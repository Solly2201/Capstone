import { Router, type Request } from "express";
import rateLimit from "express-rate-limit";
import { isValidObjectId, type FilterQuery, type SortOrder } from "mongoose";
import {
  createPetitionSchema,
  petitionListQuerySchema,
  petitionMineQuerySchema,
  petitionQueueQuerySchema,
  petitionTransitionSchema,
  publicPetitionStatuses,
  type PetitionSort
} from "@cap/contracts";
import { Petition, type PetitionDocument } from "../models/petition.js";
import { Signature } from "../models/signature.js";
import { User } from "../models/user.js";
import { optionalAuth, requireAuth, requireFreshRole, requireRole, withFreshRole } from "../middleware/auth.js";
import { isPetitionVisibleTo, toPetitionSummary, toPublicPetition } from "../lib/petitions.js";
import {
  applyPetitionTransition,
  petitionWorkflowStatusCode
} from "../services/petition-workflow.js";
import {
  hasCitizenSigned,
  signPetition,
  signatureStatusCode,
  signedPetitionIds,
  withdrawSignature
} from "../services/petition-signatures.js";

// Petitions and public participation. A deterministic state machine over
// MongoDB; no AI service in this path by design. Reading is public,
// acting requires an identity the server derives itself.
export const petitionRouter = Router();

// Rate limits are keyed by account, not IP: an IP key punishes shared
// NATs and is sidestepped by rotating addresses. Every limiter below runs
// after requireAuth, so the fallback string is unreachable.
const byUser = (request: Request): string => request.auth?.userId ?? "unauthenticated";

// Publishing creates public content under the citizen's name.
const createPetitionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  keyGenerator: byUser,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many petitions created. Please try again later." }
});

// Bounds automation, not enthusiasm: signing many petitions is legitimate.
const signatureRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  keyGenerator: byUser,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many signing actions. Please try again shortly." }
});

// Mirrors the civic workflow limiter.
const petitionWorkflowRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  keyGenerator: byUser,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many petition actions. Please try again shortly." }
});

// A malformed or repeated id must never reach a database call.
const objectIdParam = (value: unknown): string | null =>
  typeof value === "string" && isValidObjectId(value) ? value : null;

const viewerFrom = (request: Request) =>
  request.auth ? { role: request.auth.role } : undefined;

const sortOrderFor = (sort: PetitionSort): Record<string, SortOrder> => {
  if (sort === "oldest") return { createdAt: 1 };
  // Secondary key keeps paging stable when counts tie.
  if (sort === "most_signed") return { signatureCount: -1, createdAt: -1 };
  return { createdAt: -1 };
};

// Shared by the three listing endpoints so the hasSigned lookup, the
// count and the summary mapping cannot drift apart.
const listPetitions = async (
  filter: FilterQuery<PetitionDocument>,
  query: { sort: PetitionSort; limit: number; offset: number },
  citizenId?: string
) => {
  const [petitions, total] = await Promise.all([
    Petition.find(filter).sort(sortOrderFor(query.sort)).skip(query.offset).limit(query.limit),
    Petition.countDocuments(filter)
  ]);

  const signed = await signedPetitionIds(
    petitions.map((petition) => petition._id),
    citizenId
  );

  return {
    petitions: petitions.map((petition) => toPetitionSummary(petition, signed.has(String(petition._id)))),
    total,
    limit: query.limit,
    offset: query.offset
  };
};

// Publish a petition. CITIZEN only: the authority is the body being
// petitioned. Creator identity comes from the JWT, never from the body.
petitionRouter.post(
  "/",
  requireAuth,
  requireRole("CITIZEN"),
  createPetitionRateLimiter,
  async (request, response, next) => {
    try {
      const input = createPetitionSchema.parse(request.body);
      const creatorId = request.auth!.userId;

      const creator = await User.findById(creatorId).select("fullName");
      if (!creator) {
        // Token valid but account gone: never publish unattributable content.
        return response.status(401).json({ message: "Your session is invalid or has expired." });
      }

      const petition = await Petition.create({
        creatorId,
        creatorName: creator.fullName,
        category: input.category,
        title: input.title,
        description: input.description,
        signatureGoal: input.signatureGoal,
        // Server-set. The creator is not auto-counted, so every signature
        // in the count is an explicit act by somebody.
        status: "OPEN",
        signatureCount: 0,
        history: []
      });

      return response.status(201).json({
        petition: toPublicPetition(petition, viewerFrom(request), false)
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Public list. Removed petitions are excluded structurally: the status
// filter falls back to the public set rather than trusting the query.
petitionRouter.get("/", optionalAuth, async (request, response, next) => {
  try {
    const query = petitionListQuerySchema.parse(request.query);

    const filter: FilterQuery<PetitionDocument> = {
      status: query.status ?? { $in: [...publicPetitionStatuses] }
    };
    if (query.category) filter.category = query.category;

    return response.json(await listPetitions(filter, query, request.auth?.userId));
  } catch (error) {
    return next(error);
  }
});

// Petitions the signed-in citizen created or signed. Declared before
// /:id so the literal segment is never parsed as an id. Both branches are
// scoped to the authenticated account.
petitionRouter.get("/mine", requireAuth, async (request, response, next) => {
  try {
    const query = petitionMineQuerySchema.parse(request.query);
    const citizenId = request.auth!.userId;

    if (query.filter === "signed") {
      // Served entirely by the { citizenId, createdAt } index.
      const rows = await Signature.find({ citizenId })
        .sort({ createdAt: -1 })
        .select("petitionId");
      const signedIds = rows.map((row) => String(row.petitionId));

      // Signing does not entitle a citizen to keep seeing a petition
      // moderation removed, so this list must not become a second route
      // to content the detail endpoint would refuse.
      const visible = await Petition.find({
        _id: { $in: signedIds },
        $or: [{ status: { $ne: "REJECTED" } }, { creatorId: citizenId }]
      }).select("_id");
      const visibleIds = new Set(visible.map((petition) => String(petition._id)));

      // Paginate over what is visible, not the raw signature rows, so
      // total stays honest and pages do not come back short.
      const orderedIds = signedIds.filter((id) => visibleIds.has(id));
      const pageIds = orderedIds.slice(query.offset, query.offset + query.limit);

      const petitions = pageIds.length > 0 ? await Petition.find({ _id: { $in: pageIds } }) : [];

      // $in makes no ordering promise; reassemble in slice order.
      const byId = new Map(petitions.map((petition) => [String(petition._id), petition]));
      const ordered = pageIds
        .map((id) => byId.get(id))
        .filter((petition): petition is NonNullable<typeof petition> => petition !== undefined);

      return response.json({
        petitions: ordered.map((petition) => toPetitionSummary(petition, true)),
        total: orderedIds.length,
        limit: query.limit,
        offset: query.offset
      });
    }

    return response.json(
      await listPetitions({ creatorId: citizenId }, { ...query, sort: "newest" }, citizenId)
    );
  } catch (error) {
    return next(error);
  }
});

// Authority queue. Also declared before /:id. Staff see every status;
// goalMet compares two stored fields via $expr so the database evaluates
// it rather than the process.
petitionRouter.get(
  "/authority",
  requireAuth,
  requireFreshRole("AUTHORITY", "ADMIN"),
  async (request, response, next) => {
    try {
      const query = petitionQueueQuerySchema.parse(request.query);

      const filter: FilterQuery<PetitionDocument> = {};
      if (query.status) filter.status = query.status;
      if (query.category) filter.category = query.category;
      if (query.goalMet !== undefined) {
        filter.$expr = query.goalMet
          ? { $gte: ["$signatureCount", "$signatureGoal"] }
          : { $lt: ["$signatureCount", "$signatureGoal"] };
      }

      // Staff do not sign petitions.
      return response.json(await listPetitions(filter, query));
    } catch (error) {
      return next(error);
    }
  }
);

// Petition detail. A petition the viewer may not see answers 404, not
// 403, so this cannot confirm a removed petition ever existed.
petitionRouter.get("/:id", optionalAuth, async (request, response, next) => {
  try {
    const id = objectIdParam(request.params.id);
    if (!id) return response.status(404).json({ message: "Petition not found." });

    const petition = await Petition.findById(id);
    if (!petition) return response.status(404).json({ message: "Petition not found." });

    if (!isPetitionVisibleTo(petition, request.auth)) {
      return response.status(404).json({ message: "Petition not found." });
    }

    const hasSigned = await hasCitizenSigned(petition._id, request.auth?.userId);
    return response.json({ petition: toPublicPetition(petition, viewerFrom(request), hasSigned) });
  } catch (error) {
    return next(error);
  }
});

// Sign a petition. CITIZEN only -- staff are the addressee, not
// supporters. The signer is the token subject; no request field carries it.
petitionRouter.post(
  "/:id/signatures",
  requireAuth,
  requireRole("CITIZEN"),
  signatureRateLimiter,
  async (request, response, next) => {
    try {
      const id = objectIdParam(request.params.id);
      if (!id) return response.status(404).json({ message: "Petition not found." });

      const result = await signPetition(id, { userId: request.auth!.userId });
      if (!result.ok) {
        return response.status(signatureStatusCode[result.code]).json({ message: result.message });
      }

      return response.status(201).json({
        petition: toPublicPetition(result.petition, viewerFrom(request), true),
        signed: true
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Withdraw the caller's own signature. The path carries no signature or
// citizen id, so deleting someone else's is impossible by construction.
petitionRouter.delete(
  "/:id/signatures/me",
  requireAuth,
  requireRole("CITIZEN"),
  signatureRateLimiter,
  async (request, response, next) => {
    try {
      const id = objectIdParam(request.params.id);
      if (!id) return response.status(404).json({ message: "Petition not found." });

      const result = await withdrawSignature(id, { userId: request.auth!.userId });
      if (!result.ok) {
        return response.status(signatureStatusCode[result.code]).json({ message: result.message });
      }

      return response.json({
        petition: toPublicPetition(result.petition, viewerFrom(request), false),
        signed: false
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Apply a lifecycle transition. Modelled as creating a transition rather
// than PATCHing a status: no endpoint assigns an arbitrary status.
//
// requireAuth without requireRole is deliberate -- a creator may close
// their own petition, so authorisation is decided in the workflow service,
// which compares the token subject against the stored creatorId.
petitionRouter.post(
  "/:id/transitions",
  requireAuth,
  petitionWorkflowRateLimiter,
  withFreshRole,
  async (request, response, next) => {
    try {
      const id = objectIdParam(request.params.id);
      if (!id) return response.status(404).json({ message: "Petition not found." });

      const input = petitionTransitionSchema.parse(request.body);
      const result = await applyPetitionTransition(
        id,
        input.status,
        { userId: request.auth!.userId, role: request.auth!.role },
        input.note
      );

      if (!result.ok) {
        return response
          .status(petitionWorkflowStatusCode[result.code])
          .json({ message: result.message });
      }

      const hasSigned = await hasCitizenSigned(result.petition._id, request.auth!.userId);
      return response.json({
        petition: toPublicPetition(result.petition, viewerFrom(request), hasSigned)
      });
    } catch (error) {
      return next(error);
    }
  }
);

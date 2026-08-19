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
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
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

/**
 * Petitions and public participation.
 *
 * Plain CRUD plus a deterministic state machine over MongoDB -- nothing
 * here touches the Python AI service, for the same reason civic
 * reporting does not: there is no AI in this path (no recommendation, no
 * clustering, no classification, no generated petition text), so routing
 * it through Python would add a hop and a failure mode for no benefit.
 * The browser talks only to Node.
 *
 * **Reading is public, acting is not.** Browsing petitions needs no
 * account, because the point of a petition is to be seen; creating one,
 * signing one and moderating one all require an authenticated identity
 * that the server derives itself.
 *
 * Authority scope matches the civic module's documented simulation: one
 * authority, seeing everything, because the project models a single
 * civic body rather than a jurisdictional hierarchy.
 */
export const petitionRouter = Router();

/**
 * Rate limits are keyed by authenticated user id rather than by IP.
 *
 * Every limiter below sits *after* `requireAuth`, so `request.auth` is
 * always populated by the time the key is computed. Keying on the
 * account is the right granularity for these actions: an IP key both
 * punishes citizens sharing a NAT and is trivially sidestepped by
 * rotating addresses, whereas creating a petition or signing one is
 * inherently an act by an account. The constant fallback is unreachable
 * on these routes and exists only so the key is never undefined.
 */
const byUser = (request: Request): string => request.auth?.userId ?? "unauthenticated";

// Publishing is the expensive, most abusable action: it creates public
// content under the citizen's name.
const createPetitionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  keyGenerator: byUser,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many petitions created. Please try again later." }
});

// Signing many different petitions is entirely legitimate behaviour, so
// this bounds automation rather than enthusiasm.
const signatureRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  keyGenerator: byUser,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many signing actions. Please try again shortly." }
});

// Same shape and reasoning as the civic workflow limiter.
const petitionWorkflowRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  keyGenerator: byUser,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many petition actions. Please try again shortly." }
});

/**
 * Route params are typed `string | string[]`, so a repeated param would
 * arrive as an array. Anything that is not a single ObjectId string is
 * treated as "no such petition" rather than coerced -- a malformed id
 * must never reach a database call.
 */
const objectIdParam = (value: unknown): string | null =>
  typeof value === "string" && isValidObjectId(value) ? value : null;

const viewerFrom = (request: Request) =>
  request.auth ? { role: request.auth.role } : undefined;

const sortOrderFor = (sort: PetitionSort): Record<string, SortOrder> => {
  if (sort === "oldest") return { createdAt: 1 };
  // A secondary key keeps paging stable when many petitions tie on count.
  if (sort === "most_signed") return { signatureCount: -1, createdAt: -1 };
  return { createdAt: -1 };
};

/**
 * Runs a paginated petition query and decorates each row with whether
 * the requesting citizen signed it.
 *
 * Shared by the three listing endpoints so the `hasSigned` batch lookup,
 * the count and the summary mapping cannot drift between them.
 */
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

/**
 * Publish a petition. CITIZEN only.
 *
 * Staff are excluded deliberately, and not merely for tidiness: the
 * authority is the body being petitioned, so letting it author petitions
 * to itself would make the signal meaningless.
 *
 * `creatorId` comes from the verified JWT and `creatorName` is read from
 * that account's own record -- neither is in the input schema, so a
 * client-supplied value is rejected outright by `.strict()` rather than
 * quietly dropped.
 */
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
        // The token verified but the account is gone. Treat it as an
        // unusable session rather than publishing an unattributable
        // petition.
        return response.status(401).json({ message: "Your session is invalid or has expired." });
      }

      const petition = await Petition.create({
        creatorId,
        creatorName: creator.fullName,
        category: input.category,
        title: input.title,
        description: input.description,
        signatureGoal: input.signatureGoal,
        // Server-set: a petition always starts open with nothing on it.
        // The creator is not auto-counted, so every signature the count
        // reports is an explicit act by somebody.
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

/**
 * The public list.
 *
 * Anonymous callers are served; a signed-in citizen additionally gets
 * `hasSigned` on each row. Removed petitions are excluded structurally
 * -- the status filter is intersected with the public statuses rather
 * than trusted from the query -- so no combination of parameters can
 * surface one here.
 */
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

/**
 * Petitions the signed-in citizen created, or signed.
 *
 * Declared before `/:id` so neither literal path segment is ever parsed
 * as a petition id.
 *
 * The `signed` filter exists because "one signature per person" is only
 * a fair rule if a person can see what they have already signed. Both
 * branches are scoped to the authenticated account; neither accepts an
 * id from the caller.
 */
petitionRouter.get("/mine", requireAuth, async (request, response, next) => {
  try {
    const query = petitionMineQuerySchema.parse(request.query);
    const citizenId = request.auth!.userId;

    if (query.filter === "signed") {
      // Every signature this citizen has given, newest first. Only the
      // petition id is projected, so even a prolific signer costs one
      // small read served entirely by the `{ citizenId, createdAt }`
      // index.
      const rows = await Signature.find({ citizenId })
        .sort({ createdAt: -1 })
        .select("petitionId");
      const signedIds = rows.map((row) => String(row.petitionId));

      // The removed-petition rule applies here too. Signing something
      // does not entitle a citizen to keep seeing it after moderation
      // took it down -- only its creator and staff retain that -- so a
      // removed petition drops out of this list rather than becoming a
      // second way to reach content the detail endpoint would refuse.
      //
      // Projected to ids alone: this query decides *which* petitions the
      // citizen may still see, and the page read below is the only one
      // that pulls whole documents.
      const visible = await Petition.find({
        _id: { $in: signedIds },
        $or: [{ status: { $ne: "REJECTED" } }, { creatorId: citizenId }]
      }).select("_id");
      const visibleIds = new Set(visible.map((petition) => String(petition._id)));

      // Paginating over what is actually visible -- rather than over the
      // raw signature rows -- is what keeps `total` honest and stops a
      // page coming back short when moderation has removed something
      // the citizen signed. Filtering the signature order preserves it,
      // so the list still reads newest-signed first.
      const orderedIds = signedIds.filter((id) => visibleIds.has(id));
      const pageIds = orderedIds.slice(query.offset, query.offset + query.limit);

      const petitions = pageIds.length > 0 ? await Petition.find({ _id: { $in: pageIds } }) : [];

      // A `$in` lookup makes no ordering promise of its own, so the page
      // is reassembled in the order the slice established.
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

/**
 * The authority queue.
 *
 * Declared before `/:id` for the same reason. Staff see every status,
 * including removed petitions, and can filter on whether a petition
 * reached its own goal -- which is what makes the goal a triage signal
 * rather than decoration. `goalMet` is expressed as a comparison between
 * two stored fields via `$expr`, so it is evaluated by the database
 * rather than by fetching everything and filtering in the process.
 */
petitionRouter.get(
  "/authority",
  requireAuth,
  requireRole("AUTHORITY", "ADMIN"),
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

      // Staff do not sign petitions, so no row can be "signed by" them.
      return response.json(await listPetitions(filter, query));
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * Petition detail. Public, with the same removed-petition rule.
 *
 * A petition the viewer may not see is answered 404 rather than 403, so
 * the endpoint cannot be used to confirm that a particular removed
 * petition was ever published.
 */
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

/**
 * Sign a petition. Authenticated CITIZEN only.
 *
 * Staff are refused by role: the authority is the addressee of a
 * petition, and staff support would corrupt exactly the signal the
 * authority is meant to read.
 *
 * The signer is the token's subject. There is no request field for it,
 * and no branch anywhere that reads one.
 */
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

/**
 * Withdraw the signing citizen's own signature.
 *
 * The path carries no signature id and no citizen id: there is exactly
 * one signature this request could refer to, and the server already
 * knows which. That removes the whole class of "delete somebody else's
 * signature" bugs by construction rather than by an ownership check.
 */
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

/**
 * Perform a lifecycle transition.
 *
 * Modelled as *creating a transition* rather than PATCHing a status
 * field, because that is what happens: an actor performs a reviewable
 * act that appends to the petition's history. There is deliberately no
 * endpoint anywhere that assigns an arbitrary status.
 *
 * Note the middleware: `requireAuth` but **not** `requireRole`. This
 * route is reachable by a plain citizen on purpose, because a creator
 * closing their own petition is a legitimate move. Authorisation is
 * therefore done where it can actually be decided -- in the workflow
 * service, which derives the actor's capability by comparing the token's
 * subject against the stored `creatorId` and hands that to the shared
 * transition table. A citizen who is not the creator resolves to no
 * capability and is refused by the table itself.
 */
petitionRouter.post(
  "/:id/transitions",
  requireAuth,
  petitionWorkflowRateLimiter,
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

import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { isValidObjectId, type FilterQuery, type SortOrder } from "mongoose";
import {
  civicMediaAllowedMimeTypes,
  civicMediaMaxBytes,
  civicMineQuerySchema,
  civicPriorityUpdateSchema,
  civicQueueQuerySchema,
  civicTransitionSchema,
  computeCivicDueAt,
  createCivicReportSchema,
  type CivicMediaMimeType
} from "@cap/contracts";
import { CivicReport, type CivicReportDocument } from "../models/civic-report.js";
import { requireAuth, requireFreshRole, requireRole } from "../middleware/auth.js";
import { LocalFileStorage } from "../services/local-file-storage.js";
import { stripImageMetadata } from "../lib/image-sanitize.js";
import { toPublicCivicReport, type CivicReportViewer } from "../lib/civic-reports.js";
import { actorNamesFor } from "../lib/actor-names.js";
import {
  applyPriorityChange,
  applyStatusTransition,
  workflowStatusCode
} from "../services/civic-workflow.js";
import {
  civicReportFingerprint,
  findPotentialDuplicates,
  isDuplicateKeyError
} from "../services/civic-duplicates.js";

// Civic reporting: citizen submission plus the authority workflow. A
// deterministic state machine over MongoDB; no AI service in this path.
//
// The simulation has one authority, which sees every report: the project
// models a single civic body, not a jurisdictional hierarchy.
export const civicRouter = Router();

const storage = new LocalFileStorage();

// Tighter than the app-wide default: this writes a file and a document.
const createReportRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many reports submitted. Please try again later." }
});

// Bounds mistakes and any attempt to churn a report's history.
const workflowRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many workflow actions. Please try again shortly." }
});

// Images are buffered in memory, never streamed to disk by multer.
// Nothing reaches storage until the bytes are verified as a real JPEG or
// PNG and stripped, and multer's filename is never used as a path.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: civicMediaMaxBytes, files: 1, fields: 20 },
  fileFilter: (_request, file, callback) => {
    if (!civicMediaAllowedMimeTypes.includes(file.mimetype as CivicMediaMimeType)) {
      callback(new Error("UNSUPPORTED_MEDIA_TYPE"));
      return;
    }
    callback(null, true);
  }
});

const viewerFrom = (request: Request): CivicReportViewer => ({ role: request.auth!.role });

// A malformed or repeated id must never reach a database call.
const objectIdParam = (value: unknown): string | null =>
  typeof value === "string" && isValidObjectId(value) ? value : null;

const isReviewer = (request: Request): boolean =>
  request.auth!.role === "AUTHORITY" || request.auth!.role === "ADMIN";

// Staff viewers see actor identities on history; resolve them to display
// names in one batched read across however many reports are being
// serialised. Citizens never receive actorId, so no lookup happens.
const historyActorNames = async (
  request: Request,
  reports: { history?: { actorId: unknown }[] }[]
): Promise<Map<string, string> | undefined> => {
  if (!isReviewer(request)) return undefined;
  return actorNamesFor(
    reports.flatMap((report) => (report.history ?? []).map((entry) => String(entry.actorId)))
  );
};

civicRouter.post(
  "/reports",
  requireAuth,
  requireRole("CITIZEN"),
  createReportRateLimiter,
  upload.single("image"),
  async (request, response, next) => {
    try {
      const input = createCivicReportSchema.parse(request.body);

      // From the verified JWT only; the schema carries no reporterId.
      const reporterId = request.auth!.userId;

      // SLA clock starts at submission; the same instant anchors the
      // duplicate fingerprint's time bucket.
      const createdAt = new Date();

      // Exact resubmission by this citizen (double click, retry): refuse
      // and point at their own existing report. The unique index below is
      // the race-proof guarantee; this lookup exists to answer with the
      // report id before any file is written.
      const fingerprint = civicReportFingerprint({
        reporterId,
        category: input.category,
        title: input.title,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
        at: createdAt
      });
      const alreadySubmitted = await CivicReport.findOne({ fingerprint });
      if (alreadySubmitted) {
        return response.status(409).json({
          message: "You have already submitted this report.",
          code: "DUPLICATE_REPORT",
          reportId: alreadySubmitted.id
        });
      }

      // A nearby recent same-category report by anyone is a warning, not
      // a refusal: independent reports of the same problem are legitimate.
      // Checked before the image is persisted so declining costs nothing.
      if (!input.acknowledgeDuplicates) {
        const potentialDuplicates = await findPotentialDuplicates({
          category: input.category,
          latitude: input.latitude,
          longitude: input.longitude,
          now: createdAt
        });
        if (potentialDuplicates.length > 0) {
          return response.status(409).json({
            message: "A similar issue was recently reported near this location.",
            code: "POTENTIAL_DUPLICATE",
            potentialDuplicates
          });
        }
      }

      const media = [];
      if (request.file) {
        const sanitised = stripImageMetadata(request.file.buffer);
        if (!sanitised) {
          return response.status(415).json({ message: "That file is not a valid JPEG or PNG image." });
        }
        // Declared Content-Type must agree with the actual bytes.
        if (sanitised.format !== request.file.mimetype) {
          return response
            .status(415)
            .json({ message: "The file contents do not match the declared image type." });
        }

        const extension = sanitised.format === "image/png" ? "png" : "jpg";
        const stored = await storage.save("originals", `civic.${extension}`, sanitised.bytes);
        media.push({
          scope: stored.scope as "originals",
          storedName: stored.storedName,
          mimeType: sanitised.format,
          size: sanitised.bytes.length,
          uploadedAt: new Date()
        });
      }

      // MEDIUM until an authority sets a priority.
      try {
        const report = await CivicReport.create({
          reporterId,
          category: input.category,
          title: input.title,
          description: input.description,
          // GeoJSON order is [longitude, latitude].
          location: { type: "Point", coordinates: [input.longitude, input.latitude] },
          ...(input.landmark ? { landmark: input.landmark } : {}),
          status: "SUBMITTED",
          priority: "MEDIUM",
          fingerprint,
          dueAt: computeCivicDueAt(createdAt, "MEDIUM"),
          media,
          history: []
        });

        return response.status(201).json({ report: toPublicCivicReport(report, viewerFrom(request)) });
      } catch (error) {
        // Two racing identical submissions: the unique fingerprint index
        // rejected the loser. (The stored image from this losing request
        // becomes unreferenced — same as any failed create today.)
        if (isDuplicateKeyError(error)) {
          const winner = await CivicReport.findOne({ fingerprint });
          return response.status(409).json({
            message: "You have already submitted this report.",
            code: "DUPLICATE_REPORT",
            ...(winner ? { reportId: winner.id } : {})
          });
        }
        throw error;
      }
    } catch (error) {
      return next(error);
    }
  }
);

// Paginated: the old fixed limit of 100 silently truncated a prolific
// reporter's history with no indication anything was missing.
civicRouter.get("/reports/mine", requireAuth, async (request, response, next) => {
  try {
    const query = civicMineQuerySchema.parse(request.query);
    const filter = { reporterId: request.auth!.userId };
    const [reports, total] = await Promise.all([
      CivicReport.find(filter).sort({ createdAt: -1 }).skip(query.offset).limit(query.limit),
      CivicReport.countDocuments(filter)
    ]);
    return response.json({
      reports: reports.map((report) => toPublicCivicReport(report, viewerFrom(request))),
      total,
      limit: query.limit,
      offset: query.offset
    });
  } catch (error) {
    return next(error);
  }
});

// Authority queue. Declared before /reports/:id so the literal segment is
// never parsed as an id. Filters are validated against the shared query
// contract, so no query string can reach an arbitrary Mongo filter.
civicRouter.get(
  "/authority/reports",
  requireAuth,
  requireFreshRole("AUTHORITY", "ADMIN"),
  async (request, response, next) => {
    try {
      const query = civicQueueQuerySchema.parse(request.query);
      const now = new Date();

      const filter: FilterQuery<CivicReportDocument> = {};
      if (query.status) filter.status = query.status;
      if (query.category) filter.category = query.category;
      if (query.priority) filter.priority = query.priority;
      if (query.overdue) {
        // Same rule as the shared read-time helper, expressed as a query.
        filter.dueAt = { $lt: now };
        filter.status = query.status ?? { $nin: ["RESOLVED", "REJECTED"] };
      }

      const sortOrder: Record<string, SortOrder> =
        query.sort === "oldest"
          ? { createdAt: 1 }
          : query.sort === "due_soonest"
            ? { dueAt: 1 }
            : { createdAt: -1 };

      const [reports, total] = await Promise.all([
        CivicReport.find(filter).sort(sortOrder).skip(query.offset).limit(query.limit),
        CivicReport.countDocuments(filter)
      ]);
      const actorNames = await historyActorNames(request, reports);

      return response.json({
        reports: reports.map((report) => toPublicCivicReport(report, viewerFrom(request), now, actorNames)),
        total,
        limit: query.limit,
        offset: query.offset
      });
    } catch (error) {
      return next(error);
    }
  }
);

// A citizen reads their own report; staff read any. Someone else's
// report answers 404, not 403, so ids cannot be enumerated.
civicRouter.get("/reports/:id", requireAuth, async (request, response, next) => {
  try {
    const id = objectIdParam(request.params.id);
    if (!id) return response.status(404).json({ message: "Report not found." });

    const report = await CivicReport.findById(id);
    if (!report) return response.status(404).json({ message: "Report not found." });

    const isOwner = String(report.reporterId) === request.auth!.userId;
    if (!isOwner && !isReviewer(request)) return response.status(404).json({ message: "Report not found." });

    const actorNames = await historyActorNames(request, [report]);
    return response.json({ report: toPublicCivicReport(report, viewerFrom(request), new Date(), actorNames) });
  } catch (error) {
    return next(error);
  }
});

// Apply a status transition. Modelled as creating a transition rather
// than PATCHing a status: no endpoint assigns an arbitrary status.
//
// Authorisation is enforced twice on purpose -- requireRole keeps
// citizens out of the route, and the shared table independently decides
// whether this role may make this particular move.
civicRouter.post(
  "/reports/:id/transitions",
  requireAuth,
  workflowRateLimiter,
  requireFreshRole("AUTHORITY", "ADMIN"),
  async (request, response, next) => {
    try {
      const id = objectIdParam(request.params.id);
      if (!id) return response.status(404).json({ message: "Report not found." });

      const input = civicTransitionSchema.parse(request.body);
      const result = await applyStatusTransition(
        id,
        input.status,
        { userId: request.auth!.userId, role: request.auth!.role },
        input.note
      );

      if (!result.ok) {
        return response.status(workflowStatusCode[result.code]).json({ message: result.message });
      }

      const actorNames = await historyActorNames(request, [result.report]);
      return response.json({
        report: toPublicCivicReport(result.report, viewerFrom(request), new Date(), actorNames)
      });
    } catch (error) {
      return next(error);
    }
  }
);

/** Set priority, which moves the SLA deadline. Authority/admin only. */
civicRouter.patch(
  "/reports/:id/priority",
  requireAuth,
  workflowRateLimiter,
  requireFreshRole("AUTHORITY", "ADMIN"),
  async (request, response, next) => {
    try {
      const id = objectIdParam(request.params.id);
      if (!id) return response.status(404).json({ message: "Report not found." });

      const input = civicPriorityUpdateSchema.parse(request.body);
      const result = await applyPriorityChange(
        id,
        input.priority,
        { userId: request.auth!.userId, role: request.auth!.role },
        input.note
      );

      if (!result.ok) {
        return response.status(workflowStatusCode[result.code]).json({ message: result.message });
      }

      const actorNames = await historyActorNames(request, [result.report]);
      return response.json({
        report: toPublicCivicReport(result.report, viewerFrom(request), new Date(), actorNames)
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Serves an attached image under the same ownership rule as the report.
// The URL is not a capability: knowing it is useless without a token for
// an account allowed to see the report. Reads go through
// LocalFileStorage, which re-checks containment within the storage root.
civicRouter.get("/reports/:id/media/:mediaId", requireAuth, async (request, response, next) => {
  try {
    const id = objectIdParam(request.params.id);
    const mediaId = objectIdParam(request.params.mediaId);
    if (!id || !mediaId) {
      return response.status(404).json({ message: "Media not found." });
    }

    const report = await CivicReport.findById(id);
    if (!report) return response.status(404).json({ message: "Media not found." });

    const isOwner = String(report.reporterId) === request.auth!.userId;
    if (!isOwner && !isReviewer(request)) return response.status(404).json({ message: "Media not found." });

    const media = report.media.find((entry) => String(entry._id) === mediaId);
    if (!media) return response.status(404).json({ message: "Media not found." });

    const bytes = await storage.read(media.scope, media.storedName);
    response.setHeader("Content-Type", media.mimeType);
    response.setHeader("Content-Length", String(bytes.length));
    // Stored images are already stripped; block sniffing anyway.
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "private, max-age=300");
    return response.send(bytes);
  } catch (error) {
    return next(error);
  }
});

// Multer errors are not Zod errors, so they are translated into the
// project's JSON error shape rather than falling through as a 500.
civicRouter.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return response.status(413).json({ message: "That image is larger than the 5 MB limit." });
    }
    if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
      return response.status(400).json({ message: "Only one image can be attached to a report." });
    }
    return response.status(400).json({ message: "The uploaded file could not be read." });
  }
  if (error instanceof Error && error.message === "UNSUPPORTED_MEDIA_TYPE") {
    return response.status(415).json({ message: "Only JPEG and PNG images are accepted." });
  }
  return next(error);
});

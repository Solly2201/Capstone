import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { isValidObjectId, type FilterQuery, type SortOrder } from "mongoose";
import {
  civicMediaAllowedMimeTypes,
  civicMediaMaxBytes,
  civicPriorityUpdateSchema,
  civicQueueQuerySchema,
  civicTransitionSchema,
  computeCivicDueAt,
  createCivicReportSchema,
  type CivicMediaMimeType
} from "@cap/contracts";
import { CivicReport, type CivicReportDocument } from "../models/civic-report.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { LocalFileStorage } from "../services/local-file-storage.js";
import { stripImageMetadata } from "../lib/image-sanitize.js";
import { toPublicCivicReport, type CivicReportViewer } from "../lib/civic-reports.js";
import {
  applyPriorityChange,
  applyStatusTransition,
  workflowStatusCode
} from "../services/civic-workflow.js";

/**
 * Civic reporting: citizen submission plus the authority workflow.
 *
 * Plain CRUD and a deterministic state machine over MongoDB -- nothing
 * here touches the Python AI service. That service exists for the
 * legal-answer pipeline; civic reporting has no AI in this milestone (no
 * classification, no priority prediction, no vision), so routing it
 * through Python would add a hop and a failure mode for no benefit.
 *
 * Authority scope: this simulation has ONE authority. An AUTHORITY user
 * sees every report in every category, because the project models a
 * single civic body rather than a real jurisdictional hierarchy (wards,
 * departments, escalation chains). Introducing jurisdiction would mean
 * inventing a government structure the project has not specified.
 */
export const civicRouter = Router();

const storage = new LocalFileStorage();

// Report creation writes a file and a document, so it gets a tighter
// limit than the app-wide default.
const createReportRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many reports submitted. Please try again later." }
});

// Workflow actions are cheap but state-changing; a limit bounds both
// mistakes and any attempt to churn a report's history.
const workflowRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many workflow actions. Please try again shortly." }
});

/**
 * Images are buffered in memory, never streamed to disk by multer.
 * Nothing reaches storage until the bytes have been verified as a real
 * JPEG/PNG and stripped of metadata, and the filename multer sees is
 * never used as a path.
 */
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

/**
 * Route params are typed as `string | string[]`, so a repeated param
 * would arrive as an array. Anything that is not a single ObjectId
 * string is treated as "no such report" rather than coerced.
 */
const objectIdParam = (value: unknown): string | null =>
  typeof value === "string" && isValidObjectId(value) ? value : null;

const isReviewer = (request: Request): boolean =>
  request.auth!.role === "AUTHORITY" || request.auth!.role === "ADMIN";

civicRouter.post(
  "/reports",
  requireAuth,
  requireRole("CITIZEN"),
  createReportRateLimiter,
  upload.single("image"),
  async (request, response, next) => {
    try {
      const input = createCivicReportSchema.parse(request.body);

      // reporterId comes from the verified JWT only. A client-supplied
      // reporterId is not part of the schema, so it is dropped here.
      const reporterId = request.auth!.userId;

      const media = [];
      if (request.file) {
        const sanitised = stripImageMetadata(request.file.buffer);
        if (!sanitised) {
          return response.status(415).json({ message: "That file is not a valid JPEG or PNG image." });
        }
        // The declared Content-Type must agree with the actual bytes.
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

      // The SLA clock starts at submission. Priority is MEDIUM until an
      // authority sets it, so the initial deadline uses that window.
      const createdAt = new Date();
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
        dueAt: computeCivicDueAt(createdAt, "MEDIUM"),
        media,
        history: []
      });

      return response.status(201).json({ report: toPublicCivicReport(report, viewerFrom(request)) });
    } catch (error) {
      return next(error);
    }
  }
);

civicRouter.get("/reports/mine", requireAuth, async (request, response, next) => {
  try {
    const reports = await CivicReport.find({ reporterId: request.auth!.userId })
      .sort({ createdAt: -1 })
      .limit(100);
    return response.json({ reports: reports.map((report) => toPublicCivicReport(report, viewerFrom(request))) });
  } catch (error) {
    return next(error);
  }
});

/**
 * The authority queue.
 *
 * Declared before `/reports/:id` so "authority" is never parsed as a
 * report id. Filters and sorting are validated against the shared query
 * contract, so only known fields reach the database -- a client cannot
 * inject an arbitrary Mongo filter.
 */
civicRouter.get(
  "/authority/reports",
  requireAuth,
  requireRole("AUTHORITY", "ADMIN"),
  async (request, response, next) => {
    try {
      const query = civicQueueQuerySchema.parse(request.query);
      const now = new Date();

      const filter: FilterQuery<CivicReportDocument> = {};
      if (query.status) filter.status = query.status;
      if (query.category) filter.category = query.category;
      if (query.priority) filter.priority = query.priority;
      if (query.overdue) {
        // Overdue is "past the deadline and still open" -- the same rule
        // the shared helper applies at read time, expressed as a query.
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

      return response.json({
        reports: reports.map((report) => toPublicCivicReport(report, viewerFrom(request), now)),
        total,
        limit: query.limit,
        offset: query.offset
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * A citizen may read their own report; AUTHORITY and ADMIN may read any
 * report, since they must act on them.
 *
 * A citizen asking for someone else's report gets 404, not 403 --
 * distinguishing "exists but not yours" from "does not exist" would let
 * anyone enumerate which report ids are real.
 */
civicRouter.get("/reports/:id", requireAuth, async (request, response, next) => {
  try {
    const id = objectIdParam(request.params.id);
    if (!id) return response.status(404).json({ message: "Report not found." });

    const report = await CivicReport.findById(id);
    if (!report) return response.status(404).json({ message: "Report not found." });

    const isOwner = String(report.reporterId) === request.auth!.userId;
    if (!isOwner && !isReviewer(request)) return response.status(404).json({ message: "Report not found." });

    return response.json({ report: toPublicCivicReport(report, viewerFrom(request)) });
  } catch (error) {
    return next(error);
  }
});

/**
 * Perform a status transition.
 *
 * Modelled as creating a transition rather than PATCHing a status field,
 * because that is what actually happens: an actor performs a reviewable
 * act that appends to the report's history. There is deliberately no
 * endpoint that assigns an arbitrary status.
 *
 * Authorisation is enforced twice, on purpose: `requireRole` keeps
 * citizens out of the route entirely, and the shared transition table
 * independently decides whether this actor's role may make this
 * particular move. Neither check alone is trusted.
 */
civicRouter.post(
  "/reports/:id/transitions",
  requireAuth,
  requireRole("AUTHORITY", "ADMIN"),
  workflowRateLimiter,
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

      return response.json({ report: toPublicCivicReport(result.report, viewerFrom(request)) });
    } catch (error) {
      return next(error);
    }
  }
);

/** Set priority, which moves the SLA deadline. Authority/admin only. */
civicRouter.patch(
  "/reports/:id/priority",
  requireAuth,
  requireRole("AUTHORITY", "ADMIN"),
  workflowRateLimiter,
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

      return response.json({ report: toPublicCivicReport(result.report, viewerFrom(request)) });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * Serves an attached image.
 *
 * Same ownership rule as the report itself -- media is not public, and
 * the URL is not a capability: knowing it is not enough without a token
 * for an account allowed to see the report. The file is read by its
 * server-generated stored name through LocalFileStorage, which re-checks
 * containment within the storage root.
 */
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
    // Stored images are already stripped; stop browsers sniffing anyway.
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "private, max-age=300");
    return response.send(bytes);
  } catch (error) {
    return next(error);
  }
});

/**
 * Upload failures arrive as multer errors rather than Zod errors, so
 * they are translated here into the project's JSON error shape instead
 * of falling through to the app-wide 500 handler.
 */
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

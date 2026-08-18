import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { isValidObjectId } from "mongoose";
import {
  createCivicReportSchema,
  civicMediaAllowedMimeTypes,
  civicMediaMaxBytes,
  type CivicMediaMimeType
} from "@cap/contracts";
import { CivicReport } from "../models/civic-report.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { LocalFileStorage } from "../services/local-file-storage.js";
import { stripImageMetadata } from "../lib/image-sanitize.js";
import { toPublicCivicReport } from "../lib/civic-reports.js";

/**
 * Civic reporting: create a report, list your own, read one.
 *
 * Plain CRUD over MongoDB -- nothing here touches the Python AI service.
 * That service exists for the legal-answer pipeline; civic reporting has
 * no AI in this milestone (no classification, no priority prediction, no
 * vision), so routing it through Python would add a hop and a failure
 * mode for no benefit.
 *
 * The authority workflow (status transitions, triage, SLA) is
 * deliberately not built here -- a submitted report stays SUBMITTED.
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
        media
      });

      return response.status(201).json({ report: toPublicCivicReport(report) });
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
    return response.json({ reports: reports.map(toPublicCivicReport) });
  } catch (error) {
    return next(error);
  }
});

/**
 * A citizen may read their own report; AUTHORITY and ADMIN may read any
 * report, since they will need to act on them in a later milestone.
 *
 * A citizen asking for someone else's report gets 404, not 403 --
 * distinguishing "exists but not yours" from "does not exist" would let
 * anyone enumerate which report ids are real.
 */
civicRouter.get("/reports/:id", requireAuth, async (request, response, next) => {
  try {
    const { id } = request.params;
    if (!isValidObjectId(id)) return response.status(404).json({ message: "Report not found." });

    const report = await CivicReport.findById(id);
    if (!report) return response.status(404).json({ message: "Report not found." });

    const auth = request.auth!;
    const isOwner = String(report.reporterId) === auth.userId;
    const isReviewer = auth.role === "AUTHORITY" || auth.role === "ADMIN";
    if (!isOwner && !isReviewer) return response.status(404).json({ message: "Report not found." });

    return response.json({ report: toPublicCivicReport(report) });
  } catch (error) {
    return next(error);
  }
});

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
    const { id, mediaId } = request.params;
    if (!isValidObjectId(id) || !isValidObjectId(mediaId)) {
      return response.status(404).json({ message: "Media not found." });
    }

    const report = await CivicReport.findById(id);
    if (!report) return response.status(404).json({ message: "Media not found." });

    const auth = request.auth!;
    const isOwner = String(report.reporterId) === auth.userId;
    const isReviewer = auth.role === "AUTHORITY" || auth.role === "ADMIN";
    if (!isOwner && !isReviewer) return response.status(404).json({ message: "Media not found." });

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

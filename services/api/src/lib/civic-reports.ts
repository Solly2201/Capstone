import type { CivicMedia, CivicReport as PublicCivicReport } from "@cap/contracts";
import type { HydratedDocument } from "mongoose";
import type { CivicReportDocument } from "../models/civic-report.js";

/**
 * Maps a stored report onto the shared public contract.
 *
 * This is the single place the GeoJSON `[longitude, latitude]` ordering
 * is unpacked into the `latitude`/`longitude` fields the API and UI use,
 * so the inversion cannot leak into route handlers or components.
 *
 * Storage details never cross this boundary: `storedName` and `scope`
 * stay server-side, and the client receives only an API path it must
 * present a token to.
 */
export const toPublicCivicReport = (report: HydratedDocument<CivicReportDocument>): PublicCivicReport => {
  const [longitude, latitude] = report.location.coordinates;

  const media: CivicMedia[] = report.media.map((entry) => ({
    id: String(entry._id),
    mimeType: entry.mimeType,
    size: entry.size,
    url: `/civic/reports/${report.id}/media/${String(entry._id)}`,
    uploadedAt: entry.uploadedAt.toISOString()
  }));

  return {
    id: report.id,
    reporterId: String(report.reporterId),
    category: report.category,
    title: report.title,
    description: report.description,
    latitude,
    longitude,
    ...(report.landmark ? { landmark: report.landmark } : {}),
    status: report.status,
    priority: report.priority,
    media,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString()
  };
};

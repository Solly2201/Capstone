import {
  isCivicReportOverdue,
  type CivicHistoryEntry,
  type CivicMedia,
  type CivicReport as PublicCivicReport,
  type UserRole
} from "@cap/contracts";
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
 *
 * The mapper is viewer-aware for one reason: history carries the id of
 * the staff member who acted. Authorities and admins see it, because
 * internal accountability needs it; citizens see only the acting role,
 * which explains the decision without disclosing which individual made
 * it. Defaulting to the narrower view means a new caller leaks nothing
 * unless it deliberately opts in.
 */
export type CivicReportViewer = {
  role: UserRole;
};

const canSeeActorIdentity = (viewer?: CivicReportViewer): boolean =>
  viewer?.role === "AUTHORITY" || viewer?.role === "ADMIN";

export const toPublicCivicReport = (
  report: HydratedDocument<CivicReportDocument>,
  viewer?: CivicReportViewer,
  now: Date = new Date()
): PublicCivicReport => {
  const [longitude, latitude] = report.location.coordinates;
  const showActors = canSeeActorIdentity(viewer);

  // Reports created before this milestone have no history array, and a
  // read of legacy data must not 500 on a field that did not exist yet.
  const media: CivicMedia[] = (report.media ?? []).map((entry) => ({
    id: String(entry._id),
    mimeType: entry.mimeType,
    size: entry.size,
    url: `/civic/reports/${report.id}/media/${String(entry._id)}`,
    uploadedAt: entry.uploadedAt.toISOString()
  }));

  const history: CivicHistoryEntry[] = (report.history ?? []).map((entry) => ({
    type: entry.type,
    from: entry.from,
    to: entry.to,
    actorRole: entry.actorRole,
    ...(showActors ? { actorId: String(entry.actorId) } : {}),
    ...(entry.note ? { note: entry.note } : {}),
    at: entry.at.toISOString()
  }));

  const dueAt = report.dueAt ? report.dueAt.toISOString() : undefined;

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
    ...(dueAt ? { dueAt } : {}),
    isOverdue: isCivicReportOverdue({ status: report.status, dueAt }, now),
    history,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString()
  };
};

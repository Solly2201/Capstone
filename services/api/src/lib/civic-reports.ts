import {
  isCivicReportOverdue,
  type CivicHistoryEntry,
  type CivicMedia,
  type CivicReport as PublicCivicReport,
  type UserRole
} from "@cap/contracts";
import type { HydratedDocument } from "mongoose";
import type { CivicReportDocument } from "../models/civic-report.js";

// Maps a stored report onto the shared public contract, and the single
// place the GeoJSON [longitude, latitude] ordering is unpacked, so the
// inversion cannot leak into routes or components.
//
// Storage details stay server-side: the client gets only an API path it
// must present a token to. Viewer-aware because history carries the
// acting staff member's id, which only AUTHORITY and ADMIN see.
export type CivicReportViewer = {
  role: UserRole;
};

const canSeeActorIdentity = (viewer?: CivicReportViewer): boolean =>
  viewer?.role === "AUTHORITY" || viewer?.role === "ADMIN";

export const toPublicCivicReport = (
  report: HydratedDocument<CivicReportDocument>,
  viewer?: CivicReportViewer,
  now: Date = new Date(),
  /** Batched actorId → display-name map; travels only where actorId does. */
  actorNames?: Map<string, string>
): PublicCivicReport => {
  const [longitude, latitude] = report.location.coordinates;
  const showActors = canSeeActorIdentity(viewer);

  // Legacy reports predate these arrays; a read must not 500 on them.
  const media: CivicMedia[] = (report.media ?? []).map((entry) => ({
    id: String(entry._id),
    mimeType: entry.mimeType,
    size: entry.size,
    url: `/civic/reports/${report.id}/media/${String(entry._id)}`,
    uploadedAt: entry.uploadedAt.toISOString()
  }));

  const history: CivicHistoryEntry[] = (report.history ?? []).map((entry) => {
    const actorId = String(entry.actorId);
    const actorName = actorNames?.get(actorId);
    return {
      type: entry.type,
      from: entry.from,
      to: entry.to,
      actorRole: entry.actorRole,
      ...(showActors ? { actorId } : {}),
      ...(showActors && actorName ? { actorName } : {}),
      ...(entry.note ? { note: entry.note } : {}),
      at: entry.at.toISOString()
    };
  });

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

import { z } from "zod";

/**
 * Civic reporting contracts, shared by the web app and the Node API.
 *
 * Kept deliberately small: one report, one optional image, no authority
 * workflow. Categories/statuses/priorities are closed enums rather than
 * free strings so the frontend, the API validator and the Mongoose
 * schema cannot drift apart.
 */

export const civicCategories = [
  "pothole",
  "garbage",
  "streetlight",
  "water",
  "road_damage",
  "drainage",
  "traffic",
  "other"
] as const;
export type CivicCategory = (typeof civicCategories)[number];

export const civicCategoryLabels: Record<CivicCategory, string> = {
  pothole: "Pothole",
  garbage: "Garbage / waste",
  streetlight: "Street light",
  water: "Water supply",
  road_damage: "Road damage",
  drainage: "Drainage / sewage",
  traffic: "Traffic / signage",
  other: "Something else"
};

export const civicStatuses = ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"] as const;
export type CivicStatus = (typeof civicStatuses)[number];

export const civicStatusLabels: Record<CivicStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected"
};

export const civicPriorities = ["LOW", "MEDIUM", "HIGH"] as const;
export type CivicPriority = (typeof civicPriorities)[number];

/**
 * Media limits, shared so the browser can reject an oversized file
 * before uploading it and the API can reject it again on arrival. The
 * API is the enforcing side -- the client check is a convenience only.
 */
export const civicMediaMaxBytes = 5 * 1024 * 1024;
export const civicMediaAllowedMimeTypes = ["image/jpeg", "image/png"] as const;
export type CivicMediaMimeType = (typeof civicMediaAllowedMimeTypes)[number];

/**
 * Report creation input.
 *
 * Coordinates use `coerce` because this endpoint accepts
 * multipart/form-data (every field arrives as a string when an image is
 * attached); JSON clients sending real numbers validate identically.
 *
 * `reporterId` is deliberately absent: it is derived from the
 * authenticated JWT server-side and is never accepted from the browser.
 */
export const createCivicReportSchema = z.object({
  category: z.enum(civicCategories),
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(2000),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  landmark: z.string().trim().max(200).optional()
});

export type CreateCivicReportInput = z.infer<typeof createCivicReportSchema>;

export type CivicMedia = {
  id: string;
  mimeType: CivicMediaMimeType;
  size: number;
  /** API path the browser fetches with its bearer token. */
  url: string;
  uploadedAt: string;
};

export type CivicReport = {
  id: string;
  reporterId: string;
  category: CivicCategory;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  landmark?: string;
  status: CivicStatus;
  priority: CivicPriority;
  media: CivicMedia[];
  createdAt: string;
  updatedAt: string;
};

export type CivicReportListResponse = {
  reports: CivicReport[];
};

export type CivicReportResponse = {
  report: CivicReport;
};

/** Short human-readable location summary for list views. */
export const formatCivicLocation = (report: Pick<CivicReport, "latitude" | "longitude" | "landmark">): string =>
  report.landmark && report.landmark.length > 0
    ? report.landmark
    : `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`;

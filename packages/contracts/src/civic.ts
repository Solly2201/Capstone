import { z } from "zod";

/**
 * Civic reporting contracts, shared by the web app and the Node API.
 *
 * Categories/statuses/priorities are closed enums rather than free
 * strings so the frontend, the API validator and the Mongoose schema
 * cannot drift apart. The report lifecycle further down is the single
 * source of truth for what may happen to a report.
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
 * `status` and `priority` are absent for the same reason.
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

/**
 * Structural alias for the role names in `userRoles`, declared here so
 * this lifecycle module stays self-contained. Same union as `UserRole`.
 */
export type UserRoleName = "CITIZEN" | "AUTHORITY" | "ADMIN";

// --- Report lifecycle (authority workflow) -----------------------------
//
// The transition table below is the single source of truth for what may
// happen to a report. The API enforces it; the web app uses it to render
// only the actions that actually exist. Route handlers must not carry
// their own status if-statements.
//
// CITIZEN appears in no rule, deliberately: a citizen can never move
// their own report, and that is a property of the table itself rather
// than of a middleware check somebody could forget on a future route.
//
// ADMIN has strictly more reach than AUTHORITY -- it alone may reopen a
// closed report -- but it moves through the same table. There is no
// bypass path that skips these rules.

export type CivicTransitionRule = {
  from: CivicStatus;
  to: CivicStatus;
  /** Roles permitted to perform this transition. */
  roles: readonly UserRoleName[];
  /** Whether a written reason is mandatory. */
  requiresNote: boolean;
  /** What this transition means, shown as the action label in the UI. */
  label: string;
};

const AUTHORITY_AND_ADMIN = ["AUTHORITY", "ADMIN"] as const;
const ADMIN_ONLY = ["ADMIN"] as const;

export const civicTransitions: readonly CivicTransitionRule[] = [
  {
    from: "SUBMITTED",
    to: "UNDER_REVIEW",
    roles: AUTHORITY_AND_ADMIN,
    requiresNote: false,
    label: "Acknowledge and start reviewing"
  },
  {
    from: "SUBMITTED",
    to: "REJECTED",
    roles: AUTHORITY_AND_ADMIN,
    requiresNote: true,
    label: "Reject with a reason"
  },
  {
    from: "UNDER_REVIEW",
    to: "IN_PROGRESS",
    roles: AUTHORITY_AND_ADMIN,
    requiresNote: false,
    label: "Accept and begin work"
  },
  {
    from: "UNDER_REVIEW",
    to: "REJECTED",
    roles: AUTHORITY_AND_ADMIN,
    requiresNote: true,
    label: "Reject with a reason"
  },
  {
    from: "IN_PROGRESS",
    to: "RESOLVED",
    roles: AUTHORITY_AND_ADMIN,
    requiresNote: true,
    label: "Mark resolved, describing what was done"
  },
  {
    from: "IN_PROGRESS",
    to: "UNDER_REVIEW",
    roles: AUTHORITY_AND_ADMIN,
    requiresNote: true,
    label: "Send back for review, explaining why"
  },
  {
    from: "RESOLVED",
    to: "UNDER_REVIEW",
    roles: ADMIN_ONLY,
    requiresNote: true,
    label: "Reopen a resolved report"
  },
  {
    from: "REJECTED",
    to: "UNDER_REVIEW",
    roles: ADMIN_ONLY,
    requiresNote: true,
    label: "Reopen a rejected report"
  }
];

/** Closed states: only an ADMIN reopen leads out of these. */
export const terminalCivicStatuses: readonly CivicStatus[] = ["RESOLVED", "REJECTED"];

export const isTerminalCivicStatus = (status: CivicStatus): boolean => terminalCivicStatuses.includes(status);

/** The transitions a given role may perform from a given status. */
export const civicTransitionsFor = (from: CivicStatus, role: UserRoleName): CivicTransitionRule[] =>
  civicTransitions.filter((rule) => rule.from === from && rule.roles.includes(role));

export type CivicTransitionCheck =
  | { ok: true; rule: CivicTransitionRule }
  | {
      ok: false;
      code: "SAME_STATUS" | "INVALID_TRANSITION" | "FORBIDDEN_ROLE" | "NOTE_REQUIRED";
      message: string;
    };

/**
 * The one place a transition is judged. Both the API and the UI call it;
 * the API's answer is the authoritative one.
 */
export const checkCivicTransition = (
  from: CivicStatus,
  to: CivicStatus,
  role: UserRoleName,
  note?: string
): CivicTransitionCheck => {
  if (from === to) {
    return { ok: false, code: "SAME_STATUS", message: "This report is already in that state." };
  }

  const rule = civicTransitions.find((entry) => entry.from === from && entry.to === to);
  if (!rule) {
    return {
      ok: false,
      code: "INVALID_TRANSITION",
      message: "A report cannot move directly between those states."
    };
  }

  if (!rule.roles.includes(role)) {
    return { ok: false, code: "FORBIDDEN_ROLE", message: "Your role cannot perform this transition." };
  }

  if (rule.requiresNote && (note === undefined || note.trim().length === 0)) {
    return { ok: false, code: "NOTE_REQUIRED", message: "This transition requires a written reason." };
  }

  return { ok: true, rule };
};

// --- Status history ----------------------------------------------------

export const civicHistoryTypes = ["STATUS", "PRIORITY"] as const;
export type CivicHistoryType = (typeof civicHistoryTypes)[number];

/**
 * One recorded change.
 *
 * Entirely server-constructed: no part of this is accepted from a
 * request body, so a client cannot forge an actor, a timestamp, a
 * previous status, or a change that never happened.
 *
 * `actorId` is included only for AUTHORITY/ADMIN viewers. A citizen sees
 * which role acted and why, not which member of staff -- the least
 * personal information that still explains the decision.
 */
export type CivicHistoryEntry = {
  type: CivicHistoryType;
  from: string;
  to: string;
  actorRole: UserRoleName;
  actorId?: string;
  note?: string;
  at: string;
};

// --- Priority and SLA --------------------------------------------------
//
// Priority is assigned by authority staff, NOT derived automatically
// from the report. Automatic assignment was considered and rejected for
// now: the only signals available at submission are category, free text
// and coordinates, and this project has no evidence base for mapping any
// of them onto real-world urgency. A category table that silently called
// every "water" report HIGH would look objective while encoding a guess,
// and in a queue that ordering decides what gets attention first. Staff
// assignment is transparent, reviewable and recorded in the history; a
// measured rule can replace it later without changing the SLA mechanics
// below, because the deadline is derived from priority rather than from
// whatever set it.
//
// SLA durations are simulation values for a capstone project. They are
// not a service-level commitment by any real authority.

export const civicSlaHoursByPriority: Record<CivicPriority, number> = {
  HIGH: 48,
  MEDIUM: 120,
  LOW: 240
};

export const civicSlaHours = (priority: CivicPriority): number => civicSlaHoursByPriority[priority];

/**
 * A report's deadline: submission time plus the SLA window for its
 * current priority.
 *
 * Re-derived from `createdAt` whenever priority changes, so the clock
 * runs from when the citizen reported the problem and does not restart
 * when staff touch the record.
 *
 * Pure and absolute: the arithmetic is in epoch milliseconds with no
 * local-timezone component, so the result does not depend on the machine
 * that computes it.
 */
export const computeCivicDueAt = (createdAt: Date | string, priority: CivicPriority): Date => {
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  return new Date(created.getTime() + civicSlaHours(priority) * 60 * 60 * 1000);
};

/**
 * Overdue means past the deadline while still open.
 *
 * A closed report is never overdue: once it is resolved or rejected the
 * clock stops, so historical reports do not accumulate a forever-growing
 * breach count. `now` is a parameter so this is testable with controlled
 * dates rather than depending on wall-clock time.
 */
export const isCivicReportOverdue = (
  report: Pick<CivicReport, "status" | "dueAt">,
  now: Date = new Date()
): boolean => {
  if (isTerminalCivicStatus(report.status)) return false;
  if (!report.dueAt) return false;
  return now.getTime() > new Date(report.dueAt).getTime();
};

// --- Response shapes ---------------------------------------------------

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
  /** SLA deadline derived from createdAt + priority. */
  dueAt?: string;
  /** Server-computed at read time; never stored. */
  isOverdue: boolean;
  /** Oldest first. Server-controlled, append-only. */
  history: CivicHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type CivicReportListResponse = {
  reports: CivicReport[];
};

export type CivicReportResponse = {
  report: CivicReport;
};

// --- Authority request contracts ---------------------------------------

export const civicTransitionSchema = z.object({
  status: z.enum(civicStatuses),
  note: z.string().trim().min(3).max(500).optional()
});
export type CivicTransitionInput = z.infer<typeof civicTransitionSchema>;

export const civicPriorityUpdateSchema = z.object({
  priority: z.enum(civicPriorities),
  note: z.string().trim().min(3).max(500).optional()
});
export type CivicPriorityUpdateInput = z.infer<typeof civicPriorityUpdateSchema>;

export const civicQueueSortOptions = ["newest", "oldest", "due_soonest"] as const;
export type CivicQueueSort = (typeof civicQueueSortOptions)[number];

export const civicQueueQuerySchema = z.object({
  status: z.enum(civicStatuses).optional(),
  category: z.enum(civicCategories).optional(),
  priority: z.enum(civicPriorities).optional(),
  overdue: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  sort: z.enum(civicQueueSortOptions).default("newest"),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0)
});
export type CivicQueueQuery = z.infer<typeof civicQueueQuerySchema>;

export type CivicQueueResponse = {
  reports: CivicReport[];
  total: number;
  limit: number;
  offset: number;
};

/** Short human-readable location summary for list views. */
export const formatCivicLocation = (report: Pick<CivicReport, "latitude" | "longitude" | "landmark">): string =>
  report.landmark && report.landmark.length > 0
    ? report.landmark
    : `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`;

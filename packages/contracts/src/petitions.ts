import { z } from "zod";

/**
 * Petition and public-participation contracts, shared by the web app and
 * the Node API.
 *
 * Same discipline as `civic.ts`: closed enums rather than free strings,
 * one declared lifecycle table that both sides read, and no
 * security-sensitive field anywhere in an input schema. A petition is
 * public content, so the response shapes here are deliberately narrower
 * than the stored document -- see `services/api/src/lib/petitions.ts`
 * for the mapper that decides what actually leaves the server.
 */

export const petitionCategories = [
  "infrastructure",
  "sanitation",
  "water",
  "transport",
  "environment",
  "public_safety",
  "health",
  "education",
  "governance",
  "other"
] as const;
export type PetitionCategory = (typeof petitionCategories)[number];

export const petitionCategoryLabels: Record<PetitionCategory, string> = {
  infrastructure: "Roads and infrastructure",
  sanitation: "Sanitation and waste",
  water: "Water supply",
  transport: "Public transport",
  environment: "Environment",
  public_safety: "Public safety",
  health: "Health services",
  education: "Education",
  governance: "Local governance",
  other: "Something else"
};

/**
 * The petition lifecycle vocabulary.
 *
 * `OPEN` is the only signable state. `ANSWERED` is the only terminal
 * one: it means the authority published a formal response, which is the
 * outcome the whole feature exists to produce.
 */
export const petitionStatuses = ["OPEN", "UNDER_REVIEW", "ANSWERED", "CLOSED", "REJECTED"] as const;
export type PetitionStatus = (typeof petitionStatuses)[number];

export const petitionStatusLabels: Record<PetitionStatus, string> = {
  OPEN: "Open for signatures",
  UNDER_REVIEW: "Under review",
  ANSWERED: "Answered",
  CLOSED: "Closed",
  REJECTED: "Removed"
};

/**
 * Statuses an anonymous or unrelated citizen may see.
 *
 * `REJECTED` is absent on purpose. A removed petition stays visible to
 * its creator (so they can read why it was removed) and to staff (so the
 * decision stays auditable), but it is not public content any more --
 * republishing removed material would defeat the point of removing it.
 */
export const publicPetitionStatuses: readonly PetitionStatus[] = [
  "OPEN",
  "UNDER_REVIEW",
  "ANSWERED",
  "CLOSED"
];

export const isPublicPetitionStatus = (status: PetitionStatus): boolean =>
  publicPetitionStatuses.includes(status);

/** Signatures are only ever accepted while a petition is OPEN. */
export const isSignablePetitionStatus = (status: PetitionStatus): boolean => status === "OPEN";

/** No transition leads out of ANSWERED: the authority has responded. */
export const terminalPetitionStatuses: readonly PetitionStatus[] = ["ANSWERED"];

export const isTerminalPetitionStatus = (status: PetitionStatus): boolean =>
  terminalPetitionStatuses.includes(status);

/**
 * Structural alias for the role names in `userRoles`, declared here so
 * this module stays self-contained. Same union as `UserRole`.
 */
export type PetitionUserRole = "CITIZEN" | "AUTHORITY" | "ADMIN";

// --- Petition lifecycle -------------------------------------------------
//
// The table below is the single source of truth for what may happen to a
// petition. The API enforces it; the web app renders only the actions it
// declares. Route handlers carry no status if-statements of their own.
//
// Unlike the civic report table, this one is keyed by an *actor
// capability* rather than a raw role, because a petition has one
// relationship a report does not: its creator. Capability is derived
// server-side from (role, is-this-the-creator) and is the only thing the
// table ever sees.
//
//   CREATOR   -- the CITIZEN whose account published this petition
//   AUTHORITY -- civic authority staff
//   ADMIN     -- staff with reopen/reinstate reach
//
// A citizen who is not the creator maps to no capability at all, so they
// appear in no rule and can move nothing. That is a property of the
// table itself rather than of a middleware check a future route could
// forget -- the same guarantee `civicTransitions` gives.

export const petitionActorCapabilities = ["CREATOR", "AUTHORITY", "ADMIN"] as const;
export type PetitionActorCapability = (typeof petitionActorCapabilities)[number];

export const petitionCapabilityLabels: Record<PetitionActorCapability, string> = {
  CREATOR: "the petition creator",
  AUTHORITY: "the civic authority",
  ADMIN: "an administrator"
};

/**
 * Derives what an actor may do, from server-held state only.
 *
 * `isCreator` is always computed by comparing the authenticated user id
 * against the stored `creatorId`; it is never accepted from a request.
 *
 * **Creatorship is checked first, deliberately: nobody adjudicates their
 * own petition.** Petition creation is CITIZEN-only, so today the only
 * way to be both a creator and a member of staff is for an account to be
 * promoted after publishing something. If that ever happens, this
 * ordering means they keep the creator's single power (closing their own
 * petition) and lose the staff powers *over that one petition* -- they
 * cannot review, answer or remove it. Every other petition is unaffected,
 * and any of their colleagues can still moderate this one, so the rule
 * costs nothing and closes a real conflict of interest rather than
 * relying on the current absence of a role-change feature.
 */
export const petitionCapabilityFor = (
  role: PetitionUserRole,
  isCreator: boolean
): PetitionActorCapability | null => {
  if (isCreator) return "CREATOR";
  if (role === "ADMIN") return "ADMIN";
  if (role === "AUTHORITY") return "AUTHORITY";
  return null;
};

export type PetitionTransitionRule = {
  from: PetitionStatus;
  to: PetitionStatus;
  /** Capabilities permitted to perform this transition. */
  actors: readonly PetitionActorCapability[];
  /** Whether a written reason is mandatory. */
  requiresNote: boolean;
  /** What this transition means, shown as the action label in the UI. */
  label: string;
};

const STAFF = ["AUTHORITY", "ADMIN"] as const;
const ADMIN_ONLY = ["ADMIN"] as const;

export const petitionTransitions: readonly PetitionTransitionRule[] = [
  {
    from: "OPEN",
    to: "CLOSED",
    actors: ["CREATOR", "AUTHORITY", "ADMIN"],
    requiresNote: true,
    label: "Close this petition to further signatures, explaining why"
  },
  {
    from: "OPEN",
    to: "UNDER_REVIEW",
    actors: STAFF,
    requiresNote: false,
    label: "Take this petition up for review"
  },
  {
    from: "OPEN",
    to: "REJECTED",
    actors: STAFF,
    requiresNote: true,
    label: "Remove this petition, with a reason"
  },
  {
    from: "UNDER_REVIEW",
    to: "ANSWERED",
    actors: STAFF,
    requiresNote: true,
    label: "Publish the authority's formal response"
  },
  {
    from: "UNDER_REVIEW",
    to: "CLOSED",
    actors: STAFF,
    requiresNote: true,
    label: "Close without a formal response, explaining why"
  },
  {
    from: "UNDER_REVIEW",
    to: "REJECTED",
    actors: STAFF,
    requiresNote: true,
    label: "Remove this petition, with a reason"
  },
  {
    from: "CLOSED",
    to: "OPEN",
    actors: ADMIN_ONLY,
    requiresNote: true,
    label: "Reopen a closed petition"
  },
  {
    from: "REJECTED",
    to: "OPEN",
    actors: ADMIN_ONLY,
    requiresNote: true,
    label: "Reinstate a removed petition"
  }
];

/** The transitions a given capability may perform from a given status. */
export const petitionTransitionsFor = (
  from: PetitionStatus,
  capability: PetitionActorCapability | null
): PetitionTransitionRule[] =>
  capability === null
    ? []
    : petitionTransitions.filter((rule) => rule.from === from && rule.actors.includes(capability));

export type PetitionTransitionCheck =
  | { ok: true; rule: PetitionTransitionRule }
  | {
      ok: false;
      code: "SAME_STATUS" | "INVALID_TRANSITION" | "FORBIDDEN_ACTOR" | "NOTE_REQUIRED";
      message: string;
    };

/**
 * The one place a petition transition is judged. Both the API and the UI
 * call it; the API's answer is the authoritative one.
 */
export const checkPetitionTransition = (
  from: PetitionStatus,
  to: PetitionStatus,
  capability: PetitionActorCapability | null,
  note?: string
): PetitionTransitionCheck => {
  if (capability === null) {
    return { ok: false, code: "FORBIDDEN_ACTOR", message: "You cannot act on this petition." };
  }

  if (from === to) {
    return { ok: false, code: "SAME_STATUS", message: "This petition is already in that state." };
  }

  const rule = petitionTransitions.find((entry) => entry.from === from && entry.to === to);
  if (!rule) {
    return {
      ok: false,
      code: "INVALID_TRANSITION",
      message: "A petition cannot move directly between those states."
    };
  }

  if (!rule.actors.includes(capability)) {
    return {
      ok: false,
      code: "FORBIDDEN_ACTOR",
      message: "You cannot perform that action on this petition."
    };
  }

  if (rule.requiresNote && (note === undefined || note.trim().length === 0)) {
    return { ok: false, code: "NOTE_REQUIRED", message: "This action requires a written reason." };
  }

  return { ok: true, rule };
};

// --- Petition history ---------------------------------------------------

/**
 * One recorded lifecycle change.
 *
 * Entirely server-constructed: nothing from a request body reaches an
 * entry except the note, so a client cannot forge an actor, a timestamp,
 * a previous status, or a change that never happened.
 *
 * `actorId` is included only for AUTHORITY/ADMIN viewers. Everyone else
 * -- including the general public reading an answered petition -- sees
 * which capability acted and why, which is what makes the decision
 * accountable without naming an individual member of staff.
 */
export type PetitionHistoryEntry = {
  from: PetitionStatus;
  to: PetitionStatus;
  actorCapability: PetitionActorCapability;
  actorId?: string;
  note?: string;
  at: string;
};

// --- Input contracts ----------------------------------------------------

export const petitionTitleMin = 10;
export const petitionTitleMax = 140;
export const petitionDescriptionMin = 50;
export const petitionDescriptionMax = 5000;
export const petitionGoalMin = 10;
export const petitionGoalMax = 100_000;

/**
 * Petition creation input.
 *
 * `.strict()` rather than Zod's default strip: an unknown key is a 400,
 * not a silently discarded field. Nothing here is security-sensitive --
 * `creatorId`, `creatorName`, `status`, `signatureCount`, `history` and
 * both timestamps are absent by design and are set from authenticated
 * server state instead.
 *
 * `signatureGoal` *is* client-chosen, deliberately: it is the creator's
 * own target, it grants no privilege, and it is bounded here.
 */
export const createPetitionSchema = z
  .object({
    category: z.enum(petitionCategories),
    title: z.string().trim().min(petitionTitleMin).max(petitionTitleMax),
    description: z.string().trim().min(petitionDescriptionMin).max(petitionDescriptionMax),
    signatureGoal: z.coerce.number().int().min(petitionGoalMin).max(petitionGoalMax)
  })
  .strict();

export type CreatePetitionInput = z.infer<typeof createPetitionSchema>;

/** A lifecycle action. Same shape as the civic transition contract. */
export const petitionTransitionSchema = z
  .object({
    status: z.enum(petitionStatuses),
    note: z.string().trim().min(3).max(1000).optional()
  })
  .strict();
export type PetitionTransitionInput = z.infer<typeof petitionTransitionSchema>;

// --- Query contracts ----------------------------------------------------

export const petitionSortOptions = ["newest", "oldest", "most_signed"] as const;
export type PetitionSort = (typeof petitionSortOptions)[number];

export const petitionSortLabels: Record<PetitionSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  most_signed: "Most signatures"
};

/**
 * Public listing parameters.
 *
 * Every filter is a closed enum or a bounded integer, so only known
 * fields with known values ever reach the database -- there is no path
 * from a query string to an arbitrary Mongo filter. Unknown parameters
 * are dropped by Zod rather than forwarded.
 *
 * `status` is narrowed to the public statuses: a client cannot ask the
 * public list for removed petitions.
 */
export const petitionListQuerySchema = z.object({
  category: z.enum(petitionCategories).optional(),
  status: z.enum(["OPEN", "UNDER_REVIEW", "ANSWERED", "CLOSED"]).optional(),
  sort: z.enum(petitionSortOptions).default("newest"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});
export type PetitionListQuery = z.infer<typeof petitionListQuerySchema>;

/**
 * The authority queue. Staff may additionally filter on REJECTED and on
 * whether a petition reached the goal its creator set, which is what
 * turns that goal from decoration into a triage signal.
 */
export const petitionQueueQuerySchema = z.object({
  category: z.enum(petitionCategories).optional(),
  status: z.enum(petitionStatuses).optional(),
  goalMet: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  sort: z.enum(petitionSortOptions).default("newest"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});
export type PetitionQueueQuery = z.infer<typeof petitionQueueQuerySchema>;

export const petitionMineFilters = ["created", "signed"] as const;
export type PetitionMineFilter = (typeof petitionMineFilters)[number];

export const petitionMineQuerySchema = z.object({
  filter: z.enum(petitionMineFilters).default("created"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});
export type PetitionMineQuery = z.infer<typeof petitionMineQuerySchema>;

// --- Response shapes ----------------------------------------------------

/**
 * A petition as it appears in a list.
 *
 * Deliberately narrower than the detail shape: no description body, no
 * history, no creator id. A listing is a browsing surface, and the less
 * each row carries the less there is to leak across every page.
 */
export type PetitionSummary = {
  id: string;
  title: string;
  category: PetitionCategory;
  status: PetitionStatus;
  /** Display name of the account that published it, at publication time. */
  creatorName: string;
  signatureGoal: number;
  /** Server-maintained; never accepted from, or adjustable by, a client. */
  signatureCount: number;
  /** Whether the requesting account has signed. False when anonymous. */
  hasSigned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Petition = PetitionSummary & {
  creatorId: string;
  description: string;
  /** Oldest first. Server-controlled, append-only. */
  history: PetitionHistoryEntry[];
};

export type PetitionListResponse = {
  petitions: PetitionSummary[];
  total: number;
  limit: number;
  offset: number;
};

export type PetitionResponse = {
  petition: Petition;
};

export type PetitionSignatureResponse = {
  petition: Petition;
  /** True when this request created the signature rather than finding one. */
  signed: boolean;
};

// --- Derived display helpers -------------------------------------------

/** Whether a petition reached the target its creator set. */
export const hasReachedPetitionGoal = (
  petition: Pick<PetitionSummary, "signatureCount" | "signatureGoal">
): boolean => petition.signatureCount >= petition.signatureGoal;

/**
 * Progress towards the goal as a 0-100 percentage.
 *
 * Clamped at both ends so a petition that overshoots its target does not
 * render a progress bar wider than its track, and a non-positive goal
 * (which validation forbids, but defence in depth is cheap) cannot
 * divide by zero.
 */
export const petitionProgressPercent = (
  petition: Pick<PetitionSummary, "signatureCount" | "signatureGoal">
): number => {
  if (petition.signatureGoal <= 0) return 100;
  const raw = (petition.signatureCount / petition.signatureGoal) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
};

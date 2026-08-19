import type {
  Petition as PublicPetition,
  PetitionHistoryEntry,
  PetitionSummary,
  UserRole
} from "@cap/contracts";
import type { HydratedDocument } from "mongoose";
import type { PetitionDocument } from "../models/petition.js";

/**
 * Maps a stored petition onto the shared public contracts.
 *
 * Two shapes leave this module, and which one a route picks is a
 * deliberate disclosure decision rather than a convenience:
 *
 * - `toPetitionSummary` is what a listing returns. It carries no
 *   description body, no history and no creator id, because a browsing
 *   surface repeats itself across every row of every page and the
 *   cheapest way not to leak something is not to send it.
 * - `toPublicPetition` is the detail shape, and adds exactly those three.
 *
 * The mapper is viewer-aware for the same reason `toPublicCivicReport`
 * is: history carries the id of the actor who moved the petition.
 * AUTHORITY and ADMIN see it because internal accountability needs it;
 * everyone else -- including the general public reading an answered
 * petition -- sees which capability acted and why, which explains the
 * decision without naming an individual. Defaulting to the narrower view
 * means a new caller leaks nothing unless it deliberately opts in.
 *
 * `hasSigned` is passed in rather than read here. It is a fact about the
 * *viewer*, derived from the Signature collection by the route, and
 * keeping it out of this function stops a caller accidentally rendering
 * one citizen's signing state onto another's response.
 */

export type PetitionViewer = {
  role: UserRole;
};

const canSeeActorIdentity = (viewer?: PetitionViewer): boolean =>
  viewer?.role === "AUTHORITY" || viewer?.role === "ADMIN";

/**
 * The stored count is clamped at zero on the way out.
 *
 * `signatureCount` is maintained by `$inc`, and the schema's `min: 0`
 * does not apply to an atomic update operator. A negative count could
 * only arise from a bug or from manual database surgery, but a petition
 * reporting "-1 signatures" would be a visible correctness failure, so
 * the read path refuses to render one.
 */
const safeCount = (value: number): number => (Number.isFinite(value) && value > 0 ? Math.floor(value) : 0);

export const toPetitionSummary = (
  petition: HydratedDocument<PetitionDocument>,
  hasSigned = false
): PetitionSummary => ({
  id: petition.id,
  title: petition.title,
  category: petition.category,
  status: petition.status,
  creatorName: petition.creatorName,
  signatureGoal: petition.signatureGoal,
  signatureCount: safeCount(petition.signatureCount),
  hasSigned,
  createdAt: petition.createdAt.toISOString(),
  updatedAt: petition.updatedAt.toISOString()
});

export const toPublicPetition = (
  petition: HydratedDocument<PetitionDocument>,
  viewer?: PetitionViewer,
  hasSigned = false
): PublicPetition => {
  const showActors = canSeeActorIdentity(viewer);

  const history: PetitionHistoryEntry[] = (petition.history ?? []).map((entry) => ({
    from: entry.from,
    to: entry.to,
    actorCapability: entry.actorCapability,
    ...(showActors ? { actorId: String(entry.actorId) } : {}),
    ...(entry.note ? { note: entry.note } : {}),
    at: entry.at.toISOString()
  }));

  return {
    ...toPetitionSummary(petition, hasSigned),
    creatorId: String(petition.creatorId),
    description: petition.description,
    history
  };
};

/**
 * Whether a viewer may see this petition at all.
 *
 * Every status except REJECTED is public: petitions are broadcast
 * content, and an archive of what the authority closed or answered is
 * the point of having one. A REJECTED petition is different -- it was
 * removed by moderation, and continuing to serve it publicly would undo
 * the removal. It stays readable by its creator, so they can read the
 * reason, and by staff, so the decision stays auditable.
 *
 * Callers turn a `false` here into 404 rather than 403. "Exists but you
 * cannot see it" and "does not exist" are answered identically, so the
 * endpoint cannot be used to confirm that a particular removed petition
 * was ever published -- the same rule the civic report routes follow.
 */
export const isPetitionVisibleTo = (
  petition: Pick<PetitionDocument, "status" | "creatorId">,
  viewer?: { userId: string; role: UserRole }
): boolean => {
  if (petition.status !== "REJECTED") return true;
  if (!viewer) return false;
  if (viewer.role === "AUTHORITY" || viewer.role === "ADMIN") return true;
  return String(petition.creatorId) === viewer.userId;
};

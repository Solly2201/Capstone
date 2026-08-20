import type {
  Petition as PublicPetition,
  PetitionHistoryEntry,
  PetitionSummary,
  UserRole
} from "@cap/contracts";
import type { HydratedDocument } from "mongoose";
import type { PetitionDocument } from "../models/petition.js";

// Maps a stored petition onto the shared public contracts. Which shape a
// route picks is a disclosure decision: the summary carries no
// description, history or creator id; the detail shape adds all three.
//
// Viewer-aware because history carries the actor id. Only AUTHORITY and
// ADMIN see it; the narrower view is the default, so a new caller leaks
// nothing unless it opts in.
//
// hasSigned is passed in rather than read here: it is a fact about the
// viewer, so keeping it out stops one citizen's signing state being
// rendered onto another's response.

export type PetitionViewer = {
  role: UserRole;
};

const canSeeActorIdentity = (viewer?: PetitionViewer): boolean =>
  viewer?.role === "AUTHORITY" || viewer?.role === "ADMIN";

// Clamped on the way out: signatureCount is maintained by $inc, and the
// schema's min: 0 does not apply to an atomic update operator.
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

// Every status except REJECTED is public. A removed petition stays
// readable by its creator, so they can read the reason, and by staff, so
// the decision stays auditable.
//
// Callers turn false into 404, not 403, so this cannot confirm that a
// particular removed petition was ever published.
export const isPetitionVisibleTo = (
  petition: Pick<PetitionDocument, "status" | "creatorId">,
  viewer?: { userId: string; role: UserRole }
): boolean => {
  if (petition.status !== "REJECTED") return true;
  if (!viewer) return false;
  if (viewer.role === "AUTHORITY" || viewer.role === "ADMIN") return true;
  return String(petition.creatorId) === viewer.userId;
};

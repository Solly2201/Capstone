import {
  checkPetitionTransition,
  petitionCapabilityFor,
  type PetitionStatus,
  type UserRole
} from "@cap/contracts";
import { isPetitionVisibleTo } from "../lib/petitions.js";
import { Petition, type PetitionDocument } from "../models/petition.js";
import type { HydratedDocument } from "mongoose";

// Every petition status change goes through this module: routes validate
// shapes and answer HTTP, the decision lives here and in the shared
// transition table, so there is one place to audit.
//
// Three invariants this file owns:
//   No forged actor -- capability is computed from the authenticated user
//     id against the stored creatorId, never from the request.
//   No forged history -- entries are built from that capability and the
//     server clock; only the note comes from the request.
//   No lost updates -- the write is conditional on the status the
//     decision was made against, so a concurrent move reports a conflict
//     instead of being silently overwritten.

export type PetitionActor = {
  userId: string;
  role: UserRole;
};

export type PetitionWorkflowFailure = {
  ok: false;
  /** Maps directly onto an HTTP status in the route layer. */
  code: "NOT_FOUND" | "INVALID_TRANSITION" | "FORBIDDEN" | "CONFLICT";
  message: string;
};

export type PetitionWorkflowSuccess = {
  ok: true;
  petition: HydratedDocument<PetitionDocument>;
};

export type PetitionWorkflowResult = PetitionWorkflowSuccess | PetitionWorkflowFailure;

// Order matters: load, derive capability from stored state, let the
// shared table judge, then issue the conditional write.
export const applyPetitionTransition = async (
  petitionId: string,
  nextStatus: PetitionStatus,
  actor: PetitionActor,
  note?: string
): Promise<PetitionWorkflowResult> => {
  const petition = await Petition.findById(petitionId);
  if (!petition) return { ok: false, code: "NOT_FOUND", message: "Petition not found." };

  // Reported before any transition reasoning, and via the same rule the
  // read path uses, so a stranger probing ids cannot tell a removed
  // petition from one that never existed.
  if (!isPetitionVisibleTo(petition, actor)) {
    return { ok: false, code: "NOT_FOUND", message: "Petition not found." };
  }

  const isCreator = String(petition.creatorId) === actor.userId;

  const capability = petitionCapabilityFor(actor.role, isCreator);
  const currentStatus = petition.status;
  const check = checkPetitionTransition(currentStatus, nextStatus, capability, note);
  if (!check.ok) {
    return {
      ok: false,
      code: check.code === "FORBIDDEN_ACTOR" ? "FORBIDDEN" : "INVALID_TRANSITION",
      message: check.message
    };
  }

  const at = new Date();
  const updated = await Petition.findOneAndUpdate(
    // The status filter is the concurrency guard, not just a lookup.
    { _id: petition._id, status: currentStatus },
    {
      $set: { status: nextStatus },
      $push: {
        history: {
          from: currentStatus,
          to: nextStatus,
          actorId: actor.userId,
          // The capability the table actually judged, so the trail says
          // "closed by the creator" rather than leaving it to inference.
          actorCapability: capability,
          ...(note ? { note } : {}),
          at
        }
      }
    },
    { new: true }
  );

  if (!updated) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "This petition changed while you were working on it. Reload and try again."
    };
  }

  return { ok: true, petition: updated };
};

/** HTTP status for each workflow failure code. */
export const petitionWorkflowStatusCode: Record<PetitionWorkflowFailure["code"], number> = {
  NOT_FOUND: 404,
  INVALID_TRANSITION: 422,
  FORBIDDEN: 403,
  CONFLICT: 409
};

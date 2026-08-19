import {
  checkPetitionTransition,
  petitionCapabilityFor,
  type PetitionStatus,
  type UserRole
} from "@cap/contracts";
import { isPetitionVisibleTo } from "../lib/petitions.js";
import { Petition, type PetitionDocument } from "../models/petition.js";
import type { HydratedDocument } from "mongoose";

/**
 * The petition lifecycle workflow.
 *
 * Every status change goes through this module. Routes validate shapes
 * and answer HTTP; the decision about whether a change is allowed lives
 * here and in the shared transition table, so there is exactly one place
 * to audit -- the same split `civic-workflow.ts` uses.
 *
 * Three properties this file is responsible for:
 *
 * 1. **No forged actor.** The capability that the transition table is
 *    asked about is computed here, from the authenticated user id
 *    against the *stored* `creatorId`. A request cannot claim to be the
 *    creator of a petition it did not create, because nothing in the
 *    request is consulted when deciding that.
 *
 * 2. **No forged history.** Entries are built here from the derived
 *    capability and the server clock. Nothing from a request body
 *    reaches them except the free-text note.
 *
 * 3. **No lost updates.** The write is conditional on the status the
 *    decision was made against, so if somebody else moves the petition
 *    between our read and our write, our update matches nothing and we
 *    report a conflict instead of silently overwriting their action.
 */

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

/**
 * Applies a lifecycle transition.
 *
 * Order matters: the petition is loaded, the actor's capability is
 * derived from stored state, the shared table judges the move, and only
 * then is the conditional write issued.
 *
 * A petition that the actor cannot even see is reported as NOT_FOUND
 * before any transition reasoning happens, so a stranger probing ids
 * cannot tell a removed petition from one that never existed.
 */
export const applyPetitionTransition = async (
  petitionId: string,
  nextStatus: PetitionStatus,
  actor: PetitionActor,
  note?: string
): Promise<PetitionWorkflowResult> => {
  const petition = await Petition.findById(petitionId);
  if (!petition) return { ok: false, code: "NOT_FOUND", message: "Petition not found." };

  // A petition the actor cannot even see must not acknowledge existing,
  // through this endpoint any more than through the read one -- so the
  // same `isPetitionVisibleTo` rule decides it, rather than a second
  // copy of the reasoning that could drift from the first.
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
          // Recorded as the capability the table actually judged, so the
          // audit trail says "closed by the creator" rather than leaving
          // a reader to infer it from a role.
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

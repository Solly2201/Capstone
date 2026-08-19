import { isSignablePetitionStatus } from "@cap/contracts";
import { Petition, type PetitionDocument } from "../models/petition.js";
import { Signature, isDuplicateKeyError } from "../models/signature.js";
import type { HydratedDocument } from "mongoose";

/**
 * Signature integrity.
 *
 * This is the security-critical part of the petition feature: a
 * signature count is the only thing a petition asserts about the world,
 * so the whole feature is worth nothing if the count can be inflated.
 *
 * The design rests on one database-enforced fact -- the unique index on
 * `{ petitionId, citizenId }` in `models/signature.ts` -- and treats
 * everything else as untrusted:
 *
 * - The citizen id always comes from the verified JWT. There is no code
 *   path anywhere that reads a signer identity from a request.
 * - "Have you already signed?" is never asked as a precondition and then
 *   acted on. That is check-then-act and it loses under concurrency:
 *   two simultaneous requests both read "no" and both insert. Instead
 *   the insert is simply attempted, and the database rejects the loser
 *   with a duplicate-key error. Exactly one of N racing requests can
 *   win, whatever N is.
 * - The count is adjusted with `$inc`, which is atomic in MongoDB, so
 *   concurrent signers cannot lose each other's updates the way a
 *   read-modify-write would.
 *
 * **Why not a transaction.** The deployment target (`docker-compose.yml`)
 * runs a standalone mongod, and MongoDB multi-document transactions
 * require a replica set, so a transaction is not available to be used
 * here rather than being passed over. The consequences are handled
 * explicitly instead, with compensating writes below, and the residual
 * risk is bounded and one-directional: see `signPetition`.
 */

export type SignatureActor = {
  userId: string;
};

export type SignatureFailure = {
  ok: false;
  code: "NOT_FOUND" | "NOT_OPEN" | "ALREADY_SIGNED" | "NOT_SIGNED" | "CONFLICT";
  message: string;
};

export type SignatureSuccess = {
  ok: true;
  petition: HydratedDocument<PetitionDocument>;
  /** True when this request changed the signature state. */
  changed: boolean;
};

export type SignatureResult = SignatureSuccess | SignatureFailure;

export const signatureStatusCode: Record<SignatureFailure["code"], number> = {
  NOT_FOUND: 404,
  NOT_OPEN: 422,
  ALREADY_SIGNED: 409,
  NOT_SIGNED: 409,
  CONFLICT: 409
};

/**
 * Records one citizen's signature.
 *
 * The ordering is deliberate: **insert the signature first, then adjust
 * the count.**
 *
 * Inserting first means the overwhelmingly common failure -- the same
 * citizen signing twice, which is what a double-clicked button or a
 * replayed request produces -- fails atomically at the unique index
 * before anything else has happened, so it needs no compensation at all.
 * Incrementing first would make that common case require an undo.
 *
 * The rarer race is the petition closing between the status check and
 * the increment. That is caught by making the increment itself
 * conditional on the petition still being OPEN: if it matches nothing,
 * the signature that was just inserted is deleted again. Deleting is
 * safe because this request is the one that created that exact row.
 *
 * If the process died between the insert and the increment, the count
 * would be one lower than the number of signature rows. That drift is
 * one-directional by construction -- the count can only ever understate
 * support, never overstate it -- and the Signature collection remains
 * the source of truth, so a recount is a single aggregation. An
 * inflated count would be a correctness failure; a conservative one is
 * a recoverable inaccuracy.
 */
export const signPetition = async (
  petitionId: string,
  actor: SignatureActor
): Promise<SignatureResult> => {
  const petition = await Petition.findById(petitionId);
  if (!petition) return { ok: false, code: "NOT_FOUND", message: "Petition not found." };

  if (!isSignablePetitionStatus(petition.status)) {
    return {
      ok: false,
      code: "NOT_OPEN",
      message: "This petition is no longer open for signatures."
    };
  }

  let signatureId: unknown;
  try {
    const created = await Signature.create({ petitionId: petition._id, citizenId: actor.userId });
    signatureId = created._id;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      // The database refused a second signature from this citizen. This
      // is a successful outcome for the user's intent ("I support this")
      // even though nothing changed, so the route answers 409 with the
      // petition attached rather than treating it as an error page.
      return { ok: false, code: "ALREADY_SIGNED", message: "You have already signed this petition." };
    }
    throw error;
  }

  const updated = await Petition.findOneAndUpdate(
    { _id: petition._id, status: "OPEN" },
    { $inc: { signatureCount: 1 } },
    { new: true }
  );

  if (!updated) {
    // The petition stopped being open while we were inserting. Undo the
    // signature so a closed petition does not carry one that was never
    // counted.
    await Signature.deleteOne({ _id: signatureId });
    return {
      ok: false,
      code: "NOT_OPEN",
      message: "This petition closed before your signature could be recorded."
    };
  }

  return { ok: true, petition: updated, changed: true };
};

/**
 * Withdraws a citizen's own signature.
 *
 * Included because signing is an act of consent and consent that cannot
 * be taken back is not really consent -- not because the endpoint was
 * easy to add. It is restricted to OPEN petitions: once a petition has
 * been closed, reviewed or answered, its tally is the historical record
 * the authority acted on and editing it afterwards would rewrite that
 * record.
 *
 * The ordering here is the mirror image of signing: **decrement first,
 * then delete.** A withdrawal's common failure is "you had not signed",
 * which is caught by the cheap existence check before any write. What
 * the ordering then protects against is the petition closing mid-request
 * -- the conditional decrement fails, and no signature has been removed
 * yet. If the delete unexpectedly removes nothing (two withdrawals
 * racing), the decrement is compensated back.
 */
export const withdrawSignature = async (
  petitionId: string,
  actor: SignatureActor
): Promise<SignatureResult> => {
  const petition = await Petition.findById(petitionId);
  if (!petition) return { ok: false, code: "NOT_FOUND", message: "Petition not found." };

  if (!isSignablePetitionStatus(petition.status)) {
    return {
      ok: false,
      code: "NOT_OPEN",
      message: "This petition is closed, so its signatures can no longer be changed."
    };
  }

  const existing = await Signature.exists({ petitionId: petition._id, citizenId: actor.userId });
  if (!existing) {
    return { ok: false, code: "NOT_SIGNED", message: "You have not signed this petition." };
  }

  const updated = await Petition.findOneAndUpdate(
    { _id: petition._id, status: "OPEN", signatureCount: { $gt: 0 } },
    { $inc: { signatureCount: -1 } },
    { new: true }
  );

  if (!updated) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "This petition changed while you were working on it. Reload and try again."
    };
  }

  const removed = await Signature.deleteOne({ petitionId: petition._id, citizenId: actor.userId });
  if (removed.deletedCount === 0) {
    // Another request withdrew the same signature first. Give the count
    // back, because this request removed nothing.
    await Petition.updateOne({ _id: petition._id }, { $inc: { signatureCount: 1 } });
    return { ok: false, code: "NOT_SIGNED", message: "You have not signed this petition." };
  }

  return { ok: true, petition: updated, changed: true };
};

/**
 * Whether one citizen has signed one petition.
 *
 * Answers `false` for an anonymous viewer without touching the database.
 */
export const hasCitizenSigned = async (
  petitionId: unknown,
  citizenId?: string
): Promise<boolean> => {
  if (!citizenId) return false;
  const found = await Signature.exists({ petitionId, citizenId });
  return found !== null;
};

/**
 * Which of a page of petitions a citizen has signed.
 *
 * One `$in` query for the whole page rather than one per row: a listing
 * of 50 petitions costs a single indexed lookup, not 50.
 */
export const signedPetitionIds = async (
  petitionIds: unknown[],
  citizenId?: string
): Promise<Set<string>> => {
  if (!citizenId || petitionIds.length === 0) return new Set();
  const rows = await Signature.find({ petitionId: { $in: petitionIds }, citizenId }).select("petitionId");
  return new Set(rows.map((row) => String(row.petitionId)));
};

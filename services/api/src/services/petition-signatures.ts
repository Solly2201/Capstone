import { isSignablePetitionStatus } from "@cap/contracts";
import { Petition, type PetitionDocument } from "../models/petition.js";
import { Signature, isDuplicateKeyError } from "../models/signature.js";
import type { HydratedDocument } from "mongoose";

// Signature integrity -- the security-critical part of the petition
// feature, since an inflatable count makes a petition assert nothing.
//
// The design rests on one database-enforced fact, the unique index on
// { petitionId, citizenId } in models/signature.ts, and trusts nothing
// else:
//   The citizen id always comes from the verified JWT; no code path reads
//     a signer identity from a request.
//   "Have you already signed?" is never a precondition that is then acted
//     on -- that is check-then-act and loses under concurrency. The insert
//     is attempted and the database rejects the loser, so exactly one of N
//     racing requests wins.
//   The count moves by $inc, which is atomic, so concurrent signers cannot
//     lose each other's updates.
//
// No transaction: the deployment target runs a standalone mongod, and
// multi-document transactions need a replica set. The consequences are
// handled with the compensating writes below, and the residual risk is
// one-directional -- see signPetition.

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

// Record one citizen's signature: insert the signature first, then adjust
// the count.
//
// Inserting first means the common failure -- the same citizen signing
// twice from a double-click or a replay -- fails atomically at the unique
// index before anything else happens, needing no compensation.
//
// The rarer race is the petition closing between the status check and the
// increment, caught by making the increment conditional on OPEN; if it
// matches nothing the just-inserted signature is deleted again.
//
// A crash between the two leaves the count one below the row count. That
// drift is one-directional -- the count can only understate support --
// and Signature stays the source of truth, so a recount is one aggregation.
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
      // The database refused a second signature. The user's intent is
      // already satisfied, so this is a 409 with the petition attached
      // rather than an error page.
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
    // Closed mid-insert: undo, so a closed petition does not carry a
    // signature that was never counted.
    await Signature.deleteOne({ _id: signatureId });
    return {
      ok: false,
      code: "NOT_OPEN",
      message: "This petition closed before your signature could be recorded."
    };
  }

  return { ok: true, petition: updated, changed: true };
};

// Withdraw a citizen's own signature: signing is consent, and consent
// that cannot be taken back is not consent. Restricted to OPEN petitions
// -- once closed or answered, the tally is the record the authority acted
// on, and editing it would rewrite that record.
//
// The ordering mirrors signing: decrement first, then delete. The common
// failure ("you had not signed") is caught by the existence check before
// any write; the ordering then protects against the petition closing
// mid-request, since the conditional decrement fails before anything is
// removed. If two withdrawals race, the decrement is compensated back.
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
    // Another request withdrew it first, and this one removed nothing.
    await Petition.updateOne({ _id: petition._id }, { $inc: { signatureCount: 1 } });
    return { ok: false, code: "NOT_SIGNED", message: "You have not signed this petition." };
  }

  return { ok: true, petition: updated, changed: true };
};

// Answers false for an anonymous viewer without touching the database.
export const hasCitizenSigned = async (
  petitionId: unknown,
  citizenId?: string
): Promise<boolean> => {
  if (!citizenId) return false;
  const found = await Signature.exists({ petitionId, citizenId });
  return found !== null;
};

// One $in query for a whole page rather than one per row: a listing of
// 50 petitions costs a single indexed lookup, not 50.
export const signedPetitionIds = async (
  petitionIds: unknown[],
  citizenId?: string
): Promise<Set<string>> => {
  if (!citizenId || petitionIds.length === 0) return new Set();
  const rows = await Signature.find({ petitionId: { $in: petitionIds }, citizenId }).select("petitionId");
  return new Set(rows.map((row) => String(row.petitionId)));
};

// The documented recovery for count drift, now implemented: the
// Signature collection is the source of truth, so the count is set from
// a real row count. ADMIN-triggered maintenance, not part of any citizen
// path. A signature landing between the count and the write can leave
// the stored value one below the rows again -- the same conservative
// direction as every other drift here, fixable by running it again.
export const recountPetitionSignatures = async (
  petitionId: string
): Promise<HydratedDocument<PetitionDocument> | null> => {
  const rows = await Signature.countDocuments({ petitionId });
  return Petition.findByIdAndUpdate(
    petitionId,
    { $set: { signatureCount: rows } },
    { new: true }
  );
};

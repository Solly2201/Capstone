import { Schema, model, type Types } from "mongoose";

// One citizen's signature on one petition, and the source of truth for
// petition support -- Petition.signatureCount is a cache derived from it.
//
// The unique compound index below is the security control, not a
// convenience: a second insert for the same pair fails with E11000 no
// matter how many requests race. An application-level "have they signed?"
// check is check-then-act and loses under concurrency; this does not.
//
// The document carries no free text, so there is nothing here for a
// client to smuggle a field into.

export type SignatureDocument = {
  petitionId: Types.ObjectId;
  /** Always derived from the verified JWT, never from a request body. */
  citizenId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const signatureSchema = new Schema<SignatureDocument>(
  {
    petitionId: { type: Schema.Types.ObjectId, ref: "Petition", required: true },
    citizenId: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

// The uniqueness constraint. Also serves the "has this citizen signed?"
// lookup and the listing's $in batch lookup, which query the same pair.
signatureSchema.index({ petitionId: 1, citizenId: 1 }, { unique: true });

// Petitions I have signed, most recent first.
signatureSchema.index({ citizenId: 1, createdAt: -1 });

export const Signature = model<SignatureDocument>("Signature", signatureSchema);

// MongoDB's duplicate-key code, so the signing path can tell "already
// signed" from a real database failure without string-matching.
export const DUPLICATE_KEY_ERROR = 11000;

export const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === DUPLICATE_KEY_ERROR;

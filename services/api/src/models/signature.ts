import { Schema, model, type Types } from "mongoose";

/**
 * One citizen's signature on one petition.
 *
 * This collection is the source of truth for petition support.
 * `Petition.signatureCount` is a cache derived from it, never the other
 * way round.
 *
 * **The unique compound index is the security control**, not a
 * convenience. "One signature per citizen per petition" is enforced by
 * the database: a second insert for the same pair fails with a duplicate
 * key error (E11000) no matter how many requests race, how many browser
 * tabs are open, or whether the frontend remembered to disable a button.
 * Application-level "have they signed already?" checks are inherently
 * check-then-act and lose under concurrency; this does not.
 *
 * The document is deliberately tiny -- petition, citizen, timestamp. A
 * signature carries no free text, so there is no user-controlled content
 * here to sanitise, and no room for a client to smuggle a field in.
 *
 * There is no compound `_id` trick and no application-generated id: the
 * default `_id` plus the unique index is the simplest arrangement that
 * gives both a stable row identity and the constraint.
 */

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

/**
 * The uniqueness constraint. Also serves the "has this citizen signed?"
 * lookup on the detail page and the `$in` batch lookup the listing uses,
 * since both query on this exact prefix pair.
 */
signatureSchema.index({ petitionId: 1, citizenId: 1 }, { unique: true });

/** "Petitions I have signed, most recent first." */
signatureSchema.index({ citizenId: 1, createdAt: -1 });

export const Signature = model<SignatureDocument>("Signature", signatureSchema);

/**
 * MongoDB's duplicate-key error code.
 *
 * Exported so the signing path can tell "somebody already signed this"
 * apart from a genuine database failure without string-matching an error
 * message. Mongoose surfaces the driver's `code` on the thrown error.
 */
export const DUPLICATE_KEY_ERROR = 11000;

export const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === DUPLICATE_KEY_ERROR;

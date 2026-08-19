import { Schema, model, type Types } from "mongoose";
import {
  petitionActorCapabilities,
  petitionCategories,
  petitionDescriptionMax,
  petitionGoalMax,
  petitionGoalMin,
  petitionStatuses,
  petitionTitleMax,
  type PetitionActorCapability,
  type PetitionCategory,
  type PetitionStatus
} from "@cap/contracts";

/**
 * A citizen-published petition.
 *
 * Signatures are NOT embedded here -- see `models/signature.ts`. That is
 * the load-bearing decision in this model, so the reasoning is recorded
 * where the alternative would have lived:
 *
 * 1. **Uniqueness.** MongoDB cannot enforce a unique constraint *within*
 *    an array, so "one signature per citizen per petition" would rest on
 *    application logic plus `$addToSet`. A separate collection gets a
 *    real unique index on `{ petitionId, citizenId }`, enforced by the
 *    database itself rather than by remembering to check.
 * 2. **Bounds.** A report's history is bounded by the shape of its state
 *    machine; a successful petition's signature list is bounded only by
 *    the size of the population. A document has a 16 MB ceiling, so an
 *    embedded array turns popularity into a hard write failure.
 * 3. **Read cost.** Embedding drags the whole signer list into every
 *    read, including a listing page that only wants a count.
 *
 * `history` *is* embedded, for exactly the reasons `CivicReport.history`
 * is: it is only ever read with its petition, only ever written by the
 * petition workflow service, and bounded by the state machine's shape.
 * Keeping it in the same document is also what makes the conditional
 * status update in `petition-workflow.ts` correct without a transaction.
 */

export type PetitionHistorySubdocument = {
  from: PetitionStatus;
  to: PetitionStatus;
  actorId: Types.ObjectId;
  actorCapability: PetitionActorCapability;
  note?: string;
  at: Date;
};

export type PetitionDocument = {
  creatorId: Types.ObjectId;
  /**
   * Display name of the creating account, captured at publication time.
   *
   * Denormalised on purpose. A petition is a signed public statement, so
   * its byline is a snapshot of who published it rather than a live view
   * of an account that may since have been renamed -- and a listing page
   * would otherwise join against users on every row of every page. The
   * value is read from the authenticated user's own record server-side,
   * so it cannot be supplied or forged by a client.
   */
  creatorName: string;
  category: PetitionCategory;
  title: string;
  description: string;
  signatureGoal: number;
  /**
   * Cached count, maintained only by `$inc` after a signature row has
   * been successfully inserted or removed. The `Signature` collection is
   * the source of truth; this field exists so a listing does not have to
   * count rows per petition. It is never written from a request body and
   * appears in no input schema.
   */
  signatureCount: number;
  status: PetitionStatus;
  history: PetitionHistorySubdocument[];
  createdAt: Date;
  updatedAt: Date;
};

const historySchema = new Schema<PetitionHistorySubdocument>(
  {
    from: { type: String, required: true, enum: [...petitionStatuses] },
    to: { type: String, required: true, enum: [...petitionStatuses] },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorCapability: { type: String, required: true, enum: [...petitionActorCapabilities] },
    note: { type: String, trim: true, maxlength: 1000 },
    at: { type: Date, required: true }
  },
  { _id: false }
);

const petitionSchema = new Schema<PetitionDocument>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    creatorName: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, required: true, enum: [...petitionCategories] },
    title: { type: String, required: true, trim: true, maxlength: petitionTitleMax },
    description: { type: String, required: true, trim: true, maxlength: petitionDescriptionMax },
    signatureGoal: { type: Number, required: true, min: petitionGoalMin, max: petitionGoalMax },
    signatureCount: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, required: true, enum: [...petitionStatuses], default: "OPEN", index: true },
    history: { type: [historySchema], default: [] }
  },
  { timestamps: true }
);

// "Petitions I published, newest first" -- the My petitions query.
petitionSchema.index({ creatorId: 1, createdAt: -1 });
// The public browse surface filters on status and orders by date.
petitionSchema.index({ status: 1, createdAt: -1 });
// The "most signatures first" ordering, within a status.
petitionSchema.index({ status: 1, signatureCount: -1 });
// Category browsing, newest first.
petitionSchema.index({ status: 1, category: 1, createdAt: -1 });

export const Petition = model<PetitionDocument>("Petition", petitionSchema);

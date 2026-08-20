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

// A citizen-published petition.
//
// Signatures are deliberately NOT embedded -- see models/signature.ts.
// MongoDB cannot enforce uniqueness within an array, a signature list is
// bounded only by the population against a 16 MB document ceiling, and
// embedding would drag the signer list into every listing read.
//
// history IS embedded: only ever read with its petition, only ever
// written by the workflow service, and bounded by the state machine. One
// atomic document is what makes the conditional status update in
// petition-workflow.ts correct without a transaction.

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
   * Display name captured at publication time. Denormalised on purpose:
   * a petition's byline is a snapshot of who published it, and a listing
   * would otherwise join against users on every row. Read server-side
   * from the authenticated account, so a client cannot forge it.
   */
  creatorName: string;
  category: PetitionCategory;
  title: string;
  description: string;
  signatureGoal: number;
  /**
   * Cached count, maintained only by $inc after a signature row is
   * inserted or removed. Signature is the source of truth; this exists so
   * a listing need not count rows. Never written from a request body.
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

// My petitions, newest first.
petitionSchema.index({ creatorId: 1, createdAt: -1 });
// The public browse surface filters on status and orders by date.
petitionSchema.index({ status: 1, createdAt: -1 });
// The "most signatures first" ordering, within a status.
petitionSchema.index({ status: 1, signatureCount: -1 });
// Category browsing, newest first.
petitionSchema.index({ status: 1, category: 1, createdAt: -1 });

export const Petition = model<PetitionDocument>("Petition", petitionSchema);

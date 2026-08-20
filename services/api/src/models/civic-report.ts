import { Schema, model, type Types } from "mongoose";
import {
  civicCategories,
  civicHistoryTypes,
  civicMediaAllowedMimeTypes,
  civicPriorities,
  civicStatuses,
  userRoles,
  type CivicCategory,
  type CivicHistoryType,
  type CivicMediaMimeType,
  type CivicPriority,
  type CivicStatus,
  type UserRole
} from "@cap/contracts";

// A citizen-submitted civic issue.
//
// Location is GeoJSON with a 2dsphere index so nearby-report and
// clustering queries need no migration later. Note the coordinate order:
// GeoJSON is [longitude, latitude], the reverse of how the API and UI
// talk about it, and the conversion lives only in toPublicCivicReport so
// the inversion cannot spread.
//
// Media and history are embedded: a report owns its files, and its
// history is only read with the report, only written by the workflow
// service, and bounded by the state machine. One atomic document is what
// makes the conditional status update in civic-workflow.ts safe without a
// transaction. Only storage references live here; bytes are on disk.

export type CivicMediaSubdocument = {
  _id: Types.ObjectId;
  scope: "originals";
  storedName: string;
  mimeType: CivicMediaMimeType;
  size: number;
  uploadedAt: Date;
};

export type CivicHistorySubdocument = {
  type: CivicHistoryType;
  from: string;
  to: string;
  actorId: Types.ObjectId;
  actorRole: UserRole;
  note?: string;
  at: Date;
};

export type CivicReportDocument = {
  reporterId: Types.ObjectId;
  category: CivicCategory;
  title: string;
  description: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  landmark?: string;
  status: CivicStatus;
  priority: CivicPriority;
  media: CivicMediaSubdocument[];
  history: CivicHistorySubdocument[];
  /** SLA deadline: createdAt + the window for the current priority. */
  dueAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const mediaSchema = new Schema<CivicMediaSubdocument>({
  scope: { type: String, required: true, enum: ["originals"] },
  storedName: { type: String, required: true },
  mimeType: { type: String, required: true, enum: [...civicMediaAllowedMimeTypes] },
  size: { type: Number, required: true, min: 1 },
  uploadedAt: { type: Date, required: true, default: () => new Date() }
});

const historySchema = new Schema<CivicHistorySubdocument>(
  {
    type: { type: String, required: true, enum: [...civicHistoryTypes] },
    from: { type: String, required: true },
    to: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorRole: { type: String, required: true, enum: [...userRoles] },
    note: { type: String, trim: true, maxlength: 500 },
    at: { type: Date, required: true }
  },
  { _id: false }
);

const civicReportSchema = new Schema<CivicReportDocument>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: true, enum: [...civicCategories] },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    location: {
      type: { type: String, required: true, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value: number[]) =>
            value.length === 2 &&
            value[0] >= -180 &&
            value[0] <= 180 &&
            value[1] >= -90 &&
            value[1] <= 90,
          message: "coordinates must be [longitude, latitude] within valid ranges"
        }
      }
    },
    landmark: { type: String, trim: true, maxlength: 200 },
    status: { type: String, required: true, enum: [...civicStatuses], default: "SUBMITTED", index: true },
    priority: { type: String, required: true, enum: [...civicPriorities], default: "MEDIUM" },
    media: { type: [mediaSchema], default: [] },
    history: { type: [historySchema], default: [] },
    dueAt: { type: Date }
  },
  { timestamps: true }
);

// My reports, newest first.
civicReportSchema.index({ reporterId: 1, createdAt: -1 });
// Supports any date-ordered listing.
civicReportSchema.index({ createdAt: -1 });
// The authority queue filters on status and orders by deadline.
civicReportSchema.index({ status: 1, dueAt: 1 });
// Reserved for nearby-report and clustering queries.
civicReportSchema.index({ location: "2dsphere" });

export const CivicReport = model<CivicReportDocument>("CivicReport", civicReportSchema);

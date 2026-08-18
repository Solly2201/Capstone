import { Schema, model, type Types } from "mongoose";
import {
  civicCategories,
  civicMediaAllowedMimeTypes,
  civicPriorities,
  civicStatuses,
  type CivicCategory,
  type CivicMediaMimeType,
  type CivicPriority,
  type CivicStatus
} from "@cap/contracts";

/**
 * A citizen-submitted civic issue.
 *
 * Location is stored as GeoJSON (`{ type: "Point", coordinates: [lng, lat] }`)
 * with a 2dsphere index, so "reports near me" and duplicate-clustering
 * queries are possible later without a migration. Note the coordinate
 * ORDER: GeoJSON is [longitude, latitude], the reverse of how the API
 * and UI talk about it -- conversion happens in one place
 * (`toPublicCivicReport`) so the inversion cannot spread.
 *
 * Media is embedded rather than a separate collection: a report owns its
 * files, they are never shared between reports, and the array is capped
 * at one image in this milestone. Only storage references live here --
 * the bytes are on disk via LocalFileStorage.
 */

export type CivicMediaSubdocument = {
  _id: Types.ObjectId;
  scope: "originals";
  storedName: string;
  mimeType: CivicMediaMimeType;
  size: number;
  uploadedAt: Date;
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
    media: { type: [mediaSchema], default: [] }
  },
  { timestamps: true }
);

// "My reports, newest first" is the only list query in this milestone.
civicReportSchema.index({ reporterId: 1, createdAt: -1 });
// Supports a future authority queue and any date-ordered listing.
civicReportSchema.index({ createdAt: -1 });
// Geospatial queries (nearby reports, duplicate clustering) later.
civicReportSchema.index({ location: "2dsphere" });

export const CivicReport = model<CivicReportDocument>("CivicReport", civicReportSchema);

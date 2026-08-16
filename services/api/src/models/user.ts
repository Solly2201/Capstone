import { Schema, model } from "mongoose";
import type { UserRole } from "@cap/contracts";

export type UserDocument = {
  fullName: string;
  email: string;
  passwordHash: string;
  profilePhotoUrl?: string;
  role: UserRole;
  emailVerified: boolean;
  disclaimerAcceptance: {
    version: string;
    acceptedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    profilePhotoUrl: { type: String },
    role: { type: String, required: true, enum: ["CITIZEN", "AUTHORITY", "ADMIN"] },
    emailVerified: { type: Boolean, required: true, default: false },
    disclaimerAcceptance: {
      version: { type: String, required: true },
      acceptedAt: { type: Date, required: true }
    }
  },
  { timestamps: true }
);

export const User = model<UserDocument>("User", userSchema);

import { Schema, model } from "mongoose";
import type { UserRole } from "@cap/contracts";

export type UserDocument = {
  fullName: string;
  email: string;
  passwordHash: string;
  profilePhotoUrl?: string;
  role: UserRole;
  emailVerified: boolean;
  /**
   * Pending email-verification challenge. Only the SHA-256 hash of the
   * token is stored, so a database read cannot be replayed to verify
   * somebody else's account (same reasoning as never storing the raw
   * password). Cleared once the account is verified.
   */
  emailVerification?: {
    tokenHash: string;
    expiresAt: Date;
  };
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
    emailVerification: {
      type: new Schema(
        {
          tokenHash: { type: String, required: true },
          expiresAt: { type: Date, required: true }
        },
        { _id: false }
      ),
      required: false,
      select: false
    },
    disclaimerAcceptance: {
      version: { type: String, required: true },
      acceptedAt: { type: Date, required: true }
    }
  },
  { timestamps: true }
);

export const User = model<UserDocument>("User", userSchema);

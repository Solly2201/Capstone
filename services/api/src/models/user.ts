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
  /**
   * Bumped to invalidate every access token already issued to this
   * account. Privileged routes compare it against the token's claim, so
   * a demotion or a compromised session can be revoked without waiting
   * for the token to expire.
   */
  tokenVersion: number;
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
    tokenVersion: { type: Number, required: true, default: 0 },
    disclaimerAcceptance: {
      version: { type: String, required: true },
      acceptedAt: { type: Date, required: true }
    }
  },
  { timestamps: true }
);

export const User = model<UserDocument>("User", userSchema);

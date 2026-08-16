import { z } from "zod";

export const userRoles = ["CITIZEN", "AUTHORITY", "ADMIN"] as const;
export type UserRole = (typeof userRoles)[number];

export const disclaimerVersion = "2026-08-16";

export const disclaimerText =
  "This module is only for public awareness and information. For any real-world implication, please contact a legal adviser.";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(12).max(128),
  profilePhotoUrl: z.string().url().optional(),
  acceptedDisclaimer: z.literal(true)
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  profilePhotoUrl?: string;
  role: UserRole;
  emailVerified: boolean;
};

import type { PublicUser } from "@cap/contracts";
import type { HydratedDocument } from "mongoose";
import type { UserDocument } from "../models/user.js";

export const toPublicUser = (user: HydratedDocument<UserDocument>): PublicUser => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  ...(user.profilePhotoUrl ? { profilePhotoUrl: user.profilePhotoUrl } : {}),
  role: user.role,
  emailVerified: user.emailVerified
});

import { Router } from "express";
import bcrypt from "bcrypt";
import { loginSchema, registerSchema, disclaimerVersion } from "@cap/contracts";
import { User } from "../models/user.js";
import { signAccessToken } from "../lib/jwt.js";
import { toPublicUser } from "../lib/users.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/register", async (request, response, next) => {
  try {
    const input = registerSchema.parse(request.body);
    const existing = await User.exists({ email: input.email.toLowerCase() });
    if (existing) return response.status(409).json({ message: "An account already exists for this email." });

    const user = await User.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      profilePhotoUrl: input.profilePhotoUrl,
      role: "CITIZEN",
      emailVerified: false,
      disclaimerAcceptance: { version: disclaimerVersion, acceptedAt: new Date() }
    });

    return response.status(201).json({
      user: toPublicUser(user),
      message: "Account created. Verify your email before using protected features."
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/login", async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body);
    const user = await User.findOne({ email: input.email.toLowerCase() }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return response.status(401).json({ message: "Email or password is incorrect." });
    }
    if (!user.emailVerified) return response.status(403).json({ message: "Verify your email before signing in." });

    return response.json({
      token: signAccessToken({ sub: user.id, role: user.role }),
      user: toPublicUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.get("/me", requireAuth, async (request, response, next) => {
  try {
    const user = await User.findById(request.auth?.userId);
    if (!user) return response.status(404).json({ message: "User not found." });
    return response.json({ user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
});

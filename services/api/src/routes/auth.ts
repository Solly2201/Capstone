import { Router } from "express";
import bcrypt from "bcrypt";
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
  disclaimerVersion
} from "@cap/contracts";
import { User } from "../models/user.js";
import { signAccessToken } from "../lib/jwt.js";
import { toPublicUser } from "../lib/users.js";
import { requireAuth } from "../middleware/auth.js";
import { devVerification, hashVerificationToken, issueVerificationToken } from "../lib/email-verification.js";

export const authRouter = Router();

const VERIFICATION_SENT_MESSAGE =
  "Account created. Confirm your email address to finish activating the account.";

authRouter.post("/register", async (request, response, next) => {
  try {
    const input = registerSchema.parse(request.body);
    const existing = await User.exists({ email: input.email.toLowerCase() });
    if (existing) return response.status(409).json({ message: "An account already exists for this email." });

    const issued = issueVerificationToken();
    const user = await User.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      profilePhotoUrl: input.profilePhotoUrl,
      role: "CITIZEN",
      emailVerified: false,
      emailVerification: { tokenHash: issued.tokenHash, expiresAt: issued.expiresAt },
      disclaimerAcceptance: { version: disclaimerVersion, acceptedAt: new Date() }
    });

    const verification = devVerification(issued);
    return response.status(201).json({
      user: toPublicUser(user),
      message: VERIFICATION_SENT_MESSAGE,
      ...(verification ? { verification } : {})
    });
  } catch (error) {
    return next(error);
  }
});

// Completes the verification challenge. Deliberately does not sign the
// user in: verification proves control of the address, login still needs
// the password. Lookup is by token hash only, and an expired challenge is
// rejected without distinguishing itself from an unknown one.
authRouter.post("/verify-email", async (request, response, next) => {
  try {
    const input = verifyEmailSchema.parse(request.body);
    const user = await User.findOne({
      "emailVerification.tokenHash": hashVerificationToken(input.token)
    }).select("+emailVerification");

    if (!user || !user.emailVerification || user.emailVerification.expiresAt.getTime() < Date.now()) {
      return response
        .status(400)
        .json({ message: "This verification link is invalid or has expired. Request a new one." });
    }

    user.emailVerified = true;
    user.emailVerification = undefined;
    await user.save();

    return response.json({
      user: toPublicUser(user),
      message: "Email verified. You can sign in now."
    });
  } catch (error) {
    return next(error);
  }
});

// Re-issues a verification challenge. Always answers 200 with the same
// message whether or not the address exists, so it cannot be used to
// enumerate accounts.
authRouter.post("/resend-verification", async (request, response, next) => {
  try {
    const input = resendVerificationSchema.parse(request.body);
    const genericMessage =
      "If that address belongs to an unverified account, a new verification link has been issued.";
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user || user.emailVerified) return response.json({ message: genericMessage });

    const issued = issueVerificationToken();
    user.emailVerification = { tokenHash: issued.tokenHash, expiresAt: issued.expiresAt };
    await user.save();

    const verification = devVerification(issued);
    return response.json({ message: genericMessage, ...(verification ? { verification } : {}) });
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
    if (!user.emailVerified) {
      return response.status(403).json({
        message: "Verify your email before signing in.",
        reason: "email_not_verified"
      });
    }

    return response.json({
      token: signAccessToken({ sub: user.id, role: user.role, ver: user.tokenVersion ?? 0 }),
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

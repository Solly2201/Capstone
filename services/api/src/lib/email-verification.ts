import crypto from "node:crypto";
import type { DevVerification } from "@cap/contracts";
import { env } from "../config/env.js";

/**
 * Email verification without an email provider.
 *
 * Registration created accounts with `emailVerified: false` and login
 * rejects unverified accounts, but nothing ever issued or delivered a
 * verification challenge -- so every self-registered account was
 * permanently locked out. This module closes that deadlock with the
 * smallest mechanism that is still correct:
 *
 *   - a cryptographically random token is issued at registration;
 *   - only its SHA-256 hash is persisted (see models/user.ts);
 *   - it expires after 24 hours;
 *   - outside production the raw token is returned in the API response
 *     so the flow is completable locally.
 *
 * That last step is a deliberate development affordance, not a
 * shortcut in the security model: `devVerification()` returns
 * `undefined` when NODE_ENV === "production", so a deployed instance
 * never leaks a token over the API. Wiring a real transport later means
 * mailing `token` from the register/resend handlers -- nothing else in
 * this flow has to change. No external mail infrastructure is assumed
 * or invented here.
 */

export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export const hashVerificationToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export type IssuedVerification = {
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

export const issueVerificationToken = (): IssuedVerification => {
  const token = crypto.randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: hashVerificationToken(token),
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)
  };
};

/**
 * The token block attached to non-production API responses. Returns
 * `undefined` in production, where a real email transport must deliver
 * the token instead.
 */
export const devVerification = (issued: IssuedVerification): DevVerification | undefined =>
  env.NODE_ENV === "production"
    ? undefined
    : { token: issued.token, expiresAt: issued.expiresAt.toISOString(), deliveredVia: "api-response" };

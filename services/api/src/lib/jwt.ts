import jwt from "jsonwebtoken";
import type { UserRole } from "@cap/contracts";
import { env } from "../config/env.js";

export type AccessTokenPayload = {
  sub: string;
  role: UserRole;
  /**
   * The account's `tokenVersion` when this token was issued. Privileged
   * routes compare it against stored state, so bumping a user's
   * tokenVersion revokes their existing tokens (see middleware/auth.ts).
   * Optional so a token minted before this claim existed still parses;
   * it is then treated as version 0, matching the schema default.
   */
  ver?: number;
};

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign({ ver: 0, ...payload }, env.JWT_SECRET, {
    expiresIn: "15m",
    issuer: "cap-api",
    audience: "cap-web"
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET, { issuer: "cap-api", audience: "cap-web" }) as AccessTokenPayload;

// Refresh tokens carry a distinct audience, so the two kinds can never be
// substituted for one another: an access token presented to /auth/refresh
// fails this check, and a refresh token presented as a bearer credential
// fails verifyAccessToken's. The refresh token deliberately carries no
// role -- the stored role is re-read at refresh time, so a demotion takes
// effect on the next refresh rather than surviving for seven days.
export type RefreshTokenPayload = {
  sub: string;
  ver?: number;
};

export const signRefreshToken = (payload: RefreshTokenPayload) =>
  jwt.sign({ ver: 0, ...payload }, env.JWT_SECRET, {
    expiresIn: "7d",
    issuer: "cap-api",
    audience: "cap-refresh"
  });

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET, { issuer: "cap-api", audience: "cap-refresh" }) as RefreshTokenPayload;

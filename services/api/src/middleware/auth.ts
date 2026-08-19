import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@cap/contracts";
import { verifyAccessToken } from "../lib/jwt.js";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: UserRole };
    }
  }
}

export const requireAuth = (request: Request, response: Response, next: NextFunction) => {
  const token = request.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return response.status(401).json({ message: "Authentication is required." });

  try {
    const payload = verifyAccessToken(token);
    request.auth = { userId: payload.sub, role: payload.role };
    return next();
  } catch {
    return response.status(401).json({ message: "Your session is invalid or has expired." });
  }
};

export const requireRole = (...roles: UserRole[]) =>
  (request: Request, response: Response, next: NextFunction) => {
    if (!request.auth) return response.status(401).json({ message: "Authentication is required." });
    if (!roles.includes(request.auth.role)) return response.status(403).json({ message: "You do not have access to this resource." });
    return next();
  };

/**
 * Populates `request.auth` when a valid token is present, and continues
 * either way.
 *
 * For endpoints that are genuinely public but render differently for a
 * signed-in account -- the petition list and petition detail, which
 * anyone may read but which show a citizen whether they have already
 * signed. Using `requireAuth` there would put a login wall in front of
 * public content; ignoring the token entirely would make the page unable
 * to tell a signer from a stranger.
 *
 * An invalid or expired token is treated as anonymous rather than as an
 * error, so a stale session degrades a public page to its public view
 * instead of breaking it. Nothing downstream may use the *absence* of
 * `request.auth` as evidence of anything except "not identified": this
 * middleware grants no access on its own, and every privileged branch
 * behind it re-checks the identity it finds.
 */
export const optionalAuth = (request: Request, _response: Response, next: NextFunction) => {
  const token = request.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    request.auth = { userId: payload.sub, role: payload.role };
  } catch {
    // Deliberately silent: an unusable token means anonymous here.
  }
  return next();
};

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

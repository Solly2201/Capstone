import jwt from "jsonwebtoken";
import type { UserRole } from "@cap/contracts";
import { env } from "../config/env.js";

export type AccessTokenPayload = {
  sub: string;
  role: UserRole;
};

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m", issuer: "cap-api", audience: "cap-web" });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET, { issuer: "cap-api", audience: "cap-web" }) as AccessTokenPayload;

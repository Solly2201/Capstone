import pino from "pino";
import { env } from "../config/env.js";

/**
 * The one logger in the process.
 *
 * Redaction is not cosmetic: `authorization` carries a bearer token that
 * would otherwise let anyone reading the logs act as that user, and the
 * register/login bodies carry raw passwords. Both are removed before
 * anything is serialised, so no call site has to remember to.
 *
 * Tests run silent so a suite's output stays readable.
 */
export const redactOptions = {
  paths: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
    "*.password",
    "*.passwordHash",
    "*.token",
    "*.tokenHash"
  ],
  censor: "[redacted]"
};

export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : env.NODE_ENV === "production" ? "info" : "debug",
  redact: redactOptions,
  base: { service: "cap-api" }
});

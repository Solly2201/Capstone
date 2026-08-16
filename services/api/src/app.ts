import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pino from "pino";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { corpusRouter } from "./routes/corpus.js";

const logger = pino({ level: env.NODE_ENV === "production" ? "info" : "debug" });

export const createApp = () => {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: false }));
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: "draft-8", legacyHeaders: false }));

  app.get("/health", (_request, response) => response.json({ status: "ok", service: "cap-api" }));
  app.use("/api/auth", authRouter);
  app.use("/api/corpus", corpusRouter);

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) return response.status(400).json({ message: "Invalid request data.", issues: error.flatten() });
    logger.error(error);
    return response.status(500).json({ message: "An unexpected error occurred." });
  });

  return app;
};

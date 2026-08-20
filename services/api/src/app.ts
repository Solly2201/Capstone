import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { authRouter } from "./routes/auth.js";
import { civicRouter } from "./routes/civic.js";
import { corpusRouter } from "./routes/corpus.js";
import { legalRouter } from "./routes/legal.js";
import { petitionRouter } from "./routes/petitions.js";

// Mongoose connection states: 1 is connected, 2 is connecting.
const mongoIsReady = () => mongoose.connection.readyState === 1;

export const createApp = () => {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: false }));
  app.use(express.json({ limit: "1mb" }));

  app.use(
    pinoHttp({
      logger,
      // Correlates every line of one request, including the error log.
      genReqId: (request: IncomingMessage) =>
        (request.headers["x-request-id"] as string) ?? randomUUID(),
      // Only the outcome is interesting at info level; a 4xx is the
      // client's problem and a 5xx is ours, so they are graded apart.
      customLogLevel: (_request: IncomingMessage, response: ServerResponse, error?: Error) => {
        if (error || response.statusCode >= 500) return "error";
        if (response.statusCode >= 400) return "warn";
        return "info";
      },
      customSuccessMessage: (request: IncomingMessage, response: ServerResponse) =>
        `${request.method} ${request.url} ${response.statusCode}`,
      // Query strings on the legal endpoints can carry a citizen's
      // situation, so only the path is recorded.
      customProps: (request: IncomingMessage) => ({ route: request.url?.split("?")[0] })
    })
  );

  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: "draft-8", legacyHeaders: false }));

  // Liveness: the process is up. Kept dependency-free so a database
  // outage does not make the container look dead and get restarted.
  app.get("/health", (_request, response) => response.json({ status: "ok", service: "cap-api" }));

  // Readiness: whether this instance can actually serve traffic.
  app.get("/health/ready", (_request, response) => {
    const ready = mongoIsReady();
    return response.status(ready ? 200 : 503).json({
      status: ready ? "ready" : "degraded",
      service: "cap-api",
      dependencies: { mongodb: ready ? "up" : "down" }
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/civic", civicRouter);
  app.use("/api/corpus", corpusRouter);
  app.use("/api/legal", legalRouter);
  app.use("/api/petitions", petitionRouter);

  app.use((error: unknown, request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      return response.status(400).json({ message: "Invalid request data.", issues: error.flatten() });
    }
    // request.log carries the request id, so a 500 in the logs can be
    // traced back to the request that produced it.
    request.log.error(
      { err: error, route: request.originalUrl.split("?")[0], method: request.method },
      "Unhandled request error"
    );
    return response.status(500).json({ message: "An unexpected error occurred." });
  });

  return app;
};

import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { CivicReport } from "./models/civic-report.js";
import { Petition } from "./models/petition.js";
import { Signature } from "./models/signature.js";
import { User } from "./models/user.js";

const app = createApp();
const server = createServer(app);
const io = new Server(server, { cors: { origin: env.WEB_ORIGIN } });

io.on("connection", (socket) => {
  socket.emit("system:ready", { message: "Real-time updates are connected." });
});

// Models whose indexes carry a correctness or security guarantee. One
// signature per citizen per petition is enforced only by Signature's
// unique compound index, and User.email is unique on the same basis.
const indexedModels = [User, CivicReport, Petition, Signature];

// A dropped database connection is the failure most likely to be
// misread as an application bug, so it is logged as its own event
// rather than surfacing only as request errors.
const watchConnection = () => {
  mongoose.connection.on("disconnected", () => logger.error("MongoDB connection lost"));
  mongoose.connection.on("reconnected", () => logger.warn("MongoDB connection restored"));
  mongoose.connection.on("error", (error) => logger.error({ err: error }, "MongoDB connection error"));
};

async function start() {
  watchConnection();
  await mongoose.connect(env.MONGODB_URI);

  // autoIndex builds in the background and reports failure only through
  // an event nobody listens for, so a unique index that cannot be built
  // would leave the process serving /health without its constraint.
  // Awaiting init() refuses to serve traffic in that state.
  await Promise.all(indexedModels.map((model) => model.init()));

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "CAP API listening");
  });
}

/**
 * Stops accepting new work, then releases the database.
 *
 * Without this, a container stop kills the process mid-request: an
 * in-flight civic transition could have written its status update and
 * not yet returned, leaving the caller unsure whether it applied. The
 * timeout is a backstop so a stuck connection cannot block a deploy.
 */
let shuttingDown = false;
const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Shutting down");

  const forced = setTimeout(() => {
    logger.error("Graceful shutdown timed out; exiting");
    process.exit(1);
  }, 10_000);
  forced.unref();

  try {
    io.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await mongoose.disconnect();
    logger.info("Shutdown complete");
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Error during shutdown");
    process.exit(1);
  }
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

start().catch((error) => {
  logger.error({ err: error }, "CAP API failed to start");
  process.exit(1);
});

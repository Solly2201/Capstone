import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
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

/**
 * Every model whose indexes carry a correctness or security guarantee.
 *
 * `Signature` is the one that matters most: "one signature per citizen
 * per petition" is enforced *only* by its unique compound index, and
 * `petition-signatures.ts` deliberately relies on the database to reject
 * the loser of a race rather than doing a check-then-act in application
 * code. `User.email` is unique on the same basis.
 */
const indexedModels = [User, CivicReport, Petition, Signature];

async function start() {
  await mongoose.connect(env.MONGODB_URI);

  // Mongoose's autoIndex builds indexes in the background and reports a
  // failure only through an event nobody was listening for, so a build
  // that fails -- most plausibly a unique index that cannot be created
  // because conflicting rows already exist -- left the process starting
  // cleanly, logging nothing, and answering /health while the constraint
  // it depends on was simply absent. Awaiting init() makes that failure
  // loud and refuses to serve traffic under it: a signature count that
  // silently accepts duplicates is worse than an API that will not boot.
  await Promise.all(indexedModels.map((model) => model.init()));

  server.listen(env.PORT, () => {
    console.log(`CAP API listening on http://localhost:${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("CAP API failed to start", error);
  process.exit(1);
});

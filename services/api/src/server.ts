import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();
const server = createServer(app);
const io = new Server(server, { cors: { origin: env.WEB_ORIGIN } });

io.on("connection", (socket) => {
  socket.emit("system:ready", { message: "Real-time updates are connected." });
});

async function start() {
  await mongoose.connect(env.MONGODB_URI);
  server.listen(env.PORT, () => {
    console.log(`CAP API listening on http://localhost:${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("CAP API failed to start", error);
  process.exit(1);
});

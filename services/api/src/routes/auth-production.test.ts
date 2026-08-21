import request from "supertest";
import { describe, expect, it, vi } from "vitest";

// Production with no mail transport: registration would create accounts
// whose verification token nobody can ever receive (devVerification is
// disabled in production). The API must refuse honestly rather than
// manufacture a dead end. Isolated in its own file because the env
// singleton has to be mocked before anything imports it.
vi.mock("../config/env.js", () => ({
  DEV_JWT_SECRET: "local-development-secret-change-before-production",
  env: {
    NODE_ENV: "production",
    PORT: 4000,
    MONGODB_URI: "mongodb://localhost:27017/cap",
    REDIS_URL: "redis://localhost:6379",
    JWT_SECRET: "a-production-secret-that-is-long-enough-123456",
    WEB_ORIGIN: "http://localhost:5173",
    LOCAL_STORAGE_ROOT: "../../data/uploads",
    AI_SERVICE_URL: "http://localhost:8000",
    AI_SERVICE_TIMEOUT_MS: 15000,
    MAIL_FROM: "CAP <no-reply@cap.local>"
    // SMTP_URL deliberately absent.
  },
  parseEnv: vi.fn()
}));

vi.mock("../models/user.js", () => ({
  User: { exists: vi.fn(), create: vi.fn(), findOne: vi.fn(), findById: vi.fn() }
}));

import { createApp } from "../app.js";
import { User } from "../models/user.js";

describe("registration in production without a mail transport", () => {
  it("answers 503 and creates nothing", async () => {
    const response = await request(createApp()).post("/api/auth/register").send({
      fullName: "Asha Citizen",
      email: "asha@example.com",
      password: "CorrectHorse!2026",
      acceptedDisclaimer: true
    });

    expect(response.status).toBe(503);
    expect((User as unknown as { create: ReturnType<typeof vi.fn> }).create).not.toHaveBeenCalled();
  });
});

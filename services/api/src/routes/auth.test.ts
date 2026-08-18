import request from "supertest";
import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { User } from "../models/user.js";
import { signAccessToken } from "../lib/jwt.js";
import { hashVerificationToken } from "../lib/email-verification.js";

vi.mock("../models/user.js", () => ({
  User: {
    exists: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn()
  }
}));

const userModel = User as unknown as {
  exists: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
};

// Mongoose queries are thenable AND chainable -- the routes use both
// "await User.findOne()" and "await User.findOne().select(...)", so the
// stub has to support both shapes.
const query = (value: unknown) => {
  const thenable = Promise.resolve(value) as Promise<unknown> & { select: () => Promise<unknown> };
  thenable.select = () => Promise.resolve(value);
  return thenable;
};

const PASSWORD = "CorrectHorse!2026";
const passwordHash = bcrypt.hashSync(PASSWORD, 4);

type FakeUser = {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: string;
  emailVerified: boolean;
  emailVerification?: { tokenHash: string; expiresAt: Date };
  save: ReturnType<typeof vi.fn>;
};

const fakeUser = (overrides: Partial<FakeUser> = {}): FakeUser => ({
  id: "user-1",
  fullName: "Asha Citizen",
  email: "asha@example.com",
  passwordHash,
  role: "CITIZEN",
  emailVerified: true,
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides
});

const validRegistration = {
  fullName: "Asha Citizen",
  email: "Asha@Example.com",
  password: PASSWORD,
  acceptedDisclaimer: true
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/register", () => {
  it("creates an account and issues a verification challenge", async () => {
    userModel.exists.mockResolvedValue(null);
    userModel.create.mockImplementation(async (doc: Partial<FakeUser>) =>
      fakeUser({ ...doc, emailVerified: false })
    );

    const response = await request(createApp()).post("/api/auth/register").send(validRegistration);

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("asha@example.com");
    expect(response.body.user.emailVerified).toBe(false);
    expect(response.body.user.passwordHash).toBeUndefined();

    // Outside production the token is handed back so the flow is completable
    // locally -- this project has no mail transport.
    expect(response.body.verification.deliveredVia).toBe("api-response");
    expect(response.body.verification.token).toMatch(/^[0-9a-f]{64}$/);

    // Only the hash is persisted, never the raw token.
    const created = userModel.create.mock.calls[0][0];
    expect(created.emailVerification.tokenHash).toBe(hashVerificationToken(response.body.verification.token));
    expect(created.emailVerification.tokenHash).not.toBe(response.body.verification.token);
    expect(created.emailVerified).toBe(false);
  });

  it("rejects an invalid registration", async () => {
    const response = await request(createApp())
      .post("/api/auth/register")
      .send({ fullName: "A", email: "not-an-email", password: "short", acceptedDisclaimer: false });

    expect(response.status).toBe(400);
    expect(userModel.create).not.toHaveBeenCalled();
  });

  it("rejects a duplicate email", async () => {
    userModel.exists.mockResolvedValue({ _id: "existing" });

    const response = await request(createApp()).post("/api/auth/register").send(validRegistration);

    expect(response.status).toBe(409);
    expect(userModel.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/verify-email", () => {
  it("verifies an account and clears the challenge", async () => {
    const token = "a".repeat(64);
    const user = fakeUser({
      emailVerified: false,
      emailVerification: { tokenHash: hashVerificationToken(token), expiresAt: new Date(Date.now() + 60000) }
    });
    userModel.findOne.mockReturnValue(query(user));

    const response = await request(createApp()).post("/api/auth/verify-email").send({ token });

    expect(response.status).toBe(200);
    expect(response.body.user.emailVerified).toBe(true);
    expect(user.emailVerified).toBe(true);
    expect(user.emailVerification).toBeUndefined();
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(userModel.findOne).toHaveBeenCalledWith({
      "emailVerification.tokenHash": hashVerificationToken(token)
    });
  });

  it("rejects an expired challenge", async () => {
    const token = "b".repeat(64);
    const user = fakeUser({
      emailVerified: false,
      emailVerification: { tokenHash: hashVerificationToken(token), expiresAt: new Date(Date.now() - 60000) }
    });
    userModel.findOne.mockReturnValue(query(user));

    const response = await request(createApp()).post("/api/auth/verify-email").send({ token });

    expect(response.status).toBe(400);
    expect(user.save).not.toHaveBeenCalled();
  });

  it("rejects an unknown token", async () => {
    userModel.findOne.mockReturnValue(query(null));

    const response = await request(createApp()).post("/api/auth/verify-email").send({ token: "c".repeat(64) });

    expect(response.status).toBe(400);
  });
});

describe("POST /api/auth/resend-verification", () => {
  it("issues a fresh challenge for an unverified account", async () => {
    const user = fakeUser({ emailVerified: false });
    userModel.findOne.mockReturnValue(query(user));

    const response = await request(createApp())
      .post("/api/auth/resend-verification")
      .send({ email: "asha@example.com" });

    expect(response.status).toBe(200);
    expect(response.body.verification.token).toMatch(/^[0-9a-f]{64}$/);
    expect(user.save).toHaveBeenCalledTimes(1);
  });

  it("does not reveal whether an address is registered", async () => {
    userModel.findOne.mockReturnValue(query(null));
    const unknown = await request(createApp())
      .post("/api/auth/resend-verification")
      .send({ email: "nobody@example.com" });

    userModel.findOne.mockReturnValue(query(fakeUser({ emailVerified: false })));
    const known = await request(createApp())
      .post("/api/auth/resend-verification")
      .send({ email: "asha@example.com" });

    expect(unknown.status).toBe(200);
    expect(unknown.body.message).toBe(known.body.message);
    expect(unknown.body.verification).toBeUndefined();
  });
});

describe("POST /api/auth/login", () => {
  it("returns a token and the public user for a verified account", async () => {
    userModel.findOne.mockReturnValue(query(fakeUser()));

    const response = await request(createApp())
      .post("/api/auth/login")
      .send({ email: "asha@example.com", password: PASSWORD });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe("string");
    expect(response.body.user).toEqual({
      id: "user-1",
      fullName: "Asha Citizen",
      email: "asha@example.com",
      role: "CITIZEN",
      emailVerified: true
    });
  });

  it("rejects an unverified account with a machine-readable reason", async () => {
    userModel.findOne.mockReturnValue(query(fakeUser({ emailVerified: false })));

    const response = await request(createApp())
      .post("/api/auth/login")
      .send({ email: "asha@example.com", password: PASSWORD });

    expect(response.status).toBe(403);
    expect(response.body.reason).toBe("email_not_verified");
  });

  it("rejects a wrong password", async () => {
    userModel.findOne.mockReturnValue(query(fakeUser()));

    const response = await request(createApp())
      .post("/api/auth/login")
      .send({ email: "asha@example.com", password: "WrongPassword!2026" });

    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
  });
});

describe("GET /api/auth/me", () => {
  it("rejects an unauthenticated request", async () => {
    const response = await request(createApp()).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(userModel.findById).not.toHaveBeenCalled();
  });

  it("rejects a malformed token", async () => {
    const response = await request(createApp()).get("/api/auth/me").set("Authorization", "Bearer not-a-jwt");

    expect(response.status).toBe(401);
  });

  it("returns the current user for a valid token", async () => {
    userModel.findById.mockResolvedValue(fakeUser());
    const token = signAccessToken({ sub: "user-1", role: "CITIZEN" });

    const response = await request(createApp()).get("/api/auth/me").set("Authorization", "Bearer " + token);

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe("user-1");
    expect(userModel.findById).toHaveBeenCalledWith("user-1");
  });
});

import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { CivicReport } from "../models/civic-report.js";
import { Petition } from "../models/petition.js";
import { User } from "../models/user.js";
import { signAccessToken } from "../lib/jwt.js";

vi.mock("../models/civic-report.js", () => ({
  CivicReport: {
    find: vi.fn(),
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
    countDocuments: vi.fn()
  }
}));

vi.mock("../models/petition.js", () => ({
  Petition: { find: vi.fn(), findById: vi.fn(), findOneAndUpdate: vi.fn(), countDocuments: vi.fn() }
}));

vi.mock("../models/signature.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../models/signature.js")>();
  return { ...actual, Signature: { find: vi.fn(), exists: vi.fn() } };
});

vi.mock("../models/user.js", () => ({ User: { findById: vi.fn() } }));

vi.mock("../services/local-file-storage.js", () => ({
  LocalFileStorage: class {
    save = vi.fn();
    read = vi.fn();
  }
}));

const reportModel = CivicReport as unknown as {
  find: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  findOneAndUpdate: ReturnType<typeof vi.fn>;
  countDocuments: ReturnType<typeof vi.fn>;
};
const petitionModel = Petition as unknown as {
  find: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  countDocuments: ReturnType<typeof vi.fn>;
};
const userModel = User as unknown as { findById: ReturnType<typeof vi.fn> };

const ACTOR_ID = "64b7f9c2e1a2b3c4d5e6f703";
const REPORT_ID = "64b7f9c2e1a2b3c4d5e6f7aa";
const PETITION_ID = "64b7f9c2e1a2b3c4d5e6fa01";

const stored = (value: unknown) => ({ select: () => Promise.resolve(value) });

const chainable = (value: unknown) => ({
  sort: () => ({ skip: () => ({ limit: () => Promise.resolve(value) }) })
});

/** A token that claims AUTHORITY, whatever the database later says. */
const authorityToken = signAccessToken({ sub: ACTOR_ID, role: "AUTHORITY", ver: 0 });

const queue = (token: string) =>
  request(createApp()).get("/api/civic/authority/reports").set("Authorization", `Bearer ${token}`);

beforeEach(() => {
  vi.clearAllMocks();
  reportModel.find.mockReturnValue(chainable([]));
  reportModel.countDocuments.mockResolvedValue(0);
  petitionModel.find.mockReturnValue(chainable([]));
  petitionModel.countDocuments.mockResolvedValue(0);
});

describe("privileged routes re-check the caller against stored state", () => {
  it("allows an authority whose stored role still matches the token", async () => {
    userModel.findById.mockReturnValue(stored({ role: "AUTHORITY", tokenVersion: 0 }));

    const response = await queue(authorityToken);

    expect(response.status).toBe(200);
    expect(userModel.findById).toHaveBeenCalledWith(ACTOR_ID);
  });

  // The whole point of the re-check: the token is validly signed and
  // unexpired, but the account behind it is no longer an authority.
  it("refuses a demoted account still holding a valid AUTHORITY token", async () => {
    userModel.findById.mockReturnValue(stored({ role: "CITIZEN", tokenVersion: 0 }));

    const response = await queue(authorityToken);

    expect(response.status).toBe(403);
    expect(reportModel.find).not.toHaveBeenCalled();
  });

  it("refuses a token whose version the account has moved past", async () => {
    userModel.findById.mockReturnValue(stored({ role: "AUTHORITY", tokenVersion: 3 }));

    const response = await queue(authorityToken);

    expect(response.status).toBe(401);
    expect(reportModel.find).not.toHaveBeenCalled();
  });

  it("refuses a token for an account that no longer exists", async () => {
    userModel.findById.mockReturnValue(stored(null));

    const response = await queue(authorityToken);

    expect(response.status).toBe(401);
  });

  it("treats a token minted without a version claim as version zero", async () => {
    const legacyToken = signAccessToken({ sub: ACTOR_ID, role: "AUTHORITY" });
    userModel.findById.mockReturnValue(stored({ role: "AUTHORITY", tokenVersion: 0 }));

    const response = await queue(legacyToken);

    expect(response.status).toBe(200);
  });

  it("applies the same re-check to a report transition", async () => {
    userModel.findById.mockReturnValue(stored({ role: "CITIZEN", tokenVersion: 0 }));

    const response = await request(createApp())
      .post(`/api/civic/reports/${REPORT_ID}/transitions`)
      .set("Authorization", `Bearer ${authorityToken}`)
      .send({ status: "UNDER_REVIEW" });

    expect(response.status).toBe(403);
    expect(reportModel.findById).not.toHaveBeenCalled();
  });

  it("applies the same re-check to a priority change", async () => {
    userModel.findById.mockReturnValue(stored({ role: "CITIZEN", tokenVersion: 0 }));

    const response = await request(createApp())
      .patch(`/api/civic/reports/${REPORT_ID}/priority`)
      .set("Authorization", `Bearer ${authorityToken}`)
      .send({ priority: "HIGH" });

    expect(response.status).toBe(403);
  });

  it("applies the same re-check to the petition queue", async () => {
    userModel.findById.mockReturnValue(stored({ role: "CITIZEN", tokenVersion: 0 }));

    const response = await request(createApp())
      .get("/api/petitions/authority")
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(response.status).toBe(403);
  });

  // Petition transitions accept any authenticated caller, because a
  // creator may close their own petition. The stored role still has to
  // replace the token's claim before capability is derived from it.
  it("derives petition capability from the stored role, not the token claim", async () => {
    userModel.findById.mockReturnValue(stored({ role: "CITIZEN", tokenVersion: 0 }));
    petitionModel.findById.mockResolvedValue({
      _id: PETITION_ID,
      id: PETITION_ID,
      creatorId: "64b7f9c2e1a2b3c4d5e6f999",
      status: "OPEN"
    });

    const response = await request(createApp())
      .post(`/api/petitions/${PETITION_ID}/transitions`)
      .set("Authorization", `Bearer ${authorityToken}`)
      .send({ status: "UNDER_REVIEW", note: "Reviewing this petition." });

    expect(response.status).toBe(403);
  });

  it("still rejects a request with no token at all", async () => {
    const response = await request(createApp()).get("/api/civic/authority/reports");

    expect(response.status).toBe(401);
    expect(userModel.findById).not.toHaveBeenCalled();
  });
});

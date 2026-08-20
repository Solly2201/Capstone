import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { Petition } from "../models/petition.js";
import { Signature } from "../models/signature.js";
import { signAccessToken } from "../lib/jwt.js";

// Signature integrity. The mocks here emulate the database constraints
// rather than recording calls: the signature store throws a real
// duplicate-key error and the petition store honours the conditional
// filter. Asserting that the route called create proves nothing about a
// race; making the fake behave like MongoDB does.

vi.mock("../models/petition.js", () => ({
  Petition: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
    countDocuments: vi.fn()
  }
}));

vi.mock("../models/signature.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../models/signature.js")>();
  return {
    ...actual,
    Signature: {
      create: vi.fn(),
      find: vi.fn(),
      exists: vi.fn(),
      deleteOne: vi.fn(),
      countDocuments: vi.fn()
    }
  };
});

vi.mock("../models/user.js", () => ({ User: { findById: vi.fn() } }));

const petitionModel = Petition as unknown as {
  findById: ReturnType<typeof vi.fn>;
  findOneAndUpdate: ReturnType<typeof vi.fn>;
  updateOne: ReturnType<typeof vi.fn>;
};
const signatureModel = Signature as unknown as {
  create: ReturnType<typeof vi.fn>;
  exists: ReturnType<typeof vi.fn>;
  deleteOne: ReturnType<typeof vi.fn>;
};

const PETITION_ID = "64b7f9c2e1a2b3c4d5e6fa01";
const MISSING_ID = "64b7f9c2e1a2b3c4d5e6fa99";
const CREATOR_ID = "64b7f9c2e1a2b3c4d5e6f701";
const AUTHORITY_ID = "64b7f9c2e1a2b3c4d5e6f703";
const ADMIN_ID = "64b7f9c2e1a2b3c4d5e6f704";

const authorityToken = signAccessToken({ sub: AUTHORITY_ID, role: "AUTHORITY" });
const adminToken = signAccessToken({ sub: ADMIN_ID, role: "ADMIN" });

// The signing limiter is keyed by user id and module-scoped, so each test
// takes a fresh citizen rather than sharing a budget.
let citizenCounter = 0;
const nextCitizen = () => {
  citizenCounter += 1;
  const id = `64b7f9c2e1a2b3c4d5e6d${String(citizenCounter).padStart(3, "0")}`;
  return { id, token: signAccessToken({ sub: id, role: "CITIZEN" }) };
};

const CREATED_AT = new Date("2026-08-18T10:00:00.000Z");

/** In-memory stand-ins, rebuilt per test. */
type StoredPetition = {
  id: string;
  _id: string;
  creatorId: string;
  creatorName: string;
  category: string;
  title: string;
  description: string;
  signatureGoal: number;
  signatureCount: number;
  status: string;
  history: unknown[];
  createdAt: Date;
  updatedAt: Date;
};

let petition: StoredPetition;
/** Stands in for the unique index on `{ petitionId, citizenId }`. */
let signatures: Set<string>;
/** Runs once, between the signature insert and the count update. */
let betweenInsertAndIncrement: (() => void) | null;

const key = (petitionId: unknown, citizenId: unknown) => `${String(petitionId)}:${String(citizenId)}`;

const duplicateKeyError = () => {
  const error = new Error("E11000 duplicate key error collection: cap.signatures") as Error & {
    code: number;
  };
  error.code = 11000;
  return error;
};

const sign = (token: string, id = PETITION_ID, body?: Record<string, unknown>) => {
  const call = request(createApp())
    .post(`/api/petitions/${id}/signatures`)
    .set("Authorization", `Bearer ${token}`);
  return body ? call.send(body) : call;
};

const withdraw = (token: string, id = PETITION_ID) =>
  request(createApp())
    .delete(`/api/petitions/${id}/signatures/me`)
    .set("Authorization", `Bearer ${token}`);

beforeEach(() => {
  vi.clearAllMocks();
  signatures = new Set();
  betweenInsertAndIncrement = null;
  petition = {
    id: PETITION_ID,
    _id: PETITION_ID,
    creatorId: CREATOR_ID,
    creatorName: "Asha Menon",
    category: "transport",
    title: "Restore the evening bus service on route 14",
    description:
      "The last evening bus was withdrawn in June and shift workers now walk home in the dark.",
    signatureGoal: 500,
    signatureCount: 0,
    status: "OPEN",
    history: [],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT
  };

  petitionModel.findById.mockImplementation(async (id: string) =>
    id === petition._id ? petition : null
  );

  // Emulates the unique compound index.
  signatureModel.create.mockImplementation(async (doc: { petitionId: unknown; citizenId: unknown }) => {
    const composite = key(doc.petitionId, doc.citizenId);
    if (signatures.has(composite)) throw duplicateKeyError();
    signatures.add(composite);
    const hook = betweenInsertAndIncrement;
    betweenInsertAndIncrement = null;
    hook?.();
    return { _id: `signature-${composite}` };
  });

  signatureModel.exists.mockImplementation(async (filter: { petitionId: unknown; citizenId: unknown }) =>
    signatures.has(key(filter.petitionId, filter.citizenId)) ? { _id: "x" } : null
  );

  signatureModel.deleteOne.mockImplementation(
    async (filter: { _id?: string; petitionId?: unknown; citizenId?: unknown }) => {
      const composite = filter._id
        ? String(filter._id).replace("signature-", "")
        : key(filter.petitionId, filter.citizenId);
      const existed = signatures.delete(composite);
      return { deletedCount: existed ? 1 : 0 };
    }
  );

  // Honours the conditional filter, the way findOneAndUpdate does.
  petitionModel.findOneAndUpdate.mockImplementation(
    async (
      filter: { _id: string; status?: string; signatureCount?: { $gt: number } },
      update: { $inc?: { signatureCount: number } }
    ) => {
      if (filter._id !== petition._id) return null;
      if (filter.status !== undefined && filter.status !== petition.status) return null;
      if (filter.signatureCount?.$gt !== undefined && !(petition.signatureCount > filter.signatureCount.$gt)) {
        return null;
      }
      if (update.$inc?.signatureCount) petition.signatureCount += update.$inc.signatureCount;
      return petition;
    }
  );

  petitionModel.updateOne.mockImplementation(
    async (filter: { _id: string }, update: { $inc?: { signatureCount: number } }) => {
      if (filter._id !== petition._id) return { modifiedCount: 0 };
      if (update.$inc?.signatureCount) petition.signatureCount += update.$inc.signatureCount;
      return { modifiedCount: 1 };
    }
  );
});

describe("POST /api/petitions/:id/signatures", () => {
  it("records a signature and increments the count exactly once", async () => {
    const citizen = nextCitizen();

    const response = await sign(citizen.token);

    expect(response.status).toBe(201);
    expect(response.body.signed).toBe(true);
    expect(response.body.petition.signatureCount).toBe(1);
    expect(response.body.petition.hasSigned).toBe(true);
    expect(signatures.size).toBe(1);
  });

  it("derives the signer from the token, ignoring any body the client sends", async () => {
    const citizen = nextCitizen();
    const victim = nextCitizen();

    await sign(citizen.token, PETITION_ID, {
      citizenId: victim.id,
      signerId: victim.id,
      petitionId: MISSING_ID,
      createdAt: "2001-01-01T00:00:00.000Z"
    });

    const [document] = signatureModel.create.mock.calls[0];
    expect(String(document.citizenId)).toBe(citizen.id);
    expect(String(document.petitionId)).toBe(PETITION_ID);
    expect(Object.keys(document).sort()).toEqual(["citizenId", "petitionId"]);
    expect(signatures.has(key(PETITION_ID, victim.id))).toBe(false);
  });

  it("refuses a second signature from the same citizen and does not inflate the count", async () => {
    const citizen = nextCitizen();

    const first = await sign(citizen.token);
    const second = await sign(citizen.token);

    expect(first.status).toBe(201);
    expect(second.status).toBe(409);
    expect(petition.signatureCount).toBe(1);
    expect(signatures.size).toBe(1);
  });

  // The race the unique index exists for: both requests are in flight
  // before either finishes, so a "have they signed?" check would let both
  // through.
  it("lets exactly one of two simultaneous signatures from one citizen win", async () => {
    const citizen = nextCitizen();

    const responses = await Promise.all([sign(citizen.token), sign(citizen.token)]);
    const statuses = responses.map((response) => response.status).sort();

    expect(statuses).toEqual([201, 409]);
    expect(petition.signatureCount).toBe(1);
    expect(signatures.size).toBe(1);
  });

  it("lets exactly one of five simultaneous signatures from one citizen win", async () => {
    const citizen = nextCitizen();

    const responses = await Promise.all(Array.from({ length: 5 }, () => sign(citizen.token)));

    expect(responses.filter((response) => response.status === 201)).toHaveLength(1);
    expect(responses.filter((response) => response.status === 409)).toHaveLength(4);
    expect(petition.signatureCount).toBe(1);
  });

  it("counts both when two different citizens sign simultaneously", async () => {
    const first = nextCitizen();
    const second = nextCitizen();

    const responses = await Promise.all([sign(first.token), sign(second.token)]);

    expect(responses.every((response) => response.status === 201)).toBe(true);
    expect(petition.signatureCount).toBe(2);
    expect(signatures.size).toBe(2);
  });

  it("counts every one of ten different citizens signing simultaneously", async () => {
    const citizens = Array.from({ length: 10 }, () => nextCitizen());

    const responses = await Promise.all(citizens.map((citizen) => sign(citizen.token)));

    expect(responses.every((response) => response.status === 201)).toBe(true);
    expect(petition.signatureCount).toBe(10);
    expect(signatures.size).toBe(10);
  });

  it("rejects an unauthenticated signature", async () => {
    const response = await request(createApp()).post(`/api/petitions/${PETITION_ID}/signatures`);

    expect(response.status).toBe(401);
    expect(signatureModel.create).not.toHaveBeenCalled();
  });

  it("refuses staff, who are the body being petitioned", async () => {
    for (const token of [authorityToken, adminToken]) {
      const response = await sign(token);
      expect(response.status).toBe(403);
    }
    expect(signatureModel.create).not.toHaveBeenCalled();
    expect(petition.signatureCount).toBe(0);
  });

  it("answers 404 for a nonexistent petition", async () => {
    const citizen = nextCitizen();

    const response = await sign(citizen.token, MISSING_ID);

    expect(response.status).toBe(404);
    expect(signatureModel.create).not.toHaveBeenCalled();
  });

  it("answers 404 for a malformed petition id without touching the database", async () => {
    const citizen = nextCitizen();

    const response = await sign(citizen.token, "../../etc/passwd");

    expect(response.status).toBe(404);
    expect(petitionModel.findById).not.toHaveBeenCalled();
  });

  it("refuses to sign a petition that is not open", async () => {
    for (const status of ["UNDER_REVIEW", "ANSWERED", "CLOSED", "REJECTED"]) {
      const citizen = nextCitizen();
      petition.status = status;
      petition.signatureCount = 7;

      const response = await sign(citizen.token);

      expect(response.status, status).toBe(422);
      expect(petition.signatureCount, status).toBe(7);
      expect(signatures.size, status).toBe(0);
    }
  });

  // The window the compensating delete exists for: the petition closes
  // after the row is inserted but before the count moves.
  it("undoes the signature if the petition closes mid-request", async () => {
    const citizen = nextCitizen();
    betweenInsertAndIncrement = () => {
      petition.status = "CLOSED";
    };

    const response = await sign(citizen.token);

    expect(response.status).toBe(422);
    expect(signatures.size).toBe(0);
    expect(petition.signatureCount).toBe(0);
    expect(signatureModel.deleteOne).toHaveBeenCalled();
  });

  it("never increments the count without a signature row behind it", async () => {
    const citizen = nextCitizen();

    await sign(citizen.token);
    await sign(citizen.token);
    await sign(citizen.token);

    expect(petition.signatureCount).toBe(signatures.size);
  });

  it("rate-limits repeated signing by one account", async () => {
    const citizen = nextCitizen();
    const statuses: number[] = [];

    for (let attempt = 0; attempt < 62; attempt += 1) {
      statuses.push((await sign(citizen.token)).status);
    }

    expect(statuses.filter((status) => status === 429).length).toBeGreaterThan(0);
    expect(petition.signatureCount).toBe(1);
  });
});

describe("DELETE /api/petitions/:id/signatures/me", () => {
  it("removes the citizen's own signature and decrements the count", async () => {
    const citizen = nextCitizen();
    await sign(citizen.token);

    const response = await withdraw(citizen.token);

    expect(response.status).toBe(200);
    expect(response.body.signed).toBe(false);
    expect(response.body.petition.signatureCount).toBe(0);
    expect(response.body.petition.hasSigned).toBe(false);
    expect(signatures.size).toBe(0);
  });

  it("only ever removes the caller's own signature", async () => {
    const first = nextCitizen();
    const second = nextCitizen();
    await sign(first.token);
    await sign(second.token);

    await withdraw(first.token);

    expect(signatures.has(key(PETITION_ID, first.id))).toBe(false);
    expect(signatures.has(key(PETITION_ID, second.id))).toBe(true);
    expect(petition.signatureCount).toBe(1);
  });

  it("refuses a withdrawal from somebody who never signed", async () => {
    const citizen = nextCitizen();

    const response = await withdraw(citizen.token);

    expect(response.status).toBe(409);
    expect(petition.signatureCount).toBe(0);
    expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("refuses to change the tally once the petition is no longer open", async () => {
    const citizen = nextCitizen();
    await sign(citizen.token);
    petition.status = "ANSWERED";

    const response = await withdraw(citizen.token);

    expect(response.status).toBe(422);
    expect(petition.signatureCount).toBe(1);
    expect(signatures.size).toBe(1);
  });

  it("leaves the count at exactly one when two withdrawals race", async () => {
    const first = nextCitizen();
    const second = nextCitizen();
    await sign(first.token);
    await sign(second.token);

    const responses = await Promise.all([withdraw(first.token), withdraw(first.token)]);
    const statuses = responses.map((response) => response.status).sort();

    expect(statuses).toEqual([200, 409]);
    expect(petition.signatureCount).toBe(1);
    expect(signatures.size).toBe(1);
  });

  it("cannot drive the count below zero", async () => {
    const citizen = nextCitizen();
    await sign(citizen.token);
    // A drifted count: the row exists but the cache says zero.
    petition.signatureCount = 0;

    const response = await withdraw(citizen.token);

    expect(response.status).toBe(409);
    expect(petition.signatureCount).toBe(0);
  });

  it("refuses an unauthenticated withdrawal and a staff withdrawal", async () => {
    const anonymous = await request(createApp()).delete(
      `/api/petitions/${PETITION_ID}/signatures/me`
    );
    expect(anonymous.status).toBe(401);

    const staff = await withdraw(authorityToken);
    expect(staff.status).toBe(403);
  });

  it("answers 404 for a malformed petition id", async () => {
    const citizen = nextCitizen();

    const response = await withdraw(citizen.token, "not-an-id");

    expect(response.status).toBe(404);
    expect(petitionModel.findById).not.toHaveBeenCalled();
  });

  it("survives a sign/withdraw/sign cycle with the count matching the rows", async () => {
    const citizen = nextCitizen();

    await sign(citizen.token);
    await withdraw(citizen.token);
    const again = await sign(citizen.token);

    expect(again.status).toBe(201);
    expect(petition.signatureCount).toBe(1);
    expect(signatures.size).toBe(1);
  });
});

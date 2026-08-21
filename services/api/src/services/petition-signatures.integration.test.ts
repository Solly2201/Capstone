import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { Petition } from "../models/petition.js";
import { Signature } from "../models/signature.js";
import { User } from "../models/user.js";
import { recountPetitionSignatures, signPetition } from "./petition-signatures.js";
import { clearCollections, startMongo, stopMongo } from "../test/mongo.js";

/**
 * The petition signature guarantee, tested against a real MongoDB.
 *
 * The unit suites cover the route logic, the ordering and the
 * compensating writes, and their signature fake deliberately throws a
 * real E11000 so the handler's duplicate path is exercised. What they
 * cannot show is that the constraint producing that error actually
 * exists in a running database — the fake would behave identically
 * against a schema with no index at all.
 *
 * That matters more here than anywhere else in the codebase: a petition
 * whose count can be inflated asserts nothing, so the unique index on
 * `{ petitionId, citizenId }` is the module's central security control.
 * These tests exist to prove it is really there and really enforced.
 */

const objectId = () => new mongoose.Types.ObjectId().toString();

const createPetition = async (overrides: Record<string, unknown> = {}) =>
  Petition.create({
    creatorId: objectId(),
    creatorName: "Demo Creator",
    category: "infrastructure",
    title: "Repair the arterial road",
    description: "The road has been damaged for months and needs resurfacing.",
    signatureGoal: 100,
    ...overrides
  });

beforeAll(async () => {
  await startMongo();
}, 120_000);

afterAll(async () => {
  await stopMongo();
});

afterEach(async () => {
  await clearCollections();
});

describe("signature uniqueness against a real MongoDB", () => {
  it("has actually built the unique compound index on { petitionId, citizenId }", async () => {
    const indexes = await Signature.collection.indexes();
    const compound = indexes.find(
      (index) => index.key?.petitionId === 1 && index.key?.citizenId === 1
    );

    expect(compound, "the { petitionId, citizenId } index is missing").toBeDefined();
    expect(compound?.unique, "the index exists but is not unique").toBe(true);
  });

  it("refuses a second signature row for the same citizen and petition", async () => {
    const petition = await createPetition();
    const citizenId = objectId();

    await Signature.create({ petitionId: petition._id, citizenId });
    await expect(Signature.create({ petitionId: petition._id, citizenId })).rejects.toMatchObject({
      code: 11000
    });

    expect(await Signature.countDocuments({ petitionId: petition._id })).toBe(1);
  });

  it("still allows different citizens to sign the same petition", async () => {
    const petition = await createPetition();
    await Signature.create({ petitionId: petition._id, citizenId: objectId() });
    await Signature.create({ petitionId: petition._id, citizenId: objectId() });

    expect(await Signature.countDocuments({ petitionId: petition._id })).toBe(2);
  });

  it("still allows one citizen to sign different petitions", async () => {
    const [first, second] = await Promise.all([createPetition(), createPetition()]);
    const citizenId = objectId();

    await Signature.create({ petitionId: first._id, citizenId });
    await Signature.create({ petitionId: second._id, citizenId });

    expect(await Signature.countDocuments({ citizenId })).toBe(2);
  });
});

describe("signPetition under real concurrency", () => {
  it("produces exactly one signature when the same citizen signs 12 times at once", async () => {
    const petition = await createPetition();
    const citizenId = objectId();

    const results = await Promise.all(
      Array.from({ length: 12 }, () => signPetition(petition.id, { userId: citizenId }))
    );

    // Exactly one request may report that it changed the state; the rest
    // must be told they had already signed, not handed an error page.
    const changed = results.filter((result) => result.ok && result.changed);
    const alreadySigned = results.filter((result) => !result.ok && result.code === "ALREADY_SIGNED");

    expect(changed).toHaveLength(1);
    expect(changed.length + alreadySigned.length).toBe(12);

    // The database is the authority here, not the route's answer.
    expect(await Signature.countDocuments({ petitionId: petition._id, citizenId })).toBe(1);
  }, 30_000);

  it("cannot have its signatureCount inflated by that race", async () => {
    const petition = await createPetition();
    const citizenId = objectId();

    await Promise.all(
      Array.from({ length: 12 }, () => signPetition(petition.id, { userId: citizenId }))
    );

    const stored = await Petition.findById(petition._id);
    expect(stored?.signatureCount).toBe(1);
  }, 30_000);

  it("counts twelve distinct citizens signing at once exactly once each", async () => {
    const petition = await createPetition();
    const citizenIds = Array.from({ length: 12 }, () => objectId());

    await Promise.all(citizenIds.map((userId) => signPetition(petition.id, { userId })));

    const stored = await Petition.findById(petition._id);
    expect(await Signature.countDocuments({ petitionId: petition._id })).toBe(12);
    expect(stored?.signatureCount).toBe(12);
  }, 30_000);

  it("does not record a signature on a petition that is not open", async () => {
    const petition = await createPetition({ status: "CLOSED" });

    const result = await signPetition(petition.id, { userId: objectId() });

    expect(result.ok).toBe(false);
    expect(await Signature.countDocuments({ petitionId: petition._id })).toBe(0);
    expect((await Petition.findById(petition._id))?.signatureCount).toBe(0);
  });
});

describe("schema validation against a real MongoDB", () => {
  it("rejects a petition status outside the declared enum", async () => {
    await expect(createPetition({ status: "NOT_A_STATUS" })).rejects.toThrow();
  });

  it("rejects a petition category outside the declared enum", async () => {
    await expect(createPetition({ category: "NOT_A_CATEGORY" })).rejects.toThrow();
  });

  it("rejects a signature missing its citizen", async () => {
    const petition = await createPetition();
    await expect(Signature.create({ petitionId: petition._id })).rejects.toThrow();
  });

  it("enforces the unique index on user email", async () => {
    const base = {
      fullName: "Demo Citizen",
      email: "duplicate@cap.local",
      passwordHash: "hash",
      role: "CITIZEN" as const,
      disclaimerAcceptance: { version: "2026-08-16", acceptedAt: new Date() }
    };

    await User.create(base);
    await expect(User.create(base)).rejects.toMatchObject({ code: 11000 });
    expect(await User.countDocuments({ email: base.email })).toBe(1);
  });

  it("rejects a user role outside the declared enum", async () => {
    await expect(
      User.create({
        fullName: "Demo Citizen",
        email: "bad-role@cap.local",
        passwordHash: "hash",
        role: "SUPERUSER",
        disclaimerAcceptance: { version: "2026-08-16", acceptedAt: new Date() }
      })
    ).rejects.toThrow();
  });
});

describe("signature recount against a real MongoDB", () => {
  it("repairs a drifted count from the signature rows", async () => {
    const petition = await createPetition();
    await Signature.create({ petitionId: petition._id, citizenId: objectId() });
    await Signature.create({ petitionId: petition._id, citizenId: objectId() });
    // Simulate the documented crash drift: the count understates the rows.
    await Petition.updateOne({ _id: petition._id }, { $set: { signatureCount: 0 } });

    const updated = await recountPetitionSignatures(String(petition._id));

    expect(updated?.signatureCount).toBe(2);
    // And the rows themselves were never touched.
    expect(await Signature.countDocuments({ petitionId: petition._id })).toBe(2);
  });

  it("returns null for a petition that does not exist", async () => {
    expect(await recountPetitionSignatures(objectId())).toBeNull();
  });
});

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { CivicReport } from "../models/civic-report.js";
import { civicReportFingerprint, findPotentialDuplicates } from "./civic-duplicates.js";
import { clearCollections, startMongo, stopMongo } from "../test/mongo.js";

/**
 * Civic duplicate handling, tested against a real MongoDB.
 *
 * The unit suite pins the query shapes and the route behaviour with a
 * mock; what it cannot show is that the unique fingerprint index really
 * exists in a running database, or that the 2dsphere index really answers
 * a $nearSphere query with the reports we expect. Both guarantees are
 * enforced by MongoDB, not by application code, so they are proved here
 * the same way the petition signature index is.
 */

const objectId = () => new mongoose.Types.ObjectId().toString();

// A point in Mumbai, and offsets that are unambiguously inside/outside
// the 200 m potential-duplicate radius (one degree of latitude ≈ 111 km).
const AT = { latitude: 19.07609, longitude: 72.87742 };
const NEARBY = { latitude: 19.0769, longitude: 72.87742 }; // ~90 m north
const FAR = { latitude: 19.0861, longitude: 72.87742 }; // ~1.1 km north

const createReport = async (overrides: Record<string, unknown> = {}) => {
  const { latitude, longitude, ...rest } = overrides as Record<string, unknown> & {
    latitude?: number;
    longitude?: number;
  };
  return CivicReport.create({
    reporterId: objectId(),
    category: "pothole",
    title: "Deep pothole outside the bus stop",
    description: "A large pothole has been here for weeks and buses swerve around it.",
    location: {
      type: "Point",
      coordinates: [longitude ?? AT.longitude, latitude ?? AT.latitude]
    },
    status: "SUBMITTED",
    priority: "MEDIUM",
    ...rest
  });
};

beforeAll(async () => {
  await startMongo();
}, 120_000);

afterAll(async () => {
  await stopMongo();
});

afterEach(async () => {
  await clearCollections();
});

describe("exact-resubmission fingerprint against a real MongoDB", () => {
  it("has actually built the unique sparse index on fingerprint", async () => {
    const indexes = await CivicReport.collection.indexes();
    const index = indexes.find((entry) => entry.key?.fingerprint === 1);

    expect(index, "the fingerprint index is missing").toBeDefined();
    expect(index?.unique, "the index exists but is not unique").toBe(true);
    expect(index?.sparse, "the index must be sparse so legacy reports coexist").toBe(true);
  });

  it("refuses a second report with the same fingerprint", async () => {
    const reporterId = objectId();
    const fingerprint = civicReportFingerprint({
      reporterId,
      category: "pothole",
      title: "Deep pothole outside the bus stop",
      description: "A large pothole has been here for weeks.",
      latitude: AT.latitude,
      longitude: AT.longitude,
      at: new Date()
    });

    await createReport({ reporterId, fingerprint });
    await expect(createReport({ reporterId, fingerprint })).rejects.toMatchObject({ code: 11000 });

    expect(await CivicReport.countDocuments({ fingerprint })).toBe(1);
  });

  it("lets two different citizens report the same problem in the same words", async () => {
    const shared = {
      category: "pothole" as const,
      title: "Big pothole near college gate",
      description: "Large pothole outside the college, dangerous for two-wheelers.",
      latitude: AT.latitude,
      longitude: AT.longitude,
      at: new Date()
    };
    const first = civicReportFingerprint({ ...shared, reporterId: objectId() });
    const second = civicReportFingerprint({ ...shared, reporterId: objectId() });

    expect(first).not.toBe(second);
    await createReport({ fingerprint: first });
    await createReport({ fingerprint: second });
    expect(await CivicReport.countDocuments({})).toBe(2);
  });

  it("coexists with legacy reports that carry no fingerprint at all", async () => {
    // Sparse: two missing-fingerprint documents must not collide.
    await createReport();
    await createReport();
    expect(await CivicReport.countDocuments({})).toBe(2);
  });
});

describe("potential-duplicate proximity query against the real 2dsphere index", () => {
  it("finds a recent nearby same-category report and measures its distance", async () => {
    await createReport({ title: "Pothole by the gate", ...NEARBY });

    const summaries = await findPotentialDuplicates({ category: "pothole", ...AT });

    expect(summaries).toHaveLength(1);
    expect(summaries[0].title).toBe("Pothole by the gate");
    expect(summaries[0].distanceMeters).toBeGreaterThan(50);
    expect(summaries[0].distanceMeters).toBeLessThan(150);
    // Redacted: no body, no reporter, no coordinates.
    expect(summaries[0]).not.toHaveProperty("description");
    expect(summaries[0]).not.toHaveProperty("reporterId");
  });

  it("ignores reports outside the radius, in another category, rejected, or too old", async () => {
    await createReport({ title: "Too far", ...FAR });
    await createReport({ title: "Wrong category", category: "garbage", ...NEARBY });
    await createReport({ title: "Rejected earlier", status: "REJECTED", ...NEARBY });
    const old = await createReport({ title: "Long resolved", ...NEARBY });
    // createdAt is set by the timestamps plugin; age it directly.
    await CivicReport.collection.updateOne(
      { _id: old._id },
      { $set: { createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } }
    );

    const summaries = await findPotentialDuplicates({ category: "pothole", ...AT });

    expect(summaries).toEqual([]);
  });

  it("returns the nearest reports first", async () => {
    await createReport({ title: "Further", latitude: 19.0773, longitude: AT.longitude });
    await createReport({ title: "Nearest", ...NEARBY });

    const summaries = await findPotentialDuplicates({ category: "pothole", ...AT });

    expect(summaries.map((summary) => summary.title)).toEqual(["Nearest", "Further"]);
  });
});

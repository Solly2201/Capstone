import { beforeEach, describe, expect, it, vi } from "vitest";
import { civicDuplicateMaxCandidates, civicDuplicateRadiusMeters } from "@cap/contracts";
import { CivicReport } from "../models/civic-report.js";
import {
  civicReportFingerprint,
  findPotentialDuplicates,
  fingerprintTimeBucket,
  haversineMeters,
  isDuplicateKeyError,
  normalizeReportText,
  quantizeCoordinate,
  type FingerprintInput
} from "./civic-duplicates.js";

vi.mock("../models/civic-report.js", () => ({
  CivicReport: { find: vi.fn() }
}));

const reportModel = CivicReport as unknown as { find: ReturnType<typeof vi.fn> };

const baseInput: FingerprintInput = {
  reporterId: "64b7f9c2e1a2b3c4d5e6f701",
  category: "pothole",
  title: "Deep pothole outside the bus stop",
  description: "A large pothole has been here for weeks and buses swerve around it.",
  latitude: 19.07609,
  longitude: 72.87742,
  at: new Date("2026-08-18T10:20:00Z")
};

describe("normalizeReportText", () => {
  it("collapses case, punctuation and repeated whitespace", () => {
    expect(normalizeReportText("Big  POTHOLE!!  near the   gate.")).toBe("big pothole near the gate");
  });

  it("keeps genuinely different wording different", () => {
    expect(normalizeReportText("streetlight broken")).not.toBe(normalizeReportText("streetlight flickering"));
  });

  it("normalises unicode presentation forms", () => {
    // NFKC folds the full-width form to plain ASCII.
    expect(normalizeReportText("ｐｏｔｈｏｌｅ")).toBe("pothole");
  });
});

describe("quantizeCoordinate", () => {
  it("rounds to four decimal places (~11 m cells)", () => {
    expect(quantizeCoordinate(19.076094)).toBe("19.0761");
    expect(quantizeCoordinate(19.07609)).toBe("19.0761");
  });

  it("keeps distinct street corners apart", () => {
    expect(quantizeCoordinate(19.076)).not.toBe(quantizeCoordinate(19.078));
  });
});

describe("fingerprintTimeBucket", () => {
  it("floors to the hour", () => {
    expect(fingerprintTimeBucket(new Date("2026-08-18T10:00:00Z"))).toBe(
      fingerprintTimeBucket(new Date("2026-08-18T10:59:59Z"))
    );
    expect(fingerprintTimeBucket(new Date("2026-08-18T10:59:59Z"))).not.toBe(
      fingerprintTimeBucket(new Date("2026-08-18T11:00:00Z"))
    );
  });
});

describe("civicReportFingerprint", () => {
  it("is deterministic", () => {
    expect(civicReportFingerprint(baseInput)).toBe(civicReportFingerprint({ ...baseInput }));
  });

  it("ignores cosmetic differences in wording and GPS jitter", () => {
    const cosmetic = civicReportFingerprint({
      ...baseInput,
      title: "deep POTHOLE outside the bus stop!!",
      description: "A large  pothole has been here for weeks, and buses swerve around it.",
      latitude: 19.076093,
      longitude: 72.877418,
      at: new Date("2026-08-18T10:45:00Z")
    });
    expect(cosmetic).toBe(civicReportFingerprint(baseInput));
  });

  it("differs for a different citizen reporting the same problem", () => {
    expect(civicReportFingerprint({ ...baseInput, reporterId: "64b7f9c2e1a2b3c4d5e6f702" })).not.toBe(
      civicReportFingerprint(baseInput)
    );
  });

  it("differs across category, location cell and hour bucket", () => {
    const base = civicReportFingerprint(baseInput);
    expect(civicReportFingerprint({ ...baseInput, category: "garbage" })).not.toBe(base);
    expect(civicReportFingerprint({ ...baseInput, latitude: 19.078 })).not.toBe(base);
    expect(civicReportFingerprint({ ...baseInput, at: new Date("2026-08-18T11:20:00Z") })).not.toBe(base);
  });
});

describe("haversineMeters", () => {
  it("is zero for the same point", () => {
    expect(haversineMeters(19.07609, 72.87742, 19.07609, 72.87742)).toBe(0);
  });

  it("matches a known distance", () => {
    // One degree of longitude at the equator is ~111.19 km.
    const metres = haversineMeters(0, 0, 0, 1);
    expect(metres).toBeGreaterThan(111_000);
    expect(metres).toBeLessThan(111_400);
  });
});

describe("isDuplicateKeyError", () => {
  it("recognises E11000 and nothing else", () => {
    expect(isDuplicateKeyError(Object.assign(new Error("dup"), { code: 11000 }))).toBe(true);
    expect(isDuplicateKeyError(new Error("boom"))).toBe(false);
    expect(isDuplicateKeyError(null)).toBe(false);
  });
});

describe("findPotentialDuplicates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const storedReport = (overrides: Record<string, unknown> = {}) => ({
    id: "64b7f9c2e1a2b3c4d5e6f7aa",
    title: "Big pothole near college gate",
    category: "pothole",
    status: "UNDER_REVIEW",
    description: "should never appear in a summary",
    reporterId: "64b7f9c2e1a2b3c4d5e6f702",
    location: { type: "Point", coordinates: [72.87742, 19.07609] },
    createdAt: new Date("2026-08-15T09:00:00Z"),
    ...overrides
  });

  it("queries nearby recent same-category open reports via the geo index", async () => {
    reportModel.find.mockReturnValue({ limit: () => Promise.resolve([]) });

    await findPotentialDuplicates({
      category: "pothole",
      latitude: 19.07609,
      longitude: 72.87742,
      now: new Date("2026-08-18T10:00:00Z")
    });

    const filter = reportModel.find.mock.calls[0][0];
    expect(filter.category).toBe("pothole");
    expect(filter.status).toEqual({ $ne: "REJECTED" });
    expect(filter.createdAt.$gte).toEqual(new Date("2026-07-19T10:00:00Z"));
    expect(filter.location.$nearSphere.$maxDistance).toBe(civicDuplicateRadiusMeters);
    // GeoJSON order is [longitude, latitude].
    expect(filter.location.$nearSphere.$geometry.coordinates).toEqual([72.87742, 19.07609]);
  });

  it("returns redacted summaries only", async () => {
    reportModel.find.mockReturnValue({ limit: () => Promise.resolve([storedReport()]) });

    const summaries = await findPotentialDuplicates({
      category: "pothole",
      latitude: 19.07609,
      longitude: 72.87742
    });

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toEqual({
      id: "64b7f9c2e1a2b3c4d5e6f7aa",
      title: "Big pothole near college gate",
      category: "pothole",
      status: "UNDER_REVIEW",
      distanceMeters: 0,
      createdAt: "2026-08-15T09:00:00.000Z"
    });
    // The redaction is the security property: another citizen's report
    // body must not leak through the create endpoint's warning.
    expect(summaries[0]).not.toHaveProperty("description");
    expect(summaries[0]).not.toHaveProperty("reporterId");
  });

  it("reports the real distance from the submission point", async () => {
    // ~0.0018 degrees of latitude is roughly 200 m.
    reportModel.find.mockReturnValue({
      limit: () => Promise.resolve([storedReport({ location: { type: "Point", coordinates: [72.87742, 19.0779] } })])
    });

    const summaries = await findPotentialDuplicates({
      category: "pothole",
      latitude: 19.07609,
      longitude: 72.87742
    });

    expect(summaries[0].distanceMeters).toBeGreaterThan(150);
    expect(summaries[0].distanceMeters).toBeLessThan(250);
  });

  it("caps the candidate list", async () => {
    const limit = vi.fn().mockResolvedValue([]);
    reportModel.find.mockReturnValue({ limit });

    await findPotentialDuplicates({ category: "pothole", latitude: 19.07609, longitude: 72.87742 });

    expect(limit).toHaveBeenCalledWith(civicDuplicateMaxCandidates);
  });
});

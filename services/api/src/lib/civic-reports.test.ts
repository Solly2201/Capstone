import { describe, expect, it } from "vitest";
import { toPublicCivicReport } from "./civic-reports.js";
import type { CivicReportDocument } from "../models/civic-report.js";
import type { HydratedDocument } from "mongoose";

/**
 * Mapper-level tests. The route tests cover authorisation; these cover
 * what the mapper is uniquely responsible for -- the coordinate
 * inversion, actor-identity visibility, and not falling over on data
 * written before this milestone's fields existed.
 */

const CREATED_AT = new Date("2026-08-18T10:00:00.000Z");

const doc = (overrides: Record<string, unknown> = {}) =>
  ({
    id: "64b7f9c2e1a2b3c4d5e6f7aa",
    reporterId: "64b7f9c2e1a2b3c4d5e6f701",
    category: "pothole",
    title: "Deep pothole",
    description: "A large pothole has been here for weeks.",
    location: { type: "Point", coordinates: [72.87742, 19.07609] },
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    media: [],
    history: [],
    dueAt: new Date("2026-08-23T10:00:00.000Z"),
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    ...overrides
  }) as unknown as HydratedDocument<CivicReportDocument>;

describe("toPublicCivicReport", () => {
  it("unpacks GeoJSON [lng, lat] into latitude and longitude", () => {
    const result = toPublicCivicReport(doc());

    expect(result.latitude).toBeCloseTo(19.07609, 5);
    expect(result.longitude).toBeCloseTo(72.87742, 5);
  });

  it("computes overdue against the supplied instant, not wall-clock time", () => {
    const notYet = toPublicCivicReport(doc(), undefined, new Date("2026-08-22T10:00:00.000Z"));
    const past = toPublicCivicReport(doc(), undefined, new Date("2026-08-24T10:00:00.000Z"));

    expect(notYet.isOverdue).toBe(false);
    expect(past.isOverdue).toBe(true);
  });

  it("stops counting a closed report as overdue", () => {
    const resolved = toPublicCivicReport(doc({ status: "RESOLVED" }), undefined, new Date("2027-01-01T00:00:00.000Z"));

    expect(resolved.isOverdue).toBe(false);
  });

  it("hides the acting staff identity unless the viewer is staff", () => {
    const history = [
      {
        type: "STATUS",
        from: "SUBMITTED",
        to: "UNDER_REVIEW",
        actorId: "64b7f9c2e1a2b3c4d5e6f703",
        actorRole: "AUTHORITY",
        at: CREATED_AT
      }
    ];

    // No viewer supplied: default to the narrower view.
    expect(toPublicCivicReport(doc({ history })).history[0].actorId).toBeUndefined();
    expect(toPublicCivicReport(doc({ history }), { role: "CITIZEN" }).history[0].actorId).toBeUndefined();
    expect(toPublicCivicReport(doc({ history }), { role: "AUTHORITY" }).history[0].actorId).toBe(
      "64b7f9c2e1a2b3c4d5e6f703"
    );
    expect(toPublicCivicReport(doc({ history }), { role: "ADMIN" }).history[0].actorId).toBe(
      "64b7f9c2e1a2b3c4d5e6f703"
    );
  });

  it("never exposes storage details", () => {
    const media = [
      {
        _id: "64b7f9c2e1a2b3c4d5e6f7bb",
        scope: "originals",
        storedName: "0f8fad5b-uuid-civic.png",
        mimeType: "image/png",
        size: 1234,
        uploadedAt: CREATED_AT
      }
    ];

    const result = toPublicCivicReport(doc({ media }), { role: "ADMIN" });

    expect(JSON.stringify(result)).not.toContain("storedName");
    expect(JSON.stringify(result)).not.toContain("0f8fad5b-uuid-civic.png");
    expect(result.media[0].url).toBe(
      "/civic/reports/64b7f9c2e1a2b3c4d5e6f7aa/media/64b7f9c2e1a2b3c4d5e6f7bb"
    );
  });

  it("reads a report stored before history and SLA fields existed", () => {
    // A document written by the previous milestone: no history, no dueAt.
    const legacy = doc({ history: undefined, media: undefined, dueAt: undefined });

    const result = toPublicCivicReport(legacy, { role: "AUTHORITY" });

    expect(result.history).toEqual([]);
    expect(result.media).toEqual([]);
    expect(result.dueAt).toBeUndefined();
    expect(result.isOverdue).toBe(false);
  });
});

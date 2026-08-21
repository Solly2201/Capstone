import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { CivicReport } from "../models/civic-report.js";
import { signAccessToken } from "../lib/jwt.js";

// vi.mock is hoisted above const declarations, so the storage spies have
// to be created inside vi.hoisted to exist by the time the factory runs.
const { saveMock, readMock } = vi.hoisted(() => ({ saveMock: vi.fn(), readMock: vi.fn() }));

vi.mock("../models/civic-report.js", () => ({
  CivicReport: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    countDocuments: vi.fn()
  }
}));

vi.mock("../services/local-file-storage.js", () => ({
  LocalFileStorage: class {
    save = saveMock;
    read = readMock;
  }
}));

const reportModel = CivicReport as unknown as {
  create: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  countDocuments: ReturnType<typeof vi.fn>;
};

const CITIZEN_ID = "64b7f9c2e1a2b3c4d5e6f701";
const OTHER_CITIZEN_ID = "64b7f9c2e1a2b3c4d5e6f702";
const REPORT_ID = "64b7f9c2e1a2b3c4d5e6f7aa";
const MEDIA_ID = "64b7f9c2e1a2b3c4d5e6f7bb";

const citizenToken = signAccessToken({ sub: CITIZEN_ID, role: "CITIZEN" });
const otherCitizenToken = signAccessToken({ sub: OTHER_CITIZEN_ID, role: "CITIZEN" });
const authorityToken = signAccessToken({ sub: "64b7f9c2e1a2b3c4d5e6f703", role: "AUTHORITY" });

/** Minimal stand-in for a hydrated CivicReport document. */
const fakeReport = (overrides: Record<string, unknown> = {}) => ({
  id: REPORT_ID,
  reporterId: CITIZEN_ID,
  category: "pothole",
  title: "Deep pothole outside the bus stop",
  description: "A large pothole has been here for weeks and buses swerve around it.",
  location: { type: "Point", coordinates: [72.87742, 19.07609] },
  landmark: "Near the market gate",
  status: "SUBMITTED",
  priority: "MEDIUM",
  media: [],
  history: [],
  dueAt: new Date("2026-08-23T10:00:00Z"),
  createdAt: new Date("2026-08-18T10:00:00Z"),
  updatedAt: new Date("2026-08-18T10:00:00Z"),
  ...overrides
});

const mediaSubdocument = () => ({
  _id: MEDIA_ID,
  scope: "originals" as const,
  storedName: "0f8fad5b-d9cb-469f-a165-70867728950e-civic.png",
  mimeType: "image/png" as const,
  size: 1234,
  uploadedAt: new Date("2026-08-18T10:00:00Z")
});

/**
 * `CivicReport.find()` chains: `.sort().skip().limit()` for the paginated
 * listings, bare `.limit()` for the potential-duplicate geo query.
 */
const listQuery = (value: unknown) => {
  const self: Record<string, unknown> = {};
  for (const method of ["sort", "skip", "limit"]) self[method] = () => self;
  self.then = (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(value).then(resolve, reject);
  return self;
};

const validFields = {
  category: "pothole",
  title: "Deep pothole outside the bus stop",
  description: "A large pothole has been here for weeks and buses swerve around it.",
  latitude: "19.07609",
  longitude: "72.87742"
};

const postReport = (token: string, fields: Record<string, string> = validFields) => {
  const req = request(createApp()).post("/api/civic/reports").set("Authorization", `Bearer ${token}`);
  Object.entries(fields).forEach(([key, value]) => req.field(key, value));
  return req;
};

// A structurally valid PNG carrying a text chunk with location data.
const GPS_SECRET = "GPS:19.0760N,72.8777E";
const pngChunk = (type: string, data: Buffer) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  return Buffer.concat([length, Buffer.from(type, "ascii"), data, Buffer.alloc(4)]);
};
const pngWithMetadata = () =>
  Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", Buffer.alloc(13)),
    pngChunk("tEXt", Buffer.concat([Buffer.from("Comment\0"), Buffer.from(GPS_SECRET)])),
    pngChunk("IDAT", Buffer.from([0x78, 0x9c, 0x63, 0x00])),
    pngChunk("IEND", Buffer.alloc(0))
  ]);

beforeEach(() => {
  vi.clearAllMocks();
  reportModel.create.mockImplementation(async (doc: Record<string, unknown>) => fakeReport(doc));
  // Duplicate checks on creation: no earlier identical submission, no
  // nearby reports, unless a test says otherwise.
  reportModel.findOne.mockResolvedValue(null);
  reportModel.find.mockReturnValue(listQuery([]));
  reportModel.countDocuments.mockResolvedValue(0);
  saveMock.mockResolvedValue({ scope: "originals", storedName: "generated-name.png" });
});

describe("POST /api/civic/reports", () => {
  it("rejects an unauthenticated submission", async () => {
    const response = await request(createApp()).post("/api/civic/reports").send(validFields);

    expect(response.status).toBe(401);
    expect(reportModel.create).not.toHaveBeenCalled();
  });

  it("rejects a submission from a non-citizen role", async () => {
    const response = await postReport(authorityToken);

    expect(response.status).toBe(403);
    expect(reportModel.create).not.toHaveBeenCalled();
  });

  it("lets an authenticated citizen create a report", async () => {
    const response = await postReport(citizenToken).field("landmark", "Near the market gate");

    expect(response.status).toBe(201);
    expect(response.body.report.title).toBe(validFields.title);
    expect(response.body.report.status).toBe("SUBMITTED");
    expect(response.body.report.priority).toBe("MEDIUM");
    // Coordinates round-trip in the API's latitude/longitude order even
    // though they are stored GeoJSON-style as [longitude, latitude].
    expect(response.body.report.latitude).toBeCloseTo(19.07609, 5);
    expect(response.body.report.longitude).toBeCloseTo(72.87742, 5);

    const created = reportModel.create.mock.calls[0][0];
    expect(created.location).toEqual({ type: "Point", coordinates: [72.87742, 19.07609] });
  });

  it("derives reporterId from the token and ignores a spoofed one", async () => {
    const response = await postReport(citizenToken).field("reporterId", OTHER_CITIZEN_ID);

    expect(response.status).toBe(201);
    const created = reportModel.create.mock.calls[0][0];
    expect(created.reporterId).toBe(CITIZEN_ID);
    expect(created.reporterId).not.toBe(OTHER_CITIZEN_ID);
    expect(response.body.report.reporterId).toBe(CITIZEN_ID);
  });

  it("ignores a client-supplied status and priority", async () => {
    const response = await postReport(citizenToken).field("status", "RESOLVED").field("priority", "HIGH");

    expect(response.status).toBe(201);
    const created = reportModel.create.mock.calls[0][0];
    expect(created.status).toBe("SUBMITTED");
    expect(created.priority).toBe("MEDIUM");
  });

  it("rejects an unknown category", async () => {
    const response = await postReport(citizenToken, { ...validFields, category: "alien_invasion" });

    expect(response.status).toBe(400);
    expect(reportModel.create).not.toHaveBeenCalled();
  });

  it("rejects out-of-range coordinates", async () => {
    const badLatitude = await postReport(citizenToken, { ...validFields, latitude: "119.5" });
    const badLongitude = await postReport(citizenToken, { ...validFields, longitude: "-500" });
    const notANumber = await postReport(citizenToken, { ...validFields, latitude: "somewhere" });

    expect(badLatitude.status).toBe(400);
    expect(badLongitude.status).toBe(400);
    expect(notANumber.status).toBe(400);
    expect(reportModel.create).not.toHaveBeenCalled();
  });

  it("rejects missing required fields", async () => {
    const noTitle = await postReport(citizenToken, {
      category: "garbage",
      description: "Rubbish has not been collected for two weeks on this street.",
      latitude: "19.1",
      longitude: "72.8"
    });
    const shortDescription = await postReport(citizenToken, { ...validFields, description: "too short" });
    const noCoordinates = await postReport(citizenToken, {
      category: "garbage",
      title: "Uncollected rubbish",
      description: "Rubbish has not been collected for two weeks on this street."
    });

    expect(noTitle.status).toBe(400);
    expect(shortDescription.status).toBe(400);
    expect(noCoordinates.status).toBe(400);
    expect(reportModel.create).not.toHaveBeenCalled();
  });

  it("accepts a PNG and strips its metadata before storing it", async () => {
    const original = pngWithMetadata();
    expect(original.includes(GPS_SECRET)).toBe(true);

    const response = await postReport(citizenToken).attach("image", original, {
      filename: "../../evil.png",
      contentType: "image/png"
    });

    expect(response.status).toBe(201);
    expect(saveMock).toHaveBeenCalledTimes(1);

    const [scope, nameHint, bytes] = saveMock.mock.calls[0];
    expect(scope).toBe("originals");
    // The client filename is never used as the storage name.
    expect(nameHint).toBe("civic.png");
    // The persisted bytes no longer carry the location metadata.
    expect((bytes as Buffer).includes(GPS_SECRET)).toBe(false);

    const created = reportModel.create.mock.calls[0][0] as { media: Array<Record<string, unknown>> };
    expect(created.media).toHaveLength(1);
    expect(created.media[0].mimeType).toBe("image/png");
  });

  it("rejects a disallowed MIME type", async () => {
    const response = await postReport(citizenToken).attach("image", Buffer.from("#!/bin/sh"), {
      filename: "script.sh",
      contentType: "text/x-shellscript"
    });

    expect(response.status).toBe(415);
    expect(saveMock).not.toHaveBeenCalled();
    expect(reportModel.create).not.toHaveBeenCalled();
  });

  it("rejects a file whose bytes do not match its declared image type", async () => {
    // Claims to be a JPEG; the bytes are a PNG.
    const response = await postReport(citizenToken).attach("image", pngWithMetadata(), {
      filename: "photo.jpg",
      contentType: "image/jpeg"
    });

    expect(response.status).toBe(415);
    expect(saveMock).not.toHaveBeenCalled();
    expect(reportModel.create).not.toHaveBeenCalled();
  });

  it("rejects a non-image disguised with an allowed content type", async () => {
    const response = await postReport(citizenToken).attach("image", Buffer.from("%PDF-1.7 fake"), {
      filename: "photo.png",
      contentType: "image/png"
    });

    expect(response.status).toBe(415);
    expect(saveMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/civic/reports — duplicate handling", () => {
  const nearbyReport = () =>
    fakeReport({
      id: "64b7f9c2e1a2b3c4d5e6f7cc",
      reporterId: OTHER_CITIZEN_ID,
      title: "Big pothole near college gate",
      status: "UNDER_REVIEW",
      createdAt: new Date("2026-08-15T09:00:00Z")
    });

  it("warns about a nearby recent same-category report instead of creating", async () => {
    reportModel.find.mockReturnValue(listQuery([nearbyReport()]));

    const response = await postReport(citizenToken);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("POTENTIAL_DUPLICATE");
    expect(response.body.potentialDuplicates).toHaveLength(1);
    expect(reportModel.create).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();

    // Redacted summary only: another citizen's report body must not leak
    // through the warning (their detail page answers 404 to this viewer).
    const summary = response.body.potentialDuplicates[0];
    expect(summary.title).toBe("Big pothole near college gate");
    expect(summary.status).toBe("UNDER_REVIEW");
    expect(typeof summary.distanceMeters).toBe("number");
    expect(summary).not.toHaveProperty("description");
    expect(summary).not.toHaveProperty("reporterId");
    expect(summary).not.toHaveProperty("media");
    expect(summary).not.toHaveProperty("landmark");
  });

  it("scopes the potential-duplicate query to category, recency, distance and non-rejected status", async () => {
    await postReport(citizenToken);

    const filter = reportModel.find.mock.calls[0][0];
    expect(filter.category).toBe("pothole");
    expect(filter.status).toEqual({ $ne: "REJECTED" });
    expect(filter.createdAt.$gte).toBeInstanceOf(Date);
    expect(filter.location.$nearSphere.$maxDistance).toBe(200);
    expect(filter.location.$nearSphere.$geometry.coordinates).toEqual([72.87742, 19.07609]);
  });

  it("creates the report when the citizen acknowledges the warning", async () => {
    // Would warn without the acknowledgement…
    reportModel.find.mockReturnValue(listQuery([nearbyReport()]));

    const response = await postReport(citizenToken, {
      ...validFields,
      acknowledgeDuplicates: "true"
    });

    expect(response.status).toBe(201);
    // …and with it the geo query is skipped entirely.
    expect(reportModel.find).not.toHaveBeenCalled();
    expect(reportModel.create).toHaveBeenCalledTimes(1);
  });

  it("attaches a deterministic fingerprint to the created report", async () => {
    await postReport(citizenToken);

    const created = reportModel.create.mock.calls[0][0] as { fingerprint?: string };
    expect(created.fingerprint).toMatch(/^[0-9a-f]{64}$/);
  });

  it("refuses an exact resubmission by the same citizen, pointing at the existing report", async () => {
    reportModel.findOne.mockResolvedValue(fakeReport());

    const response = await postReport(citizenToken);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("DUPLICATE_REPORT");
    expect(response.body.reportId).toBe(REPORT_ID);
    expect(reportModel.create).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("answers 409 when the unique index rejects the loser of a racing resubmission", async () => {
    // The pre-check saw nothing, but by create time the winner landed.
    reportModel.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(fakeReport());
    reportModel.create.mockRejectedValue(Object.assign(new Error("E11000 duplicate key"), { code: 11000 }));

    const response = await postReport(citizenToken);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("DUPLICATE_REPORT");
    expect(response.body.reportId).toBe(REPORT_ID);
  });

  // The no-duplicates happy path (409 never fires, report created) is
  // already pinned by "lets an authenticated citizen create a report"
  // above, which now runs through both duplicate checks.
});

describe("GET /api/civic/reports/mine", () => {
  it("rejects an unauthenticated request", async () => {
    const response = await request(createApp()).get("/api/civic/reports/mine");

    expect(response.status).toBe(401);
    expect(reportModel.find).not.toHaveBeenCalled();
  });

  it("returns only the caller's own reports", async () => {
    reportModel.find.mockReturnValue(listQuery([fakeReport()]));

    const response = await request(createApp())
      .get("/api/civic/reports/mine")
      .set("Authorization", `Bearer ${citizenToken}`);

    expect(response.status).toBe(200);
    expect(response.body.reports).toHaveLength(1);
    // The query is scoped by the token's subject, not by anything sent.
    expect(reportModel.find).toHaveBeenCalledWith({ reporterId: CITIZEN_ID });
  });

  it("returns an empty list rather than an error when there are none", async () => {
    reportModel.find.mockReturnValue(listQuery([]));

    const response = await request(createApp())
      .get("/api/civic/reports/mine")
      .set("Authorization", `Bearer ${citizenToken}`);

    expect(response.status).toBe(200);
    expect(response.body.reports).toEqual([]);
  });
});

describe("GET /api/civic/reports/:id", () => {
  it("rejects an unauthenticated request", async () => {
    const response = await request(createApp()).get(`/api/civic/reports/${REPORT_ID}`);

    expect(response.status).toBe(401);
  });

  it("returns the report to its owner", async () => {
    reportModel.findById.mockResolvedValue(fakeReport());

    const response = await request(createApp())
      .get(`/api/civic/reports/${REPORT_ID}`)
      .set("Authorization", `Bearer ${citizenToken}`);

    expect(response.status).toBe(200);
    expect(response.body.report.id).toBe(REPORT_ID);
    // Storage details never cross the API boundary.
    expect(JSON.stringify(response.body)).not.toContain("storedName");
  });

  it("does not let one citizen read another citizen's report", async () => {
    reportModel.findById.mockResolvedValue(fakeReport());

    const response = await request(createApp())
      .get(`/api/civic/reports/${REPORT_ID}`)
      .set("Authorization", `Bearer ${otherCitizenToken}`);

    // 404 rather than 403: existence itself is not disclosed.
    expect(response.status).toBe(404);
    expect(response.body.report).toBeUndefined();
    expect(response.body.message).toBe("Report not found.");
  });

  it("lets an authority read any report", async () => {
    reportModel.findById.mockResolvedValue(fakeReport());

    const response = await request(createApp())
      .get(`/api/civic/reports/${REPORT_ID}`)
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(response.status).toBe(200);
  });

  it("returns 404 for a malformed id without querying the database", async () => {
    const response = await request(createApp())
      .get("/api/civic/reports/not-an-object-id")
      .set("Authorization", `Bearer ${citizenToken}`);

    expect(response.status).toBe(404);
    expect(reportModel.findById).not.toHaveBeenCalled();
  });
});

describe("GET /api/civic/reports/:id/media/:mediaId", () => {
  it("serves the image to the report owner", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ media: [mediaSubdocument()] }));
    readMock.mockResolvedValue(Buffer.from("stripped-image-bytes"));

    const response = await request(createApp())
      .get(`/api/civic/reports/${REPORT_ID}/media/${MEDIA_ID}`)
      .set("Authorization", `Bearer ${citizenToken}`);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("image/png");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(readMock).toHaveBeenCalledWith("originals", mediaSubdocument().storedName);
  });

  it("refuses to serve media from another citizen's report", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ media: [mediaSubdocument()] }));

    const response = await request(createApp())
      .get(`/api/civic/reports/${REPORT_ID}/media/${MEDIA_ID}`)
      .set("Authorization", `Bearer ${otherCitizenToken}`);

    expect(response.status).toBe(404);
    expect(readMock).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated media request", async () => {
    const response = await request(createApp()).get(`/api/civic/reports/${REPORT_ID}/media/${MEDIA_ID}`);

    expect(response.status).toBe(401);
    expect(readMock).not.toHaveBeenCalled();
  });

  it("does not accept a traversal sequence as a media id", async () => {
    const response = await request(createApp())
      .get(`/api/civic/reports/${REPORT_ID}/media/..%2F..%2F..%2Fetc%2Fpasswd`)
      .set("Authorization", `Bearer ${citizenToken}`);

    expect(response.status).toBe(404);
    expect(readMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/civic/reports/mine — pagination", () => {
  it("passes limit and offset through and reports the total", async () => {
    const skip = vi.fn();
    const limit = vi.fn(() => Promise.resolve([fakeReport()]));
    reportModel.find.mockReturnValue({ sort: () => ({ skip: (n: number) => (skip(n), { limit }) }) });
    reportModel.countDocuments.mockResolvedValue(53);

    const response = await request(createApp())
      .get("/api/civic/reports/mine?limit=10&offset=20")
      .set("Authorization", `Bearer ${citizenToken}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(53);
    expect(response.body.limit).toBe(10);
    expect(response.body.offset).toBe(20);
    expect(skip).toHaveBeenCalledWith(20);
    expect(limit).toHaveBeenCalledWith(10);
    // Total is counted over the same owner-scoped filter the page uses.
    expect(reportModel.countDocuments).toHaveBeenCalledWith({ reporterId: CITIZEN_ID });
  });

  it("rejects out-of-range paging parameters", async () => {
    const response = await request(createApp())
      .get("/api/civic/reports/mine?limit=500")
      .set("Authorization", `Bearer ${citizenToken}`);

    expect(response.status).toBe(400);
  });
});

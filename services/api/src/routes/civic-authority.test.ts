import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { civicTransitions } from "@cap/contracts";
import { createApp } from "../app.js";
import { CivicReport } from "../models/civic-report.js";
import { User } from "../models/user.js";
import { signAccessToken } from "../lib/jwt.js";

vi.mock("../models/civic-report.js", () => ({
  CivicReport: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
    countDocuments: vi.fn()
  }
}));

vi.mock("../services/local-file-storage.js", () => ({
  LocalFileStorage: class {
    save = vi.fn();
    read = vi.fn();
  }
}));

// The authority routes re-read the caller's role from the database, so a
// demoted account cannot keep acting on a still-valid token.
vi.mock("../models/user.js", () => ({
  User: {
    findById: vi.fn(),
    // Batched actor-name resolution for staff history views.
    find: vi.fn(() => ({ select: () => Promise.resolve([]) }))
  }
}));

const reportModel = CivicReport as unknown as {
  find: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  findOneAndUpdate: ReturnType<typeof vi.fn>;
  countDocuments: ReturnType<typeof vi.fn>;
};
const userModel = User as unknown as { findById: ReturnType<typeof vi.fn> };

const selectable = (value: unknown) => ({ select: () => Promise.resolve(value) });

const CITIZEN_ID = "64b7f9c2e1a2b3c4d5e6f701";
const AUTHORITY_ID = "64b7f9c2e1a2b3c4d5e6f703";
const ADMIN_ID = "64b7f9c2e1a2b3c4d5e6f704";
const REPORT_ID = "64b7f9c2e1a2b3c4d5e6f7aa";

const citizenToken = signAccessToken({ sub: CITIZEN_ID, role: "CITIZEN" });
const authorityToken = signAccessToken({ sub: AUTHORITY_ID, role: "AUTHORITY" });
const adminToken = signAccessToken({ sub: ADMIN_ID, role: "ADMIN" });

const CREATED_AT = new Date("2026-08-18T10:00:00.000Z");

const fakeReport = (overrides: Record<string, unknown> = {}) => ({
  id: REPORT_ID,
  _id: REPORT_ID,
  reporterId: CITIZEN_ID,
  category: "pothole",
  title: "Deep pothole outside the bus stop",
  description: "A large pothole has been here for weeks and buses swerve around it.",
  location: { type: "Point", coordinates: [72.87742, 19.07609] },
  status: "SUBMITTED",
  priority: "MEDIUM",
  media: [],
  history: [],
  dueAt: new Date("2026-08-23T10:00:00.000Z"),
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides
});

const queueQuery = (value: unknown) => ({
  sort: () => ({ skip: () => ({ limit: () => Promise.resolve(value) }) })
});

const transition = (token: string, body: Record<string, unknown>, id = REPORT_ID) =>
  request(createApp())
    .post(`/api/civic/reports/${id}/transitions`)
    .set("Authorization", `Bearer ${token}`)
    .send(body);

const storedRoleFor = (id: string) =>
  id === ADMIN_ID ? "ADMIN" : id === AUTHORITY_ID ? "AUTHORITY" : "CITIZEN";

beforeEach(() => {
  vi.clearAllMocks();
  // Stored role matches the token unless a test deliberately diverges them.
  userModel.findById.mockImplementation((id: string) =>
    selectable({ role: storedRoleFor(String(id)), tokenVersion: 0 })
  );
  // By default the conditional update succeeds and echoes the new state.
  reportModel.findOneAndUpdate.mockImplementation(async (_filter: unknown, update: Record<string, never>) => {
    const set = (update as { $set?: Record<string, unknown> }).$set ?? {};
    const push = (update as { $push?: { history?: Record<string, unknown> } }).$push?.history;
    return fakeReport({
      ...set,
      history: push ? [{ ...push, at: new Date(String(push.at)), actorId: String(push.actorId) }] : []
    });
  });
});

describe("POST /api/civic/reports/:id/transitions", () => {
  it("performs every transition the shared table declares", async () => {
    for (const rule of civicTransitions) {
      for (const role of rule.roles) {
        vi.clearAllMocks();
        reportModel.findOneAndUpdate.mockResolvedValue(fakeReport({ status: rule.to }));
        reportModel.findById.mockResolvedValue(fakeReport({ status: rule.from }));

        const token = role === "ADMIN" ? adminToken : authorityToken;
        const response = await transition(token, {
          status: rule.to,
          ...(rule.requiresNote ? { note: "A recorded reason." } : {})
        });

        expect(response.status, `${rule.from} -> ${rule.to} as ${role}`).toBe(200);
        expect(response.body.report.status).toBe(rule.to);
      }
    }
  });

  it("rejects a transition that is not in the table", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ status: "SUBMITTED" }));

    const response = await transition(authorityToken, { status: "RESOLVED", note: "skipping ahead" });

    expect(response.status).toBe(422);
    expect(reportModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects a status jump from SUBMITTED straight to IN_PROGRESS", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ status: "SUBMITTED" }));

    const response = await transition(authorityToken, { status: "IN_PROGRESS" });

    expect(response.status).toBe(422);
    expect(reportModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("refuses a citizen outright, even on their own report", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ reporterId: CITIZEN_ID }));

    const response = await transition(citizenToken, { status: "UNDER_REVIEW" });

    expect(response.status).toBe(403);
    expect(reportModel.findById).not.toHaveBeenCalled();
    expect(reportModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("refuses an unauthenticated transition", async () => {
    const response = await request(createApp())
      .post(`/api/civic/reports/${REPORT_ID}/transitions`)
      .send({ status: "UNDER_REVIEW" });

    expect(response.status).toBe(401);
    expect(reportModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("stops an authority from reopening a closed report", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ status: "RESOLVED" }));

    const response = await transition(authorityToken, { status: "UNDER_REVIEW", note: "reopening" });

    expect(response.status).toBe(403);
    expect(reportModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("lets an admin reopen a closed report through the same table", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ status: "RESOLVED" }));
    reportModel.findOneAndUpdate.mockResolvedValue(fakeReport({ status: "UNDER_REVIEW" }));

    const response = await transition(adminToken, { status: "UNDER_REVIEW", note: "Citizen says it recurred." });

    expect(response.status).toBe(200);
    expect(response.body.report.status).toBe("UNDER_REVIEW");
  });

  it("does not let an admin invent a transition the table lacks", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ status: "SUBMITTED" }));

    const response = await transition(adminToken, { status: "RESOLVED", note: "just close it" });

    expect(response.status).toBe(422);
    expect(reportModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("requires a written reason where the rule demands one", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ status: "SUBMITTED" }));

    const response = await transition(authorityToken, { status: "REJECTED" });

    expect(response.status).toBe(422);
    expect(reportModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects a no-op transition", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ status: "UNDER_REVIEW" }));

    const response = await transition(authorityToken, { status: "UNDER_REVIEW" });

    expect(response.status).toBe(422);
  });

  it("rejects a status that is not in the enum", async () => {
    reportModel.findById.mockResolvedValue(fakeReport());

    const response = await transition(authorityToken, { status: "DELETED" });

    expect(response.status).toBe(400);
    expect(reportModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("returns 404 for a nonexistent report", async () => {
    reportModel.findById.mockResolvedValue(null);

    const response = await transition(authorityToken, { status: "UNDER_REVIEW" });

    expect(response.status).toBe(404);
  });

  it("returns 404 for a malformed ObjectId without querying", async () => {
    const response = await transition(authorityToken, { status: "UNDER_REVIEW" }, "not-an-object-id");

    expect(response.status).toBe(404);
    expect(reportModel.findById).not.toHaveBeenCalled();
  });

  it("reports a conflict when the report moved underneath the actor", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ status: "SUBMITTED" }));
    // The conditional update matched nothing: somebody else transitioned first.
    reportModel.findOneAndUpdate.mockResolvedValue(null);

    const response = await transition(authorityToken, { status: "UNDER_REVIEW" });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain("changed while you were working");
  });

  it("guards the write with the status it made the decision against", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ status: "SUBMITTED" }));

    await transition(authorityToken, { status: "UNDER_REVIEW" });

    const [filter] = reportModel.findOneAndUpdate.mock.calls[0];
    expect(filter.status).toBe("SUBMITTED");
  });
});

describe("status history integrity", () => {
  it("builds the history entry from the token and the server clock", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ status: "SUBMITTED" }));
    const before = Date.now();

    await transition(authorityToken, { status: "REJECTED", note: "Duplicate of an earlier report." });

    const [, update] = reportModel.findOneAndUpdate.mock.calls[0];
    const entry = update.$push.history;
    expect(entry.type).toBe("STATUS");
    expect(entry.from).toBe("SUBMITTED");
    expect(entry.to).toBe("REJECTED");
    expect(entry.actorId).toBe(AUTHORITY_ID);
    expect(entry.actorRole).toBe("AUTHORITY");
    expect(entry.note).toBe("Duplicate of an earlier report.");
    expect(new Date(entry.at).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("ignores a client attempt to forge the actor, timestamp or previous status", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ status: "SUBMITTED" }));

    await transition(authorityToken, {
      status: "UNDER_REVIEW",
      actorId: ADMIN_ID,
      actorRole: "ADMIN",
      at: "1999-01-01T00:00:00.000Z",
      from: "RESOLVED",
      history: [{ type: "STATUS", from: "SUBMITTED", to: "RESOLVED", actorRole: "ADMIN", at: "1999-01-01T00:00:00.000Z" }]
    });

    const [, update] = reportModel.findOneAndUpdate.mock.calls[0];
    const entry = update.$push.history;
    expect(entry.actorId).toBe(AUTHORITY_ID);
    expect(entry.actorRole).toBe("AUTHORITY");
    expect(entry.from).toBe("SUBMITTED");
    expect(new Date(entry.at).getFullYear()).toBeGreaterThan(2020);
    // Nothing the client sent was written as a field of its own.
    expect(update.$set.history).toBeUndefined();
    expect(update.$set.reporterId).toBeUndefined();
    expect(Object.keys(update.$set)).toEqual(["status"]);
  });

  it("shows the acting role but not the staff identity to a citizen", async () => {
    const history = [
      {
        type: "STATUS",
        from: "SUBMITTED",
        to: "REJECTED",
        actorId: AUTHORITY_ID,
        actorRole: "AUTHORITY",
        note: "Duplicate report.",
        at: CREATED_AT
      }
    ];
    reportModel.findById.mockResolvedValue(fakeReport({ status: "REJECTED", history }));

    const asCitizen = await request(createApp())
      .get(`/api/civic/reports/${REPORT_ID}`)
      .set("Authorization", `Bearer ${citizenToken}`);

    expect(asCitizen.status).toBe(200);
    expect(asCitizen.body.report.history[0].actorRole).toBe("AUTHORITY");
    expect(asCitizen.body.report.history[0].note).toBe("Duplicate report.");
    expect(asCitizen.body.report.history[0].actorId).toBeUndefined();
    expect(JSON.stringify(asCitizen.body)).not.toContain(AUTHORITY_ID);
  });

  it("shows the staff identity to an authority", async () => {
    const history = [
      { type: "STATUS", from: "SUBMITTED", to: "UNDER_REVIEW", actorId: AUTHORITY_ID, actorRole: "AUTHORITY", at: CREATED_AT }
    ];
    reportModel.findById.mockResolvedValue(fakeReport({ history }));

    const asAuthority = await request(createApp())
      .get(`/api/civic/reports/${REPORT_ID}`)
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(asAuthority.body.report.history[0].actorId).toBe(AUTHORITY_ID);
  });
});

describe("PATCH /api/civic/reports/:id/priority", () => {
  it("lets an authority set priority and moves the deadline with it", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ priority: "MEDIUM" }));

    const response = await request(createApp())
      .patch(`/api/civic/reports/${REPORT_ID}/priority`)
      .set("Authorization", `Bearer ${authorityToken}`)
      .send({ priority: "HIGH" });

    expect(response.status).toBe(200);
    const [, update] = reportModel.findOneAndUpdate.mock.calls[0];
    expect(update.$set.priority).toBe("HIGH");
    // HIGH is 48h from submission, not 48h from now.
    expect(new Date(update.$set.dueAt).toISOString()).toBe("2026-08-20T10:00:00.000Z");
    expect(update.$push.history.type).toBe("PRIORITY");
    expect(update.$push.history.from).toBe("MEDIUM");
    expect(update.$push.history.to).toBe("HIGH");
  });

  it("refuses a citizen", async () => {
    const response = await request(createApp())
      .patch(`/api/civic/reports/${REPORT_ID}/priority`)
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ priority: "HIGH" });

    expect(response.status).toBe(403);
    expect(reportModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects a priority outside the enum", async () => {
    const response = await request(createApp())
      .patch(`/api/civic/reports/${REPORT_ID}/priority`)
      .set("Authorization", `Bearer ${authorityToken}`)
      .send({ priority: "URGENT" });

    expect(response.status).toBe(400);
  });

  it("rejects setting the priority it already has", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ priority: "HIGH" }));

    const response = await request(createApp())
      .patch(`/api/civic/reports/${REPORT_ID}/priority`)
      .set("Authorization", `Bearer ${authorityToken}`)
      .send({ priority: "HIGH" });

    expect(response.status).toBe(422);
  });

  it("refuses to re-prioritise a closed report", async () => {
    // Regression: moving the SLA deadline on a finished report is
    // meaningless and would append history to something already closed.
    for (const status of ["RESOLVED", "REJECTED"]) {
      vi.clearAllMocks();
      reportModel.findById.mockResolvedValue(fakeReport({ status, priority: "MEDIUM" }));

      const response = await request(createApp())
        .patch(`/api/civic/reports/${REPORT_ID}/priority`)
        .set("Authorization", `Bearer ${authorityToken}`)
        .send({ priority: "HIGH" });

      expect(response.status, status).toBe(422);
      expect(reportModel.findOneAndUpdate).not.toHaveBeenCalled();
    }
  });

  it("reports a conflict when priority changed underneath the actor", async () => {
    reportModel.findById.mockResolvedValue(fakeReport({ priority: "MEDIUM" }));
    reportModel.findOneAndUpdate.mockResolvedValue(null);

    const response = await request(createApp())
      .patch(`/api/civic/reports/${REPORT_ID}/priority`)
      .set("Authorization", `Bearer ${authorityToken}`)
      .send({ priority: "LOW" });

    expect(response.status).toBe(409);
  });
});

describe("malformed identifiers", () => {
  it("treats a repeated id parameter as no such report rather than coercing it", async () => {
    // Route params are typed string | string[]; anything that is not a
    // single ObjectId string must not reach the database.
    const response = await request(createApp())
      .get("/api/civic/reports/64b7f9c2e1a2b3c4d5e6f7aa%00")
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(response.status).toBe(404);
    expect(reportModel.findById).not.toHaveBeenCalled();
  });

  it("rejects a traversal-shaped media id", async () => {
    const response = await request(createApp())
      .get(`/api/civic/reports/${REPORT_ID}/media/..%2F..%2Fsecret`)
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(response.status).toBe(404);
    expect(reportModel.findById).not.toHaveBeenCalled();
  });
});

describe("GET /api/civic/authority/reports", () => {
  beforeEach(() => {
    reportModel.find.mockReturnValue(queueQuery([fakeReport()]));
    reportModel.countDocuments.mockResolvedValue(1);
  });

  it("refuses a citizen", async () => {
    const response = await request(createApp())
      .get("/api/civic/authority/reports")
      .set("Authorization", `Bearer ${citizenToken}`);

    expect(response.status).toBe(403);
    expect(reportModel.find).not.toHaveBeenCalled();
  });

  it("refuses an unauthenticated request", async () => {
    const response = await request(createApp()).get("/api/civic/authority/reports");

    expect(response.status).toBe(401);
  });

  it("returns the queue to an authority", async () => {
    const response = await request(createApp())
      .get("/api/civic/authority/reports")
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(response.status).toBe(200);
    expect(response.body.reports).toHaveLength(1);
    expect(response.body.total).toBe(1);
    expect(response.body.limit).toBe(25);
    expect(reportModel.find).toHaveBeenCalledWith({});
  });

  it("passes only known filters through to the database", async () => {
    await request(createApp())
      .get("/api/civic/authority/reports?status=UNDER_REVIEW&category=garbage&priority=HIGH")
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(reportModel.find).toHaveBeenCalledWith({
      status: "UNDER_REVIEW",
      category: "garbage",
      priority: "HIGH"
    });
  });

  it("ignores an unknown query parameter rather than querying on it", async () => {
    await request(createApp())
      .get("/api/civic/authority/reports?reporterId=64b7f9c2e1a2b3c4d5e6f701&$where=1")
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(reportModel.find).toHaveBeenCalledWith({});
  });

  it("rejects an invalid filter value", async () => {
    const response = await request(createApp())
      .get("/api/civic/authority/reports?status=NONSENSE")
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(response.status).toBe(400);
    expect(reportModel.find).not.toHaveBeenCalled();
  });

  it("filters overdue reports to open ones past their deadline", async () => {
    await request(createApp())
      .get("/api/civic/authority/reports?overdue=true")
      .set("Authorization", `Bearer ${authorityToken}`);

    const [filter] = reportModel.find.mock.calls[0];
    expect(filter.dueAt.$lt).toBeInstanceOf(Date);
    expect(filter.status).toEqual({ $nin: ["RESOLVED", "REJECTED"] });
  });

  it("caps the page size", async () => {
    const response = await request(createApp())
      .get("/api/civic/authority/reports?limit=5000")
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(response.status).toBe(400);
  });
});

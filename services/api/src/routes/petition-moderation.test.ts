import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { petitionStatuses, petitionTransitions } from "@cap/contracts";
import { createApp } from "../app.js";
import { Petition } from "../models/petition.js";
import { User } from "../models/user.js";
import { signAccessToken } from "../lib/jwt.js";

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

// The transitions route re-reads the actor's role from the database, so
// capability is derived from stored state rather than the token's claim.
vi.mock("../models/user.js", () => ({ User: { findById: vi.fn() } }));

const petitionModel = Petition as unknown as {
  findById: ReturnType<typeof vi.fn>;
  findOneAndUpdate: ReturnType<typeof vi.fn>;
};
const userModel = User as unknown as { findById: ReturnType<typeof vi.fn> };

const PETITION_ID = "64b7f9c2e1a2b3c4d5e6fa01";
const CREATOR_ID = "64b7f9c2e1a2b3c4d5e6f701";
const STRANGER_ID = "64b7f9c2e1a2b3c4d5e6f702";
const AUTHORITY_ID = "64b7f9c2e1a2b3c4d5e6f703";
const ADMIN_ID = "64b7f9c2e1a2b3c4d5e6f704";

const creatorToken = signAccessToken({ sub: CREATOR_ID, role: "CITIZEN" });
const strangerToken = signAccessToken({ sub: STRANGER_ID, role: "CITIZEN" });
const authorityToken = signAccessToken({ sub: AUTHORITY_ID, role: "AUTHORITY" });
const adminToken = signAccessToken({ sub: ADMIN_ID, role: "ADMIN" });

const tokenFor: Record<string, string> = {
  CREATOR: creatorToken,
  AUTHORITY: authorityToken,
  ADMIN: adminToken
};

const CREATED_AT = new Date("2026-08-18T10:00:00.000Z");

const fakePetition = (overrides: Record<string, unknown> = {}) => ({
  id: PETITION_ID,
  _id: PETITION_ID,
  creatorId: CREATOR_ID,
  creatorName: "Asha Menon",
  category: "transport",
  title: "Restore the evening bus service on route 14",
  description: "The last evening bus was withdrawn in June and shift workers walk home in the dark.",
  signatureGoal: 500,
  signatureCount: 42,
  status: "OPEN",
  history: [],
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides
});

const transition = (token: string, body: Record<string, unknown>, id = PETITION_ID) =>
  request(createApp())
    .post(`/api/petitions/${id}/transitions`)
    .set("Authorization", `Bearer ${token}`)
    .send(body);

const storedRoleFor = (id: string) =>
  id === ADMIN_ID ? "ADMIN" : id === AUTHORITY_ID ? "AUTHORITY" : "CITIZEN";

beforeEach(() => {
  vi.clearAllMocks();
  userModel.findById.mockImplementation((id: string) => ({
    select: () => Promise.resolve({ role: storedRoleFor(String(id)), tokenVersion: 0 })
  }));
  // By default the conditional update succeeds and echoes the new state.
  petitionModel.findOneAndUpdate.mockImplementation(
    async (_filter: unknown, update: Record<string, never>) => {
      const set = (update as { $set?: Record<string, unknown> }).$set ?? {};
      const pushed = (update as { $push?: { history?: Record<string, unknown> } }).$push?.history;
      return fakePetition({
        ...set,
        history: pushed ? [{ ...pushed, at: new Date(String(pushed.at)) }] : []
      });
    }
  );
});

describe("POST /api/petitions/:id/transitions", () => {
  it("performs every transition the shared table declares, for every actor it declares", async () => {
    for (const rule of petitionTransitions) {
      for (const actor of rule.actors) {
        vi.clearAllMocks();
        petitionModel.findById.mockResolvedValue(fakePetition({ status: rule.from }));
        petitionModel.findOneAndUpdate.mockResolvedValue(fakePetition({ status: rule.to }));

        const response = await transition(tokenFor[actor], {
          status: rule.to,
          ...(rule.requiresNote ? { note: "A recorded reason." } : {})
        });

        expect(response.status, `${rule.from} -> ${rule.to} as ${actor}`).toBe(200);
        expect(response.body.petition.status).toBe(rule.to);
      }
    }
  });

  it("rejects every from/to pair the table does not declare", async () => {
    const declared = new Set(petitionTransitions.map((rule) => `${rule.from}->${rule.to}`));

    for (const from of petitionStatuses) {
      for (const to of petitionStatuses) {
        if (from === to || declared.has(`${from}->${to}`)) continue;
        vi.clearAllMocks();
        petitionModel.findById.mockResolvedValue(fakePetition({ status: from }));

        const response = await transition(adminToken, { status: to, note: "A recorded reason." });

        expect([403, 422], `${from} -> ${to}`).toContain(response.status);
        expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
      }
    }
  });

  // The central authorisation property: a citizen who did not create the
  // petition resolves to no capability and can make no move at all.
  it("lets a citizen who is not the creator move nothing at all", async () => {
    for (const from of petitionStatuses) {
      for (const to of petitionStatuses) {
        if (from === to) continue;
        vi.clearAllMocks();
        petitionModel.findById.mockResolvedValue(fakePetition({ status: from }));

        const response = await transition(strangerToken, { status: to, note: "Let me in." });

        expect([403, 404], `${from} -> ${to}`).toContain(response.status);
        expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
      }
    }
  });

  it("lets the creator close their own open petition", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "OPEN" }));

    const response = await transition(creatorToken, { status: "CLOSED", note: "Resolved elsewhere." });

    expect(response.status).toBe(200);
    expect(response.body.petition.status).toBe("CLOSED");
  });

  it("gives the creator no other move, in any state", async () => {
    for (const from of petitionStatuses) {
      for (const to of petitionStatuses) {
        if (from === to || (from === "OPEN" && to === "CLOSED")) continue;
        vi.clearAllMocks();
        petitionModel.findById.mockResolvedValue(fakePetition({ status: from }));

        const response = await transition(creatorToken, { status: to, note: "A recorded reason." });

        expect([403, 422], `${from} -> ${to} as creator`).toContain(response.status);
        expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
      }
    }
  });

  it("does not let the creator remove or answer their own petition", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "OPEN" }));

    const removed = await transition(creatorToken, { status: "REJECTED", note: "Hide the evidence." });
    expect(removed.status).toBe(403);

    petitionModel.findById.mockResolvedValue(fakePetition({ status: "UNDER_REVIEW" }));
    const answered = await transition(creatorToken, {
      status: "ANSWERED",
      note: "The authority agrees with me."
    });
    expect(answered.status).toBe(403);
    expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("does not let an authority reopen or reinstate, which is admin-only", async () => {
    for (const from of ["CLOSED", "REJECTED"]) {
      vi.clearAllMocks();
      petitionModel.findById.mockResolvedValue(fakePetition({ status: from }));

      const response = await transition(authorityToken, { status: "OPEN", note: "Back you go." });

      expect(response.status, from).toBe(403);
      expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
    }
  });

  it("lets an admin reopen a closed petition and reinstate a removed one", async () => {
    for (const from of ["CLOSED", "REJECTED"]) {
      vi.clearAllMocks();
      petitionModel.findById.mockResolvedValue(fakePetition({ status: from }));
      petitionModel.findOneAndUpdate.mockResolvedValue(fakePetition({ status: "OPEN" }));

      const response = await transition(adminToken, { status: "OPEN", note: "Removed in error." });

      expect(response.status, from).toBe(200);
      expect(response.body.petition.status).toBe("OPEN");
    }
  });

  // Regression: capability was once derived from role before creatorship,
  // so an account promoted after publishing could moderate its own
  // petition. It now keeps only the creator's power over that one.
  it("does not let a staff account moderate a petition it created itself", async () => {
    for (const [role, token] of [
      ["AUTHORITY", authorityToken],
      ["ADMIN", adminToken]
    ] as const) {
      const selfCreated = () => fakePetition({ status: "OPEN", creatorId: role === "ADMIN" ? ADMIN_ID : AUTHORITY_ID });

      vi.clearAllMocks();
      petitionModel.findById.mockResolvedValue(selfCreated());
      const removed = await transition(token, { status: "REJECTED", note: "Quietly gone." });
      expect(removed.status, role).toBe(403);

      vi.clearAllMocks();
      petitionModel.findById.mockResolvedValue(selfCreated());
      const reviewed = await transition(token, { status: "UNDER_REVIEW" });
      expect(reviewed.status, role).toBe(403);

      expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
    }
  });

  it("still lets a staff account close a petition it created itself", async () => {
    petitionModel.findById.mockResolvedValue(
      fakePetition({ status: "OPEN", creatorId: AUTHORITY_ID })
    );
    petitionModel.findOneAndUpdate.mockResolvedValue(fakePetition({ status: "CLOSED" }));

    const response = await transition(authorityToken, {
      status: "CLOSED",
      note: "Withdrawing my own petition."
    });

    expect(response.status).toBe(200);
    const [, update] = petitionModel.findOneAndUpdate.mock.calls[0];
    expect(update.$push.history.actorCapability).toBe("CREATOR");
  });

  it("lets a colleague still moderate a petition a staff member created", async () => {
    petitionModel.findById.mockResolvedValue(
      fakePetition({ status: "OPEN", creatorId: AUTHORITY_ID })
    );
    petitionModel.findOneAndUpdate.mockResolvedValue(fakePetition({ status: "REJECTED" }));

    const response = await transition(adminToken, { status: "REJECTED", note: "Not appropriate." });

    expect(response.status).toBe(200);
  });

  it("refuses a transition that skips review", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "OPEN" }));

    const response = await transition(authorityToken, { status: "ANSWERED", note: "Done already." });

    expect(response.status).toBe(422);
    expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("demands a written reason wherever the table requires one", async () => {
    for (const rule of petitionTransitions.filter((entry) => entry.requiresNote)) {
      vi.clearAllMocks();
      petitionModel.findById.mockResolvedValue(fakePetition({ status: rule.from }));

      const response = await transition(tokenFor[rule.actors[0]], { status: rule.to });

      expect(response.status, `${rule.from} -> ${rule.to}`).toBe(422);
      expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
    }
  });

  it("builds the history entry from server state, ignoring anything the client sends", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "OPEN" }));

    await transition(authorityToken, {
      status: "REJECTED",
      note: "Duplicate of an existing petition."
    });

    const [, update] = petitionModel.findOneAndUpdate.mock.calls[0];
    const entry = update.$push.history;
    expect(entry.from).toBe("OPEN");
    expect(entry.to).toBe("REJECTED");
    expect(entry.actorId).toBe(AUTHORITY_ID);
    expect(entry.actorCapability).toBe("AUTHORITY");
    expect(entry.at instanceof Date).toBe(true);
    expect(entry.note).toBe("Duplicate of an existing petition.");
  });

  it("records the creator's own close as a CREATOR action, not a staff one", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "OPEN" }));

    await transition(creatorToken, { status: "CLOSED", note: "No longer needed." });

    const [, update] = petitionModel.findOneAndUpdate.mock.calls[0];
    expect(update.$push.history.actorCapability).toBe("CREATOR");
    expect(update.$push.history.actorId).toBe(CREATOR_ID);
  });

  it("rejects a forged actor, timestamp or history array in the request body", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "OPEN" }));

    const response = await transition(authorityToken, {
      status: "UNDER_REVIEW",
      actorId: CREATOR_ID,
      actorCapability: "ADMIN",
      at: "2001-01-01T00:00:00.000Z",
      history: [{ from: "OPEN", to: "ANSWERED" }],
      signatureCount: 99_999
    });

    expect(response.status).toBe(400);
    expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("never lets a transition write the signature count", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "OPEN" }));

    await transition(authorityToken, { status: "UNDER_REVIEW" });

    const [, update] = petitionModel.findOneAndUpdate.mock.calls[0];
    expect(Object.keys(update.$set)).toEqual(["status"]);
    expect(update.$set.signatureCount).toBeUndefined();
  });

  it("guards the write with the status the decision was made against", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "OPEN" }));

    await transition(authorityToken, { status: "UNDER_REVIEW" });

    const [filter] = petitionModel.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({ _id: PETITION_ID, status: "OPEN" });
  });

  it("answers 409 when somebody else moved the petition first", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "OPEN" }));
    petitionModel.findOneAndUpdate.mockResolvedValue(null);

    const response = await transition(authorityToken, { status: "UNDER_REVIEW" });

    expect(response.status).toBe(409);
  });

  it("refuses a status outside the closed enum", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "OPEN" }));

    const response = await transition(authorityToken, { status: "DELETED", note: "Gone." });

    expect(response.status).toBe(400);
    expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated transition", async () => {
    const response = await request(createApp())
      .post(`/api/petitions/${PETITION_ID}/transitions`)
      .send({ status: "UNDER_REVIEW" });

    expect(response.status).toBe(401);
    expect(petitionModel.findById).not.toHaveBeenCalled();
  });

  it("answers 404 for a malformed or unknown petition id", async () => {
    const malformed = await transition(authorityToken, { status: "UNDER_REVIEW" }, "nope");
    expect(malformed.status).toBe(404);
    expect(petitionModel.findById).not.toHaveBeenCalled();

    petitionModel.findById.mockResolvedValue(null);
    const missing = await transition(authorityToken, { status: "UNDER_REVIEW" });
    expect(missing.status).toBe(404);
  });

  // A stranger must not distinguish "this removed petition exists" from
  // "no such petition", even through the action endpoint.
  it("answers 404, not 403, when a stranger acts on a removed petition", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "REJECTED" }));

    const response = await transition(strangerToken, { status: "OPEN", note: "Put it back." });

    expect(response.status).toBe(404);
  });

  it("refuses to move a petition into the state it is already in", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "OPEN" }));

    const response = await transition(authorityToken, { status: "OPEN", note: "Again." });

    expect(response.status).toBe(422);
    expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("leaves an answered petition immovable by anybody", async () => {
    for (const [actor, token] of Object.entries(tokenFor)) {
      for (const to of petitionStatuses) {
        if (to === "ANSWERED") continue;
        vi.clearAllMocks();
        petitionModel.findById.mockResolvedValue(fakePetition({ status: "ANSWERED" }));

        const response = await transition(token, { status: to, note: "One more change." });

        expect([403, 422], `ANSWERED -> ${to} as ${actor}`).toContain(response.status);
        expect(petitionModel.findOneAndUpdate).not.toHaveBeenCalled();
      }
    }
  });
});

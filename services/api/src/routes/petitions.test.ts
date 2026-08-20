import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { Petition } from "../models/petition.js";
import { Signature } from "../models/signature.js";
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

vi.mock("../models/user.js", () => ({
  User: { findById: vi.fn() }
}));

const petitionModel = Petition as unknown as {
  create: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  countDocuments: ReturnType<typeof vi.fn>;
};
const signatureModel = Signature as unknown as {
  find: ReturnType<typeof vi.fn>;
  exists: ReturnType<typeof vi.fn>;
  countDocuments: ReturnType<typeof vi.fn>;
};
const userModel = User as unknown as { findById: ReturnType<typeof vi.fn> };

const PETITION_ID = "64b7f9c2e1a2b3c4d5e6fa01";
const CREATOR_ID = "64b7f9c2e1a2b3c4d5e6f701";
const OTHER_CITIZEN_ID = "64b7f9c2e1a2b3c4d5e6f702";
const AUTHORITY_ID = "64b7f9c2e1a2b3c4d5e6f703";
const ADMIN_ID = "64b7f9c2e1a2b3c4d5e6f704";

/** Four petitions a citizen signed, used by the signed-list paging tests. */
const SIGNED_A = "64b7f9c2e1a2b3c4d5e6fa0a";
const SIGNED_B = "64b7f9c2e1a2b3c4d5e6fa0b";
const SIGNED_C = "64b7f9c2e1a2b3c4d5e6fa0c";
const SIGNED_D = "64b7f9c2e1a2b3c4d5e6fa0d";

const creatorToken = signAccessToken({ sub: CREATOR_ID, role: "CITIZEN" });
const otherCitizenToken = signAccessToken({ sub: OTHER_CITIZEN_ID, role: "CITIZEN" });
const authorityToken = signAccessToken({ sub: AUTHORITY_ID, role: "AUTHORITY" });
const adminToken = signAccessToken({ sub: ADMIN_ID, role: "ADMIN" });

// The create limiter is keyed by user id and lives for the module's
// lifetime, so each publishing test uses a fresh citizen; the rate-limit
// test below uses a fixed id on purpose.
let citizenCounter = 0;
const nextCitizen = () => {
  citizenCounter += 1;
  const id = `64b7f9c2e1a2b3c4d5e6c${String(citizenCounter).padStart(3, "0")}`;
  return { id, token: signAccessToken({ sub: id, role: "CITIZEN" }) };
};

const CREATED_AT = new Date("2026-08-18T10:00:00.000Z");

/** Minimal stand-in for a hydrated Petition document. */
const fakePetition = (overrides: Record<string, unknown> = {}) => ({
  id: PETITION_ID,
  _id: PETITION_ID,
  creatorId: CREATOR_ID,
  creatorName: "Asha Menon",
  category: "transport",
  title: "Restore the evening bus service on route 14",
  description:
    "The last evening bus was withdrawn in June and shift workers now walk home in the dark along an unlit stretch of road.",
  signatureGoal: 500,
  signatureCount: 42,
  status: "OPEN",
  history: [],
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides
});

// A thenable stand-in for a Mongoose query: every chainable method
// returns the same object, so it satisfies both find().sort().skip()
// .limit() and a bare find().select().
const query = (value: unknown) => {
  const self: Record<string, unknown> = {};
  for (const method of ["sort", "skip", "limit", "select"]) {
    self[method] = () => self;
  }
  self.then = (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(value).then(resolve, reject);
  return self;
};

const validBody = {
  category: "transport",
  title: "Restore the evening bus service on route 14",
  description:
    "The last evening bus was withdrawn in June and shift workers now walk home in the dark along an unlit stretch of road.",
  signatureGoal: 500
};

const postPetition = (token: string, body: Record<string, unknown> = validBody) =>
  request(createApp()).post("/api/petitions").set("Authorization", `Bearer ${token}`).send(body);

beforeEach(() => {
  vi.clearAllMocks();
  petitionModel.create.mockImplementation(async (doc: Record<string, unknown>) => fakePetition(doc));
  petitionModel.find.mockReturnValue(query([]));
  petitionModel.countDocuments.mockResolvedValue(0);
  signatureModel.find.mockReturnValue(query([]));
  signatureModel.exists.mockResolvedValue(null);
  signatureModel.countDocuments.mockResolvedValue(0);
  // Serves both lookups the routes make: the creator's display name and
  // the stored role/token version the authority routes re-check.
  userModel.findById.mockImplementation((id: string) =>
    query({
      fullName: "Asha Menon",
      role: String(id) === ADMIN_ID ? "ADMIN" : String(id) === AUTHORITY_ID ? "AUTHORITY" : "CITIZEN",
      tokenVersion: 0
    })
  );
});

describe("POST /api/petitions", () => {
  it("rejects an unauthenticated submission", async () => {
    const response = await request(createApp()).post("/api/petitions").send(validBody);

    expect(response.status).toBe(401);
    expect(petitionModel.create).not.toHaveBeenCalled();
  });

  it("refuses an authority account, which is the body being petitioned", async () => {
    const response = await postPetition(authorityToken);

    expect(response.status).toBe(403);
    expect(petitionModel.create).not.toHaveBeenCalled();
  });

  it("refuses an admin account for the same reason", async () => {
    const response = await postPetition(adminToken);

    expect(response.status).toBe(403);
    expect(petitionModel.create).not.toHaveBeenCalled();
  });

  it("publishes a petition for an authenticated citizen", async () => {
    const citizen = nextCitizen();

    const response = await postPetition(citizen.token);

    expect(response.status).toBe(201);
    expect(response.body.petition.title).toBe(validBody.title);
    expect(response.body.petition.status).toBe("OPEN");
    expect(response.body.petition.signatureCount).toBe(0);
    expect(response.body.petition.hasSigned).toBe(false);
  });

  it("derives the creator from the token and the account record", async () => {
    const citizen = nextCitizen();
    userModel.findById.mockReturnValue(query({ fullName: "Real Account Name" }));

    await postPetition(citizen.token);

    const [document] = petitionModel.create.mock.calls[0];
    expect(document.creatorId).toBe(citizen.id);
    expect(document.creatorName).toBe("Real Account Name");
    expect(userModel.findById).toHaveBeenCalledWith(citizen.id);
  });

  it("starts every petition open, empty and without history", async () => {
    const citizen = nextCitizen();

    await postPetition(citizen.token);

    const [document] = petitionModel.create.mock.calls[0];
    expect(document.status).toBe("OPEN");
    expect(document.signatureCount).toBe(0);
    expect(document.history).toEqual([]);
  });

  // The creator is not silently counted: every number reported must
  // correspond to a signature row somebody deliberately created.
  it("does not auto-sign the petition on behalf of its creator", async () => {
    const citizen = nextCitizen();

    const response = await postPetition(citizen.token);

    expect(response.body.petition.signatureCount).toBe(0);
    expect(Signature.create).not.toHaveBeenCalled();
  });

  it("rejects a client-supplied creator, status, count or timestamp outright", async () => {
    const citizen = nextCitizen();
    const forged = {
      ...validBody,
      creatorId: OTHER_CITIZEN_ID,
      creatorName: "Somebody Else",
      status: "ANSWERED",
      signatureCount: 99_999,
      history: [{ from: "OPEN", to: "ANSWERED" }],
      createdAt: "2020-01-01T00:00:00.000Z"
    };

    const response = await postPetition(citizen.token, forged);

    // `.strict()` means an unknown key is a 400, not a silent drop.
    expect(response.status).toBe(400);
    expect(petitionModel.create).not.toHaveBeenCalled();
  });

  it("rejects a title that is too short and a description that is too thin", async () => {
    const citizen = nextCitizen();

    const shortTitle = await postPetition(citizen.token, { ...validBody, title: "Bus" });
    expect(shortTitle.status).toBe(400);

    const thinDescription = await postPetition(citizen.token, {
      ...validBody,
      description: "Please fix."
    });
    expect(thinDescription.status).toBe(400);
    expect(petitionModel.create).not.toHaveBeenCalled();
  });

  it("rejects a category outside the closed enum", async () => {
    const citizen = nextCitizen();

    const response = await postPetition(citizen.token, { ...validBody, category: "trebuchet" });

    expect(response.status).toBe(400);
    expect(petitionModel.create).not.toHaveBeenCalled();
  });

  it("bounds the signature goal at both ends", async () => {
    const citizen = nextCitizen();

    expect((await postPetition(citizen.token, { ...validBody, signatureGoal: 1 })).status).toBe(400);
    expect((await postPetition(citizen.token, { ...validBody, signatureGoal: 5_000_000 })).status).toBe(400);
    expect((await postPetition(citizen.token, { ...validBody, signatureGoal: 10.5 })).status).toBe(400);
    expect(petitionModel.create).not.toHaveBeenCalled();
  });

  it("treats a vanished account as an unusable session rather than publishing anonymously", async () => {
    const citizen = nextCitizen();
    userModel.findById.mockReturnValue(query(null));

    const response = await postPetition(citizen.token);

    expect(response.status).toBe(401);
    expect(petitionModel.create).not.toHaveBeenCalled();
  });

  it("rate-limits a citizen publishing repeatedly", async () => {
    const citizen = nextCitizen();
    const statuses: number[] = [];

    for (let attempt = 0; attempt < 12; attempt += 1) {
      statuses.push((await postPetition(citizen.token)).status);
    }

    expect(statuses.filter((status) => status === 201)).toHaveLength(10);
    expect(statuses.at(-1)).toBe(429);
  });
});

describe("GET /api/petitions", () => {
  it("serves an anonymous browser without a token", async () => {
    petitionModel.find.mockReturnValue(query([fakePetition()]));
    petitionModel.countDocuments.mockResolvedValue(1);

    const response = await request(createApp()).get("/api/petitions");

    expect(response.status).toBe(200);
    expect(response.body.petitions).toHaveLength(1);
    expect(response.body.total).toBe(1);
  });

  it("excludes removed petitions from the public list by construction", async () => {
    await request(createApp()).get("/api/petitions");

    const [filter] = petitionModel.find.mock.calls[0];
    expect(filter.status).toEqual({ $in: ["OPEN", "UNDER_REVIEW", "ANSWERED", "CLOSED"] });
  });

  it("refuses to list removed petitions even when asked for them directly", async () => {
    const response = await request(createApp()).get("/api/petitions?status=REJECTED");

    expect(response.status).toBe(400);
    expect(petitionModel.find).not.toHaveBeenCalled();
  });

  it("passes only known filters through to the database", async () => {
    await request(createApp()).get("/api/petitions?category=water&status=ANSWERED");

    const [filter] = petitionModel.find.mock.calls[0];
    expect(filter).toEqual({ status: "ANSWERED", category: "water" });
  });

  // The listing must not become a query language: a supplied parameter,
  // including one shaped like a Mongo operator, has to vanish.
  it("drops unknown query parameters instead of forwarding them", async () => {
    await request(createApp()).get(
      "/api/petitions?creatorId=64b7f9c2e1a2b3c4d5e6f702&signatureCount[$gt]=0&__proto__=x"
    );

    const [filter] = petitionModel.find.mock.calls[0];
    expect(Object.keys(filter)).toEqual(["status"]);
    expect(filter.creatorId).toBeUndefined();
    expect(filter.signatureCount).toBeUndefined();
  });

  it("rejects an unknown sort and an out-of-range page size", async () => {
    expect((await request(createApp()).get("/api/petitions?sort=whatever")).status).toBe(400);
    expect((await request(createApp()).get("/api/petitions?limit=5000")).status).toBe(400);
    expect((await request(createApp()).get("/api/petitions?offset=-1")).status).toBe(400);
    expect(petitionModel.find).not.toHaveBeenCalled();
  });

  it("defaults to a bounded page rather than an unbounded one", async () => {
    const response = await request(createApp()).get("/api/petitions");

    expect(response.body.limit).toBe(20);
    expect(response.body.offset).toBe(0);
  });

  it("tells a signed-in citizen which petitions they already signed", async () => {
    petitionModel.find.mockReturnValue(query([fakePetition()]));
    petitionModel.countDocuments.mockResolvedValue(1);
    signatureModel.find.mockReturnValue(query([{ petitionId: PETITION_ID }]));

    const response = await request(createApp())
      .get("/api/petitions")
      .set("Authorization", `Bearer ${otherCitizenToken}`);

    expect(response.body.petitions[0].hasSigned).toBe(true);
  });

  it("reports hasSigned false for an anonymous reader without querying signatures", async () => {
    petitionModel.find.mockReturnValue(query([fakePetition()]));

    const response = await request(createApp()).get("/api/petitions");

    expect(response.body.petitions[0].hasSigned).toBe(false);
    expect(signatureModel.find).not.toHaveBeenCalled();
  });

  it("treats an unusable token as anonymous rather than failing the page", async () => {
    petitionModel.find.mockReturnValue(query([fakePetition()]));

    const response = await request(createApp())
      .get("/api/petitions")
      .set("Authorization", "Bearer not-a-real-token");

    expect(response.status).toBe(200);
    expect(response.body.petitions[0].hasSigned).toBe(false);
  });

  it("never exposes the description, creator id or history in a listing", async () => {
    petitionModel.find.mockReturnValue(query([fakePetition()]));

    const response = await request(createApp()).get("/api/petitions");

    const [row] = response.body.petitions;
    expect(row.creatorName).toBe("Asha Menon");
    expect(row.description).toBeUndefined();
    expect(row.creatorId).toBeUndefined();
    expect(row.history).toBeUndefined();
  });
});

describe("GET /api/petitions/:id", () => {
  it("serves a public petition to an anonymous reader", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition());

    const response = await request(createApp()).get(`/api/petitions/${PETITION_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.petition.title).toBe("Restore the evening bus service on route 14");
    expect(response.body.petition.description).toBeTruthy();
  });

  it("answers 404 for a malformed id without touching the database", async () => {
    const response = await request(createApp()).get("/api/petitions/not-an-object-id");

    expect(response.status).toBe(404);
    expect(petitionModel.findById).not.toHaveBeenCalled();
  });

  it("answers 404 for a well-formed id that does not exist", async () => {
    petitionModel.findById.mockResolvedValue(null);

    const response = await request(createApp()).get(`/api/petitions/${PETITION_ID}`);

    expect(response.status).toBe(404);
  });

  it("hides a removed petition from the public with 404, not 403", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "REJECTED" }));

    const anonymous = await request(createApp()).get(`/api/petitions/${PETITION_ID}`);
    expect(anonymous.status).toBe(404);

    const stranger = await request(createApp())
      .get(`/api/petitions/${PETITION_ID}`)
      .set("Authorization", `Bearer ${otherCitizenToken}`);
    expect(stranger.status).toBe(404);
  });

  it("still shows a removed petition to its creator and to staff", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ status: "REJECTED" }));

    for (const token of [creatorToken, authorityToken, adminToken]) {
      const response = await request(createApp())
        .get(`/api/petitions/${PETITION_ID}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.petition.status).toBe("REJECTED");
    }
  });

  it("shows history to everyone but the acting staff member's id only to staff", async () => {
    petitionModel.findById.mockResolvedValue(
      fakePetition({
        status: "ANSWERED",
        history: [
          {
            from: "UNDER_REVIEW",
            to: "ANSWERED",
            actorId: AUTHORITY_ID,
            actorCapability: "AUTHORITY",
            note: "Evening services resume from 1 October.",
            at: CREATED_AT
          }
        ]
      })
    );

    const anonymous = await request(createApp()).get(`/api/petitions/${PETITION_ID}`);
    expect(anonymous.body.petition.history[0].note).toBe("Evening services resume from 1 October.");
    expect(anonymous.body.petition.history[0].actorCapability).toBe("AUTHORITY");
    expect(anonymous.body.petition.history[0].actorId).toBeUndefined();

    const staff = await request(createApp())
      .get(`/api/petitions/${PETITION_ID}`)
      .set("Authorization", `Bearer ${authorityToken}`);
    expect(staff.body.petition.history[0].actorId).toBe(AUTHORITY_ID);
  });

  it("never leaks internal storage fields", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition());

    const response = await request(createApp()).get(`/api/petitions/${PETITION_ID}`);

    expect(response.body.petition._id).toBeUndefined();
    expect(response.body.petition.__v).toBeUndefined();
    expect(response.body.petition.id).toBe(PETITION_ID);
  });

  it("clamps a corrupted negative count rather than rendering it", async () => {
    petitionModel.findById.mockResolvedValue(fakePetition({ signatureCount: -5 }));

    const response = await request(createApp()).get(`/api/petitions/${PETITION_ID}`);

    expect(response.body.petition.signatureCount).toBe(0);
  });
});

describe("GET /api/petitions/mine", () => {
  it("requires an account", async () => {
    const response = await request(createApp()).get("/api/petitions/mine");

    expect(response.status).toBe(401);
  });

  it("scopes the created list to the authenticated citizen", async () => {
    await request(createApp())
      .get("/api/petitions/mine")
      .set("Authorization", `Bearer ${creatorToken}`);

    const [filter] = petitionModel.find.mock.calls[0];
    expect(filter).toEqual({ creatorId: CREATOR_ID });
  });

  it("cannot be pointed at another citizen's petitions", async () => {
    await request(createApp())
      .get(`/api/petitions/mine?creatorId=${OTHER_CITIZEN_ID}&citizenId=${OTHER_CITIZEN_ID}`)
      .set("Authorization", `Bearer ${creatorToken}`);

    const [filter] = petitionModel.find.mock.calls[0];
    expect(filter).toEqual({ creatorId: CREATOR_ID });
  });

  it("lists the petitions the citizen signed, in signing order", async () => {
    const second = { ...fakePetition(), id: "64b7f9c2e1a2b3c4d5e6fa02", _id: "64b7f9c2e1a2b3c4d5e6fa02" };
    signatureModel.find.mockReturnValue(
      query([{ petitionId: "64b7f9c2e1a2b3c4d5e6fa02" }, { petitionId: PETITION_ID }])
    );
    signatureModel.countDocuments.mockResolvedValue(2);
    // A `$in` lookup makes no ordering promise, so it returns them reversed.
    petitionModel.find.mockReturnValue(query([fakePetition(), second]));

    const response = await request(createApp())
      .get("/api/petitions/mine?filter=signed")
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.petitions.map((row: { id: string }) => row.id)).toEqual([
      "64b7f9c2e1a2b3c4d5e6fa02",
      PETITION_ID
    ]);
    expect(response.body.petitions.every((row: { hasSigned: boolean }) => row.hasSigned)).toBe(true);
  });

  it("scopes the signed list to the authenticated citizen", async () => {
    await request(createApp())
      .get("/api/petitions/mine?filter=signed")
      .set("Authorization", `Bearer ${creatorToken}`);

    const [filter] = signatureModel.find.mock.calls[0];
    expect(filter).toEqual({ citizenId: CREATOR_ID });
  });

  // Regression: signing must not become a second route to content
  // moderation removed. This list originally fetched by id alone,
  // bypassing the rule the detail endpoint enforces.
  it("excludes removed petitions from the signed list unless the viewer created them", async () => {
    signatureModel.find.mockReturnValue(query([{ petitionId: PETITION_ID }]));

    await request(createApp())
      .get("/api/petitions/mine?filter=signed")
      .set("Authorization", `Bearer ${creatorToken}`);

    const [filter] = petitionModel.find.mock.calls[0];
    expect(filter.$or).toEqual([{ status: { $ne: "REJECTED" } }, { creatorId: CREATOR_ID }]);
  });

  // The signed list paginates over what it can show, not over raw
  // signature rows: counting signatures would report an unreachable total
  // and hand back short pages once moderation removed something.
  it("counts only the signed petitions the list can actually show", async () => {
    signatureModel.find.mockReturnValue(
      query([{ petitionId: SIGNED_A }, { petitionId: SIGNED_B }, { petitionId: SIGNED_C }])
    );
    // SIGNED_B was removed by moderation, so the visibility query omits it.
    petitionModel.find
      .mockReturnValueOnce(query([{ _id: SIGNED_A }, { _id: SIGNED_C }]))
      .mockReturnValueOnce(
        query([
          fakePetition({ id: SIGNED_A, _id: SIGNED_A }),
          fakePetition({ id: SIGNED_C, _id: SIGNED_C })
        ])
      );

    const response = await request(createApp())
      .get("/api/petitions/mine?filter=signed")
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.petitions.map((row: { id: string }) => row.id)).toEqual([
      SIGNED_A,
      SIGNED_C
    ]);
  });

  it("returns a full page when a removed petition falls inside the range", async () => {
    signatureModel.find.mockReturnValue(
      query([
        { petitionId: SIGNED_A },
        { petitionId: SIGNED_B },
        { petitionId: SIGNED_C },
        { petitionId: SIGNED_D }
      ])
    );
    petitionModel.find
      .mockReturnValueOnce(query([{ _id: SIGNED_A }, { _id: SIGNED_C }, { _id: SIGNED_D }]))
      .mockReturnValueOnce(
        query([
          fakePetition({ id: SIGNED_A, _id: SIGNED_A }),
          fakePetition({ id: SIGNED_C, _id: SIGNED_C })
        ])
      );

    const response = await request(createApp())
      .get("/api/petitions/mine?filter=signed&limit=2")
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(3);
    // Two rows, not one: the removal is skipped over rather than
    // punching a hole in the page.
    expect(response.body.petitions.map((row: { id: string }) => row.id)).toEqual([
      SIGNED_A,
      SIGNED_C
    ]);
  });

  it("applies the offset to the visible petitions rather than to signatures", async () => {
    signatureModel.find.mockReturnValue(
      query([
        { petitionId: SIGNED_A },
        { petitionId: SIGNED_B },
        { petitionId: SIGNED_C },
        { petitionId: SIGNED_D }
      ])
    );
    petitionModel.find
      .mockReturnValueOnce(query([{ _id: SIGNED_A }, { _id: SIGNED_C }, { _id: SIGNED_D }]))
      .mockReturnValueOnce(query([fakePetition({ id: SIGNED_D, _id: SIGNED_D })]));

    const response = await request(createApp())
      .get("/api/petitions/mine?filter=signed&limit=2&offset=2")
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(3);
    expect(response.body.offset).toBe(2);
    expect(response.body.petitions.map((row: { id: string }) => row.id)).toEqual([SIGNED_D]);
  });

  it("does not read petition documents at all when nothing was signed", async () => {
    signatureModel.find.mockReturnValue(query([]));
    petitionModel.find.mockReturnValueOnce(query([]));

    const response = await request(createApp())
      .get("/api/petitions/mine?filter=signed")
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ petitions: [], total: 0 });
    // Only the visibility query ran; there was no page to fetch.
    expect(petitionModel.find).toHaveBeenCalledTimes(1);
  });

  it("rejects an unknown filter value", async () => {
    const response = await request(createApp())
      .get("/api/petitions/mine?filter=everyone")
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(response.status).toBe(400);
  });

  it("is not shadowed by the :id route", async () => {
    await request(createApp())
      .get("/api/petitions/mine")
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(petitionModel.findById).not.toHaveBeenCalled();
  });
});

describe("GET /api/petitions/authority", () => {
  it("refuses an anonymous caller and a plain citizen", async () => {
    expect((await request(createApp()).get("/api/petitions/authority")).status).toBe(401);

    const citizen = await request(createApp())
      .get("/api/petitions/authority")
      .set("Authorization", `Bearer ${otherCitizenToken}`);
    expect(citizen.status).toBe(403);
    expect(petitionModel.find).not.toHaveBeenCalled();
  });

  it("serves authority and admin", async () => {
    for (const token of [authorityToken, adminToken]) {
      const response = await request(createApp())
        .get("/api/petitions/authority")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
    }
  });

  it("lets staff see every status, including removed petitions", async () => {
    const response = await request(createApp())
      .get("/api/petitions/authority?status=REJECTED")
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(response.status).toBe(200);
    const [filter] = petitionModel.find.mock.calls[0];
    expect(filter).toEqual({ status: "REJECTED" });
  });

  it("expresses the goal-met filter as a database comparison of two stored fields", async () => {
    await request(createApp())
      .get("/api/petitions/authority?goalMet=true")
      .set("Authorization", `Bearer ${authorityToken}`);

    const [met] = petitionModel.find.mock.calls[0];
    expect(met.$expr).toEqual({ $gte: ["$signatureCount", "$signatureGoal"] });

    vi.clearAllMocks();
    petitionModel.find.mockReturnValue(query([]));
    petitionModel.countDocuments.mockResolvedValue(0);

    await request(createApp())
      .get("/api/petitions/authority?goalMet=false")
      .set("Authorization", `Bearer ${authorityToken}`);

    const [notMet] = petitionModel.find.mock.calls[0];
    expect(notMet.$expr).toEqual({ $lt: ["$signatureCount", "$signatureGoal"] });
  });

  it("drops unknown queue parameters", async () => {
    await request(createApp())
      .get("/api/petitions/authority?creatorName=Asha&$where=1")
      .set("Authorization", `Bearer ${authorityToken}`);

    const [filter] = petitionModel.find.mock.calls[0];
    expect(filter).toEqual({});
  });

  it("is not shadowed by the :id route", async () => {
    await request(createApp())
      .get("/api/petitions/authority")
      .set("Authorization", `Bearer ${authorityToken}`);

    expect(petitionModel.findById).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";
import {
  checkPetitionTransition,
  hasReachedPetitionGoal,
  isPublicPetitionStatus,
  isSignablePetitionStatus,
  isTerminalPetitionStatus,
  petitionActorCapabilities,
  petitionCapabilityFor,
  petitionProgressPercent,
  petitionStatuses,
  petitionTransitions,
  petitionTransitionsFor,
  type PetitionActorCapability,
  type PetitionStatus
} from "@cap/contracts";

// The shared petition lifecycle rules, independent of HTTP: the API
// enforces them and the UI renders from them, so they are pinned directly
// rather than only through routes.

const CAPABILITIES: PetitionActorCapability[] = [...petitionActorCapabilities];

describe("petition transition table", () => {
  it("allows every transition it declares, for the capabilities it declares", () => {
    for (const rule of petitionTransitions) {
      for (const capability of rule.actors) {
        const note = rule.requiresNote ? "A written reason." : undefined;
        const result = checkPetitionTransition(rule.from, rule.to, capability, note);
        expect(result.ok, `${rule.from} -> ${rule.to} as ${capability}`).toBe(true);
      }
    }
  });

  it("rejects every from/to pair that is not in the table", () => {
    const declared = new Set(petitionTransitions.map((rule) => `${rule.from}->${rule.to}`));

    for (const from of petitionStatuses) {
      for (const to of petitionStatuses) {
        if (from === to || declared.has(`${from}->${to}`)) continue;
        for (const capability of CAPABILITIES) {
          const result = checkPetitionTransition(from, to, capability, "A written reason.");
          expect(result.ok, `${from} -> ${to} as ${capability}`).toBe(false);
        }
      }
    }
  });

  it("refuses a capability the rule does not name, for every declared rule", () => {
    for (const rule of petitionTransitions) {
      const excluded = CAPABILITIES.filter((capability) => !rule.actors.includes(capability));
      for (const capability of excluded) {
        const result = checkPetitionTransition(rule.from, rule.to, capability, "A written reason.");
        expect(result.ok, `${rule.from} -> ${rule.to} as ${capability}`).toBe(false);
        if (!result.ok) expect(result.code).toBe("FORBIDDEN_ACTOR");
      }
    }
  });

  // The structural guarantee: an actor with no capability can move
  // nothing, anywhere -- a property of the table's shape, not of a route
  // remembering to check.
  it("lets a capability-less actor make no move at all, from any state to any state", () => {
    for (const from of petitionStatuses) {
      for (const to of petitionStatuses) {
        const result = checkPetitionTransition(from, to, null, "A written reason.");
        expect(result.ok, `${from} -> ${to} as nobody`).toBe(false);
        if (!result.ok) expect(result.code).toBe("FORBIDDEN_ACTOR");
      }
    }

    for (const from of petitionStatuses) {
      expect(petitionTransitionsFor(from, null)).toEqual([]);
    }
  });

  it("refuses a transition to the state the petition is already in", () => {
    for (const status of petitionStatuses) {
      const result = checkPetitionTransition(status, status, "ADMIN", "A written reason.");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe("SAME_STATUS");
    }
  });

  it("requires a written reason wherever the rule demands one", () => {
    for (const rule of petitionTransitions.filter((entry) => entry.requiresNote)) {
      for (const capability of rule.actors) {
        expect(checkPetitionTransition(rule.from, rule.to, capability).ok).toBe(false);
        expect(checkPetitionTransition(rule.from, rule.to, capability, "   ").ok).toBe(false);

        const result = checkPetitionTransition(rule.from, rule.to, capability, "  ");
        if (!result.ok) expect(result.code).toBe("NOTE_REQUIRED");
      }
    }
  });

  it("gives the creator exactly one action: closing their own open petition", () => {
    const creatorRules = petitionTransitions.filter((rule) => rule.actors.includes("CREATOR"));

    expect(creatorRules).toHaveLength(1);
    expect(creatorRules[0].from).toBe("OPEN");
    expect(creatorRules[0].to).toBe("CLOSED");
    expect(creatorRules[0].requiresNote).toBe(true);
  });

  it("reserves reopening and reinstating for ADMIN alone", () => {
    for (const rule of petitionTransitions.filter((entry) => entry.to === "OPEN")) {
      expect(rule.actors).toEqual(["ADMIN"]);
    }

    expect(petitionTransitionsFor("REJECTED", "AUTHORITY")).toEqual([]);
    expect(petitionTransitionsFor("CLOSED", "AUTHORITY")).toEqual([]);
    expect(petitionTransitionsFor("REJECTED", "ADMIN")).toHaveLength(1);
    expect(petitionTransitionsFor("CLOSED", "ADMIN")).toHaveLength(1);
  });

  it("leaves no way out of ANSWERED", () => {
    expect(petitionTransitions.filter((rule) => rule.from === "ANSWERED")).toEqual([]);
    for (const capability of CAPABILITIES) {
      expect(petitionTransitionsFor("ANSWERED", capability)).toEqual([]);
    }
    expect(isTerminalPetitionStatus("ANSWERED")).toBe(true);
  });

  it("only reaches states that exist in the declared vocabulary", () => {
    const known = new Set<string>(petitionStatuses);
    for (const rule of petitionTransitions) {
      expect(known.has(rule.from)).toBe(true);
      expect(known.has(rule.to)).toBe(true);
    }
  });
});

describe("petitionCapabilityFor", () => {
  it("maps staff onto their own capability on petitions they did not create", () => {
    expect(petitionCapabilityFor("ADMIN", false)).toBe("ADMIN");
    expect(petitionCapabilityFor("AUTHORITY", false)).toBe("AUTHORITY");
  });

  it("gives a citizen a capability only on their own petition", () => {
    expect(petitionCapabilityFor("CITIZEN", true)).toBe("CREATOR");
    expect(petitionCapabilityFor("CITIZEN", false)).toBeNull();
  });

  // Nobody adjudicates their own petition: a promoted account keeps the
  // creator's power and loses staff powers over that one petition.
  it("demotes a staff account to CREATOR on a petition it created", () => {
    expect(petitionCapabilityFor("AUTHORITY", true)).toBe("CREATOR");
    expect(petitionCapabilityFor("ADMIN", true)).toBe("CREATOR");
  });

  it("leaves a staff creator unable to review, answer or remove their own petition", () => {
    for (const role of ["AUTHORITY", "ADMIN"] as const) {
      const capability = petitionCapabilityFor(role, true);
      const moves = petitionTransitionsFor("OPEN", capability).map((rule) => rule.to);

      expect(moves, role).toEqual(["CLOSED"]);
      expect(checkPetitionTransition("OPEN", "REJECTED", capability, "Hide it.").ok).toBe(false);
      expect(checkPetitionTransition("OPEN", "UNDER_REVIEW", capability).ok).toBe(false);
    }
  });
});

describe("petition status predicates", () => {
  it("treats OPEN as the only signable state", () => {
    for (const status of petitionStatuses) {
      expect(isSignablePetitionStatus(status), status).toBe(status === "OPEN");
    }
  });

  it("treats REJECTED as the only non-public state", () => {
    for (const status of petitionStatuses) {
      expect(isPublicPetitionStatus(status), status).toBe(status !== "REJECTED");
    }
  });
});

describe("petition progress helpers", () => {
  it("reports goal completion at and beyond the target", () => {
    expect(hasReachedPetitionGoal({ signatureCount: 99, signatureGoal: 100 })).toBe(false);
    expect(hasReachedPetitionGoal({ signatureCount: 100, signatureGoal: 100 })).toBe(true);
    expect(hasReachedPetitionGoal({ signatureCount: 250, signatureGoal: 100 })).toBe(true);
  });

  it("clamps the progress percentage into 0-100", () => {
    expect(petitionProgressPercent({ signatureCount: 0, signatureGoal: 100 })).toBe(0);
    expect(petitionProgressPercent({ signatureCount: 50, signatureGoal: 100 })).toBe(50);
    expect(petitionProgressPercent({ signatureCount: 100, signatureGoal: 100 })).toBe(100);
    // Overshooting the goal must not render a bar wider than its track.
    expect(petitionProgressPercent({ signatureCount: 900, signatureGoal: 100 })).toBe(100);
    // Defence in depth: validation forbids this, arithmetic still holds.
    expect(petitionProgressPercent({ signatureCount: 5, signatureGoal: 0 })).toBe(100);
  });
});

// Regression guard on the vocabulary: a new status fails here and forces
// a decision about the table, publicity and signability rather than
// quietly inheriting defaults.
describe("petition status vocabulary", () => {
  it("is exactly the five declared states", () => {
    const expected: PetitionStatus[] = ["OPEN", "UNDER_REVIEW", "ANSWERED", "CLOSED", "REJECTED"];
    expect([...petitionStatuses]).toEqual(expected);
  });
});

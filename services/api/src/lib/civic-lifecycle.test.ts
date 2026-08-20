import { describe, expect, it } from "vitest";
import {
  checkCivicTransition,
  civicSlaHoursByPriority,
  civicStatuses,
  civicTransitions,
  civicTransitionsFor,
  computeCivicDueAt,
  isCivicReportOverdue,
  isTerminalCivicStatus,
  type CivicStatus,
  type UserRoleName
} from "@cap/contracts";

// The shared lifecycle rules, independent of HTTP: the API enforces them
// and the UI renders from them, so they are pinned directly.

const ROLES: UserRoleName[] = ["CITIZEN", "AUTHORITY", "ADMIN"];

describe("civic transition table", () => {
  it("allows every transition it declares, for the roles it declares", () => {
    for (const rule of civicTransitions) {
      for (const role of rule.roles) {
        const note = rule.requiresNote ? "A written reason." : undefined;
        const result = checkCivicTransition(rule.from, rule.to, role, note);
        expect(result.ok, `${rule.from} -> ${rule.to} as ${role}`).toBe(true);
      }
    }
  });

  it("rejects every from/to pair that is not in the table", () => {
    const declared = new Set(civicTransitions.map((rule) => `${rule.from}->${rule.to}`));

    for (const from of civicStatuses) {
      for (const to of civicStatuses) {
        if (from === to || declared.has(`${from}->${to}`)) continue;

        const result = checkCivicTransition(from, to, "ADMIN", "reason");
        expect(result.ok, `${from} -> ${to} should be impossible`).toBe(false);
        if (!result.ok) expect(result.code).toBe("INVALID_TRANSITION");
      }
    }
  });

  it("never lets a citizen move a report, from any state to any state", () => {
    for (const from of civicStatuses) {
      for (const to of civicStatuses) {
        const result = checkCivicTransition(from, to, "CITIZEN", "reason");
        expect(result.ok, `citizen ${from} -> ${to}`).toBe(false);
      }
    }
    expect(civicTransitions.every((rule) => !rule.roles.includes("CITIZEN"))).toBe(true);
  });

  it("reserves reopening a closed report for ADMIN", () => {
    expect(checkCivicTransition("RESOLVED", "UNDER_REVIEW", "ADMIN", "reopening").ok).toBe(true);
    expect(checkCivicTransition("REJECTED", "UNDER_REVIEW", "ADMIN", "reopening").ok).toBe(true);

    const authorityAttempt = checkCivicTransition("RESOLVED", "UNDER_REVIEW", "AUTHORITY", "reopening");
    expect(authorityAttempt.ok).toBe(false);
    if (!authorityAttempt.ok) expect(authorityAttempt.code).toBe("FORBIDDEN_ROLE");
  });

  it("rejects a no-op transition", () => {
    const result = checkCivicTransition("SUBMITTED", "SUBMITTED", "AUTHORITY");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("SAME_STATUS");
  });

  it("requires a note where the rule demands one", () => {
    const withoutNote = checkCivicTransition("SUBMITTED", "REJECTED", "AUTHORITY");
    expect(withoutNote.ok).toBe(false);
    if (!withoutNote.ok) expect(withoutNote.code).toBe("NOTE_REQUIRED");

    // Whitespace is not a reason.
    const blankNote = checkCivicTransition("SUBMITTED", "REJECTED", "AUTHORITY", "   ");
    expect(blankNote.ok).toBe(false);

    expect(checkCivicTransition("SUBMITTED", "REJECTED", "AUTHORITY", "Duplicate of an existing report.").ok).toBe(true);
  });

  it("offers no transitions out of a closed report except for an admin", () => {
    for (const terminal of ["RESOLVED", "REJECTED"] as CivicStatus[]) {
      expect(isTerminalCivicStatus(terminal)).toBe(true);
      expect(civicTransitionsFor(terminal, "AUTHORITY")).toHaveLength(0);
      expect(civicTransitionsFor(terminal, "CITIZEN")).toHaveLength(0);
      expect(civicTransitionsFor(terminal, "ADMIN").length).toBeGreaterThan(0);
    }
  });

  it("offers a citizen no actions anywhere", () => {
    for (const status of civicStatuses) {
      expect(civicTransitionsFor(status, "CITIZEN")).toHaveLength(0);
    }
  });

  it("keeps every declared role a real role", () => {
    for (const rule of civicTransitions) {
      for (const role of rule.roles) expect(ROLES).toContain(role);
    }
  });
});

describe("SLA deadlines", () => {
  // A fixed instant, so nothing here depends on when the suite runs.
  const createdAt = new Date("2026-08-18T10:00:00.000Z");

  it("derives the deadline from submission time and priority", () => {
    expect(computeCivicDueAt(createdAt, "HIGH").toISOString()).toBe("2026-08-20T10:00:00.000Z"); // +48h
    expect(computeCivicDueAt(createdAt, "MEDIUM").toISOString()).toBe("2026-08-23T10:00:00.000Z"); // +120h
    expect(computeCivicDueAt(createdAt, "LOW").toISOString()).toBe("2026-08-28T10:00:00.000Z"); // +240h
  });

  it("accepts an ISO string as readily as a Date", () => {
    expect(computeCivicDueAt(createdAt.toISOString(), "HIGH").toISOString()).toBe(
      computeCivicDueAt(createdAt, "HIGH").toISOString()
    );
  });

  it("orders the SLA windows by urgency", () => {
    expect(civicSlaHoursByPriority.HIGH).toBeLessThan(civicSlaHoursByPriority.MEDIUM);
    expect(civicSlaHoursByPriority.MEDIUM).toBeLessThan(civicSlaHoursByPriority.LOW);
  });

  it("does not depend on the local timezone", () => {
    // Same instant expressed in two zones must give the same deadline.
    const utc = computeCivicDueAt(new Date("2026-08-18T10:00:00.000Z"), "HIGH");
    const offset = computeCivicDueAt(new Date("2026-08-18T15:30:00.000+05:30"), "HIGH");
    expect(utc.getTime()).toBe(offset.getTime());
  });
});

describe("overdue calculation", () => {
  const dueAt = "2026-08-20T10:00:00.000Z";

  it("is overdue only after the deadline passes", () => {
    expect(isCivicReportOverdue({ status: "IN_PROGRESS", dueAt }, new Date("2026-08-20T09:59:59.000Z"))).toBe(false);
    expect(isCivicReportOverdue({ status: "IN_PROGRESS", dueAt }, new Date("2026-08-20T10:00:01.000Z"))).toBe(true);
  });

  it("treats the exact deadline instant as not yet overdue", () => {
    expect(isCivicReportOverdue({ status: "IN_PROGRESS", dueAt }, new Date(dueAt))).toBe(false);
  });

  it("stops the clock once a report is closed", () => {
    const wellPast = new Date("2027-01-01T00:00:00.000Z");
    expect(isCivicReportOverdue({ status: "RESOLVED", dueAt }, wellPast)).toBe(false);
    expect(isCivicReportOverdue({ status: "REJECTED", dueAt }, wellPast)).toBe(false);
    expect(isCivicReportOverdue({ status: "UNDER_REVIEW", dueAt }, wellPast)).toBe(true);
  });

  it("is never overdue without a deadline", () => {
    expect(isCivicReportOverdue({ status: "SUBMITTED", dueAt: undefined }, new Date("2030-01-01T00:00:00.000Z"))).toBe(
      false
    );
  });
});

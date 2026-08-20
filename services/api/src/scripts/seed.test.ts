import bcrypt from "bcrypt";
import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, userRoles } from "@cap/contracts";
import { retiredSeedEmails, seedUsers } from "./seed.js";

const DEMO_CITIZENS = ["shreshtha.bindal26@nmims.in", "user@test.com"];

describe("development seed accounts", () => {
  it("seeds the two documented demo citizens as CITIZEN", () => {
    for (const email of DEMO_CITIZENS) {
      const user = seedUsers.find((entry) => entry.email === email);
      expect(user, `${email} must be seeded`).toBeDefined();
      expect(user!.role).toBe("CITIZEN");
    }
  });

  it("names the demo citizens as documented", () => {
    expect(seedUsers.find((u) => u.email === "shreshtha.bindal26@nmims.in")!.fullName).toBe(
      "Shreshtha Bindal"
    );
    expect(seedUsers.find((u) => u.email === "user@test.com")!.fullName).toBe("Test User");
  });

  it("uses only declared roles and unique lowercase emails", () => {
    const emails = seedUsers.map((entry) => entry.email);
    expect(new Set(emails).size).toBe(emails.length);
    for (const entry of seedUsers) {
      expect(userRoles).toContain(entry.role);
      expect(entry.email).toBe(entry.email.toLowerCase());
    }
  });

  // Seeded passwords must clear the same bar a self-registration would,
  // so the demo accounts do not document a credential the app itself
  // would refuse to create.
  it("uses passwords that satisfy the registration policy", () => {
    for (const entry of seedUsers) {
      const parsed = registerSchema.safeParse({
        fullName: entry.fullName,
        email: entry.email,
        password: entry.password,
        acceptedDisclaimer: true
      });
      expect(parsed.success, `${entry.email} password must satisfy registerSchema`).toBe(true);
    }
  });

  it("uses passwords the login contract accepts", () => {
    for (const entry of seedUsers) {
      const parsed = loginSchema.safeParse({ email: entry.email, password: entry.password });
      expect(parsed.success).toBe(true);
    }
  });

  // The seed stores a bcrypt hash and login compares against it, so the
  // documented password must survive that exact round trip.
  it("round-trips each seeded password through bcrypt as login does", async () => {
    for (const entry of seedUsers) {
      const hash = await bcrypt.hash(entry.password, 4);
      expect(await bcrypt.compare(entry.password, hash)).toBe(true);
      expect(await bcrypt.compare(`${entry.password}x`, hash)).toBe(false);
    }
  });

  it("does not reuse a retired demo email", () => {
    for (const entry of seedUsers) {
      expect(retiredSeedEmails).not.toContain(entry.email);
    }
  });

  it("keeps demo passwords out of every source file except the seed and the README", async () => {
    const { execSync } = await import("node:child_process");
    const password = seedUsers.find((u) => u.email === "user@test.com")!.password;
    const hits = execSync(
      `git grep --untracked -l -F -- "${password}" || true`,
      { cwd: process.cwd(), encoding: "utf-8" }
    )
      .split("\n")
      .filter(Boolean);
    const unexpected = hits.filter(
      (path) => !path.endsWith("README.md") && !path.endsWith("scripts/seed.ts")
    );
    expect(unexpected).toEqual([]);
  });
});

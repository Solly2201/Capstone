import "dotenv/config";
import { pathToFileURL } from "node:url";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { disclaimerVersion, type UserRole } from "@cap/contracts";
import { env } from "../config/env.js";
import { User } from "../models/user.js";

export type SeedUser = { fullName: string; email: string; password: string; role: UserRole };

// Development demonstration accounts. These credentials are published in
// README.md on purpose so a reviewer can sign in; they must never be
// seeded into a production database.
export const seedUsers: SeedUser[] = [
  { fullName: "CAP Administrator", email: "admin@cap.local", password: "CAPAdmin!2026", role: "ADMIN" },
  { fullName: "Demo Authority", email: "authority@cap.local", password: "CAPAuthority!2026", role: "AUTHORITY" },
  { fullName: "Shreshtha Bindal", email: "shreshtha.bindal26@nmims.in", password: "CapStone@22!", role: "CITIZEN" },
  { fullName: "Test User", email: "user@test.com", password: "CapStone@22!", role: "CITIZEN" }
];

// Demo citizens seeded by earlier revisions. They are reported rather
// than deleted: a local database may already have reports and petitions
// owned by them, and removing the owner would orphan that content.
export const retiredSeedEmails = ["citizen.aarav@cap.local", "citizen.ananya@cap.local"];

export async function seed() {
  if (env.NODE_ENV === "production") {
    throw new Error("Refusing to seed demonstration accounts in production.");
  }

  await mongoose.connect(env.MONGODB_URI);

  for (const entry of seedUsers) {
    const email = entry.email.toLowerCase();
    const existing = await User.findOne({ email });

    // Re-seeding resets the demo account to the documented state so the
    // credentials in README.md always work, including after a password
    // change or a partial earlier run. The normal bcrypt hashing and the
    // normal login flow are unchanged.
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          fullName: entry.fullName,
          passwordHash: await bcrypt.hash(entry.password, 12),
          role: entry.role,
          emailVerified: true,
          disclaimerAcceptance: { version: disclaimerVersion, acceptedAt: new Date() }
        },
        $unset: { emailVerification: "" }
      },
      { upsert: true, new: true }
    );

    console.log(`${existing ? "Updated" : "Created"} ${entry.role} ${email}`);
  }

  const retired = await User.find({ email: { $in: retiredSeedEmails } }).select("email");
  for (const user of retired) {
    console.log(`Retired demo account still present: ${user.email} (not removed)`);
  }

  console.log(`Seeded ${seedUsers.length} CAP demonstration accounts.`);
  await mongoose.disconnect();
}

// Only connect to a database when run as a script; importing this module
// (the tests do) must have no side effects.
const runDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (runDirectly) {
  seed().catch(async (error) => {
    console.error("Seed failed", error);
    await mongoose.disconnect();
    process.exit(1);
  });
}

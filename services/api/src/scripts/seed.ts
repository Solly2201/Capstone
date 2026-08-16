import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { disclaimerVersion, type UserRole } from "@cap/contracts";
import { env } from "../config/env.js";
import { User } from "../models/user.js";

const seedUsers: Array<{ fullName: string; email: string; password: string; role: UserRole }> = [
  { fullName: "CAP Administrator", email: "admin@cap.local", password: "CAPAdmin!2026", role: "ADMIN" },
  { fullName: "Demo Authority", email: "authority@cap.local", password: "CAPAuthority!2026", role: "AUTHORITY" },
  { fullName: "Aarav Citizen", email: "citizen.aarav@cap.local", password: "CAPCitizen!2026", role: "CITIZEN" },
  { fullName: "Ananya Citizen", email: "citizen.ananya@cap.local", password: "CAPCitizen!2026", role: "CITIZEN" }
];

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  for (const entry of seedUsers) {
    await User.findOneAndUpdate(
      { email: entry.email },
      {
        $setOnInsert: {
          fullName: entry.fullName,
          email: entry.email,
          passwordHash: await bcrypt.hash(entry.password, 12),
          role: entry.role,
          emailVerified: true,
          disclaimerAcceptance: { version: disclaimerVersion, acceptedAt: new Date() }
        }
      },
      { upsert: true, new: true }
    );
  }
  console.log("Seeded CAP demonstration accounts.");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seed failed", error);
  await mongoose.disconnect();
  process.exit(1);
});

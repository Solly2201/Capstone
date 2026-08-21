import { createHash } from "node:crypto";
import {
  civicDuplicateMaxCandidates,
  civicDuplicateRadiusMeters,
  civicDuplicateWindowDays,
  type CivicCategory,
  type CivicDuplicateSummary
} from "@cap/contracts";
import { CivicReport } from "../models/civic-report.js";

// Deterministic duplicate handling for civic reports. No ML, no
// similarity model: an exact-resubmission fingerprint (hash) plus a
// spatial/temporal/category proximity query, both fully explainable.
//
// The two mechanisms answer different questions and are deliberately not
// merged:
//
// - The fingerprint asks "has THIS citizen already submitted THIS
//   report?" — it embeds the reporter id, so it can never fire across
//   citizens, and it is enforced by a unique sparse index so the database
//   decides the race, not application logic.
// - The proximity query asks "might somebody have already reported this
//   real-world problem?" — the answer is a warning the citizen may
//   override, never a refusal, because independent reports of the same
//   pothole are legitimate evidence of its impact.

/**
 * Canonical text form for fingerprinting: lowercase, punctuation and
 * repeated whitespace collapsed. "Big pothole!!" and "big  pothole"
 * fingerprint identically; genuinely different wording does not.
 */
export const normalizeReportText = (text: string): string =>
  text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Four decimal places is roughly an 11-metre cell: GPS jitter between two
 * taps of the same "use my location" button stays in one cell, while two
 * genuinely different street corners do not.
 */
export const quantizeCoordinate = (value: number): string => value.toFixed(4);

const FINGERPRINT_BUCKET_MS = 60 * 60 * 1000;

/** Hour bucket, so a retry minutes later collides and a report about a recurrence weeks later does not. */
export const fingerprintTimeBucket = (at: Date): number => Math.floor(at.getTime() / FINGERPRINT_BUCKET_MS);

export type FingerprintInput = {
  reporterId: string;
  category: CivicCategory;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  at: Date;
};

/**
 * SHA-256 over the canonical representation. Field values are joined with
 * a separator that normalizeReportText can never emit, so no two distinct
 * inputs can concatenate to the same canonical string.
 */
export const civicReportFingerprint = (input: FingerprintInput): string => {
  const canonical = [
    input.reporterId,
    input.category,
    normalizeReportText(input.title),
    normalizeReportText(input.description),
    quantizeCoordinate(input.latitude),
    quantizeCoordinate(input.longitude),
    String(fingerprintTimeBucket(input.at))
  ].join("\n");
  return createHash("sha256").update(canonical, "utf8").digest("hex");
};

const EARTH_RADIUS_METERS = 6_371_000;

/** Great-circle distance between two coordinates, in metres. */
export const haversineMeters = (
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
): number => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(latitudeB - latitudeA);
  const dLon = toRadians(longitudeB - longitudeA);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
};

/** Mongo duplicate-key error (E11000) — the unique index rejected the loser of a race. */
export const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000;

export type PotentialDuplicateQuery = {
  category: CivicCategory;
  latitude: number;
  longitude: number;
  now?: Date;
};

/**
 * Recent, nearby, same-category reports that might describe the same
 * real-world problem. REJECTED reports are excluded — a rejected report
 * must not deter a fresh, possibly better-evidenced one. Results are
 * redacted to CivicDuplicateSummary so the create endpoint never leaks
 * another citizen's report body through the warning.
 */
export const findPotentialDuplicates = async (
  query: PotentialDuplicateQuery
): Promise<CivicDuplicateSummary[]> => {
  const now = query.now ?? new Date();
  const since = new Date(now.getTime() - civicDuplicateWindowDays * 24 * 60 * 60 * 1000);

  // $nearSphere drives off the 2dsphere index and returns nearest-first,
  // so the most plausible duplicate is always inside the capped list.
  const candidates = await CivicReport.find({
    category: query.category,
    status: { $ne: "REJECTED" },
    createdAt: { $gte: since },
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [query.longitude, query.latitude] },
        $maxDistance: civicDuplicateRadiusMeters
      }
    }
  }).limit(civicDuplicateMaxCandidates);

  return candidates.map((report) => {
    const [longitude, latitude] = report.location.coordinates;
    return {
      id: report.id,
      title: report.title,
      category: report.category,
      status: report.status,
      distanceMeters: Math.round(haversineMeters(query.latitude, query.longitude, latitude, longitude)),
      createdAt: report.createdAt.toISOString()
    };
  });
};

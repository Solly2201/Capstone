import { isValidObjectId } from "mongoose";
import { User } from "../models/user.js";

/**
 * Resolves history actor ids to display names in one batched query, so a
 * staff audit trail reads "Ravi Officer" rather than a raw ObjectId.
 *
 * Only ever called for AUTHORITY/ADMIN viewers — citizens never receive
 * actorId, and this map travels with it. A deleted account simply has no
 * entry, and the UI falls back to the id, so an old trail stays readable.
 */
export const actorNamesFor = async (actorIds: Iterable<string>): Promise<Map<string, string>> => {
  const distinct = [...new Set(actorIds)].filter((id) => isValidObjectId(id));
  if (distinct.length === 0) return new Map();

  const users = await User.find({ _id: { $in: distinct } }).select("fullName");
  return new Map(users.map((user) => [user.id as string, user.fullName]));
};

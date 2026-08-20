import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";

export type StorageScope = "originals" | "masked" | "documents";

export type StoredFile = {
  scope: StorageScope;
  storedName: string;
};

// A small storage boundary, replaceable with an S3 adapter without
// leaking storage details into report or petition logic.
//
// Stored names are always generated here as <uuid>-<sanitised hint>; a
// client filename is a decorative suffix only, never a path. read()
// re-checks that the resolved path is inside the storage root, so a
// crafted stored name still cannot escape the directory.
export class LocalFileStorage {
  private readonly root = resolve(process.cwd(), env.LOCAL_STORAGE_ROOT);

  private safePath(scope: StorageScope, storedName: string): string {
    // Strip any directory component before it can be interpreted as one.
    const leaf = basename(storedName);
    const candidate = resolve(join(this.root, scope, leaf));
    const scopeRoot = resolve(join(this.root, scope));
    if (candidate !== scopeRoot && !candidate.startsWith(scopeRoot + sep)) {
      throw new Error("Resolved storage path escaped the storage root.");
    }
    return candidate;
  }

  async save(scope: StorageScope, fileName: string, content: Buffer): Promise<StoredFile> {
    const folder = join(this.root, scope);
    await mkdir(folder, { recursive: true });
    const safeName = basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedName = `${randomUUID()}-${safeName}`;
    await writeFile(join(folder, storedName), content, { flag: "wx" });
    return { scope, storedName };
  }

  /** Reads a previously stored file. Throws if the name resolves outside the root. */
  async read(scope: StorageScope, storedName: string): Promise<Buffer> {
    return readFile(this.safePath(scope, storedName));
  }
}

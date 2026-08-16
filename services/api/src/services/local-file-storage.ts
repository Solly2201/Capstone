import { mkdir, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";

/**
 * A deliberately small storage boundary. Replace this implementation with an S3
 * adapter later without leaking storage details into complaint or petition logic.
 */
export class LocalFileStorage {
  private readonly root = resolve(process.cwd(), env.LOCAL_STORAGE_ROOT);

  async save(scope: "originals" | "masked" | "documents", fileName: string, content: Buffer) {
    const folder = join(this.root, scope);
    await mkdir(folder, { recursive: true });
    const safeName = basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedName = `${randomUUID()}-${safeName}`;
    await writeFile(join(folder, storedName), content, { flag: "wx" });
    return { scope, storedName };
  }
}

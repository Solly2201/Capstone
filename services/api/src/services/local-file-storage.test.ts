import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Storage-safety tests run against a real temporary directory rather
 * than a mocked filesystem -- path traversal is precisely a question of
 * what the real path layer does with a crafted name.
 *
 * The storage root is read from the environment when the module is
 * first loaded, so the env var is set before the dynamic import.
 */
let storage: InstanceType<typeof import("./local-file-storage.js").LocalFileStorage>;
let root: string;

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "cap-storage-test-"));
  process.env.LOCAL_STORAGE_ROOT = root;
  const { LocalFileStorage } = await import("./local-file-storage.js");
  storage = new LocalFileStorage();
});

describe("LocalFileStorage.save", () => {
  it("generates its own storage name and never uses the caller's path", async () => {
    const stored = await storage.save("originals", "../../../etc/passwd", Buffer.from("payload"));

    // Only the basename survives, and it is sanitised and UUID-prefixed.
    expect(stored.storedName).toMatch(/^[0-9a-f-]{36}-passwd$/);
    expect(stored.storedName).not.toContain("..");
    expect(stored.storedName).not.toContain("/");
    expect(stored.storedName).not.toContain("\\");

    // The bytes landed inside the storage root, not above it.
    const written = await readFile(join(root, "originals", stored.storedName));
    expect(written.toString()).toBe("payload");
  });

  it("strips characters that could be meaningful to a path or shell", async () => {
    const stored = await storage.save("originals", 'we"ird$(name);rm -rf.png', Buffer.from("x"));

    expect(stored.storedName).toMatch(/^[0-9a-f-]{36}-[a-zA-Z0-9._-]+$/);
  });

  it("never overwrites an existing file", async () => {
    // Two saves of the same logical name produce two distinct files.
    const first = await storage.save("originals", "photo.jpg", Buffer.from("one"));
    const second = await storage.save("originals", "photo.jpg", Buffer.from("two"));

    expect(first.storedName).not.toBe(second.storedName);
    expect((await readFile(join(root, "originals", first.storedName))).toString()).toBe("one");
  });
});

describe("LocalFileStorage.read", () => {
  it("reads back a file it stored", async () => {
    const stored = await storage.save("originals", "photo.png", Buffer.from("image-bytes"));

    const bytes = await storage.read("originals", stored.storedName);

    expect(bytes.toString()).toBe("image-bytes");
  });

  it("refuses to escape the storage root via a traversal sequence", async () => {
    // Plant a file outside the scope directory that a traversal would reach.
    const secretPath = join(root, "secret.txt");
    await writeFile(secretPath, "do-not-serve");

    // basename() neutralises the traversal before the path is built, so
    // the observable outcome is a rejection rather than the planted
    // content. That rejection is the property under test: no crafted
    // stored name yields bytes from outside the scope directory.

    await expect(storage.read("originals", `..${sep}secret.txt`)).rejects.toThrow();
    await expect(storage.read("originals", "../secret.txt")).rejects.toThrow();
    await expect(storage.read("originals", "../../../../etc/passwd")).rejects.toThrow();
  });

  it("refuses an absolute path", async () => {
    const outsidePath = join(root, "outside.txt");
    await writeFile(outsidePath, "nope");

    await expect(storage.read("originals", outsidePath)).rejects.toThrow();
  });

  it("does not read a file from a different scope directory", async () => {
    await mkdir(join(root, "documents"), { recursive: true });
    await writeFile(join(root, "documents", "private.pdf"), "confidential");

    await expect(storage.read("originals", `..${sep}documents${sep}private.pdf`)).rejects.toThrow();
  });
});

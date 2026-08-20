import { defineConfig } from "vitest/config";

// Integration suite: only `*.integration.test.ts`, which start a real
// `mongod` via mongodb-memory-server (see `src/test/mongo.ts`).
//
// Run serially. Each file owns a database and clears every collection
// between tests, so parallel files would race each other's cleanup, and
// the concurrency tests need the server to themselves to mean anything.
export default defineConfig({
  test: {
    include: ["src/**/*.integration.test.ts"],
    fileParallelism: false,
    // Downloading the `mongod` binary on a cold cache dominates the first
    // run; the tests themselves are fast.
    testTimeout: 30_000,
    hookTimeout: 180_000
  }
});

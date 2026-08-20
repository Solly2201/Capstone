import { defineConfig } from "vitest/config";

// The unit suite must stay fast and infrastructure-free, so the
// integration tests -- which start a real `mongod` -- are excluded here
// and run through `npm run test:integration` instead. See
// `src/test/mongo.ts` for why that suite needs a real database.
export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.integration.test.ts"]
  }
});

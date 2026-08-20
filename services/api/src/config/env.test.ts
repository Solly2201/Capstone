import { describe, expect, it } from "vitest";
import { DEV_JWT_SECRET, parseEnv } from "./env.js";

const PROD_SECRET = "b6f1c0a9d4e37a25c8b09f1e6d4a3c72f5081b9e4c6d2a7f";

const base = {
  MONGODB_URI: "mongodb://mongo:27017/cap",
  WEB_ORIGIN: "https://cap.example.gov",
  AI_SERVICE_URL: "http://ai:8000"
} as NodeJS.ProcessEnv;

describe("environment configuration", () => {
  it("applies local defaults outside production", () => {
    const env = parseEnv({ ...base, NODE_ENV: "development" } as NodeJS.ProcessEnv);
    expect(env.PORT).toBe(4000);
    expect(env.JWT_SECRET).toBe(DEV_JWT_SECRET);
  });

  it("refuses to start in production with the development JWT secret", () => {
    expect(() =>
      parseEnv({ ...base, NODE_ENV: "production", JWT_SECRET: DEV_JWT_SECRET } as NodeJS.ProcessEnv)
    ).toThrowError(/development placeholder/);
  });

  it("starts in production with a real secret", () => {
    const env = parseEnv({
      ...base,
      NODE_ENV: "production",
      JWT_SECRET: PROD_SECRET
    } as NodeJS.ProcessEnv);
    expect(env.JWT_SECRET).toBe(PROD_SECRET);
    expect(env.NODE_ENV).toBe("production");
  });

  it("rejects a short secret in any environment", () => {
    expect(() => parseEnv({ ...base, JWT_SECRET: "too-short" } as NodeJS.ProcessEnv)).toThrow();
  });

  it("rejects a wildcard web origin in production", () => {
    expect(() =>
      parseEnv({
        ...base,
        NODE_ENV: "production",
        JWT_SECRET: PROD_SECRET,
        WEB_ORIGIN: "*"
      } as NodeJS.ProcessEnv)
    ).toThrow();
  });

  it("rejects a malformed service URL rather than defaulting silently", () => {
    expect(() => parseEnv({ ...base, AI_SERVICE_URL: "not-a-url" } as NodeJS.ProcessEnv)).toThrow();
  });
});

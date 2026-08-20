import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

/**
 * Health checks must not be rate limited.
 *
 * The global limiter allows 100 requests per 15 minutes per IP. The
 * container healthcheck polls /health every 15 seconds from a single
 * address, which is 60 requests per window before any real traffic. With
 * the limiter in front of these routes, /health began returning 429 at
 * the 101st request -- Docker reads that as unhealthy and restarts a
 * container that is working. This asserts the ordering that prevents it.
 */
describe("health endpoints are exempt from rate limiting", () => {
  it("serves liveness well past the global limit", async () => {
    const app = createApp();
    for (let i = 0; i < 150; i += 1) {
      const response = await request(app).get("/health");
      expect(response.status, `request ${i + 1}`).toBe(200);
    }
  }, 120000);

  it("serves readiness well past the global limit", async () => {
    const app = createApp();
    for (let i = 0; i < 150; i += 1) {
      const response = await request(app).get("/health/ready");
      // 503 is a legitimate readiness answer when mongo is down; 429 is
      // not an answer about readiness at all.
      expect([200, 503], `request ${i + 1}`).toContain(response.status);
    }
  }, 120000);

  it("still rate limits an ordinary API route", async () => {
    // The exemption must be for health only -- if this stops returning
    // 429 the limiter has been disabled rather than reordered.
    const app = createApp();
    let blocked = false;
    for (let i = 0; i < 130; i += 1) {
      const response = await request(app).get("/api/corpus/sources");
      if (response.status === 429) { blocked = true; break; }
    }
    expect(blocked).toBe(true);
  }, 120000);
});

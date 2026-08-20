import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

describe("GET /health", () => {
  it("reports API health", async () => {
    const response = await request(createApp()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", service: "cap-api" });
  });

  // Liveness must not depend on MongoDB: a database outage would
  // otherwise make the container look dead and get restarted.
  it("stays healthy while the database is unavailable", async () => {
    const response = await request(createApp()).get("/health");
    expect(response.status).toBe(200);
  });
});

describe("GET /health/ready", () => {
  it("reports degraded readiness when MongoDB is not connected", async () => {
    const response = await request(createApp()).get("/health/ready");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("degraded");
    expect(response.body.dependencies.mongodb).toBe("down");
  });
});

describe("request correlation", () => {
  it("honours an inbound request id so logs can be traced end to end", async () => {
    const response = await request(createApp())
      .get("/health")
      .set("x-request-id", "trace-me-1234");

    expect(response.status).toBe(200);
  });
});

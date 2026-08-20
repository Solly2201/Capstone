import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";

describe("POST /api/legal/answer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards a question to the AI service and returns its deterministic response", async () => {
    const aiBody = {
      excerpts: [
        {
          chunk_id: "bnss:43",
          text: "No woman shall be arrested after sunset and before sunrise.",
          source: "Bharatiya Nagarik Suraksha Sanhita, 2023",
          act_no: "ACT NO. 46 OF 2023",
          unit: "Section 43",
          official_url: "https://www.indiacode.nic.in/bitstream/123456789/20099/1/A202346.pdf",
          verified_as_on: "6th October, 2025",
          coverage_note: "PARTIAL"
        }
      ],
      message: null,
      abstained: false,
      policy_decision: "answered",
      reason: null,
      sources: ["Bharatiya Nagarik Suraksha Sanhita, 2023"],
      disclaimer_version: "2026-08-16",
      disclaimer_text: "This module is only for public awareness and information."
    };
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => aiBody
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await request(createApp())
      .post("/api/legal/answer")
      .send({ question: "What happens when you're arrested?" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(aiBody);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/legal/answer");
    expect(JSON.parse(options.body)).toEqual({ question: "What happens when you're arrested?" });
  });

  it("returns 400 when question is missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await request(createApp()).post("/api/legal/answer").send({});

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the AI service is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connection refused"))
    );

    const response = await request(createApp())
      .post("/api/legal/answer")
      .send({ question: "What is a bailable offence?" });

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ message: "AI service is unreachable." });
  });

  it("passes through a non-200 status from the AI service (e.g. 503 index not built)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 503,
      json: async () => ({ detail: "No index built yet." })
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await request(createApp())
      .post("/api/legal/answer")
      .send({ question: "What is a bailable offence?" });

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ detail: "No index built yet." });
  });
});

describe("POST /api/legal/answer when the AI service misbehaves", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("passes an abort signal so a hung AI service cannot hold the request open", async () => {
    // node's fetch has no default timeout. Before this, a service that
    // accepted the socket and never answered left the request open
    // indefinitely -- the existing catch only ever saw refused
    // connections.
    const fetchMock = vi.fn().mockResolvedValue({ status: 200, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await request(createApp()).post("/api/legal/answer").send({ question: "what is bail" });

    const init = fetchMock.mock.calls[0][1];
    expect(init.signal).toBeDefined();
    expect(typeof init.signal.aborted).toBe("boolean");
  });

  it("answers 504 when the AI service does not respond in time", async () => {
    const timeout = Object.assign(new Error("The operation was aborted due to timeout"), {
      name: "TimeoutError"
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(timeout));

    const response = await request(createApp())
      .post("/api/legal/answer")
      .send({ question: "what is bail" });

    // 504 and 503 say different things: a slow dependency is not an
    // absent one, and a monitor should be able to tell them apart.
    expect(response.status).toBe(504);
    expect(response.body.message).toMatch(/took too long/i);
  });

  it("still answers 503 when the AI service is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const response = await request(createApp())
      .post("/api/legal/answer")
      .send({ question: "what is bail" });

    expect(response.status).toBe(503);
    expect(response.body.message).toMatch(/unreachable/i);
  });

  it("does not log the citizen's question on failure", async () => {
    // A question can describe someone's own legal situation.
    const timeout = Object.assign(new Error("aborted"), { name: "TimeoutError" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(timeout));
    const secret = "my husband is hurting me and I need to know my options";

    const response = await request(createApp())
      .post("/api/legal/answer")
      .send({ question: secret });

    expect(response.status).toBe(504);
    expect(JSON.stringify(response.body)).not.toContain(secret);
  });
});

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

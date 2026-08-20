import { Router } from "express";
import { env } from "../config/env.js";

// Read-only proxy to the AI service's /corpus/* endpoints, so the browser
// never talks to the Python service directly and there is one place to
// add auth or rate limits. Forwards to the retrieval layer and passes the
// cited result straight through; nothing here calls an LLM.
export const corpusRouter = Router();

async function proxyGet(path: string): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${env.AI_SERVICE_URL}${path}`);
  const body = await response.json().catch(() => ({ message: "AI service returned a non-JSON response." }));
  return { status: response.status, body };
}

corpusRouter.get("/sources", async (request, response) => {
  try {
    const { status, body } = await proxyGet("/corpus/sources");
    response.status(status).json(body);
  } catch (error) {
    request.log.error({ err: error }, "AI service unreachable for a corpus request");
    response.status(503).json({ message: "AI service is unreachable." });
  }
});

corpusRouter.get("/search", async (request, response) => {
  const params = new URLSearchParams();
  if (typeof request.query.q === "string") params.set("q", request.query.q);
  if (typeof request.query.source === "string") params.set("source", request.query.source);
  if (typeof request.query.top_k === "string") params.set("top_k", request.query.top_k);

  try {
    const { status, body } = await proxyGet(`/corpus/search?${params.toString()}`);
    response.status(status).json(body);
  } catch (error) {
    request.log.error({ err: error }, "AI service unreachable for a corpus request");
    response.status(503).json({ message: "AI service is unreachable." });
  }
});

corpusRouter.get("/sections/:sourceId/:unitNumber", async (request, response) => {
  const { sourceId, unitNumber } = request.params;
  try {
    const { status, body } = await proxyGet(
      `/corpus/sections/${encodeURIComponent(sourceId)}/${encodeURIComponent(unitNumber)}`
    );
    response.status(status).json(body);
  } catch (error) {
    request.log.error({ err: error }, "AI service unreachable for a corpus request");
    response.status(503).json({ message: "AI service is unreachable." });
  }
});

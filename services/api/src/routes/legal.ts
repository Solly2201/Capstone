import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Thin proxy to the AI service's Module 1B /legal/answer endpoint.
 *
 * Deterministic retrieval only -- no generative LLM anywhere in this
 * path (standing project decision, see docs/PROJECT_STATE.md). Public
 * by deliberate v1 decision -- basic legal information should not
 * require an account -- and the disclaimer is attached to every
 * response by the AI service itself rather than relying on
 * account-level disclaimer acceptance at registration. Kept behind its
 * own rate limit (more generous than an LLM-backed endpoint would need,
 * since a BM25 lookup is cheap, but still a dedicated limit to guard
 * against scraping/abuse of a public endpoint).
 */
export const legalRouter = Router();

const answerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many legal information requests. Please try again later." }
});

legalRouter.post("/answer", answerRateLimiter, async (request, response) => {
  const question = typeof request.body?.question === "string" ? request.body.question : undefined;
  if (!question) {
    response.status(400).json({ message: "A 'question' string is required." });
    return;
  }

  try {
    const aiResponse = await fetch(`${env.AI_SERVICE_URL}/legal/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const body = await aiResponse.json().catch(() => ({ message: "AI service returned a non-JSON response." }));
    response.status(aiResponse.status).json(body);
  } catch {
    response.status(503).json({ message: "AI service is unreachable." });
  }
});

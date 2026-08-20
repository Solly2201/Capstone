import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

// Thin proxy to the AI service's /legal/answer endpoint.
//
// Deterministic retrieval only: no generative LLM anywhere in this path
// (standing project decision, see docs/PROJECT_STATE.md). Public by
// decision -- basic legal information should not require an account --
// with the disclaimer attached by the AI service itself, and its own rate
// limit because a public endpoint still needs one.
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
    if (!aiResponse.ok) {
      request.log.warn({ status: aiResponse.status }, "AI service rejected a legal answer request");
    }
    response.status(aiResponse.status).json(body);
  } catch (error) {
    // The question itself is never logged: it can describe a citizen's
    // own legal situation.
    request.log.error({ err: error }, "AI service unreachable for /legal/answer");
    response.status(503).json({ message: "AI service is unreachable." });
  }
});

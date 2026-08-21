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

  // Multi-turn context: the previous question, passed through verbatim.
  // The AI service treats it as untrusted and re-runs every guard over
  // the combined text, so the proxy only checks the shape.
  const previousQuestion = request.body?.context?.previous_question;
  const context =
    typeof previousQuestion === "string" && previousQuestion.length >= 2
      ? { previous_question: previousQuestion.slice(0, 2000) }
      : undefined;

  try {
    // Bounded, because node's fetch is not. A refused connection throws
    // immediately and was already handled; a service that accepts the
    // socket and then never answers was not, and would hold this request
    // open indefinitely while the citizen waited on a blank screen.
    const aiResponse = await fetch(`${env.AI_SERVICE_URL}/legal/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, ...(context ? { context } : {}) }),
      signal: AbortSignal.timeout(env.AI_SERVICE_TIMEOUT_MS)
    });
    const body = await aiResponse.json().catch(() => ({ message: "AI service returned a non-JSON response." }));
    if (!aiResponse.ok) {
      request.log.warn({ status: aiResponse.status }, "AI service rejected a legal answer request");
    }
    response.status(aiResponse.status).json(body);
  } catch (error) {
    // The question itself is never logged: it can describe a citizen's
    // own legal situation.
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    request.log.error(
      { err: error, timedOut, timeoutMs: env.AI_SERVICE_TIMEOUT_MS },
      timedOut
        ? "AI service did not respond in time for /legal/answer"
        : "AI service unreachable for /legal/answer"
    );
    // 504 and 503 say different things to a caller and to a monitor: one
    // is a slow dependency, the other is an absent one.
    response.status(timedOut ? 504 : 503).json({
      message: timedOut
        ? "The legal information service took too long to respond. Please try again."
        : "AI service is unreachable."
    });
  }
});

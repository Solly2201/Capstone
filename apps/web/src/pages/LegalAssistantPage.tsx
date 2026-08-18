import { AlertTriangle, ExternalLink, Info, MessagesSquare, Phone, Scale } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { disclaimerText, type LegalAnswerResponse } from "@cap/contracts";
import { SiteShell } from "../components/SiteShell";
import { api, apiErrorMessage, apiErrorStatus } from "../lib/api";

/**
 * Frontend for the deterministic legal-answer endpoint.
 *
 * This page renders exactly what `POST /api/legal/answer` returns and
 * nothing else. It does not summarise, paraphrase, merge, reorder or
 * explain the retrieved law, and it never composes an answer of its
 * own: every sentence of legal content on screen is the verbatim
 * `text` of a retrieved chunk, shown with the citation the backend
 * attached to it. Where the backend abstains or redirects, its message
 * is displayed as-is.
 *
 * That is the frontend half of the standing project decision that no
 * generative model appears anywhere in the legal-answer path (see
 * docs/ARCHITECTURE.md). The browser calls the Node API, which proxies
 * the Python AI service -- the browser never calls Python directly.
 */

const MIN_QUESTION_LENGTH = 2;
const MAX_QUESTION_LENGTH = 2000;

type Status = "idle" | "loading" | "done" | "error";

export function LegalAssistantPage() {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [answer, setAnswer] = useState<LegalAnswerResponse | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmed = question.trim();
  const canSubmit = trimmed.length >= MIN_QUESTION_LENGTH && trimmed.length <= MAX_QUESTION_LENGTH && status !== "loading";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setErrorMessage(null);
    setAnswer(null);
    setSubmittedQuestion(trimmed);

    try {
      const response = await api.post<LegalAnswerResponse>("/legal/answer", { question: trimmed });
      setAnswer(response.data);
      setStatus("done");
    } catch (error) {
      const httpStatus = apiErrorStatus(error);
      setStatus("error");
      if (httpStatus === 503) {
        setErrorMessage("The legal information service is unavailable right now. Please try again shortly.");
      } else if (httpStatus === 429) {
        setErrorMessage("Too many questions in a short time. Please wait a few minutes and try again.");
      } else {
        setErrorMessage(apiErrorMessage(error, "We could not reach the legal information service. Please try again."));
      }
    }
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <p className="eyebrow">Module 1 &middot; Legal information</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Ask a legal question</h1>
        <p className="mt-5 text-lg leading-8 text-ink/70">
          Ask in ordinary language. CAP will show you the exact text of the law that matches — never a
          summary, never a generated answer. If it cannot find verified material, it will say so
          instead of guessing.
        </p>

        <div className="mt-6 rounded-xl border border-clay/30 bg-sandstone/40 p-4 text-sm leading-6 text-ink/80">
          {disclaimerText}
        </div>

        <form onSubmit={handleSubmit} className="mt-8" noValidate>
          <label htmlFor="legal-question" className="block text-sm font-semibold">
            Your question
          </label>
          <textarea
            id="legal-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            maxLength={MAX_QUESTION_LENGTH}
            placeholder="e.g. Can the police arrest me without a warrant?"
            className="field resize-y"
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink/55">
              {trimmed.length > 0 && trimmed.length < MIN_QUESTION_LENGTH
                ? "Please write a slightly longer question."
                : `${question.length} / ${MAX_QUESTION_LENGTH} characters`}
            </p>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-parchment transition hover:bg-coal disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MessagesSquare size={17} aria-hidden="true" />
              {status === "loading" ? "Searching the law…" : "Ask"}
            </button>
          </div>
        </form>

        {status === "idle" && (
          <p className="mt-10 text-sm leading-6 text-ink/60">
            Prefer to browse? You can also{" "}
            <Link to="/learn/browse" className="font-semibold text-clay underline underline-offset-4">
              search the source documents directly
            </Link>
            .
          </p>
        )}

        {status === "loading" && (
          <p role="status" className="mt-10 text-sm text-ink/60">
            Searching the official legal corpus…
          </p>
        )}

        {status === "error" && errorMessage && (
          <p role="alert" className="mt-10 rounded-xl border border-clay/40 bg-sandstone/50 px-5 py-4 text-sm leading-6">
            {errorMessage}
          </p>
        )}

        {status === "done" && answer && <AnswerPanel answer={answer} question={submittedQuestion} />}
      </section>
    </SiteShell>
  );
}

function AnswerPanel({ answer, question }: { answer: LegalAnswerResponse; question: string }) {
  const answered = answer.policy_decision === "answered" && answer.excerpts.length > 0;

  return (
    <div className="mt-10">
      <p className="text-xs font-bold uppercase tracking-wide text-clay">You asked</p>
      <p className="mt-2 text-sm leading-6 text-ink/80">{question}</p>

      {/* Non-answer paths: the backend's own message is shown verbatim. */}
      {!answered && answer.message && <PolicyMessage answer={answer} />}

      {answered && (
        <>
          <div className="mt-8 flex items-center gap-2">
            <Scale className="text-clay" size={18} aria-hidden="true" />
            <h2 className="font-serif text-2xl font-semibold">What the law says</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            The exact text of {answer.excerpts.length === 1 ? "the matching provision" : "each matching provision"},
            reproduced without alteration.
          </p>

          <div className="mt-6 space-y-5">
            {answer.excerpts.map((excerpt) => (
              <article key={excerpt.chunk_id} className="rounded-xl border border-ink/10 bg-white/60 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-clay">
                  {excerpt.source}
                  {excerpt.act_no ? ` (${excerpt.act_no})` : ""} — {excerpt.unit}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink/90">{excerpt.text}</p>
                <p className="mt-3 text-xs text-ink/50">
                  Verified as on {excerpt.verified_as_on} ·{" "}
                  <a
                    href={excerpt.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 underline underline-offset-2"
                  >
                    official source <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </p>
                {excerpt.coverage_note && <p className="mt-2 text-xs italic text-ink/40">{excerpt.coverage_note}</p>}
              </article>
            ))}
          </div>

          {answer.sources.length > 0 && (
            <div className="mt-6 rounded-xl border border-ink/10 bg-white/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-clay">
                {answer.sources.length === 1 ? "Source" : "Sources"}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink/80">
                {answer.sources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <p className="mt-8 border-t border-ink/10 pt-5 text-xs leading-5 text-ink/60">
        {answer.disclaimer_text} <span className="text-ink/40">(disclaimer {answer.disclaimer_version})</span>
      </p>
    </div>
  );
}

/**
 * Abstentions and safety redirects. The message text always comes from
 * the backend policy decision -- only the framing around it differs, so
 * an emergency redirect does not look like a "no results" shrug.
 */
function PolicyMessage({ answer }: { answer: LegalAnswerResponse }) {
  const emergency = answer.policy_decision === "redirect_emergency";
  const adviser = answer.policy_decision === "redirect_adviser";

  const Icon = emergency ? Phone : adviser ? Info : AlertTriangle;
  const tone = emergency
    ? "border-red-800/30 bg-red-50"
    : adviser
      ? "border-clay/40 bg-sandstone/50"
      : "border-ink/15 bg-white/60";
  const heading = emergency
    ? "This needs a person, not an AI answer"
    : adviser
      ? "This needs a legal adviser"
      : "No verified answer";

  return (
    <div className={`mt-8 rounded-xl border p-5 ${tone}`} role={emergency ? "alert" : "status"}>
      <div className="flex items-center gap-2">
        <Icon className={emergency ? "text-red-800" : "text-clay"} size={18} aria-hidden="true" />
        <h2 className="font-serif text-xl font-semibold">{heading}</h2>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink/90">{answer.message}</p>
      {answer.policy_decision === "abstained" && (
        <p className="mt-4 text-sm leading-6 text-ink/70">
          CAP only answers from the official sources it has ingested, and it abstains rather than
          guess. You can{" "}
          <Link to="/learn/browse" className="font-semibold text-clay underline underline-offset-4">
            search the source documents directly
          </Link>{" "}
          or rephrase your question.
        </p>
      )}
    </div>
  );
}

import {
  AlertTriangle,
  BookOpen,
  ExternalLink,
  Info,
  LifeBuoy,
  MessagesSquare,
  Phone,
  Scale,
  ShieldAlert
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { disclaimerText, type LegalAnswerResponse } from "@cap/contracts";
import { SiteShell } from "../components/SiteShell";
import { relatedLearnContent } from "../content/learn";
import { api, apiErrorMessage, apiErrorStatus } from "../lib/api";

// Frontend for the deterministic legal-answer endpoint.
//
// This page renders exactly what POST /api/legal/answer returns: it never
// summarises, paraphrases, merges, reorders or composes legal content.
// Every sentence on screen is the verbatim text of a retrieved chunk with
// the citation the backend attached, and an abstention or redirect is
// shown as-is.
//
// That is the frontend half of the standing decision that no generative
// model appears anywhere in the legal-answer path (docs/ARCHITECTURE.md).

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
  // A serious-matter response leads with the caution and then shows the
  // general law behind it, so excerpts are rendered for `serious` too —
  // what the safety layer withholds is case-specific advice, not the
  // text of the law itself.
  const cautioned = answer.severity === "serious";
  const showExcerpts = answer.excerpts.length > 0 && (answer.policy_decision === "answered" || cautioned);
  const showPolicyMessage = answer.message !== null && (answer.policy_decision !== "answered" || cautioned);

  return (
    <div className="mt-10">
      <p className="text-xs font-bold uppercase tracking-wide text-clay">You asked</p>
      <p className="mt-2 text-sm leading-6 text-ink/80">{question}</p>

      {/* Non-answer paths: the backend's own message is shown verbatim. */}
      {showPolicyMessage && <PolicyMessage answer={answer} hasSupportingLaw={showExcerpts} />}

      {showExcerpts && (
        <>
          <div className="mt-8 flex items-center gap-2">
            <Scale className="text-clay" size={18} aria-hidden="true" />
            <h2 className="font-serif text-2xl font-semibold">
              {cautioned ? "The general law on this topic" : "What the law says"}
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            {cautioned
              ? "General legal information, not advice about your own case. "
              : ""}
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

          <RelatedLearnPanel chunkIds={answer.excerpts.map((excerpt) => excerpt.chunk_id)} />
        </>
      )}

      <p className="mt-8 border-t border-ink/10 pt-5 text-xs leading-5 text-ink/60">
        {answer.disclaimer_text} <span className="text-ink/40">(disclaimer {answer.disclaimer_version})</span>
      </p>
    </div>
  );
}

// Learn material grounded in the same provisions the answer cited. The
// relationship is an exact metadata join — an article or FAQ appears here
// only if one of its own citations names a provision shown above — so
// nothing here is inferred, ranked or generated. Most provisions have no
// Learn coverage yet; then this renders nothing rather than a loose
// topical guess (the page already links the Learn library generically).
function RelatedLearnPanel({ chunkIds }: { chunkIds: string[] }) {
  const related = relatedLearnContent(chunkIds);
  if (related.articles.length === 0 && related.faqs.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-ink/10 bg-white/40 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-clay">Go deeper in Learn</p>
      <p className="mt-2 text-sm leading-6 text-ink/70">
        Plain-language material written against the same {chunkIds.length === 1 ? "provision" : "provisions"} cited
        above.
      </p>
      {related.articles.length > 0 && (
        <ul className="mt-3 space-y-2">
          {related.articles.map((article) => (
            <li key={article.slug} className="flex items-start gap-2 text-sm">
              <BookOpen size={15} aria-hidden="true" className="mt-1 shrink-0 text-clay" />
              <span>
                <Link
                  to={`/learn/${article.slug}`}
                  className="font-semibold text-clay underline underline-offset-4"
                >
                  {article.title}
                </Link>{" "}
                <span className="text-ink/60">— {article.summary}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {related.faqs.length > 0 && (
        <ul className="mt-3 space-y-2">
          {related.faqs.map((faq) => (
            <li key={faq.id} className="flex items-start gap-2 text-sm">
              <LifeBuoy size={15} aria-hidden="true" className="mt-1 shrink-0 text-clay" />
              <Link
                to={`/learn#faq-${faq.id}`}
                className="font-semibold text-clay underline underline-offset-4"
              >
                {faq.question}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Abstentions and safety redirects. The text always comes from the
// backend policy decision; only the framing differs, so an emergency
// redirect does not look like a "no results" shrug, and a refusal does
// not look like an abstention.
function PolicyMessage({
  answer,
  hasSupportingLaw
}: {
  answer: LegalAnswerResponse;
  hasSupportingLaw: boolean;
}) {
  const emergency = answer.severity === "emergency";
  const refused = answer.severity === "harmful_request";
  const serious = answer.severity === "serious";

  const Icon = emergency ? Phone : refused ? ShieldAlert : serious ? Info : AlertTriangle;
  const tone = emergency
    ? "border-red-800/30 bg-red-50"
    : refused
      ? "border-red-800/20 bg-white/70"
      : serious
        ? "border-clay/40 bg-sandstone/50"
        : "border-ink/15 bg-white/60";
  const heading = emergency
    ? "This needs help now, not a legal answer"
    : refused
      ? "I can't help with this request"
      : serious
        ? "This is a serious matter — please talk to a lawyer"
        : "No verified answer";

  return (
    <div className={`mt-8 rounded-xl border p-5 ${tone}`} role={emergency ? "alert" : "status"}>
      <div className="flex items-center gap-2">
        <Icon className={emergency || refused ? "text-red-800" : "text-clay"} size={18} aria-hidden="true" />
        <h2 className="font-serif text-xl font-semibold">{heading}</h2>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink/90">{answer.message}</p>
      {serious && !hasSupportingLaw && (
        <p className="mt-4 text-sm leading-6 text-ink/70">
          CAP could not find a provision it is confident matches this question, so it is not showing
          any legal text rather than showing you the wrong section. You can{" "}
          <Link to="/learn" className="font-semibold text-clay underline underline-offset-4">
            read the general learning articles
          </Link>{" "}
          in the meantime.
        </p>
      )}
      {answer.policy_decision === "abstained" && !serious && (
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

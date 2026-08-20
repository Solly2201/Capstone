import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { scoreAttempt, type QuizQuestion } from "../content/learn";

// "Test yourself" for a single Learn article.
//
// Deliberately unpersisted: an attempt is component state and nothing
// more. No server round-trip, no account requirement, no stored score —
// a quiz result is not something this project needs to keep, and adding
// storage for it would mean a new backend subsystem for no benefit.
//
// The learner answers one question at a time and sees the explanation
// immediately after answering, because the point is learning rather than
// examination. Explanations are never rendered before an answer is
// submitted, so nothing on screen gives the answer away.

type Props = {
  questions: QuizQuestion[];
  /** Rendered under the final score, e.g. a link to the next article. */
  footer?: React.ReactNode;
};

const difficultyLabel: Record<QuizQuestion["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard"
};

export function ArticleQuiz({ questions, footer }: Props) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) return null;

  const question = questions[index];
  const chosen = answers[question.id];
  const score = scoreAttempt(questions, answers);

  function reset() {
    setIndex(0);
    setAnswers({});
    setRevealed(false);
    setFinished(false);
  }

  function submit() {
    if (chosen === undefined) return;
    setRevealed(true);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setRevealed(false);
  }

  if (!started) {
    return (
      <section className="mt-10 rounded-2xl border border-clay/30 bg-sandstone/40 p-6" aria-labelledby="quiz-intro">
        <h2 id="quiz-intro" className="font-serif text-xl font-semibold">
          Test yourself
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/75">
          {questions.length} {questions.length === 1 ? "question" : "questions"} drawn from this
          article. Every explanation cites the same provision the article does. Nothing is scored
          against your account — this is a check for you, not a record.
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setStarted(true);
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-parchment transition hover:bg-coal"
        >
          Start the quiz <ArrowRight size={16} aria-hidden="true" />
        </button>
      </section>
    );
  }

  if (finished) {
    return (
      <section className="mt-10 rounded-2xl border border-clay/30 bg-sandstone/40 p-6" aria-labelledby="quiz-result">
        <h2 id="quiz-result" className="font-serif text-xl font-semibold">
          Your score
        </h2>
        <p className="mt-3 text-3xl font-semibold" role="status">
          {score.correct} / {score.total}
          <span className="ml-2 align-middle text-base font-normal text-ink/60">
            ({score.percentage}%)
          </span>
        </p>
        <p className="mt-3 text-sm leading-6 text-ink/75">
          {score.correct === score.total
            ? "Every answer correct. Try another article in this section."
            : "Re-read the paragraphs above for the ones you missed — each explanation names the provision it comes from."}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-semibold transition hover:border-clay/50 hover:text-clay"
          >
            <RotateCcw size={16} aria-hidden="true" /> Try again
          </button>
          {footer}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-clay/30 bg-sandstone/40 p-6" aria-labelledby="quiz-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="quiz-heading" className="font-serif text-xl font-semibold">
          Test yourself
        </h2>
        <p className="text-xs font-semibold uppercase tracking-wide text-clay">
          Question {index + 1} of {questions.length} &middot; {difficultyLabel[question.difficulty]}
        </p>
      </div>

      <div
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={index + 1}
        aria-label="Quiz progress"
      >
        <div
          className="h-full rounded-full bg-clay transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      {question.scenario && (
        <p className="mt-5 rounded-xl border border-ink/10 bg-white/60 p-4 text-sm italic leading-6 text-ink/75">
          {question.scenario}
        </p>
      )}

      <p className="mt-5 text-base font-semibold leading-7">{question.prompt}</p>

      {/* aria-label rather than a <legend>, so the prompt is not
          duplicated in the accessibility tree and in the visible text. */}
      <fieldset className="mt-4" disabled={revealed} aria-label={question.prompt}>
        <div className="space-y-2.5">
          {question.options.map((option) => {
            const isChosen = chosen === option.id;
            const isCorrect = option.id === question.correctOptionId;
            const tone = !revealed
              ? isChosen
                ? "border-clay bg-white"
                : "border-ink/15 bg-white/60 hover:border-clay/50"
              : isCorrect
                ? "border-emerald-700/40 bg-emerald-50"
                : isChosen
                  ? "border-red-800/40 bg-red-50"
                  : "border-ink/10 bg-white/40";
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm leading-6 transition ${tone}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={isChosen}
                  // Also set on the input itself: a disabled <fieldset>
                  // stops interaction, but only the input's own attribute
                  // is reflected as `disabled` on the element.
                  disabled={revealed}
                  onChange={() => setAnswers({ ...answers, [question.id]: option.id })}
                  className="mt-1 accent-clay"
                />
                <span className="flex-1">{option.text}</span>
                {revealed && isCorrect && (
                  <Check size={16} aria-label="Correct answer" className="mt-1 shrink-0 text-emerald-700" />
                )}
                {revealed && isChosen && !isCorrect && (
                  <X size={16} aria-label="Your answer, incorrect" className="mt-1 shrink-0 text-red-800" />
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {revealed && (
        <div className="mt-5 rounded-xl border border-ink/10 bg-white/70 p-4" role="status">
          <p className="text-sm font-semibold">
            {chosen === question.correctOptionId ? "Correct" : "Not quite"}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink/85">{question.explanation}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-clay">
            Source: {question.citation.label}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!revealed ? (
          <button
            type="button"
            onClick={submit}
            disabled={chosen === undefined}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-parchment transition hover:bg-coal disabled:cursor-not-allowed disabled:opacity-60"
          >
            Check answer
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-parchment transition hover:bg-coal"
          >
            {index + 1 >= questions.length ? "See your score" : "Next question"}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
        <p className="text-xs text-ink/55">
          {score.correct} correct so far
        </p>
      </div>

      <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-5 text-ink/55">
        These questions test general legal information, not what you should do in your own
        situation. For that, speak to a legal adviser.
      </p>
    </section>
  );
}

import { describe, expect, it } from "vitest";
import {
  articlesInCategory,
  findArticle,
  findQuestion,
  learnCategories,
  learningArticles,
  legalSourceIds,
  questionsForArticle,
  questionsInCategory,
  quizQuestions,
  scoreAttempt
} from "./index";

/**
 * These are structural invariants of the question bank, not restatements
 * of the implementation. A question that leaks its answer, cites a source
 * the registry does not hold, or points at an article that no longer
 * exists is a real content defect, and each of those is caught here.
 */
describe("quiz question bank", () => {
  it("uses a unique id for every question", () => {
    const ids = quizQuestions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("draws every question from an article that exists", () => {
    for (const question of quizQuestions) {
      expect(findArticle(question.articleSlug), question.id).toBeDefined();
    }
  });

  it("gives every article at least three questions", () => {
    for (const article of learningArticles) {
      expect(questionsForArticle(article.slug).length, article.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("covers every category with questions", () => {
    for (const category of learnCategories) {
      expect(questionsInCategory(category.id).length, category.id).toBeGreaterThanOrEqual(
        articlesInCategory(category.id).length * 3
      );
    }
  });

  it("names a correct option that actually exists among the options", () => {
    for (const question of quizQuestions) {
      const ids = question.options.map((option) => option.id);
      expect(ids, question.id).toContain(question.correctOptionId);
    }
  });

  it("uses unique option ids and non-empty option text within a question", () => {
    for (const question of quizQuestions) {
      const ids = question.options.map((option) => option.id);
      expect(new Set(ids).size, question.id).toBe(ids.length);
      for (const option of question.options) {
        expect(option.text.trim().length, `${question.id}/${option.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("offers a real choice: four options for a multiple-choice or scenario question, two for true/false", () => {
    for (const question of quizQuestions) {
      const expected = question.format === "true-false" ? 2 : 4;
      expect(question.options.length, question.id).toBe(expected);
    }
  });

  it("labels true/false questions with exactly True and False", () => {
    for (const question of quizQuestions.filter((q) => q.format === "true-false")) {
      expect(question.options.map((option) => option.text).sort(), question.id).toEqual([
        "False",
        "True"
      ]);
    }
  });

  it("gives every scenario question a scenario, and no other format one", () => {
    for (const question of quizQuestions) {
      if (question.format === "scenario") {
        expect(question.scenario?.trim().length, question.id).toBeGreaterThan(0);
      } else {
        expect(question.scenario, question.id).toBeUndefined();
      }
    }
  });

  it("explains every answer and cites a registered source for the explanation", () => {
    for (const question of quizQuestions) {
      expect(question.explanation.trim().length, question.id).toBeGreaterThan(20);
      expect(legalSourceIds, question.id).toContain(question.citation.sourceId);
      expect(question.citation.unitNumber.length, question.id).toBeGreaterThan(0);
      expect(question.citation.label.length, question.id).toBeGreaterThan(0);
    }
  });

  it("does not give the answer away by making the correct option the longest one", () => {
    // A bank where the correct answer is reliably the wordiest is
    // answerable by test-craft rather than by knowing the law. Some
    // asymmetry is unavoidable — a correct option states a rule while a
    // distractor can be a bare wrong answer — so the bar is that the
    // longest option is correct less often than not, rather than at the
    // ~25% a four-option random assignment would give. This checks the
    // bank as a whole, not any single question.
    const multiChoice = quizQuestions.filter((question) => question.format !== "true-false");
    const longestIsCorrect = multiChoice.filter((question) => {
      const longest = [...question.options].sort((a, b) => b.text.length - a.text.length)[0];
      return longest.id === question.correctOptionId;
    });
    expect(longestIsCorrect.length / multiChoice.length).toBeLessThan(0.5);
  });

  it("uses distinct option text within a question", () => {
    for (const question of quizQuestions) {
      const texts = question.options.map((option) => option.text.trim().toLowerCase());
      expect(new Set(texts).size, question.id).toBe(texts.length);
    }
  });

  it("spreads the correct answer across option positions", () => {
    const positions = new Map<number, number>();
    for (const question of quizQuestions) {
      const index = question.options.findIndex((o) => o.id === question.correctOptionId);
      positions.set(index, (positions.get(index) ?? 0) + 1);
    }
    // No single position may hold more than half of all correct answers.
    for (const [, count] of positions) {
      expect(count / quizQuestions.length).toBeLessThan(0.5);
    }
  });

  it("uses every difficulty level, with a meaningful share at each", () => {
    for (const level of ["easy", "medium", "hard"] as const) {
      const share = quizQuestions.filter((q) => q.difficulty === level).length / quizQuestions.length;
      expect(share, level).toBeGreaterThan(0.15);
    }
  });

  it("resolves a question by id and returns undefined for an unknown one", () => {
    expect(findQuestion(quizQuestions[0].id)?.id).toBe(quizQuestions[0].id);
    expect(findQuestion("no-such-question")).toBeUndefined();
    expect(findQuestion(undefined)).toBeUndefined();
  });

  it("returns no questions for an article slug that does not exist", () => {
    expect(questionsForArticle("not-a-real-article")).toEqual([]);
  });
});

describe("scoreAttempt", () => {
  const questions = questionsForArticle("what-is-an-fir");

  it("scores an empty attempt as zero without dividing by zero", () => {
    expect(scoreAttempt(questions, {})).toEqual({
      correct: 0,
      answered: 0,
      total: questions.length,
      percentage: 0
    });
    expect(scoreAttempt([], {})).toEqual({ correct: 0, answered: 0, total: 0, percentage: 0 });
  });

  it("scores a perfect attempt as one hundred per cent", () => {
    const answers = Object.fromEntries(questions.map((q) => [q.id, q.correctOptionId]));
    const score = scoreAttempt(questions, answers);
    expect(score.correct).toBe(questions.length);
    expect(score.answered).toBe(questions.length);
    expect(score.percentage).toBe(100);
  });

  it("counts a wrong answer as answered but not correct", () => {
    const question = questions[0];
    const wrong = question.options.find((o) => o.id !== question.correctOptionId)!;
    const score = scoreAttempt(questions, { [question.id]: wrong.id });
    expect(score.answered).toBe(1);
    expect(score.correct).toBe(0);
  });

  it("ignores answers to questions outside the set being scored", () => {
    const score = scoreAttempt(questions, { "some-other-question": "a" });
    expect(score.answered).toBe(0);
    expect(score.correct).toBe(0);
  });
});

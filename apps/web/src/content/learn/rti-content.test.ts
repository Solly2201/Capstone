import { describe, expect, it } from "vitest";
import {
  articlesInCategory,
  faqMatchesQuery,
  faqs,
  faqsInCategory,
  findArticle,
  findCategory,
  learningArticles,
  matchesQuery,
  questionsForArticle,
  questionsInCategory,
  quizQuestions
} from "./index";

/**
 * Right to Information content.
 *
 * The generic Learn tests already prove schema, citation shape, quiz
 * balance and link resolution across all categories, and this content
 * flows into the same arrays. What is asserted here is what is specific
 * to RTI and would not be caught by those: that the two things the
 * corpus deliberately does not support are never claimed.
 */

const RTI = "right-to-information" as const;

// Excluded at ingestion (services/ai/app/ingestion/sources.py):
// ss.13, 16 and 27 were replaced by the RTI (Amendment) Act 2019 and the
// ingested copy predates it; s.25 was dropped for measured retrieval
// harm. None of them may be cited as law anywhere in Learn.
const EXCLUDED_SECTIONS = ["13", "16", "25", "27"];

const rtiCitations = [
  ...learningArticles.flatMap((article) =>
    article.paragraphs.map((paragraph) => paragraph.citation)
  ),
  ...faqs.flatMap((faq) => faq.legalBasis.map((paragraph) => paragraph.citation)),
  ...quizQuestions.map((question) => question.citation)
].filter((citation) => citation?.sourceId === "rti");

describe("Right to Information content", () => {
  it("registers the category with articles, questions and FAQs", () => {
    expect(findCategory(RTI)).toBeTruthy();
    expect(articlesInCategory(RTI).length).toBeGreaterThanOrEqual(6);
    expect(faqsInCategory(RTI).length).toBeGreaterThanOrEqual(5);
    expect(questionsInCategory(RTI).length).toBeGreaterThanOrEqual(
      articlesInCategory(RTI).length * 3
    );
  });

  it("gives every RTI article at least three questions", () => {
    for (const article of articlesInCategory(RTI)) {
      expect(questionsForArticle(article.slug).length, article.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("cites the RTI Act somewhere, and only real citizen-facing sections", () => {
    expect(rtiCitations.length).toBeGreaterThan(0);
    for (const citation of rtiCitations) {
      expect(citation!.unitNumber.length).toBeGreaterThan(0);
      expect(citation!.label).toContain("Right to Information Act");
    }
  });

  it("never cites a section excluded from the ingested corpus", () => {
    // ss.13/16/27 are pre-2019 text the amendment replaced. Citing them
    // would state repealed institutional law as current, which is the
    // whole reason they were excluded rather than ingested.
    const offending = rtiCitations.filter((citation) =>
      EXCLUDED_SECTIONS.includes(citation!.unitNumber)
    );
    expect(offending.map((c) => c!.unitNumber)).toEqual([]);
  });

  it("never describes how long an Information Commissioner serves", () => {
    // The tenure and salary provisions are exactly what the 2019
    // amendment changed, so any claim about them would be stale.
    const body = [
      ...articlesInCategory(RTI).flatMap((a) => [
        a.title,
        a.summary,
        a.scopeNote ?? "",
        ...a.paragraphs.map((p) => p.text)
      ]),
      ...faqsInCategory(RTI).flatMap((f) => [f.shortAnswer, f.scopeNote])
    ]
      .join(" ")
      .toLowerCase();
    for (const claim of ["five year", "term of office", "tenure", "salary"]) {
      expect(body.includes(claim), claim).toBe(false);
    }
  });

  it("never states a rupee fee for making a request", () => {
    // The Act says only "such fee as may be prescribed"; the amounts are
    // in rules that are not part of the ingested corpus. The Rs 250/day
    // penalty in section 20 is a different thing and is allowed.
    for (const article of articlesInCategory(RTI)) {
      const body = article.paragraphs.map((p) => p.text).join(" ");
      const feeAmounts = body.match(/(?:rs\.?|rupees)\s*\d/gi) ?? [];
      const penaltyArticle = article.slug === "complaints-and-penalties-under-rti";
      if (!penaltyArticle) {
        expect(feeAmounts, article.slug).toEqual([]);
      }
    }
  });

  it("records both corpus gaps as declared deferred topics", () => {
    const deferred = (findCategory(RTI)?.deferredTopics ?? []).join(" ").toLowerCase();
    expect(deferred).toContain("fee");
    expect(deferred).toContain("2019");
  });

  it("links every RTI FAQ to articles that exist", () => {
    for (const faq of faqsInCategory(RTI)) {
      expect(faq.relatedArticles.length, faq.id).toBeGreaterThan(0);
      for (const slug of faq.relatedArticles) {
        expect(findArticle(slug), `${faq.id} -> ${slug}`).toBeTruthy();
      }
    }
  });

  it("finds RTI content from the words a citizen would actually type", () => {
    // The point of the tags: someone searching "government file" or
    // "no reply" should reach these without knowing the abbreviation.
    const citizenPhrases = [
      "government file",
      "public information officer",
      "no reply",
      "refused",
      "penalty"
    ];
    for (const phrase of citizenPhrases) {
      const hits = faqs.filter((faq) => faqMatchesQuery(faq, phrase));
      expect(hits.length, phrase).toBeGreaterThan(0);
    }
  });

  it("finds the RTI articles by their own subject words", () => {
    for (const phrase of ["information", "appeal"]) {
      const hits = articlesInCategory(RTI).filter((article) => matchesQuery(article, phrase));
      expect(hits.length, phrase).toBeGreaterThan(0);
    }
  });
});

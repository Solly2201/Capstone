import { describe, expect, it } from "vitest";
import {
  faqMatchesQuery,
  faqSourceIds,
  faqs,
  faqsInCategory,
  findArticle,
  findFaq,
  learnCategories,
  legalSourceIds
} from "./index";

/**
 * Structural and grounding invariants for the FAQ set.
 *
 * The rule these enforce is the one that matters: an FAQ tells someone
 * what they can do in a real situation, so every substantive claim has to
 * be traceable to a provision, and nothing may read as advice about the
 * reader's own case.
 */
describe("FAQ content", () => {
  it("uses a unique id for every FAQ", () => {
    const ids = faqs.map((faq) => faq.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("assigns every FAQ to a declared learn category", () => {
    const categoryIds = new Set(learnCategories.map((category) => category.id));
    for (const faq of faqs) {
      expect(categoryIds.has(faq.categoryId), faq.id).toBe(true);
    }
  });

  it("gives every FAQ a question, a short answer and a scope note", () => {
    for (const faq of faqs) {
      expect(faq.question.trim().endsWith("?"), faq.id).toBe(true);
      expect(faq.shortAnswer.length, faq.id).toBeGreaterThan(40);
      // The scope note is what keeps an FAQ from reading as advice, so it
      // is mandatory rather than optional.
      expect(faq.scopeNote.length, faq.id).toBeGreaterThan(40);
    }
  });

  it("grounds every FAQ in at least one cited provision", () => {
    for (const faq of faqs) {
      expect(faq.legalBasis.length, faq.id).toBeGreaterThan(0);
      expect(faqSourceIds(faq).length, faq.id).toBeGreaterThan(0);
    }
  });

  it("cites only sources in the registry, with a real unit and label", () => {
    for (const faq of faqs) {
      for (const paragraph of faq.legalBasis) {
        expect(paragraph.citation, `${faq.id}: an uncited legal-basis paragraph`).toBeDefined();
        expect(legalSourceIds).toContain(paragraph.citation!.sourceId);
        expect(paragraph.citation!.unitNumber.length).toBeGreaterThan(0);
        expect(paragraph.citation!.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("links only to learning articles that exist", () => {
    for (const faq of faqs) {
      for (const slug of faq.relatedArticles) {
        expect(findArticle(slug), `${faq.id} -> ${slug}`).toBeDefined();
      }
    }
  });

  it("gives every FAQ citizen-language tags to be found by", () => {
    for (const faq of faqs) {
      expect(faq.tags.length, faq.id).toBeGreaterThanOrEqual(3);
      for (const tag of faq.tags) {
        expect(tag, faq.id).toBe(tag.toLowerCase());
      }
    }
  });

  it("keeps practical steps lawful in shape: no step tells the reader what will happen", () => {
    // "You will get", "the court will award" and similar promise outcomes
    // no static page can promise.
    const promises = /\b(you will (get|receive|win)|guaranteed|we will|I will|definitely)\b/i;
    for (const faq of faqs) {
      for (const step of faq.whatYouCanDo ?? []) {
        expect(promises.test(step), `${faq.id}: "${step}"`).toBe(false);
      }
      expect(promises.test(faq.shortAnswer), faq.id).toBe(false);
    }
  });

  it("marks danger-related FAQs with an urgency so the page leads with help", () => {
    const mustBeUrgent = [
      "someone-is-threatening-me",
      "violence-at-home",
      "protection-order-breached",
      "child-picked-up-by-police",
      "what-to-do-if-arrested"
    ];
    for (const id of mustBeUrgent) {
      const faq = findFaq(id);
      expect(faq, id).toBeDefined();
      expect(faq!.urgency, id).toBeDefined();
    }
  });

  it("never names a helpline other than the official national ones", () => {
    // Same discipline as the AI safety layer: 112, 181, 1098, 1930 only.
    const allowed = new Set(["112", "181", "1098", "1930"]);
    for (const faq of faqs) {
      const text = [faq.shortAnswer, ...(faq.whatYouCanDo ?? []), faq.scopeNote]
        .join(" ")
        // A statutory reference is not a phone number. "Section 482",
        // "section 12(h)" and "s. 478(1)" are stripped before scanning, so
        // the check stays about helplines rather than flagging citations.
        .replace(/\b(sections?|s\.)\s*\d+[A-Za-z]*(\(\d+\))?/gi, "")
        .replace(/\b\d{4}\b(?=\s*(Act|,))/g, "")
        // A rupee amount is not a phone number either. RTI's penalty is
        // "Rs 250 a day, up to Rs 25,000", and both figures are statutory
        // quantities from section 20.
        .replace(/\bRs\.?\s*[\d,]+/gi, "")
        .replace(/\b[\d,]+\s*(rupees|per day|a day)\b/gi, "");
      for (const number of text.match(/\b\d{3,5}\b/g) ?? []) {
        expect(allowed.has(number), `${faq.id} names ${number}`).toBe(true);
      }
    }
  });

  it("resolves an FAQ by id and returns undefined for an unknown one", () => {
    expect(findFaq(faqs[0].id)?.id).toBe(faqs[0].id);
    expect(findFaq("no-such-faq")).toBeUndefined();
    expect(findFaq(undefined)).toBeUndefined();
  });

  it("returns no FAQs for a category that has none", () => {
    const covered = new Set(faqs.map((faq) => faq.categoryId));
    const uncovered = learnCategories.find((category) => !covered.has(category.id));
    if (uncovered) expect(faqsInCategory(uncovered.id)).toEqual([]);
  });
});

describe("FAQ search", () => {
  it("finds an FAQ by the words a citizen would actually type", () => {
    // The point of the tags: the FAQ is titled "The police won't register
    // my FIR", but people search for what happened to them.
    for (const phrase of ["police refuse", "cops won't file", "complaint not registered"]) {
      const hits = faqs.filter((faq) => faqMatchesQuery(faq, phrase));
      expect(hits.map((faq) => faq.id), phrase).toContain("police-refuse-fir");
    }
  });

  it("finds the arrest FAQ from colloquial wording", () => {
    for (const phrase of ["picked up", "arrested", "custody"]) {
      const hits = faqs.filter((faq) => faqMatchesQuery(faq, phrase)).map((faq) => faq.id);
      expect(hits.length, phrase).toBeGreaterThan(0);
    }
  });

  it("matches case-insensitively and treats an empty query as match-all", () => {
    const faq = findFaq("how-does-bail-work")!;
    expect(faqMatchesQuery(faq, "")).toBe(true);
    expect(faqMatchesQuery(faq, "   ")).toBe(true);
    expect(faqMatchesQuery(faq, "BAIL")).toBe(true);
    expect(faqMatchesQuery(faq, "zzzz no such thing")).toBe(false);
  });

  it("searches the citation labels too", () => {
    const faq = findFaq("police-refuse-fir")!;
    expect(faqMatchesQuery(faq, "bnss")).toBe(true);
  });
});

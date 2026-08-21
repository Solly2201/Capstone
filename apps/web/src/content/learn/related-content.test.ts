import { describe, expect, it } from "vitest";
import { faqs, findArticle, findFaq, learningArticles, parseChunkId, relatedLearnContent } from "./index";

/**
 * The provision-to-Learn-content map used by the Legal Assistant's
 * related-content panel. The join is exact metadata equality on
 * `sourceId:unitNumber` — the AI service's chunk_id vocabulary — so these
 * tests pin that the map is complete over the authored content and never
 * invents a relationship.
 */

describe("parseChunkId", () => {
  it("splits a chunk id into a known source and unit", () => {
    expect(parseChunkId("bnss:173")).toEqual({ sourceId: "bnss", unitNumber: "173" });
    expect(parseChunkId("constitution:21")).toEqual({ sourceId: "constitution", unitNumber: "21" });
    expect(parseChunkId("lsa:22A")).toEqual({ sourceId: "lsa", unitNumber: "22A" });
  });

  it("rejects unknown sources and malformed ids", () => {
    expect(parseChunkId("ipc:302")).toBeNull();
    expect(parseChunkId("bnss")).toBeNull();
    expect(parseChunkId("bnss:")).toBeNull();
    expect(parseChunkId(":173")).toBeNull();
    expect(parseChunkId("")).toBeNull();
  });
});

describe("relatedLearnContent", () => {
  it("finds the FIR article and FAQ for the provision they both cite", () => {
    const related = relatedLearnContent(["bnss:173"]);

    expect(related.articles.map((article) => article.slug)).toContain("what-is-an-fir");
    expect(related.faqs.map((faq) => faq.id)).toContain("police-refuse-fir");
  });

  it("returns nothing for a provision no Learn content cites", () => {
    // bnss:500 is a real corpus chunk with no Learn coverage: the panel
    // must stay empty rather than guess at something topical.
    expect(relatedLearnContent(["bnss:500"])).toEqual({ articles: [], faqs: [] });
  });

  it("returns nothing for unknown sources rather than throwing", () => {
    expect(relatedLearnContent(["ipc:302", "not-a-chunk-id"])).toEqual({ articles: [], faqs: [] });
  });

  it("deduplicates when several excerpts cite the same material", () => {
    const related = relatedLearnContent(["bnss:173", "bnss:173", "bnss:210"]);
    const slugs = related.articles.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const faqIds = related.faqs.map((faq) => faq.id);
    expect(new Set(faqIds).size).toBe(faqIds.length);
  });

  it("round-trips every authored article citation", () => {
    // Every provision an article cites must lead back to that article —
    // otherwise the panel silently under-reports coverage.
    for (const article of learningArticles) {
      for (const paragraph of article.paragraphs) {
        if (!paragraph.citation) continue;
        const key = `${paragraph.citation.sourceId}:${paragraph.citation.unitNumber}`;
        const related = relatedLearnContent([key]);
        expect(
          related.articles.map((entry) => entry.slug),
          `article "${article.slug}" not reachable from its own citation ${key}`
        ).toContain(article.slug);
      }
    }
  });

  it("round-trips every authored FAQ citation", () => {
    for (const faq of faqs) {
      for (const paragraph of faq.legalBasis) {
        if (!paragraph.citation) continue;
        const key = `${paragraph.citation.sourceId}:${paragraph.citation.unitNumber}`;
        const related = relatedLearnContent([key]);
        expect(
          related.faqs.map((entry) => entry.id),
          `FAQ "${faq.id}" not reachable from its own citation ${key}`
        ).toContain(faq.id);
      }
    }
  });

  it("only ever returns content that actually exists", () => {
    const related = relatedLearnContent(["bnss:173", "constitution:21", "cpa2019:35"]);
    for (const article of related.articles) {
      expect(findArticle(article.slug)).toBeDefined();
    }
    for (const faq of related.faqs) {
      expect(findFaq(faq.id)).toBeDefined();
    }
  });
});

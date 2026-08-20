import { describe, expect, it } from "vitest";
import {
  articleSourceIds,
  articlesInCategory,
  findArticle,
  findCategory,
  learnCategories,
  learningArticles,
  legalSourceIds,
  legalSources,
  matchesQuery
} from "./index";

describe("learn content", () => {
  it("uses a unique slug for every article", () => {
    const slugs = learningArticles.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("assigns every article to a declared category", () => {
    const categoryIds = new Set(learnCategories.map((category) => category.id));
    for (const article of learningArticles) {
      expect(categoryIds.has(article.categoryId)).toBe(true);
    }
  });

  it("gives every category at least one article", () => {
    for (const category of learnCategories) {
      expect(articlesInCategory(category.id).length).toBeGreaterThan(0);
    }
  });

  it("cites only sources that exist in the source registry", () => {
    for (const article of learningArticles) {
      for (const paragraph of article.paragraphs) {
        if (!paragraph.citation) continue;
        expect(legalSourceIds).toContain(paragraph.citation.sourceId);
        expect(paragraph.citation.label.length).toBeGreaterThan(0);
        expect(paragraph.citation.unitNumber.length).toBeGreaterThan(0);
      }
    }
  });

  it("points every registered source at an India Code URL", () => {
    for (const id of legalSourceIds) {
      expect(legalSources[id].officialUrl).toMatch(/^https:\/\/www\.indiacode\.nic\.in\//);
    }
  });

  it("grounds every article in at least one cited source", () => {
    for (const article of learningArticles) {
      expect(articleSourceIds(article).length).toBeGreaterThan(0);
    }
  });

  it("gives every article a title, summary and body", () => {
    for (const article of learningArticles) {
      expect(article.title.length).toBeGreaterThan(0);
      expect(article.summary.length).toBeGreaterThan(0);
      expect(article.paragraphs.length).toBeGreaterThan(0);
    }
  });

  it("covers the previously deferred FIR-vs-NCR and bail-procedure topics", () => {
    expect(findArticle("fir-vs-ncr")).toBeDefined();
    expect(findArticle("bail-procedure-basics")).toBeDefined();
  });

  it("resolves categories and articles by id and slug", () => {
    expect(findCategory("arrest-bail")?.title).toBe("Arrest & Bail");
    expect(findArticle("zero-fir")?.categoryId).toBe("police-fir");
    expect(findArticle("does-not-exist")).toBeUndefined();
    expect(findArticle(undefined)).toBeUndefined();
  });

  it("matches search queries case-insensitively across title, summary and citations", () => {
    const article = findArticle("what-is-an-fir")!;
    expect(matchesQuery(article, "")).toBe(true);
    expect(matchesQuery(article, "  ")).toBe(true);
    expect(matchesQuery(article, "FIR")).toBe(true);
    expect(matchesQuery(article, "bnss")).toBe(true);
    expect(matchesQuery(article, "consumer mediation cell")).toBe(false);
  });

  it("lists an article's distinct sources without duplicates", () => {
    const article = findArticle("right-against-exploitation")!;
    const sources = articleSourceIds(article);
    expect(new Set(sources).size).toBe(sources.length);
    expect(sources).toContain("constitution");
  });
});

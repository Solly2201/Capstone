import { BookOpen, HelpCircle, Info, MessagesSquare, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { disclaimerText } from "@cap/contracts";
import { SiteShell } from "../components/SiteShell";
import {
  articleSourceIds,
  articlesInCategory,
  learnCategories,
  learningArticles,
  legalSources,
  matchesQuery,
  questionsForArticle,
  quizQuestions,
  type LearnCategoryId
} from "../content/learn";

type Filter = LearnCategoryId | "all";

export function LearnPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const sections = useMemo(
    () =>
      learnCategories
        .filter((category) => filter === "all" || category.id === filter)
        .map((category) => ({
          category,
          articles: articlesInCategory(category.id).filter((article) => matchesQuery(article, query))
        }))
        .filter((section) => section.articles.length > 0 || filter === section.category.id),
    [filter, query]
  );

  const matchCount = sections.reduce((total, section) => total + section.articles.length, 0);
  const noResults = matchCount === 0;

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <p className="eyebrow">Module 1 &middot; Legal awareness</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Learn your rights</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
          Plain-language explanations of common legal situations, grounded in the Constitution of
          India and in the Acts this project has ingested from India Code. Every claim below links to
          the exact provision it comes from, and every article ends with questions you can use to
          check what you have understood.
        </p>

        <p className="mt-3 text-sm text-ink/60">
          {learningArticles.length} articles &middot; {learnCategories.length} topics &middot;{" "}
          {quizQuestions.length} practice questions
        </p>

        <div className="mt-6 rounded-xl border border-clay/30 bg-sandstone/40 p-4 text-sm leading-6 text-ink/80">
          {disclaimerText}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search learning articles</span>
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by topic, e.g. bail, FIR, equality"
              className="w-full rounded-lg border border-ink/15 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-clay"
            />
          </label>
          <p className="text-sm text-ink/60" role="status">
            {matchCount} of {learningArticles.length} articles
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <CategoryChip active={filter === "all"} onClick={() => setFilter("all")}>
            All topics
          </CategoryChip>
          {learnCategories.map((category) => (
            <CategoryChip
              key={category.id}
              active={filter === category.id}
              onClick={() => setFilter(category.id)}
            >
              {category.title}
            </CategoryChip>
          ))}
        </div>

        {noResults && (
          <div className="mt-10 rounded-2xl border border-dashed border-ink/20 bg-white/50 p-8 text-center">
            <p className="font-serif text-xl font-semibold">No articles match that search</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Try a broader word, or search the ingested source documents directly.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                className="inline-flex items-center justify-center rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-semibold transition hover:border-clay/50 hover:text-clay"
              >
                Clear filters
              </button>
              <Link
                to="/learn/browse"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-parchment transition hover:bg-coal"
              >
                <Search size={17} aria-hidden="true" />
                Search source documents
              </Link>
            </div>
          </div>
        )}

        <div className="mt-12 space-y-14">
          {sections.map(({ category, articles }) => (
            <section key={category.id} aria-labelledby={`category-${category.id}`}>
              <h2 id={`category-${category.id}`} className="font-serif text-2xl font-semibold">
                {category.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">{category.description}</p>

              {articles.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-ink/20 p-5 text-sm text-ink/60">
                  Nothing in this category matches “{query}”.
                </p>
              ) : (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {articles.map((article) => (
                    <Link
                      key={article.slug}
                      to={`/learn/${article.slug}`}
                      className="group flex flex-col rounded-2xl border border-ink/10 bg-white/60 p-6 transition hover:border-clay/50 hover:shadow-sm"
                    >
                      <BookOpen className="text-clay" size={22} aria-hidden="true" />
                      <h3 className="mt-4 font-serif text-xl font-semibold group-hover:text-clay">
                        {article.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-6 text-ink/70">{article.summary}</p>
                      <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/55">
                        <HelpCircle size={13} aria-hidden="true" className="text-clay" />
                        {questionsForArticle(article.slug).length} practice questions
                      </p>
                      <p className="mt-2 flex flex-wrap gap-1.5">
                        {articleSourceIds(article).map((sourceId) => (
                          <span
                            key={sourceId}
                            className="rounded-full border border-clay/30 bg-sandstone/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-clay"
                          >
                            {legalSources[sourceId].label}
                          </span>
                        ))}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              {category.deferredTopics && category.deferredTopics.length > 0 && (
                <div className="mt-5 flex gap-3 rounded-xl border border-ink/10 bg-white/40 p-4 text-sm leading-6 text-ink/70">
                  <Info size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-clay" />
                  <div>
                    <p className="font-semibold text-ink/80">Not covered yet</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {category.deferredTopics.map((topic) => (
                        <li key={topic}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/legal-assistant"
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-parchment transition hover:bg-coal"
          >
            <MessagesSquare size={17} aria-hidden="true" />
            Ask a legal question
          </Link>
          <Link
            to="/learn/browse"
            className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-clay/50 hover:text-clay"
          >
            <Search size={17} aria-hidden="true" />
            Search the source documents directly
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}

function CategoryChip({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? "border-ink bg-ink text-parchment"
          : "border-ink/15 text-ink/70 hover:border-clay/50 hover:text-clay"
      }`}
    >
      {children}
    </button>
  );
}

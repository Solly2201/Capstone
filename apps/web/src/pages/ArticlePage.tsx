import { ArrowLeft, ExternalLink, Info } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { disclaimerText } from "@cap/contracts";
import { ArticleQuiz } from "../components/ArticleQuiz";
import { SiteShell } from "../components/SiteShell";
import {
  articleSourceIds,
  articlesInCategory,
  findArticle,
  findCategory,
  legalSources,
  questionsForArticle
} from "../content/learn";

export function ArticlePage() {
  const { slug } = useParams();
  const article = findArticle(slug);

  if (!article) return <ArticleNotFound />;

  const category = findCategory(article.categoryId);
  const sourceIds = articleSourceIds(article);
  const related = articlesInCategory(article.categoryId).filter((other) => other.slug !== article.slug);
  const questions = questionsForArticle(article.slug);

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <Link
          to="/learn"
          className="inline-flex items-center gap-2 text-sm font-bold text-clay underline-offset-4 hover:underline"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to learning library
        </Link>

        {category && <p className="eyebrow mt-6">{category.title}</p>}
        <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">{article.title}</h1>
        <p className="mt-4 text-lg leading-8 text-ink/70">{article.summary}</p>

        <div className="mt-8 space-y-6">
          {article.paragraphs.map((paragraph, index) => (
            <div key={index} className="border-l-2 border-clay/30 pl-5">
              <p className="text-base leading-7 text-ink/90">{paragraph.text}</p>
              {paragraph.citation && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-clay">
                  Source: {paragraph.citation.label}
                </p>
              )}
            </div>
          ))}
        </div>

        {article.scopeNote && (
          <div className="mt-10 flex gap-3 rounded-xl border border-ink/10 bg-white/50 p-4 text-sm leading-6 text-ink/75">
            <Info size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-clay" />
            <p>
              <span className="font-semibold text-ink/85">What this does not cover: </span>
              {article.scopeNote}
            </p>
          </div>
        )}

        <section className="mt-10" aria-labelledby="article-sources">
          <h2 id="article-sources" className="font-serif text-xl font-semibold">
            Sources
          </h2>
          <ul className="mt-4 space-y-3">
            {sourceIds.map((sourceId) => {
              const source = legalSources[sourceId];
              return (
                <li key={sourceId} className="rounded-xl border border-ink/10 bg-white/60 p-4">
                  <p className="text-sm font-semibold">
                    {source.label}
                    {source.actNo && <span className="font-normal text-ink/60"> · {source.actNo}</span>}
                  </p>
                  <p className="mt-1 text-xs text-ink/60">{source.publisher}</p>
                  <a
                    href={source.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-clay underline underline-offset-4"
                  >
                    Official source <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs leading-5 text-ink/50">
            Every paragraph above is written against the ingested text of these documents and tagged
            with the provision it comes from. Nothing on this page is generated at request time.
          </p>
        </section>

        <ArticleQuiz
          questions={questions}
          footer={
            related.length > 0 ? (
              <Link
                to={`/learn/${related[0].slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-parchment transition hover:bg-coal"
              >
                Continue learning: {related[0].title}
              </Link>
            ) : (
              <Link
                to="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-parchment transition hover:bg-coal"
              >
                Back to the learning library
              </Link>
            )
          }
        />

        {related.length > 0 && (
          <section className="mt-10" aria-labelledby="related-articles">
            <h2 id="related-articles" className="font-serif text-xl font-semibold">
              More in {category?.title ?? "this section"}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((other) => (
                <Link
                  key={other.slug}
                  to={`/learn/${other.slug}`}
                  className="rounded-xl border border-ink/10 bg-white/60 p-4 text-sm font-semibold transition hover:border-clay/50 hover:text-clay"
                >
                  {other.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 rounded-xl border border-clay/30 bg-sandstone/40 p-4 text-sm leading-6 text-ink/80">
          {disclaimerText} If this describes a situation you're in right now rather than something
          you're learning about generally, please contact a legal adviser or, in an emergency, call{" "}
          <a className="font-semibold underline underline-offset-4" href="tel:112">
            112
          </a>
          .
        </div>
      </article>
    </SiteShell>
  );
}

function ArticleNotFound() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
        <p className="eyebrow">Learning library</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold">Article not found</h1>
        <p className="mt-4 text-base leading-7 text-ink/70">
          That article does not exist, or its address has changed. The full library is still here.
        </p>
        <Link
          to="/learn"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-parchment transition hover:bg-coal"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to learning library
        </Link>
      </section>
    </SiteShell>
  );
}

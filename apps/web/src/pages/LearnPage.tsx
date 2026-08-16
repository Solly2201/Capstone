import { BookOpen, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { disclaimerText } from "@cap/contracts";
import { SiteShell } from "../components/SiteShell";
import { learningArticles } from "../content/learningArticles";

export function LearnPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <p className="eyebrow">Module 1 &middot; Legal awareness</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Learn your rights</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
          Plain-language explanations of common legal situations, grounded in the Constitution of
          India and the Bharatiya Nyaya Sanhita, Nagarik Suraksha Sanhita, and Sakshya Adhiniyam.
          Every claim below links to the exact section it comes from.
        </p>

        <div className="mt-6 rounded-xl border border-clay/30 bg-sandstone/40 p-4 text-sm leading-6 text-ink/80">
          {disclaimerText}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {learningArticles.map((article) => (
            <Link
              key={article.slug}
              to={`/learn/${article.slug}`}
              className="group rounded-2xl border border-ink/10 bg-white/60 p-6 transition hover:border-clay/50 hover:shadow-sm"
            >
              <BookOpen className="text-clay" size={22} aria-hidden="true" />
              <h2 className="mt-4 font-serif text-xl font-semibold group-hover:text-clay">
                {article.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">{article.summary}</p>
            </Link>
          ))}
        </div>

        <Link
          to="/learn/browse"
          className="mt-10 inline-flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-clay/50 hover:text-clay"
        >
          <Search size={17} aria-hidden="true" />
          Search the source documents directly
        </Link>
      </section>
    </SiteShell>
  );
}

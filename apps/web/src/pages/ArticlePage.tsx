import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { disclaimerText } from "@cap/contracts";
import { SiteShell } from "../components/SiteShell";
import { learningArticles } from "../content/learningArticles";

export function ArticlePage() {
  const { slug } = useParams();
  const article = learningArticles.find((a) => a.slug === slug);

  if (!article) return <Navigate to="/learn" replace />;

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <Link to="/learn" className="inline-flex items-center gap-2 text-sm font-bold text-clay underline-offset-4 hover:underline">
          <ArrowLeft size={16} aria-hidden="true" /> Back to learning library
        </Link>
        <h1 className="mt-6 font-serif text-4xl font-semibold sm:text-5xl">{article.title}</h1>
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

        <div className="mt-10 rounded-xl border border-clay/30 bg-sandstone/40 p-4 text-sm leading-6 text-ink/80">
          {disclaimerText} If this describes a situation you're in right now rather than something
          you're learning about generally, please contact a legal adviser or, in an emergency, call{" "}
          <a className="font-semibold underline underline-offset-4" href="tel:112">112</a>.
        </div>
      </article>
    </SiteShell>
  );
}

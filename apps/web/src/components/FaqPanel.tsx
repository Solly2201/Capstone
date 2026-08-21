import { AlertTriangle, ExternalLink, HelpCircle, Info, Phone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { faqSourceIds, findArticle, legalSources, type Faq } from "../content/learn";

// Practical "what should I do?" answers, rendered from static grounded
// content. Nothing here calls the AI service: an FAQ is curated and cited
// at authoring time, so it cannot change under a reader or assert
// something the provision it cites does not say.
//
// An FAQ marked `urgency` leads with getting help rather than with the
// law, matching how the Legal Assistant's safety layer frames the same
// situations. Only official national helplines are named.

const urgencyCopy: Record<NonNullable<Faq["urgency"]>, { heading: string; body: string }> = {
  emergency: {
    heading: "If you are in danger right now",
    body: "Contact 112 (Emergency) or your local police first, and get somewhere safe. The Women's Helpline is 181 and Childline is 1098. Read the rest of this page afterwards.",
  },
  serious: {
    heading: "This may be a serious matter",
    body: "The information below is general. If this is happening to you, speak to a lawyer or your District Legal Services Authority — free legal aid is available if you qualify.",
  },
};

export function FaqPanel({ faq, initiallyOpen = false }: { faq: Faq; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const sourceIds = faqSourceIds(faq);
  const urgency = faq.urgency ? urgencyCopy[faq.urgency] : undefined;
  const Icon = faq.urgency === "emergency" ? Phone : faq.urgency === "serious" ? Info : HelpCircle;

  return (
    // The id makes /learn#faq-<id> a stable deep link, which is how the
    // Legal Assistant's related-content panel reaches a specific FAQ.
    <article id={`faq-${faq.id}`} className="rounded-2xl border border-ink/10 bg-white/60">
      <h3>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex w-full items-start gap-3 p-5 text-left"
        >
          <Icon
            size={18}
            aria-hidden="true"
            className={`mt-0.5 shrink-0 ${faq.urgency === "emergency" ? "text-red-800" : "text-clay"}`}
          />
          <span className="flex-1 font-serif text-lg font-semibold">{faq.question}</span>
          <span aria-hidden="true" className="mt-1 shrink-0 text-sm text-ink/40">
            {open ? "−" : "+"}
          </span>
        </button>
      </h3>

      {open && (
        <div className="border-t border-ink/10 px-5 pb-5 pt-4">
          {urgency && (
            <div
              className={`mb-4 rounded-xl border p-4 text-sm leading-6 ${
                faq.urgency === "emergency"
                  ? "border-red-800/30 bg-red-50"
                  : "border-clay/40 bg-sandstone/50"
              }`}
              role={faq.urgency === "emergency" ? "alert" : "status"}
            >
              <p className="font-semibold">{urgency.heading}</p>
              <p className="mt-1 text-ink/85">{urgency.body}</p>
            </div>
          )}

          <p className="text-base leading-7 text-ink/90">{faq.shortAnswer}</p>

          {faq.whatYouCanDo && faq.whatYouCanDo.length > 0 && (
            <section className="mt-5" aria-labelledby={`${faq.id}-steps`}>
              <h4 id={`${faq.id}-steps`} className="text-sm font-bold uppercase tracking-wide text-clay">
                What you can generally do
              </h4>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-ink/85">
                {faq.whatYouCanDo.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-5" aria-labelledby={`${faq.id}-basis`}>
            <h4 id={`${faq.id}-basis`} className="text-sm font-bold uppercase tracking-wide text-clay">
              What the law says
            </h4>
            <div className="mt-2 space-y-3">
              {faq.legalBasis.map((paragraph, index) => (
                <div key={index} className="border-l-2 border-clay/30 pl-4">
                  <p className="text-sm leading-6 text-ink/85">{paragraph.text}</p>
                  {paragraph.citation && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-clay">
                      Source: {paragraph.citation.label}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="mt-5 flex gap-3 rounded-xl border border-ink/10 bg-white/50 p-4 text-sm leading-6 text-ink/75">
            <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-clay" />
            <p>
              <span className="font-semibold text-ink/85">Scope: </span>
              {faq.scopeNote}
            </p>
          </div>

          {sourceIds.length > 0 && (
            <p className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold uppercase tracking-wide text-ink/50">Official sources</span>
              {sourceIds.map((sourceId) => (
                <a
                  key={sourceId}
                  href={legalSources[sourceId].officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-clay/30 bg-sandstone/50 px-2.5 py-1 font-semibold text-clay underline-offset-2 hover:underline"
                >
                  {legalSources[sourceId].label}
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
              ))}
            </p>
          )}

          {faq.relatedArticles.length > 0 && (
            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-ink/60">Learn more:</span>
              {faq.relatedArticles.map((slug) => {
                const article = findArticle(slug);
                if (!article) return null;
                return (
                  <Link
                    key={slug}
                    to={`/learn/${slug}`}
                    className="font-semibold text-clay underline underline-offset-4"
                  >
                    {article.title}
                  </Link>
                );
              })}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

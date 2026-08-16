import { ArrowLeft, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/SiteShell";
import { api } from "../lib/api";

type SearchResult = {
  chunk_id: string;
  text: string;
  title: string;
  citation: {
    source: string;
    act_no: string;
    unit: string;
    official_url: string;
    verified_as_on: string;
  };
  coverage_note: string;
};

export function DocumentBrowserPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setStatus("loading");
    try {
      const response = await api.get<SearchResult[]>("/corpus/search", { params: { q: query, top_k: 8 } });
      setResults(response.data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <Link to="/learn" className="inline-flex items-center gap-2 text-sm font-bold text-clay underline-offset-4 hover:underline">
          <ArrowLeft size={16} aria-hidden="true" /> Back to learning library
        </Link>
        <h1 className="mt-6 font-serif text-4xl font-semibold sm:text-5xl">Search the source documents</h1>
        <p className="mt-4 text-lg leading-8 text-ink/70">
          This searches the exact ingested text of the Constitution, BNS, BNSS, and BSA — no
          summarising, no generation. Every result is a real section with its citation attached.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. arrest without warrant, right to bail, freedom of speech"
            className="flex-1 rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-clay"
            aria-label="Search legal source documents"
          />
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-parchment hover:bg-coal">
            <Search size={16} aria-hidden="true" /> Search
          </button>
        </form>

        {status === "error" && (
          <p className="mt-6 text-sm text-red-700">
            The corpus service isn't reachable right now. Try again shortly.
          </p>
        )}

        {status === "loading" && <p className="mt-6 text-sm text-ink/60">Searching...</p>}

        {status === "done" && results.length === 0 && (
          <p className="mt-6 text-sm text-ink/60">No matches in the ingested corpus for that search.</p>
        )}

        <div className="mt-8 space-y-5">
          {results.map((result) => (
            <div key={result.chunk_id} className="rounded-xl border border-ink/10 bg-white/60 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-clay">
                {result.citation.source} {result.citation.act_no && `(${result.citation.act_no})`} — {result.citation.unit}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/90">{result.text}</p>
              <p className="mt-3 text-xs text-ink/50">
                Verified as on {result.citation.verified_as_on} ·{" "}
                <a href={result.citation.official_url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  official source
                </a>
              </p>
              {result.coverage_note && (
                <p className="mt-2 text-xs italic text-ink/40">{result.coverage_note}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

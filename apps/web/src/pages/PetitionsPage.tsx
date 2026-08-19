import { Megaphone, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  petitionCategories,
  petitionCategoryLabels,
  petitionSortLabels,
  petitionSortOptions,
  petitionStatusLabels,
  publicPetitionStatuses,
  type PetitionListResponse,
  type PetitionSort,
  type PetitionSummary
} from "@cap/contracts";
import { useAuth } from "../auth/AuthContext";
import { PetitionProgress, PetitionStatusBadge } from "../components/PetitionProgress";
import { SiteShell } from "../components/SiteShell";
import { api, apiErrorMessage } from "../lib/api";

type LoadState = "loading" | "ready" | "error";

const PAGE_SIZE = 20;

/**
 * The public petition list.
 *
 * Readable without an account, matching the endpoint's own design: a
 * petition exists to be seen. Signing still needs an account, and the
 * "you signed this" marker only appears when the API recognised the
 * request, so an anonymous reader simply sees no such marker rather than
 * a wrong one.
 *
 * Filters map one-to-one onto the API's validated query contract, so the
 * server does the filtering and what is on screen is what the database
 * matched rather than a client-side slice of an unbounded list.
 */
export function PetitionsPage() {
  const { user } = useAuth();
  const [petitions, setPetitions] = useState<PetitionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<PetitionSort>("newest");
  const [offset, setOffset] = useState(0);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const response = await api.get<PetitionListResponse>("/petitions", {
        params: {
          ...(category ? { category } : {}),
          ...(status ? { status } : {}),
          sort,
          limit: PAGE_SIZE,
          offset
        }
      });
      setPetitions(response.data.petitions);
      setTotal(response.data.total);
      setState("ready");
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, "We could not load petitions. Please try again."));
      setState("error");
    }
  }, [category, status, sort, offset]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Changing a filter returns to the first page of the new result set. */
  const changeFilter = (apply: () => void) => {
    apply();
    setOffset(0);
  };

  const canCreate = user?.role === "CITIZEN";
  const showingTo = Math.min(offset + petitions.length, total);

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Module 3 &middot; Public participation</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Community petitions</h1>
          </div>
          {canCreate && (
            <Link
              to="/petitions/new"
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-parchment transition hover:bg-coal"
            >
              <Plus size={17} aria-hidden="true" /> Start a petition
            </Link>
          )}
        </div>
        <p className="mt-5 text-lg leading-8 text-ink/70">
          Petitions started by residents. Anyone can read them; signing needs an account, and each
          account can sign a petition once.
        </p>

        <div className="mt-8 grid gap-4 rounded-xl border border-ink/15 bg-white/50 p-4 sm:grid-cols-3">
          <label className="block text-sm font-semibold">
            Category
            <select
              className="field"
              value={category}
              onChange={(event) => changeFilter(() => setCategory(event.target.value))}
            >
              <option value="">All categories</option>
              {petitionCategories.map((value) => (
                <option key={value} value={value}>
                  {petitionCategoryLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Status
            <select
              className="field"
              value={status}
              onChange={(event) => changeFilter(() => setStatus(event.target.value))}
            >
              <option value="">All statuses</option>
              {publicPetitionStatuses.map((value) => (
                <option key={value} value={value}>
                  {petitionStatusLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Sort
            <select
              className="field"
              value={sort}
              onChange={(event) => changeFilter(() => setSort(event.target.value as PetitionSort))}
            >
              {petitionSortOptions.map((value) => (
                <option key={value} value={value}>
                  {petitionSortLabels[value]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {state === "loading" && (
          <p role="status" className="mt-10 text-sm text-ink/60">
            Loading petitions…
          </p>
        )}

        {state === "error" && (
          <p role="alert" className="mt-10 rounded-xl border border-clay/40 bg-sandstone/50 px-5 py-4 text-sm leading-6">
            {errorMessage}
          </p>
        )}

        {state === "ready" && petitions.length === 0 && (
          <div className="mt-10 rounded-xl border border-ink/10 bg-white/60 p-8 text-center">
            <Megaphone className="mx-auto text-clay" size={28} aria-hidden="true" />
            <p className="mt-4 font-serif text-xl font-semibold">
              {category || status ? "Nothing matches these filters." : "No petitions have been started yet."}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              {category || status
                ? "Clear a filter to see more."
                : "Be the first to raise something your neighbourhood needs."}
            </p>
            {canCreate && !category && !status && (
              <Link
                to="/petitions/new"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-parchment transition hover:bg-coal"
              >
                <Plus size={17} aria-hidden="true" /> Start a petition
              </Link>
            )}
          </div>
        )}

        {state === "ready" && petitions.length > 0 && (
          <>
            <p className="mt-10 text-sm text-ink/60">
              Showing {offset + 1}–{showingTo} of {total} petition{total === 1 ? "" : "s"}.
            </p>
            <ul className="mt-4 space-y-4">
              {petitions.map((petition) => (
                <li key={petition.id}>
                  <Link
                    to={`/petitions/${petition.id}`}
                    className="block rounded-xl border border-ink/10 bg-white/60 p-5 transition hover:border-clay/50 hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <PetitionStatusBadge status={petition.status} />
                      <span className="text-xs font-semibold uppercase tracking-wide text-clay">
                        {petitionCategoryLabels[petition.category]}
                      </span>
                      {petition.hasSigned && (
                        <span className="rounded-full border border-sage/50 bg-sage/10 px-2.5 py-0.5 text-xs font-bold text-sage">
                          You signed this
                        </span>
                      )}
                    </div>
                    <p className="mt-3 font-serif text-xl font-semibold">{petition.title}</p>
                    <p className="mt-1 text-xs text-ink/55">
                      Started by {petition.creatorName} on{" "}
                      {new Date(petition.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-4">
                      <PetitionProgress petition={petition} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {total > PAGE_SIZE && (
              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  className="rounded-lg border border-ink/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-sandstone disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={offset + PAGE_SIZE >= total}
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  className="rounded-lg border border-ink/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-sandstone disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </SiteShell>
  );
}

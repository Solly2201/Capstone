import { Inbox } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  petitionCategories,
  petitionCategoryLabels,
  petitionSortLabels,
  petitionSortOptions,
  petitionStatusLabels,
  petitionStatuses,
  type PetitionListResponse,
  type PetitionSort,
  type PetitionSummary
} from "@cap/contracts";
import { PetitionProgress, PetitionStatusBadge } from "../components/PetitionProgress";
import { SiteShell } from "../components/SiteShell";
import { api, apiErrorMessage } from "../lib/api";

type LoadState = "loading" | "ready" | "error";

const PAGE_SIZE = 20;

/**
 * The petition queue for civic authority staff.
 *
 * Unlike the public list this shows every status, including removed
 * petitions, so a moderation decision stays reviewable rather than
 * disappearing. The "goal reached" filter is what makes a creator's
 * signature goal a triage signal: it is evaluated by the database as a
 * comparison of two stored fields, not by paging through everything.
 *
 * Actions live on the petition itself (`/petitions/:id`), which renders
 * whatever the shared transition table allows this account to do -- so
 * there is no second, near-identical staff detail page to keep in sync.
 */
export function AuthorityPetitionsPage() {
  const [petitions, setPetitions] = useState<PetitionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [goalMet, setGoalMet] = useState(false);
  const [sort, setSort] = useState<PetitionSort>("newest");
  const [offset, setOffset] = useState(0);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const response = await api.get<PetitionListResponse>("/petitions/authority", {
        params: {
          ...(status ? { status } : {}),
          ...(category ? { category } : {}),
          ...(goalMet ? { goalMet: "true" } : {}),
          sort,
          limit: PAGE_SIZE,
          offset
        }
      });
      setPetitions(response.data.petitions);
      setTotal(response.data.total);
      setState("ready");
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, "We could not load the petition queue. Please try again."));
      setState("error");
    }
  }, [status, category, goalMet, sort, offset]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeFilter = (apply: () => void) => {
    apply();
    setOffset(0);
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <p className="eyebrow">Civic authority</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Petition queue</h1>
        <p className="mt-5 text-lg leading-8 text-ink/70">
          Every petition residents have published, with the support it has gathered. Open one to take
          it up for review, publish a response, or remove it with a reason.
        </p>

        <div className="mt-8 grid gap-4 rounded-xl border border-ink/15 bg-white/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm font-semibold">
            Status
            <select
              className="field"
              value={status}
              onChange={(event) => changeFilter(() => setStatus(event.target.value))}
            >
              <option value="">All statuses</option>
              {petitionStatuses.map((value) => (
                <option key={value} value={value}>
                  {petitionStatusLabels[value]}
                </option>
              ))}
            </select>
          </label>
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
          <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
            <input
              type="checkbox"
              className="size-4"
              checked={goalMet}
              onChange={(event) => changeFilter(() => setGoalMet(event.target.checked))}
            />
            Only petitions that reached their signature goal
          </label>
        </div>

        {state === "loading" && (
          <p role="status" className="mt-10 text-sm text-ink/60">
            Loading the queue…
          </p>
        )}

        {state === "error" && (
          <p role="alert" className="mt-10 rounded-xl border border-clay/40 bg-sandstone/50 px-5 py-4 text-sm leading-6">
            {errorMessage}
          </p>
        )}

        {state === "ready" && petitions.length === 0 && (
          <div className="mt-10 rounded-xl border border-ink/10 bg-white/60 p-8 text-center">
            <Inbox className="mx-auto text-clay" size={28} aria-hidden="true" />
            <p className="mt-4 font-serif text-xl font-semibold">Nothing matches these filters.</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">Clear a filter to see more of the queue.</p>
          </div>
        )}

        {state === "ready" && petitions.length > 0 && (
          <>
            <p className="mt-10 text-sm text-ink/60">
              Showing {offset + 1}–{Math.min(offset + petitions.length, total)} of {total} petition
              {total === 1 ? "" : "s"}.
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

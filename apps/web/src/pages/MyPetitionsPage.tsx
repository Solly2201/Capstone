import { Megaphone, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  petitionCategoryLabels,
  type PetitionListResponse,
  type PetitionMineFilter,
  type PetitionSummary
} from "@cap/contracts";
import { useAuth } from "../auth/AuthContext";
import { PetitionProgress, PetitionStatusBadge } from "../components/PetitionProgress";
import { SiteShell } from "../components/SiteShell";
import { api, apiErrorMessage } from "../lib/api";

type LoadState = "loading" | "ready" | "error";

const PAGE_SIZE = 20;

const tabs: { value: PetitionMineFilter; label: string }[] = [
  { value: "created", label: "Started by me" },
  { value: "signed", label: "Signed by me" }
];

/**
 * The citizen's own petition activity.
 *
 * The "signed by me" tab is not a convenience feature: one signature per
 * account is only a fair rule if a person can see what they have already
 * signed. Both tabs are scoped server-side to the authenticated account
 * -- this page never sends an id of its own.
 */
export function MyPetitionsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<PetitionMineFilter>("created");
  const [petitions, setPetitions] = useState<PetitionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const response = await api.get<PetitionListResponse>("/petitions/mine", {
        params: { filter, limit: PAGE_SIZE, offset }
      });
      setPetitions(response.data.petitions);
      setTotal(response.data.total);
      setState("ready");
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, "We could not load your petitions. Please try again."));
      setState("error");
    }
  }, [filter, offset]);

  useEffect(() => {
    void load();
  }, [load]);

  const canCreate = user?.role === "CITIZEN";

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Module 3 &middot; Public participation</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">My petitions</h1>
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

        <div className="mt-8 flex gap-2" role="tablist" aria-label="Petition activity">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={filter === tab.value}
              onClick={() => {
                setFilter(tab.value);
                setOffset(0);
              }}
              className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                filter === tab.value
                  ? "border-clay bg-sandstone/70 text-ink"
                  : "border-ink/15 hover:border-clay/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {state === "loading" && (
          <p role="status" className="mt-10 text-sm text-ink/60">
            Loading your petitions…
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
              {filter === "created"
                ? "You have not started a petition yet."
                : "You have not signed a petition yet."}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              {filter === "created"
                ? "If something in your area needs changing, put it to the authority."
                : "Petitions you sign will be listed here so you can follow what happens to them."}
            </p>
            <Link
              to={filter === "created" && canCreate ? "/petitions/new" : "/petitions"}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-parchment transition hover:bg-coal"
            >
              {filter === "created" && canCreate ? "Start a petition" : "Browse petitions"}
            </Link>
          </div>
        )}

        {state === "ready" && petitions.length > 0 && (
          <>
            <p className="mt-8 text-sm text-ink/60">
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

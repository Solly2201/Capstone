import { Inbox, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  civicCategories,
  civicCategoryLabels,
  civicPriorities,
  civicQueueSortOptions,
  civicStatusLabels,
  civicStatuses,
  formatCivicLocation,
  isTerminalCivicStatus,
  type CivicQueueResponse,
  type CivicQueueSort,
  type CivicReport,
  type CivicStatus
} from "@cap/contracts";
import { SiteShell } from "../components/SiteShell";
import { StatusBadge } from "../components/StatusBadge";
import { DueBadge } from "../components/StatusHistory";
import { api, apiErrorMessage } from "../lib/api";

type LoadState = "loading" | "ready" | "error";

const sortLabels: Record<CivicQueueSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  due_soonest: "Deadline soonest"
};

// The civic authority queue. Filters map onto the API's validated query
// contract, so the server does the filtering and the screen shows what
// the database matched, not a client-side slice.
export function AuthorityDashboardPage() {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [overdue, setOverdue] = useState(false);
  const [sort, setSort] = useState<CivicQueueSort>("newest");
  const [offset, setOffset] = useState(0);
  const limit = 25;

  // A closed report is never overdue by definition, so the two filters
  // together can only ever match nothing. Keep them mutually exclusive
  // instead of letting the queue answer a contradiction with silence.
  const terminalStatusSelected = status !== "" && isTerminalCivicStatus(status as CivicStatus);

  const hasActiveFilters = Boolean(status || category || priority || overdue);

  // Any filter change starts again from the first page.
  const applyFilter = (apply: () => void) => {
    apply();
    setOffset(0);
  };

  const load = useCallback(async () => {
    setState("loading");
    try {
      const response = await api.get<CivicQueueResponse>("/civic/authority/reports", {
        params: {
          ...(status ? { status } : {}),
          ...(category ? { category } : {}),
          ...(priority ? { priority } : {}),
          ...(overdue ? { overdue: "true" } : {}),
          sort,
          limit,
          offset
        }
      });
      setReports(response.data.reports);
      setTotal(response.data.total);
      setState("ready");
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, "We could not load the report queue. Please try again."));
      setState("error");
    }
  }, [status, category, priority, overdue, sort, offset]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <p className="eyebrow">Civic authority</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Report queue</h1>
        <p className="mt-5 text-lg leading-8 text-ink/70">
          Every citizen report, with its current state and deadline. Actions available on a report depend
          on where it is in the workflow.
        </p>

        <div className="mt-8 grid gap-4 rounded-xl border border-ink/15 bg-white/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm font-semibold">
            Status
            <select
              className="field"
              value={status}
              onChange={(event) =>
                applyFilter(() => {
                  const next = event.target.value;
                  setStatus(next);
                  if (next !== "" && isTerminalCivicStatus(next as CivicStatus)) setOverdue(false);
                })
              }
            >
              <option value="">All statuses</option>
              {civicStatuses.map((value) => (
                <option key={value} value={value}>
                  {civicStatusLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Category
            <select
              className="field"
              value={category}
              onChange={(event) => applyFilter(() => setCategory(event.target.value))}
            >
              <option value="">All categories</option>
              {civicCategories.map((value) => (
                <option key={value} value={value}>
                  {civicCategoryLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Priority
            <select
              className="field"
              value={priority}
              onChange={(event) => applyFilter(() => setPriority(event.target.value))}
            >
              <option value="">All priorities</option>
              {civicPriorities.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Sort
            <select
              className="field"
              value={sort}
              onChange={(event) => applyFilter(() => setSort(event.target.value as CivicQueueSort))}
            >
              {civicQueueSortOptions.map((value) => (
                <option key={value} value={value}>
                  {sortLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label
            className={`flex items-center gap-2 text-sm font-semibold sm:col-span-2 ${
              terminalStatusSelected ? "text-ink/40" : ""
            }`}
          >
            <input
              type="checkbox"
              className="size-4"
              checked={overdue}
              disabled={terminalStatusSelected}
              onChange={(event) => applyFilter(() => setOverdue(event.target.checked))}
            />
            Only past their deadline
            {terminalStatusSelected && (
              <span className="text-xs font-normal">(closed reports are never overdue)</span>
            )}
          </label>
        </div>

        {state === "loading" && (
          <p role="status" className="mt-10 text-sm text-ink/60">
            Loading the queue…
          </p>
        )}

        {state === "error" && (
          <div role="alert" className="mt-10 rounded-xl border border-clay/40 bg-sandstone/50 px-5 py-4 text-sm leading-6">
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 rounded-lg border border-ink/20 px-4 py-2 text-sm font-semibold transition hover:bg-sandstone"
            >
              Try again
            </button>
          </div>
        )}

        {state === "ready" && reports.length === 0 && (
          <div className="mt-10 rounded-xl border border-ink/10 bg-white/60 p-8 text-center">
            <Inbox className="mx-auto text-clay" size={28} aria-hidden="true" />
            {hasActiveFilters ? (
              <>
                <p className="mt-4 font-serif text-xl font-semibold">Nothing matches these filters.</p>
                <p className="mt-2 text-sm leading-6 text-ink/70">Clear a filter to see more of the queue.</p>
              </>
            ) : (
              <>
                <p className="mt-4 font-serif text-xl font-semibold">The queue is empty.</p>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  New citizen reports will appear here as they are submitted.
                </p>
              </>
            )}
          </div>
        )}

        {state === "ready" && reports.length > 0 && (
          <>
            <p className="mt-10 text-sm text-ink/60">
              Showing {offset + 1}&ndash;{offset + reports.length} of {total} report{total === 1 ? "" : "s"}.
            </p>
            <ul className="mt-4 space-y-4">
              {reports.map((report) => (
                <li key={report.id}>
                  <Link
                    to={`/authority/reports/${report.id}`}
                    className="block rounded-xl border border-ink/10 bg-white/60 p-4 transition hover:border-clay/50 hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={report.status} />
                      <DueBadge report={report} />
                      <span className="text-xs font-semibold uppercase tracking-wide text-clay">
                        {civicCategoryLabels[report.category]}
                      </span>
                      <span className="text-xs text-ink/50">Priority: {report.priority}</span>
                    </div>
                    <p className="mt-2 font-serif text-lg font-semibold">{report.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/60">
                      <MapPin size={13} aria-hidden="true" />
                      {formatCivicLocation(report)}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">
                      Submitted {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            {total > limit && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-semibold transition hover:bg-sandstone disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <p className="text-sm text-ink/60">
                  Page {Math.floor(offset / limit) + 1} of {Math.max(1, Math.ceil(total / limit))}
                </p>
                <button
                  type="button"
                  disabled={offset + limit >= total}
                  onClick={() => setOffset(offset + limit)}
                  className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-semibold transition hover:bg-sandstone disabled:cursor-not-allowed disabled:opacity-50"
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

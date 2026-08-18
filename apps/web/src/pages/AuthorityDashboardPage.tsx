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
  type CivicQueueResponse,
  type CivicQueueSort,
  type CivicReport
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

/**
 * The civic authority queue.
 *
 * Filters map one-to-one onto the API's validated query contract; the
 * server does the filtering, so what is on screen is what the database
 * matched rather than a client-side slice of an unbounded list.
 */
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

  const load = useCallback(async () => {
    setState("loading");
    try {
      const response = await api.get<CivicQueueResponse>("/civic/authority/reports", {
        params: {
          ...(status ? { status } : {}),
          ...(category ? { category } : {}),
          ...(priority ? { priority } : {}),
          ...(overdue ? { overdue: "true" } : {}),
          sort
        }
      });
      setReports(response.data.reports);
      setTotal(response.data.total);
      setState("ready");
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, "We could not load the report queue. Please try again."));
      setState("error");
    }
  }, [status, category, priority, overdue, sort]);

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
            <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
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
            <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
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
            <select className="field" value={priority} onChange={(event) => setPriority(event.target.value)}>
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
              onChange={(event) => setSort(event.target.value as CivicQueueSort)}
            >
              {civicQueueSortOptions.map((value) => (
                <option key={value} value={value}>
                  {sortLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
            <input
              type="checkbox"
              className="size-4"
              checked={overdue}
              onChange={(event) => setOverdue(event.target.checked)}
            />
            Only past their deadline
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

        {state === "ready" && reports.length === 0 && (
          <div className="mt-10 rounded-xl border border-ink/10 bg-white/60 p-8 text-center">
            <Inbox className="mx-auto text-clay" size={28} aria-hidden="true" />
            <p className="mt-4 font-serif text-xl font-semibold">Nothing matches these filters.</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">Clear a filter to see more of the queue.</p>
          </div>
        )}

        {state === "ready" && reports.length > 0 && (
          <>
            <p className="mt-10 text-sm text-ink/60">
              Showing {reports.length} of {total} report{total === 1 ? "" : "s"}.
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
          </>
        )}
      </section>
    </SiteShell>
  );
}

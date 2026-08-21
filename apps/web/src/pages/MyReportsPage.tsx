import { ImageOff, MapPin, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  civicCategoryLabels,
  civicStatusLabels,
  formatCivicLocation,
  type CivicReport,
  type CivicReportListResponse
} from "@cap/contracts";
import { AuthedImage } from "../components/AuthedImage";
import { SiteShell } from "../components/SiteShell";
import { StatusBadge } from "../components/StatusBadge";
import { DueBadge } from "../components/StatusHistory";
import { api, apiErrorMessage } from "../lib/api";

type Status = "loading" | "ready" | "error";

export function MyReportsPage() {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await api.get<CivicReportListResponse>("/civic/reports/mine");
      setReports(response.data.reports);
      setStatus("ready");
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, "We could not load your reports. Please try again."));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Module 2 &middot; Civic reporting</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">My reports</h1>
          </div>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-parchment transition hover:bg-coal"
          >
            <Plus size={17} aria-hidden="true" /> New report
          </Link>
        </div>

        {status === "loading" && (
          <p role="status" className="mt-10 text-sm text-ink/60">
            Loading your reports…
          </p>
        )}

        {status === "error" && (
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

        {status === "ready" && reports.length === 0 && (
          <div className="mt-10 rounded-xl border border-ink/10 bg-white/60 p-8 text-center">
            <p className="font-serif text-xl font-semibold">You have not reported anything yet.</p>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              When you report a civic issue it will appear here so you can follow its status.
            </p>
            <Link
              to="/report"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-parchment transition hover:bg-coal"
            >
              <Plus size={17} aria-hidden="true" /> Report an issue
            </Link>
          </div>
        )}

        {status === "ready" && reports.length > 0 && (
          <ul className="mt-10 space-y-4">
            {reports.map((report) => (
              <li key={report.id}>
                <Link
                  to={`/reports/${report.id}`}
                  className="flex gap-4 rounded-xl border border-ink/10 bg-white/60 p-4 transition hover:border-clay/50 hover:shadow-sm"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-sandstone/60">
                    {report.media.length > 0 ? (
                      <AuthedImage
                        path={report.media[0].url}
                        alt={`Photo attached to ${report.title}`}
                        className="size-20 object-cover"
                      />
                    ) : (
                      <span className="grid size-20 place-items-center text-ink/30">
                        <ImageOff size={20} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={report.status} />
                      <DueBadge report={report} />
                      <span className="text-xs font-semibold uppercase tracking-wide text-clay">
                        {civicCategoryLabels[report.category]}
                      </span>
                      <span className="text-xs text-ink/50">Priority: {report.priority}</span>
                    </div>
                    <p className="mt-2 truncate font-serif text-lg font-semibold">{report.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/60">
                      <MapPin size={13} aria-hidden="true" />
                      {formatCivicLocation(report)}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">
                      Submitted {new Date(report.createdAt).toLocaleDateString()} &middot;{" "}
                      {civicStatusLabels[report.status]}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </SiteShell>
  );
}

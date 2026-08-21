import { ArrowLeft, MapPin, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  civicCategoryLabels,
  formatCivicLocation,
  type CivicReport,
  type CivicReportResponse
} from "@cap/contracts";
import { AuthedImage } from "../components/AuthedImage";
import { SiteShell } from "../components/SiteShell";
import { StatusBadge } from "../components/StatusBadge";
import { DueBadge, StatusHistory } from "../components/StatusHistory";
import { api, apiErrorMessage, apiErrorStatus } from "../lib/api";

type Status = "loading" | "ready" | "missing" | "error";

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<CivicReport | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.get<CivicReportResponse>(`/civic/reports/${id}`);
      setReport(response.data.report);
      setStatus("ready");
    } catch (error) {
      // The API answers 404 for both "no such report" and "not yours",
      // so the UI cannot distinguish them either.
      if (apiErrorStatus(error) === 404) {
        setStatus("missing");
        return;
      }
      setErrorMessage(apiErrorMessage(error, "We could not load this report. Please try again."));
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // The authority moves a report while the citizen watches this page;
  // nothing pushes that change, so give them a way to pull it.
  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <Link
          to="/reports/mine"
          className="inline-flex items-center gap-2 text-sm font-bold text-clay underline-offset-4 hover:underline"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to my reports
        </Link>

        {status === "loading" && (
          <p role="status" className="mt-10 text-sm text-ink/60">
            Loading report…
          </p>
        )}

        {status === "missing" && (
          <div className="mt-10 rounded-xl border border-ink/15 bg-white/60 p-6">
            <h1 className="font-serif text-2xl font-semibold">Report not found</h1>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              This report does not exist, or it belongs to another account.
            </p>
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="mt-10 rounded-xl border border-clay/40 bg-sandstone/50 px-5 py-4 text-sm leading-6">
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                void load();
              }}
              className="mt-3 rounded-lg border border-ink/20 px-4 py-2 text-sm font-semibold transition hover:bg-sandstone"
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && report && (
          <article className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} />
              <DueBadge report={report} />
              <span className="text-xs font-semibold uppercase tracking-wide text-clay">
                {civicCategoryLabels[report.category]}
              </span>
              <span className="text-xs text-ink/50">Priority: {report.priority}</span>
            </div>

            <h1 className="mt-4 font-serif text-4xl font-semibold">{report.title}</h1>

            <p className="mt-4 flex items-center gap-1.5 text-sm text-ink/70">
              <MapPin size={15} aria-hidden="true" />
              {formatCivicLocation(report)}
            </p>

            <p className="mt-6 whitespace-pre-line text-base leading-7 text-ink/90">{report.description}</p>

            {report.media.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-wide text-clay">Photo</p>
                <div className="mt-3 overflow-hidden rounded-xl border border-ink/10">
                  <AuthedImage
                    path={report.media[0].url}
                    alt={`Photo attached to ${report.title}`}
                    className="w-full object-cover"
                  />
                </div>
              </div>
            )}

            <dl className="mt-8 grid gap-4 border-t border-ink/10 pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-clay">Coordinates</dt>
                <dd className="mt-1 text-sm text-ink/80">
                  {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </dd>
              </div>
              {report.landmark && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-clay">Landmark</dt>
                  <dd className="mt-1 text-sm text-ink/80">{report.landmark}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-clay">Submitted</dt>
                <dd className="mt-1 text-sm text-ink/80">{new Date(report.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-clay">Last updated</dt>
                <dd className="mt-1 text-sm text-ink/80">{new Date(report.updatedAt).toLocaleString()}</dd>
              </div>
              {report.dueAt && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-clay">Target date</dt>
                  <dd className="mt-1 text-sm text-ink/80">{new Date(report.dueAt).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>

            <section className="mt-10 border-t border-ink/10 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-xl font-semibold">What has happened so far</h2>
                <button
                  type="button"
                  disabled={refreshing}
                  onClick={() => void refresh()}
                  className="inline-flex items-center gap-2 rounded-lg border border-ink/20 px-3 py-2 text-xs font-semibold transition hover:bg-sandstone disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw size={13} aria-hidden="true" />
                  {refreshing ? "Refreshing…" : "Check for updates"}
                </button>
              </div>
              <div className="mt-4">
                <StatusHistory history={report.history} />
              </div>
            </section>

            <p className="mt-8 text-xs leading-5 text-ink/55">
              Status changes are made by the responsible civic authority. Any reason they record is shown
              above.
            </p>
          </article>
        )}
      </section>
    </SiteShell>
  );
}

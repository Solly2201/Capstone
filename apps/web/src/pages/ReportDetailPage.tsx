import { ArrowLeft, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
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
import { api, apiErrorMessage, apiErrorStatus } from "../lib/api";

type Status = "loading" | "ready" | "missing" | "error";

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<CivicReport | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    api
      .get<CivicReportResponse>(`/civic/reports/${id}`)
      .then((response) => {
        if (!active) return;
        setReport(response.data.report);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        // The API answers 404 for both "no such report" and "not yours",
        // deliberately -- so the UI cannot distinguish them either.
        if (apiErrorStatus(error) === 404) {
          setStatus("missing");
          return;
        }
        setErrorMessage(apiErrorMessage(error, "We could not load this report. Please try again."));
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [id]);

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
          <p role="alert" className="mt-10 rounded-xl border border-clay/40 bg-sandstone/50 px-5 py-4 text-sm leading-6">
            {errorMessage}
          </p>
        )}

        {status === "ready" && report && (
          <article className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} />
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
            </dl>

            <p className="mt-8 text-xs leading-5 text-ink/55">
              Status changes are made by the responsible authority. This milestone records and tracks
              reports; the authority review workflow is not built yet.
            </p>
          </article>
        )}
      </section>
    </SiteShell>
  );
}

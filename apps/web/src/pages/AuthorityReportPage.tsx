import { ArrowLeft, MapPin } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  civicCategoryLabels,
  civicPriorities,
  civicTransitionsFor,
  formatCivicLocation,
  type CivicPriority,
  type CivicReport,
  type CivicReportResponse,
  type CivicStatus
} from "@cap/contracts";
import { useAuth } from "../auth/AuthContext";
import { AuthedImage } from "../components/AuthedImage";
import { SiteShell } from "../components/SiteShell";
import { StatusBadge } from "../components/StatusBadge";
import { DueBadge, StatusHistory } from "../components/StatusHistory";
import { api, apiErrorMessage, apiErrorStatus } from "../lib/api";

type LoadState = "loading" | "ready" | "missing" | "error";

/**
 * Authority view of a single report, with the actions available from its
 * current state.
 *
 * The action list comes from the shared transition table, so the buttons
 * on screen are exactly the moves the API will accept -- there is no
 * separate frontend notion of what is allowed. The API re-checks every
 * one of them regardless.
 */
export function AuthorityReportPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [report, setReport] = useState<CivicReport | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [pendingStatus, setPendingStatus] = useState<CivicStatus | null>(null);
  const [note, setNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [priority, setPriority] = useState<CivicPriority>("MEDIUM");

  useEffect(() => {
    if (!id) return;
    let active = true;

    api
      .get<CivicReportResponse>(`/civic/reports/${id}`)
      .then((response) => {
        if (!active) return;
        setReport(response.data.report);
        setPriority(response.data.report.priority);
        setState("ready");
      })
      .catch((error) => {
        if (!active) return;
        if (apiErrorStatus(error) === 404) {
          setState("missing");
          return;
        }
        setErrorMessage(apiErrorMessage(error, "We could not load this report. Please try again."));
        setState("error");
      });

    return () => {
      active = false;
    };
  }, [id]);

  const available = report && user ? civicTransitionsFor(report.status, user.role) : [];
  const selectedRule = available.find((rule) => rule.to === pendingStatus);

  async function performTransition(event: FormEvent) {
    event.preventDefault();
    if (!report || !pendingStatus) return;

    setWorking(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const response = await api.post<CivicReportResponse>(`/civic/reports/${report.id}/transitions`, {
        status: pendingStatus,
        ...(note.trim() ? { note: note.trim() } : {})
      });
      setReport(response.data.report);
      setActionSuccess("Report updated.");
      setPendingStatus(null);
      setNote("");
    } catch (error) {
      setActionError(apiErrorMessage(error, "That action could not be completed."));
    } finally {
      setWorking(false);
    }
  }

  async function changePriority(next: CivicPriority) {
    if (!report || next === report.priority) return;

    setWorking(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const response = await api.patch<CivicReportResponse>(`/civic/reports/${report.id}/priority`, {
        priority: next
      });
      setReport(response.data.report);
      setPriority(response.data.report.priority);
      setActionSuccess("Priority updated. The deadline has moved accordingly.");
    } catch (error) {
      setPriority(report.priority);
      setActionError(apiErrorMessage(error, "Priority could not be changed."));
    } finally {
      setWorking(false);
    }
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <Link
          to="/authority"
          className="inline-flex items-center gap-2 text-sm font-bold text-clay underline-offset-4 hover:underline"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to the queue
        </Link>

        {state === "loading" && (
          <p role="status" className="mt-10 text-sm text-ink/60">
            Loading report…
          </p>
        )}

        {state === "missing" && (
          <div className="mt-10 rounded-xl border border-ink/15 bg-white/60 p-6">
            <h1 className="font-serif text-2xl font-semibold">Report not found</h1>
            <p className="mt-3 text-sm leading-6 text-ink/70">This report does not exist.</p>
          </div>
        )}

        {state === "error" && (
          <p role="alert" className="mt-10 rounded-xl border border-clay/40 bg-sandstone/50 px-5 py-4 text-sm leading-6">
            {errorMessage}
          </p>
        )}

        {state === "ready" && report && (
          <article className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} />
              <DueBadge report={report} />
              <span className="text-xs font-semibold uppercase tracking-wide text-clay">
                {civicCategoryLabels[report.category]}
              </span>
            </div>

            <h1 className="mt-4 font-serif text-4xl font-semibold">{report.title}</h1>
            <p className="mt-4 flex items-center gap-1.5 text-sm text-ink/70">
              <MapPin size={15} aria-hidden="true" />
              {formatCivicLocation(report)} · {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
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
                <p className="mt-2 text-xs text-ink/50">
                  Embedded metadata was removed before this image was stored.
                </p>
              </div>
            )}

            <section className="mt-10 rounded-xl border border-ink/15 bg-white/50 p-5">
              <h2 className="font-serif text-xl font-semibold">Actions</h2>

              {actionSuccess && (
                <p role="status" className="mt-4 rounded-lg border border-sage/40 bg-white/70 px-4 py-3 text-sm">
                  {actionSuccess}
                </p>
              )}
              {actionError && (
                <p role="alert" className="mt-4 rounded-lg border border-clay/40 bg-sandstone/50 px-4 py-3 text-sm">
                  {actionError}
                </p>
              )}

              <label className="mt-5 block text-sm font-semibold">
                Priority
                <select
                  className="field"
                  value={priority}
                  disabled={working}
                  onChange={(event) => {
                    const next = event.target.value as CivicPriority;
                    setPriority(next);
                    void changePriority(next);
                  }}
                >
                  {civicPriorities.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              {available.length === 0 ? (
                <p className="mt-5 text-sm leading-6 text-ink/60">
                  This report is closed. No further transitions are available to your role.
                </p>
              ) : (
                <form className="mt-5 space-y-4" onSubmit={performTransition}>
                  <fieldset>
                    <legend className="text-sm font-semibold">Move this report</legend>
                    <div className="mt-3 space-y-2">
                      {available.map((rule) => (
                        <label key={rule.to} className="flex items-start gap-2 text-sm">
                          <input
                            type="radio"
                            name="transition"
                            className="mt-1"
                            value={rule.to}
                            checked={pendingStatus === rule.to}
                            onChange={() => setPendingStatus(rule.to)}
                          />
                          <span>
                            {rule.label}
                            {rule.requiresNote && <span className="text-ink/50"> (reason required)</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="block text-sm font-semibold">
                    Note {selectedRule?.requiresNote ? "" : <span className="font-normal text-ink/55">(optional)</span>}
                    <textarea
                      className="field resize-y"
                      rows={3}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Explain the decision. This is visible to the citizen who reported it."
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={working || !pendingStatus || (selectedRule?.requiresNote === true && note.trim().length < 3)}
                    className="rounded-lg bg-ink px-5 py-3 text-sm font-bold text-parchment transition hover:bg-coal disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {working ? "Applying…" : "Apply action"}
                  </button>
                </form>
              )}
            </section>

            <section className="mt-10">
              <h2 className="font-serif text-xl font-semibold">History</h2>
              <div className="mt-4">
                <StatusHistory history={report.history} />
              </div>
            </section>
          </article>
        )}
      </section>
    </SiteShell>
  );
}

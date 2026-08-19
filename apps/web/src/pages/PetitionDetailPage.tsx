import { ArrowLeft, Check, PenLine } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  petitionCapabilityFor,
  petitionCapabilityLabels,
  petitionCategoryLabels,
  petitionStatusLabels,
  petitionTransitionsFor,
  type Petition,
  type PetitionResponse,
  type PetitionSignatureResponse,
  type PetitionStatus
} from "@cap/contracts";
import { useAuth } from "../auth/AuthContext";
import { PetitionProgress, PetitionStatusBadge } from "../components/PetitionProgress";
import { SiteShell } from "../components/SiteShell";
import { api, apiErrorMessage, apiErrorStatus } from "../lib/api";

type LoadState = "loading" | "ready" | "missing" | "error";

/**
 * A single petition, for everybody.
 *
 * One page rather than a public view plus a near-identical staff view,
 * because the difference between the two is entirely "which actions are
 * available", and that answer already exists in the shared transition
 * table. Rendering `petitionTransitionsFor(status, capability)` means
 * the buttons on screen are exactly the moves the API will accept, and
 * a reader with no capability simply sees no action panel.
 *
 * None of this is a security boundary: the API independently derives the
 * same capability from the token and the stored creator id, and
 * re-authorises every action behind it.
 */
export function PetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [petition, setPetition] = useState<Petition | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<PetitionStatus | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;

    api
      .get<PetitionResponse>(`/petitions/${id}`)
      .then((response) => {
        if (!active) return;
        setPetition(response.data.petition);
        setState("ready");
      })
      .catch((error) => {
        if (!active) return;
        if (apiErrorStatus(error) === 404) {
          setState("missing");
          return;
        }
        setErrorMessage(apiErrorMessage(error, "We could not load this petition. Please try again."));
        setState("error");
      });

    return () => {
      active = false;
    };
  }, [id]);

  const isCreator = Boolean(user && petition && user.id === petition.creatorId);
  const capability = user && petition ? petitionCapabilityFor(user.role, isCreator) : null;
  const available = petition ? petitionTransitionsFor(petition.status, capability) : [];
  const selectedRule = available.find((rule) => rule.to === pendingStatus);

  const isCitizen = user?.role === "CITIZEN";
  const isOpen = petition?.status === "OPEN";

  const resetFeedback = () => {
    setActionError(null);
    setActionSuccess(null);
  };

  async function sign() {
    if (!petition) return;
    setWorking(true);
    resetFeedback();
    try {
      const response = await api.post<PetitionSignatureResponse>(`/petitions/${petition.id}/signatures`);
      setPetition(response.data.petition);
      setActionSuccess("Your signature has been recorded.");
    } catch (error) {
      setActionError(apiErrorMessage(error, "Your signature could not be recorded."));
    } finally {
      setWorking(false);
    }
  }

  async function withdrawSignature() {
    if (!petition) return;
    setWorking(true);
    resetFeedback();
    try {
      const response = await api.delete<PetitionSignatureResponse>(
        `/petitions/${petition.id}/signatures/me`
      );
      setPetition(response.data.petition);
      setActionSuccess("Your signature has been withdrawn.");
    } catch (error) {
      setActionError(apiErrorMessage(error, "Your signature could not be withdrawn."));
    } finally {
      setWorking(false);
    }
  }

  async function performTransition(event: FormEvent) {
    event.preventDefault();
    if (!petition || !pendingStatus) return;

    setWorking(true);
    resetFeedback();
    try {
      const response = await api.post<PetitionResponse>(`/petitions/${petition.id}/transitions`, {
        status: pendingStatus,
        ...(note.trim() ? { note: note.trim() } : {})
      });
      setPetition(response.data.petition);
      setActionSuccess("Petition updated.");
      setPendingStatus(null);
      setNote("");
    } catch (error) {
      setActionError(apiErrorMessage(error, "That action could not be completed."));
    } finally {
      setWorking(false);
    }
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <Link
          to="/petitions"
          className="inline-flex items-center gap-2 text-sm font-bold text-clay underline-offset-4 hover:underline"
        >
          <ArrowLeft size={16} aria-hidden="true" /> All petitions
        </Link>

        {state === "loading" && (
          <p role="status" className="mt-10 text-sm text-ink/60">
            Loading petition…
          </p>
        )}

        {state === "missing" && (
          <div className="mt-10 rounded-xl border border-ink/15 bg-white/60 p-6">
            <h1 className="font-serif text-2xl font-semibold">Petition not found</h1>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              This petition does not exist, or is no longer publicly available.
            </p>
          </div>
        )}

        {state === "error" && (
          <p role="alert" className="mt-10 rounded-xl border border-clay/40 bg-sandstone/50 px-5 py-4 text-sm leading-6">
            {errorMessage}
          </p>
        )}

        {state === "ready" && petition && (
          <article className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <PetitionStatusBadge status={petition.status} />
              <span className="text-xs font-semibold uppercase tracking-wide text-clay">
                {petitionCategoryLabels[petition.category]}
              </span>
              {isCreator && (
                <span className="rounded-full border border-ink/20 px-2.5 py-0.5 text-xs font-bold text-ink/70">
                  Your petition
                </span>
              )}
            </div>

            <h1 className="mt-4 font-serif text-4xl font-semibold">{petition.title}</h1>
            <p className="mt-3 text-sm text-ink/60">
              Started by {petition.creatorName} on {new Date(petition.createdAt).toLocaleDateString()}
            </p>

            <div className="mt-8 rounded-xl border border-ink/15 bg-white/50 p-5">
              <PetitionProgress petition={petition} />

              {actionSuccess && (
                <p role="status" className="mt-5 rounded-lg border border-sage/40 bg-white/70 px-4 py-3 text-sm">
                  {actionSuccess}
                </p>
              )}
              {actionError && (
                <p role="alert" className="mt-5 rounded-lg border border-clay/40 bg-sandstone/50 px-4 py-3 text-sm">
                  {actionError}
                </p>
              )}

              {!user && isOpen && (
                <p className="mt-5 text-sm leading-6 text-ink/70">
                  <Link to="/login" className="font-semibold text-clay underline underline-offset-4">
                    Log in
                  </Link>{" "}
                  to sign this petition. Each account can sign once.
                </p>
              )}

              {user && !isCitizen && isOpen && (
                <p className="mt-5 text-sm leading-6 text-ink/70">
                  Authority accounts do not sign petitions — you are the body being petitioned.
                </p>
              )}

              {isCitizen && isOpen && !petition.hasSigned && (
                <button
                  type="button"
                  disabled={working}
                  onClick={() => void sign()}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-parchment transition hover:bg-coal disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <PenLine size={16} aria-hidden="true" />
                  {working ? "Signing…" : "Sign this petition"}
                </button>
              )}

              {isCitizen && petition.hasSigned && (
                <div className="mt-5">
                  <p className="inline-flex items-center gap-2 rounded-lg border border-sage/50 bg-sage/10 px-4 py-3 text-sm font-semibold text-sage">
                    <Check size={16} aria-hidden="true" /> You have signed this petition
                  </p>
                  {isOpen && (
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void withdrawSignature()}
                      className="ml-3 rounded-lg border border-ink/20 px-4 py-3 text-sm font-semibold transition hover:bg-sandstone disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {working ? "Withdrawing…" : "Withdraw my signature"}
                    </button>
                  )}
                </div>
              )}

              {!isOpen && (
                <p className="mt-5 text-sm leading-6 text-ink/70">
                  This petition is {petitionStatusLabels[petition.status].toLowerCase()} and is no longer
                  collecting signatures.
                </p>
              )}
            </div>

            <div className="mt-10">
              <h2 className="font-serif text-xl font-semibold">What this petition asks for</h2>
              <p className="mt-4 whitespace-pre-line text-base leading-7 text-ink/90">
                {petition.description}
              </p>
            </div>

            {available.length > 0 && (
              <section className="mt-10 rounded-xl border border-ink/15 bg-white/50 p-5">
                <h2 className="font-serif text-xl font-semibold">Actions</h2>
                <p className="mt-2 text-sm leading-6 text-ink/60">
                  Available to you as {capability ? petitionCapabilityLabels[capability] : ""}.
                </p>

                <form className="mt-5 space-y-4" onSubmit={performTransition}>
                  <fieldset>
                    <legend className="text-sm font-semibold">Move this petition</legend>
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
                    Reason{" "}
                    {selectedRule?.requiresNote ? "" : <span className="font-normal text-ink/55">(optional)</span>}
                    <textarea
                      className="field resize-y"
                      rows={3}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="This is published on the petition for everyone to read."
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={
                      working ||
                      !pendingStatus ||
                      (selectedRule?.requiresNote === true && note.trim().length < 3)
                    }
                    className="rounded-lg bg-ink px-5 py-3 text-sm font-bold text-parchment transition hover:bg-coal disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {working ? "Applying…" : "Apply action"}
                  </button>
                </form>
              </section>
            )}

            <section className="mt-10">
              <h2 className="font-serif text-xl font-semibold">History</h2>
              {petition.history.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-ink/60">
                  Nothing has happened to this petition yet.
                </p>
              ) : (
                <ol className="mt-4 space-y-4">
                  {petition.history.map((entry, index) => (
                    <li key={`${entry.at}-${index}`} className="border-l-2 border-clay/40 pl-4">
                      <p className="text-sm font-semibold">
                        {petitionStatusLabels[entry.from]} → {petitionStatusLabels[entry.to]}
                      </p>
                      <p className="mt-1 text-xs text-ink/55">
                        {new Date(entry.at).toLocaleString()} · by{" "}
                        {petitionCapabilityLabels[entry.actorCapability]}
                        {entry.actorId ? ` (${entry.actorId})` : ""}
                      </p>
                      {entry.note && <p className="mt-2 text-sm leading-6 text-ink/80">{entry.note}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </article>
        )}
      </section>
    </SiteShell>
  );
}

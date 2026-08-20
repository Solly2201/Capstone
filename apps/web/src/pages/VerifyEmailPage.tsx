import { CheckCircle2, MailCheck } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { VerifyEmailResponse } from "@cap/contracts";
import { api, apiErrorMessage } from "../lib/api";

type Status = "idle" | "verifying" | "verified" | "error";

// Completes the email-verification challenge. Reads the token from the
// query string and verifies it on mount; with no token, falls back to
// requesting a fresh challenge by email address.
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "verifying" : "idle");
  const [message, setMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendToken, setResendToken] = useState<string | null>(null);
  const attempted = useRef<string | null>(null);

  useEffect(() => {
    if (!token || attempted.current === token) return;
    attempted.current = token;
    setStatus("verifying");

    api
      .post<VerifyEmailResponse>("/auth/verify-email", { token })
      .then((response) => {
        setStatus("verified");
        setMessage(response.data.message);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(apiErrorMessage(error, "We could not verify this link. Request a new one below."));
      });
  }, [token]);

  async function handleResend(event: FormEvent) {
    event.preventDefault();
    if (!resendEmail.trim()) return;
    setResendState("sending");
    setResendToken(null);
    try {
      const response = await api.post<{ message: string; verification?: { token: string } }>(
        "/auth/resend-verification",
        { email: resendEmail.trim() }
      );
      setResendState("sent");
      setResendMessage(response.data.message);
      // Development behaviour only -- see services/api/src/lib/email-verification.ts.
      setResendToken(response.data.verification?.token ?? null);
    } catch (error) {
      setResendState("error");
      setResendMessage(apiErrorMessage(error, "We could not issue a new verification link. Try again."));
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-parchment px-5 py-12">
      <div className="w-full max-w-md">
        <span className="grid size-11 place-items-center rounded-xl bg-ink text-parchment">
          <MailCheck size={21} aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-serif text-4xl font-semibold">Verify your email</h1>

        {status === "verifying" && (
          <p role="status" className="mt-5 text-sm leading-6 text-ink/70">
            Verifying your link…
          </p>
        )}

        {status === "verified" && (
          <>
            <p className="mt-5 flex items-start gap-2 rounded-lg border border-sage/40 bg-white/70 px-4 py-3 text-sm leading-6">
              <CheckCircle2 className="mt-0.5 shrink-0 text-sage" size={18} aria-hidden="true" />
              {message}
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex rounded-lg bg-ink px-5 py-3 text-sm font-bold text-parchment transition hover:bg-coal"
            >
              Sign in
            </Link>
          </>
        )}

        {(status === "idle" || status === "error") && (
          <>
            {status === "error" && (
              <p role="alert" className="mt-5 rounded-lg border border-clay/30 bg-sandstone/50 px-4 py-3 text-sm leading-6">
                {message}
              </p>
            )}
            <p className="mt-5 text-sm leading-6 text-ink/70">
              Enter the address you registered with and we will issue a fresh verification link.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleResend} noValidate>
              <label className="block text-sm font-semibold">
                Email
                <input
                  className="field"
                  type="email"
                  value={resendEmail}
                  onChange={(event) => setResendEmail(event.target.value)}
                  autoComplete="email"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-lg bg-ink px-5 py-3.5 text-sm font-bold text-parchment transition hover:bg-coal disabled:cursor-not-allowed disabled:opacity-60"
                disabled={resendState === "sending" || resendEmail.trim().length === 0}
              >
                {resendState === "sending" ? "Sending…" : "Send a new link"}
              </button>
            </form>

            {resendMessage && (
              <p role="status" className="mt-5 rounded-lg border border-ink/15 bg-white/70 px-4 py-3 text-sm leading-6">
                {resendMessage}
              </p>
            )}

            {resendToken && (
              <p className="mt-4 rounded-lg border border-clay/30 bg-sandstone/40 px-4 py-3 text-xs leading-5">
                Development mode: no email is sent by this project, so the link is shown here.{" "}
                <Link
                  to={`/verify-email?token=${encodeURIComponent(resendToken)}`}
                  className="font-semibold text-clay underline underline-offset-4"
                >
                  Verify now
                </Link>
              </p>
            )}
          </>
        )}

        <p className="mt-10 text-sm text-ink/70">
          <Link to="/" className="font-semibold text-clay underline underline-offset-4">
            Back to CAP
          </Link>
        </p>
      </div>
    </main>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { loginSchema, type LoginInput } from "@cap/contracts";
import { useAuth } from "../auth/AuthContext";
import { apiErrorMessage, apiErrorReason } from "../lib/api";

export function LoginPage() {
  const { login, status, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [needsVerification, setNeedsVerification] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  // Where the user was headed before ProtectedRoute intercepted them.
  const from = (location.state as { from?: string } | null)?.from ?? "/account";

  if (status === "authenticated") return <Navigate to={from} replace />;

  const onSubmit = async (values: LoginInput) => {
    setNeedsVerification(false);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (error) {
      if (apiErrorReason(error) === "email_not_verified") setNeedsVerification(true);
      setError("root", { message: apiErrorMessage(error, "We could not sign you in. Try again.") });
    }
  };

  return (
    <main className="grid min-h-screen bg-parchment lg:grid-cols-2">
      <section className="hidden bg-ink p-10 text-parchment lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-parchment/75 hover:text-parchment"><ArrowLeft size={17} aria-hidden="true" /> Back to CAP</Link>
        <div className="max-w-md">
          <p className="eyebrow text-sandstone">Secure access</p>
          <h1 className="mt-5 font-serif text-5xl font-semibold leading-tight">One account for your civic participation.</h1>
          <p className="mt-6 text-base leading-7 text-parchment/75">Citizens, Authorities and Admins receive role-appropriate access. Legal information remains educational, source-grounded and never personal legal advice.</p>
        </div>
        <p className="text-sm text-parchment/60">Citizen Assistance Technology</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-clay lg:hidden"><ArrowLeft size={17} aria-hidden="true" /> Back to CAP</Link>
          <span className="mt-10 grid size-11 place-items-center rounded-xl bg-ink text-parchment lg:mt-0"><LockKeyhole size={21} aria-hidden="true" /></span>
          <h2 className="mt-6 font-serif text-4xl font-semibold">Welcome back</h2>
          <p className="mt-3 text-sm leading-6 text-ink/70">Use a verified account to access your dashboard.</p>
          {sessionExpired && (
            <p role="status" className="mt-5 rounded-lg border border-clay/30 bg-sandstone/50 px-4 py-3 text-sm leading-6">
              Your session expired, so you were signed out. Log in again to continue where you left
              off.
            </p>
          )}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="block text-sm font-semibold">Email
              <input className="field" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </label>
            <label className="block text-sm font-semibold">Password
              <input className="field" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </label>
            {errors.root && (
              <p role="alert" className="rounded-lg border border-clay/30 bg-sandstone/50 px-4 py-3 text-sm leading-6 text-ink">
                {errors.root.message}
                {needsVerification && (
                  <>
                    {" "}
                    <Link to="/verify-email" className="font-semibold text-clay underline underline-offset-4">
                      Verify your email
                    </Link>
                    .
                  </>
                )}
              </p>
            )}
            <button className="w-full rounded-lg bg-ink px-5 py-3.5 text-sm font-bold text-parchment transition hover:bg-coal disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Log in"}</button>
          </form>
          <p className="mt-8 text-sm text-ink/70">
            New here?{" "}
            <Link to="/register" className="font-semibold text-clay underline underline-offset-4">
              Create an account
            </Link>
          </p>
          <p className="mt-4 text-xs leading-5 text-ink/60">Demo accounts are documented in the project README. New accounts require email verification and acceptance of the legal-information disclaimer.</p>
        </div>
      </section>
    </main>
  );
}

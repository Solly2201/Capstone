import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { disclaimerText, registerSchema, type RegisterInput } from "@cap/contracts";
import { useAuth } from "../auth/AuthContext";
import { apiErrorMessage } from "../lib/api";

export function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [mailSent, setMailSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterInput) => {
    try {
      const result = await registerAccount(values);
      if (result.verification) {
        // Development behaviour: the API returns the verification token
        // directly because this project has no mail transport. Carry it
        // straight to the verification screen so the flow is completable.
        navigate(`/verify-email?token=${encodeURIComponent(result.verification.token)}`, { replace: true });
        return;
      }
      setMailSent(true);
    } catch (error) {
      setError("root", { message: apiErrorMessage(error, "We could not create your account. Try again.") });
    }
  };

  if (mailSent) {
    return (
      <main className="grid min-h-screen place-items-center bg-parchment px-5 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-serif text-4xl font-semibold">Confirm your email</h1>
          <p className="mt-4 text-sm leading-6 text-ink/70">
            Your account has been created. Open the verification link sent to your email address to
            activate it, then sign in.
          </p>
          <Link to="/login" className="mt-8 inline-flex rounded-lg bg-ink px-5 py-3 text-sm font-bold text-parchment hover:bg-coal">
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen bg-parchment lg:grid-cols-2">
      <section className="hidden bg-ink p-10 text-parchment lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-parchment/75 hover:text-parchment">
          <ArrowLeft size={17} aria-hidden="true" /> Back to CAP
        </Link>
        <div className="max-w-md">
          <p className="eyebrow text-sandstone">Create an account</p>
          <h1 className="mt-5 font-serif text-5xl font-semibold leading-tight">Join as a citizen.</h1>
          <p className="mt-6 text-base leading-7 text-parchment/75">
            An account is only needed for personal features. Legal information stays public and free
            to read without signing in.
          </p>
        </div>
        <p className="text-sm text-parchment/60">Citizen Assistance Technology</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-clay lg:hidden">
            <ArrowLeft size={17} aria-hidden="true" /> Back to CAP
          </Link>
          <span className="mt-10 grid size-11 place-items-center rounded-xl bg-ink text-parchment lg:mt-0">
            <UserPlus size={21} aria-hidden="true" />
          </span>
          <h2 className="mt-6 font-serif text-4xl font-semibold">Create your account</h2>
          <p className="mt-3 text-sm leading-6 text-ink/70">Citizen accounts are created here. Authority and admin accounts are provisioned separately.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="block text-sm font-semibold">
              Full name
              <input className="field" type="text" autoComplete="name" {...register("fullName")} />
              {errors.fullName && <span className="error-text">{errors.fullName.message}</span>}
            </label>
            <label className="block text-sm font-semibold">
              Email
              <input className="field" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </label>
            <label className="block text-sm font-semibold">
              Password
              <input className="field" type="password" autoComplete="new-password" {...register("password")} />
              <span className="mt-1.5 block text-xs font-normal text-ink/55">At least 12 characters.</span>
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-clay/30 bg-sandstone/40 p-4 text-sm font-normal leading-6">
              <input type="checkbox" className="mt-1 size-4 shrink-0" {...register("acceptedDisclaimer")} />
              <span>
                I understand: {disclaimerText}
                {errors.acceptedDisclaimer && (
                  <span className="error-text">You must accept this before creating an account.</span>
                )}
              </span>
            </label>

            {errors.root && (
              <p role="alert" className="rounded-lg border border-clay/30 bg-sandstone/50 px-4 py-3 text-sm leading-6 text-ink">
                {errors.root.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-ink px-5 py-3.5 text-sm font-bold text-parchment transition hover:bg-coal disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-sm text-ink/70">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-clay underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

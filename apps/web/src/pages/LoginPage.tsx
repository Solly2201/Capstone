import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { loginSchema, type LoginInput } from "@cap/contracts";
import { api } from "../lib/api";

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    try {
      const response = await api.post("/auth/login", values);
      localStorage.setItem("cap.accessToken", response.data.token);
      setError("root", { message: `Signed in as ${response.data.user.fullName}. Dashboards arrive in the next increment.` });
    } catch (error: unknown) {
      const message = typeof error === "object" && error && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError("root", { message: message ?? "We could not sign you in. Try again." });
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
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="block text-sm font-semibold">Email
              <input className="field" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </label>
            <label className="block text-sm font-semibold">Password
              <input className="field" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </label>
            {errors.root && <p className="rounded-lg border border-clay/30 bg-sandstone/50 px-4 py-3 text-sm leading-6 text-ink">{errors.root.message}</p>}
            <button className="w-full rounded-lg bg-ink px-5 py-3.5 text-sm font-bold text-parchment transition hover:bg-coal disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Log in"}</button>
          </form>
          <p className="mt-8 text-xs leading-5 text-ink/60">Demo accounts are documented in the project README. New accounts will require email verification and acceptance of the legal-information disclaimer.</p>
        </div>
      </section>
    </main>
  );
}

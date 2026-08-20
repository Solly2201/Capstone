import { BadgeCheck, LogOut, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { SiteShell } from "../components/SiteShell";

// Makes the auth integration reachable end to end: sign in, read who you
// are from GET /auth/me, sign out.
export function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <p className="eyebrow">Your account</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">{user.fullName}</h1>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-ink/10 bg-white/60 p-5">
            <dt className="text-xs font-bold uppercase tracking-wide text-clay">Email</dt>
            <dd className="mt-2 text-sm text-ink/90">{user.email}</dd>
          </div>
          <div className="rounded-xl border border-ink/10 bg-white/60 p-5">
            <dt className="text-xs font-bold uppercase tracking-wide text-clay">Role</dt>
            <dd className="mt-2 text-sm text-ink/90">{user.role}</dd>
          </div>
          <div className="rounded-xl border border-ink/10 bg-white/60 p-5 sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-wide text-clay">Email verification</dt>
            <dd className="mt-2 flex items-center gap-2 text-sm text-ink/90">
              <BadgeCheck className="text-sage" size={17} aria-hidden="true" />
              {user.emailVerified ? "Verified" : "Not verified"}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-clay/25 bg-white/45 p-4 text-sm leading-6 text-ink/80">
          <ShieldCheck className="mt-0.5 shrink-0 text-sage" size={20} aria-hidden="true" />
          <p>
            Legal information does not require an account — the{" "}
            <Link to="/legal-assistant" className="font-semibold text-clay underline underline-offset-4">
              legal assistant
            </Link>{" "}
            is public. Your account is for civic reporting and petitions in later increments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-ink/20 px-5 py-3 text-sm font-semibold transition hover:bg-sandstone"
        >
          <LogOut size={17} aria-hidden="true" /> Log out
        </button>
      </section>
    </SiteShell>
  );
}

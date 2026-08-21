import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "@cap/contracts";
import { useAuth } from "../auth/AuthContext";
import { SiteShell } from "./SiteShell";

// Gate for routes that need an account, optionally restricted by role.
// Deliberately not applied to the legal-answer page, which is public by
// standing product decision.
//
// While the token is exchanged for a user via /auth/me the route waits
// rather than redirecting, so a refresh does not bounce to /login before
// the session resolves.
//
// roles hides a route from the wrong audience; it is not the security
// boundary: every authority action is independently authorised by the
// API, so a citizen who types the dashboard URL sees nothing they could
// act on even before the redirect lands.
export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <SiteShell>
        <section className="mx-auto flex min-h-[55vh] max-w-3xl items-center px-5 lg:px-8">
          <p role="status" className="text-sm text-ink/60">
            Checking your session…
          </p>
        </section>
      </SiteShell>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // The denial copy is derived from the roles the route declares, so a
    // citizen-only page does not tell an authority officer it is "for
    // civic authority staff".
    const staffOnly = !roles.includes("CITIZEN");
    return (
      <SiteShell>
        <section className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
          <h1 className="font-serif text-3xl font-semibold">
            {staffOnly ? "This area is for civic authority staff" : "This area is for citizen accounts"}
          </h1>
          <p className="mt-4 text-sm leading-6 text-ink/70">
            {staffOnly
              ? "Your account does not have access to it. If you are looking for your own reports, they are under “My reports”."
              : "Your account does not have access to it. Authority and admin accounts work from the report and petition queues instead."}
          </p>
        </section>
      </SiteShell>
    );
  }

  return <>{children}</>;
}

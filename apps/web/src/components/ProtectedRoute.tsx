import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { SiteShell } from "./SiteShell";

/**
 * Gate for routes that genuinely need an account.
 *
 * Deliberately *not* applied to the legal-answer page: basic legal
 * information is public by standing product decision (see
 * services/api/src/routes/legal.ts), and putting a login wall in front
 * of it would contradict that.
 *
 * While the token is being exchanged for a user via /auth/me the route
 * renders a waiting state instead of redirecting, otherwise every
 * refresh on a protected page would bounce the user to /login before
 * their session had a chance to resolve.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
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

  return <>{children}</>;
}

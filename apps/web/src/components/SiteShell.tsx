import { Landmark, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { disclaimerText } from "@cap/contracts";
import { useAuth } from "../auth/AuthContext";

const links = [
  { to: "/learn", label: "Learn" },
  { to: "/legal-assistant", label: "Legal assistant" },
  { to: "/report", label: "Civic report" },
  { to: "/petitions", label: "Petitions" }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, status, logout } = useAuth();
  const signedIn = status === "authenticated" && user !== null;

  return (
    <div className="min-h-screen bg-parchment text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-parchment/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Citizen Assistance Technology home">
            <span className="grid size-10 place-items-center rounded-xl bg-ink text-parchment"><Landmark size={21} aria-hidden="true" /></span>
            <span>
              <span className="block font-serif text-lg font-semibold leading-none">Citizen Assistance</span>
              <span className="mt-1 block text-xs font-medium uppercase tracking-[0.16em] text-clay">Technology</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex" aria-label="Primary navigation">
            {links.map((link) => <NavLink key={link.to} to={link.to} className="nav-link">{link.label}</NavLink>)}
            {signedIn ? (
              <>
                <NavLink to="/reports/mine" className="nav-link">My reports</NavLink>
                <NavLink to="/account" className="nav-link">{user.fullName}</NavLink>
                <button type="button" onClick={logout} className="rounded-lg border border-ink/20 px-4 py-2.5 transition hover:bg-sandstone">Log out</button>
              </>
            ) : (
              <>
                <NavLink to="/register" className="nav-link">Register</NavLink>
                <Link to="/login" className="rounded-lg bg-ink px-4 py-2.5 text-parchment transition hover:bg-coal">Log in</Link>
              </>
            )}
          </nav>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-ink/10 bg-parchment px-5 py-4 md:hidden" aria-label="Mobile navigation">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-semibold">
              {links.map((link) => <NavLink key={link.to} to={link.to} className="rounded-md px-3 py-2 hover:bg-sandstone" onClick={() => setMenuOpen(false)}>{link.label}</NavLink>)}
              {signedIn ? (
                <>
                  <NavLink to="/reports/mine" className="rounded-md px-3 py-2 hover:bg-sandstone" onClick={() => setMenuOpen(false)}>My reports</NavLink>
                  <NavLink to="/account" className="rounded-md px-3 py-2 hover:bg-sandstone" onClick={() => setMenuOpen(false)}>{user.fullName}</NavLink>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="rounded-md border border-ink/20 px-3 py-2 text-center"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/register" className="rounded-md px-3 py-2 hover:bg-sandstone" onClick={() => setMenuOpen(false)}>Register</NavLink>
                  <Link to="/login" className="rounded-md bg-ink px-3 py-2 text-center text-parchment" onClick={() => setMenuOpen(false)}>Log in</Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t border-ink/10 bg-ink text-parchment">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1fr_2fr] lg:px-8">
          <div>
            <p className="font-serif text-xl font-semibold">Citizen Assistance Technology</p>
            <p className="mt-2 text-sm text-parchment/70">Your rights. Your service. Your voice.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-parchment/70">Important notice</p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-parchment/90">{disclaimerText} If there is an immediate threat to life or safety, call <a className="font-semibold underline underline-offset-4" href="tel:112">112</a>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

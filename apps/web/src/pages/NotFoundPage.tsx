import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/SiteShell";

// A wrong URL is not an unbuilt feature: this replaces PlaceholderPage as
// the catch-all so a typo does not read as "coming in a later increment".
export function NotFoundPage() {
  return (
    <SiteShell>
      <section className="mx-auto flex min-h-[55vh] max-w-3xl flex-col justify-center px-5 py-20 lg:px-8">
        <Compass className="text-clay" size={34} aria-hidden="true" />
        <h1 className="mt-6 font-serif text-4xl font-semibold sm:text-5xl">Page not found</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink/70">
          There is nothing at this address. The link may be out of date, or the address may have been
          mistyped.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold">
          <Link to="/" className="inline-flex items-center gap-2 text-clay underline-offset-4 hover:underline">
            <ArrowLeft size={17} aria-hidden="true" /> Back to home
          </Link>
          <Link to="/learn" className="text-clay underline-offset-4 hover:underline">
            Learn
          </Link>
          <Link to="/legal-assistant" className="text-clay underline-offset-4 hover:underline">
            Legal assistant
          </Link>
          <Link to="/petitions" className="text-clay underline-offset-4 hover:underline">
            Petitions
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}

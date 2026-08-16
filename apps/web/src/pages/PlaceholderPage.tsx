import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/SiteShell";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <SiteShell>
      <section className="mx-auto flex min-h-[55vh] max-w-3xl flex-col justify-center px-5 py-20 lg:px-8">
        <Construction className="text-clay" size={34} aria-hidden="true" />
        <p className="eyebrow mt-6">Planned module</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink/70">This area is intentionally being built in a later increment. The public foundation and safety boundaries are in place first.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-clay underline-offset-4 hover:underline"><ArrowLeft size={17} aria-hidden="true" /> Back to home</Link>
      </section>
    </SiteShell>
  );
}

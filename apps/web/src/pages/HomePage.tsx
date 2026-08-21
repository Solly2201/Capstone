import { ArrowRight, BookOpenCheck, FileCheck2, MapPinned, MessageSquareWarning, MessagesSquare, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/SiteShell";

const pathways = [
  { icon: BookOpenCheck, title: "Learn your rights", body: "Start with clear, structured legal basics—from offences and FIRs to arrest, bail, rights and procedures.", to: "/learn", action: "Explore learning" },
  { icon: MessagesSquare, title: "Ask a legal question", body: "Ask in your own words and read the exact text of the law that matches, with its official citation—never a generated answer.", to: "/legal-assistant", action: "Ask a question" },
  { icon: MapPinned, title: "Report a civic issue", body: "Document a local issue, protect privacy in images, and follow its progress through a simulated authority workflow. Needs an account.", to: "/report", action: "Report an issue" },
  { icon: UsersRound, title: "Support a petition", body: "Bring community concerns together, follow support milestones and make local issues visible.", to: "/petitions", action: "View petitions" }
];

const topics = ["Cognizable and non-cognizable offences", "Bailable and non-bailable offences", "FIR and NCR", "Arrest and detention", "Warrants and bail", "Fundamental rights"];

export function HomePage() {
  return (
    <SiteShell>
      <section className="hero-grid overflow-hidden border-b border-ink/10">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">India-focused public awareness</p>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.03] tracking-tight text-ink sm:text-6xl">Understand your rights. Act with clarity.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/75">A practical starting point for legal awareness, civic reporting and community participation—built to make official information easier to understand and safer to use.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/learn" className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3.5 text-sm font-semibold text-parchment transition hover:bg-coal">Start learning <ArrowRight size={17} aria-hidden="true" /></Link>
              <Link to="/report" className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/20 bg-parchment px-5 py-3.5 text-sm font-semibold transition hover:bg-sandstone">Report a civic issue</Link>
            </div>
            <div className="mt-10 flex items-start gap-3 rounded-xl border border-clay/25 bg-white/45 p-4 text-sm leading-6 text-ink/80">
              <ShieldCheck className="mt-0.5 shrink-0 text-sage" size={20} aria-hidden="true" />
              <p>Legal content is for public awareness, with official sources and citations. It is not personal legal advice. Immediate danger? <a className="font-semibold underline underline-offset-4" href="tel:112">Call 112</a>.</p>
            </div>
          </div>
          <div className="relative flex items-end">
            <div className="relative w-full overflow-hidden rounded-2xl bg-ink p-7 text-parchment shadow-soft sm:p-9">
              <div className="absolute -right-16 -top-16 size-56 rounded-full border border-parchment/15" />
              <div className="absolute -bottom-20 right-8 size-48 rounded-full border border-clay/70" />
              <FileCheck2 className="relative text-sandstone" size={34} aria-hidden="true" />
              <p className="relative mt-12 text-xs font-bold uppercase tracking-[0.18em] text-sandstone">Built for confidence, not guesswork</p>
              <h2 className="relative mt-4 font-serif text-3xl font-semibold leading-tight">Every legal answer must show where it came from.</h2>
              <p className="relative mt-5 max-w-md text-sm leading-6 text-parchment/75">CAP will cite the relevant official source, section or article, source link and verification date—or it will not answer.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="flex max-w-2xl flex-col gap-4">
          <p className="eyebrow">One platform, four pathways</p>
          <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Find the next useful step.</h2>
          <p className="text-base leading-7 text-ink/70">Choose what brings you here. Each pathway is designed around a clear task, not legal jargon.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pathways.map(({ icon: Icon, title, body, to, action }) => (
            <article key={title} className="group flex min-h-72 flex-col rounded-2xl border border-ink/10 bg-white/65 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <span className="grid size-11 place-items-center rounded-xl bg-sandstone text-clay"><Icon size={22} aria-hidden="true" /></span>
              <h3 className="mt-7 font-serif text-2xl font-semibold">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-ink/70">{body}</p>
              <Link to={to} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-clay underline-offset-4 hover:underline">{action} <ArrowRight size={16} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-sandstone/55">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[.85fr_1.15fr] lg:px-8 lg:py-20">
          <div>
            <p className="eyebrow">Start at the beginning</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight sm:text-4xl">Legal basics, explained without assuming prior knowledge.</h2>
            <p className="mt-5 text-base leading-7 text-ink/70">The first learning paths will turn common legal terms and procedures into small, understandable lessons linked to official material.</p>
            <Link to="/learn" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-parchment transition hover:bg-coal">Browse learning paths <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {topics.map((topic, index) => <li key={topic} className="flex items-center gap-4 rounded-xl bg-parchment px-5 py-4 text-sm font-semibold"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-clay text-xs text-parchment">{String(index + 1).padStart(2, "0")}</span>{topic}</li>)}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="rounded-2xl bg-ink px-7 py-10 text-parchment sm:px-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow text-sandstone">Safety comes first</p>
              <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight sm:text-4xl">Some situations need people, not an AI answer.</h2>
              <p className="mt-5 text-base leading-7 text-parchment/75">For urgent safety concerns, active crime, violence, harassment, child safety, medical emergencies or cyber financial fraud, CAP will stop the chat and direct you to the appropriate official route.</p>
            </div>
            <a href="tel:112" className="inline-flex items-center justify-center gap-2 rounded-lg bg-sandstone px-5 py-3.5 text-sm font-bold text-ink transition hover:bg-parchment"><MessageSquareWarning size={18} aria-hidden="true" /> Call 112 in an emergency</a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

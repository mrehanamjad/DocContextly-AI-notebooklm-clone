"use client";

import { AmbientBg } from "@/components/branding/AmbientBg";
import { Logo } from "@/components/branding/Logo";
import {
  ArrowRight,
  FileText,
  Globe,
  Youtube,
  Mic,
  BookOpen,
  Headphones,
  Network,
  Quote,
  Check,
  Plus,
  Minus,
  ChevronRight,
  Layers,
  UserCheck,
  Tv,
  HelpCircle,
  Table,
  CheckSquare,
  AlignLeft,
  Sparkles,
  Search,

  Paperclip,
  ArrowUp,
  Trash2,
  Copy,

  Share2,
  FileBarChart,
  Table2,
  Presentation,
  ListChecks,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen text-foreground selection:bg-primary/20 relative overflow-x-clip">
      <AmbientBg />
      <Nav />
      <Hero />
      <WorkspacePreview />
      <FeatureBento />
      <Studio />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

const NavItems = [
  {
    label: "Sources",
    href: "#sources",
  },
  {
    label: "Artifacts",
    href: "#artifacts",
  },
  {
    label: "Pricing",
    href: "#pricing",
  },
  {
    label: "FAQ",
    href: "#faq",
  },
];

/* ------------------------------ NAV ------------------------------ */
function Nav() {
  return (
    <nav className="sticky top-6 z-50 flex justify-center px-4 animate-fade-up">
      <div className="flex items-center gap-8 px-5 py-2.5 bg-glass border border-white/40 shadow-soft rounded-full">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-medium text-foreground/60">
          {NavItems.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="/app"
          className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          Open app <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </nav>
  );
}

/* ------------------------------ HERO ------------------------------ */
function Hero() {
  return (
    <header className="pt-24 pb-12 px-6 text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/15 rounded-full mb-6 animate-fade-up">
        <span className="flex size-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] font-bold tracking-widest uppercase text-primary">
          AI Knowledge Workspace
        </span>
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-balance mb-8 text-gradient animate-fade-up">
        Think with your
        <br />
        <span className="italic text-primary">knowledge.</span>
      </h1>
      <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto text-pretty mb-10 animate-fade-up [animation-delay:80ms]">
        A beautifully designed workspace where documents, websites, YouTube videos, and notes come together. Chat with your sources, generate presentations, podcasts, quizzes, study guides, mind maps, and more—all grounded in your own knowledge.
      </p>
      <div className="flex flex-wrap justify-center gap-3 animate-fade-up [animation-delay:140ms]">
        <Link
          href="/app"
          className="group bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          Open workspace{" "}
          <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <a
          href="#workspace"
          className="bg-glass border border-white/40 px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-white/60 transition-colors"
        >
          See it in motion
        </a>
      </div>
    </header>
  );
}

/* ------------------------ WORKSPACE PREVIEW ------------------------ */


const SOURCE_GROUPS = [
  {
    label: "Pdf",
    count: 1,
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10",
    items: [{ title: "Neural Architecture Search.pdf", meta: "1.2 MB · 36 chunks" }],
  },
  {
    label: "Docs",
    count: 1,
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10",
    items: [{ title: "Scaling laws revisited.md", meta: "7.5 KB · 10 chunks" }],
  },
  {
    label: "Web",
    count: 2,
    icon: Globe,
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
    items: [
      { title: "DeepMind Technical Report", meta: "16 chunks" },
      { title: "What Is Harness Engineering? Complete …", meta: "28 chunks" },
    ],
  },
  {
    label: "YouTube",
    count: 1,
    icon: Youtube,
    color: "text-accent-pink",
    bg: "bg-accent-pink/10",
    items: [{ title: "[1hr Talk] Intro to Large Language Models", meta: "86 chunks" }],
  },
];

const GENERATE_ITEMS = [
  { title: "Summary", subtitle: "Synthesis of main ideas", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
  { title: "Podcast", subtitle: "Two-host audio overview", icon: Headphones, color: "text-accent-pink", bg: "bg-accent-pink/10" },
  { title: "Slide deck", subtitle: "Presentation-ready slides", icon: Presentation, color: "text-accent-pink", bg: "bg-accent-pink/10" },
  { title: "Study guide", subtitle: "Structured primer", icon: BookOpen, color: "text-accent-blue", bg: "bg-accent-blue/10" },
  { title: "Flashcards", subtitle: "Active recall cards", icon: Layers, color: "text-accent-pink", bg: "bg-accent-pink/10" },
  { title: "Quiz", subtitle: "Test your understanding", icon: ListChecks, color: "text-accent-pink", bg: "bg-accent-pink/10" },
  { title: "FAQs", subtitle: "Common questions answered", icon: HelpCircle, color: "text-accent-mint", bg: "bg-accent-mint/10" },
  { title: "Mind map", subtitle: "Concept graph", icon: Share2, color: "text-accent-blue", bg: "bg-accent-blue/10" },
  { title: "Report", subtitle: "Analytical document", icon: FileBarChart, color: "text-accent-pink", bg: "bg-accent-pink/10" },
  { title: "Data table", subtitle: "Structured data", icon: Table2, color: "text-accent-mint", bg: "bg-accent-mint/10" },
];



function Citations({ n }: { n: number }) {
  return (
    <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/15 transition-colors">
      <Quote className="size-3 text-primary" />
      <span className="text-[11px] font-semibold text-primary">
        ({n}) Citations
      </span>
      <span className="text-[11px] text-primary/60">· Sources referenced</span>
    </button>
  );
}

function WorkspacePreview() {
  return (
    <section id="workspace" className="max-w-7xl mx-auto px-4 md:px-6 mb-32">
      <div className="relative bg-white/40 backdrop-blur-3xl border border-white/60 shadow-float rounded-[2rem] md:rounded-[2.5rem] p-3 md:p-4 overflow-hidden animate-fade-up [animation-delay:200ms]">
        <div className="flex h-[700px] gap-3 md:gap-4 bg-surface/60 rounded-[1.5rem] md:rounded-[1.75rem] overflow-hidden">
          {/* Sources */}
          <aside className="hidden md:flex w-72 bg-white/60 border-r border-border p-4 flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                Sources · 4/4
              </h3>
            </div>

            <button className="w-full flex items-center justify-center gap-1.5 mb-3 py-2.5 rounded-xl border border-dashed border-primary/40 text-primary text-xs font-semibold bg-primary/5 hover:bg-primary/10 transition-colors">
              <Plus className="size-3.5" />
              Add New Source
            </button>

            <div className="relative mb-3">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
              <input
                readOnly
                placeholder="Search sources"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-foreground/5 text-xs placeholder:text-foreground/30 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 mb-3 text-[10px] font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-foreground text-white">All 4</span>
              <span className="px-2.5 py-1 rounded-full bg-foreground/5 text-foreground/50">Docs 1</span>
              <span className="px-2.5 py-1 rounded-full bg-foreground/5 text-foreground/50">Web 2</span>
              <span className="px-2.5 py-1 rounded-full bg-foreground/5 text-foreground/50 truncate">YouTube 1</span>
            </div>

            <div className="flex items-center justify-between mb-4 px-0.5">
              <div className="flex items-center gap-2">
                <span className="size-4 rounded-md bg-primary grid place-items-center">
                  <Check className="size-3 text-white" />
                </span>
                <span className="text-xs font-medium">Select all sources</span>
              </div>
              <span className="text-[10px] text-foreground/30">4 selected</span>
            </div>

            <div className="space-y-4">
              {SOURCE_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-1 mb-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                    <ChevronDown className="size-3" />
                    {group.label} · {group.count}
                  </div>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div
                        key={item.title}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl border border-border bg-white/70 hover:bg-white transition-colors"
                      >
                        <span className="size-4 rounded-md bg-primary grid place-items-center mt-0.5 shrink-0">
                          <Check className="size-3 text-white" />
                        </span>
                        <span className={`size-6 rounded-md ${group.bg} grid place-items-center shrink-0`}>
                          <group.icon className={`size-3.5 ${group.color}`} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold leading-snug line-clamp-2">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-foreground/40 mt-0.5">{item.meta}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Center */}
          <section className="flex-1 flex flex-col bg-gradient-to-b from-white/80 to-white/20 relative">
            <header className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div className="flex gap-5 text-xs font-bold">
                <button className="text-primary border-b-2 border-primary pb-1">Assistant</button>
              </div>
              <div className="text-[10px] font-mono text-foreground/40">grounded · 7 sources</div>
            </header>

            <div className="px-6 pt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/50">Assistant Conversation</span>
              <button className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/40 hover:text-foreground/70 transition-colors">
                <Trash2 className="size-3.5" />
                Clear Chat
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-6 space-y-5">
              <div className="max-w-xl space-y-2">
                <p className="text-sm leading-relaxed text-foreground/80">
                  Your sources converge on one finding: transformer attention is moving toward{" "}
                  <span className="px-1 bg-primary/10 rounded font-medium">sparse, routed</span>{" "}
                  patterns for long context — a ~38% FLOP reduction with negligible loss in
                  fidelity.
                </p>
                <Citations n={5} />
              </div>

              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground text-sm px-4 py-2.5 rounded-2xl rounded-tr-md max-w-xs">
                  Where do they disagree?
                </div>
              </div>

              <div className="max-w-xl space-y-2">
                 <div className="space-y-2 flex-1">
                  <div className="flex gap-1.5">
                    <span className="size-1.5 rounded-full bg-foreground/30 caret-blink" />
                    <span className="size-1.5 rounded-full bg-foreground/30 caret-blink [animation-delay:120ms]" />
                    <span className="size-1.5 rounded-full bg-foreground/30 caret-blink [animation-delay:240ms]" />
                  </div>
                  <div className="h-3 rounded-full animate-shimmer bg-foreground/5 w-3/4" />
                  <div className="h-3 rounded-full animate-shimmer bg-foreground/5 w-1/2" />
                </div>
              </div>
            </div>

            <div className="px-4 pb-2">
              <div className="bg-white shadow-2xl shadow-primary/20 rounded-2xl p-2 border border-border flex items-center gap-3">
                <button className="size-9 rounded-xl bg-surface grid place-items-center text-foreground/40 shrink-0">
                  <Paperclip className="size-4" />
                </button>
                <div className="flex-1 text-sm text-foreground/30">
                  Ask your research assistant…
                </div>
                <button className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-lg shadow-primary/30 shrink-0">
                  <ArrowUp className="size-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-foreground/30">
                <span>Grounded in 4 sources · responses cite passages</span>
                <span>↵ to send · ⇧↵ newline</span>
              </div>
            </div>
          </section>

          {/* Right */}
          <aside className="hidden lg:flex w-80 bg-surface/60 p-4 flex-col border-l border-border overflow-y-auto">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-4">
              Artifacts
            </h3>
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="size-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                Generate
              </span>
            </div>
            <div className="space-y-1">
              {GENERATE_ITEMS.map((item) => (
                <button
                  key={item.title}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white transition-colors text-left"
                >
                  <span className={`size-8 rounded-lg ${item.bg} grid place-items-center shrink-0`}>
                    <item.icon className={`size-4 ${item.color}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold">{item.title}</div>
                    <div className="text-[11px] text-foreground/40">{item.subtitle}</div>
                  </div>
                  <ChevronRight className="size-3.5 text-foreground/20 shrink-0" />
                </button>
              ))}
            </div>
          </aside>
        </div>
        <div className="absolute top-1/4 -right-12 size-24 bg-accent-pink/20 blur-2xl rounded-full animate-float" />
        <div className="absolute bottom-1/4 -left-12 size-32 bg-accent-blue/20 blur-3xl rounded-full animate-float [animation-delay:2s]" />
      </div>
    </section>
  );
}



/* ------------------------- FEATURE BENTO ------------------------- */
const bentoItems = [
  {
    icon: Layers,
    title: "Universal ingestion pipeline",
    desc: "Upload PDFs, Word (.docx), Markdown, CSV, or plain text. DocContextly strips layouts, extracts paragraphs, and maps complex indices into your notebook automatically.",
    span: "md:col-span-2",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600",
  },
  {
    icon: Youtube,
    title: "YouTube video processing",
    desc: "Paste any YouTube URL. DocContextly fetches the transcript, processes speaker sections, and folds the video's context into your session.",
    span: "md:col-span-1",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600",
  },
  {
    icon: Globe,
    title: "Multi-URL crawler",
    desc: "Input several links at once. The deep scraper follows redirects, skips script bloat, and digests article content with precision.",
    span: "md:col-span-1",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    icon: Search,
    title: "Automated custom topics",
    desc: "No sources yet? Enter a topic. The AI queries the web, gathers peer-reviewed articles, and aggregates a balanced knowledge base from scratch.",
    span: "md:col-span-2",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
  }
];


function FeatureBento() {
  return (
    <section id="sources" className="max-w-7xl mx-auto px-6 pb-32">
      <div className="max-w-2xl mb-16">
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">
          Universal input
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-balance">
          Every format you already work with.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">

        {bentoItems.map((item, i) => (
          <div
            key={i}
            className={`group relative p-7 rounded-3xl bg-white/50 border border-white/60 hover:shadow-float hover:-translate-y-1 transition-all duration-500 overflow-hidden ${item.span} animate-fade-up shadow-lg`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className={`size-11 rounded-2xl flex items-center justify-center mb-5 ${item.iconBg} ${item.iconColor}`}
            >
              <item.icon className="size-5" />
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight">{item.title}</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


function Cite({ n, label }: { n: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground/5 text-[10px] font-mono border border-border hover:bg-primary/10 transition-colors cursor-help">
      <span className="text-primary font-bold">[{n}]</span>
      <span className="text-foreground/60">{label}</span>
    </span>
  );
}

/* -------------------------- TESTIMONIALS -------------------------- */
const testimonials = [
  {
    quote: "I replaced three apps with DocContextly in a week. The citations alone earned my trust.",
    who: "Dr. Mira Chen",
    role: "Computational Biologist, Stanford",
  },
  {
    quote:
      "Generating a podcast from my reading list felt like cheating. It's now my Monday ritual.",
    who: "Joon Park",
    role: "Founder, Northwind Research",
  },
  {
    quote: "The spatial workspace finally matches how I actually think about a problem.",
    who: "Sara Iyer",
    role: "Policy Director, Climate Atlas",
  },
];

function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-32">
      <div className="max-w-2xl mb-12">
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">
          Loved by researchers
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-balance">
          Trusted where rigor matters.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <figure
            key={i}
            className="p-7 rounded-3xl bg-white/60 border border-white/60 shadow-soft flex flex-col gap-6"
          >
            <Quote className="size-6 text-primary/60" />
            <blockquote className="text-base leading-relaxed text-foreground/80 flex-1">
              "{t.quote}"
            </blockquote>
            <figcaption>
              <div className="text-sm font-bold">{t.who}</div>
              <div className="text-xs text-foreground/50">{t.role}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- PRICING ----------------------------- */
const tiers = [
  {
    name: "Spark",
    price: "Free",
    desc: "For curious minds getting started.",
    features: ["3 notebooks", "20 sources / notebook", "AI chat & summaries", "Basic citations"],
    cta: "Start free",
    accent: false,
  },
  {
    name: "Studio",
    price: "$18",
    period: "/mo",
    desc: "For serious researchers and grad students.",
    features: [
      "Unlimited notebooks",
      "500 sources / notebook",
      "Podcast & flashcards",
      "Mind maps & timelines",
      "Export to BibTeX",
    ],
    cta: "Start 14-day trial",
    accent: true,
  },
  {
    name: "Lab",
    price: "$48",
    period: "/mo",
    desc: "For teams synthesizing together.",
    features: [
      "Everything in Studio",
      "Up to 10 collaborators",
      "Shared libraries",
      "Admin & SSO",
      "Priority support",
    ],
    cta: "Contact sales",
    accent: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 pb-32">
      <div className="max-w-2xl mb-12">
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">
          Pricing
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-balance">
          Pick a tempo. Cancel anytime.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`p-8 rounded-3xl border flex flex-col gap-6 transition-all ${t.accent
              ? "bg-gradient-to-b from-primary/10 to-white/40 border-primary/30 shadow-float ring-1 ring-primary/20"
              : "bg-white/60 border-white/60 shadow-soft"
              }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{t.name}</h3>
                {t.accent && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
                    Most loved
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-extrabold tracking-tighter">{t.price}</span>
                {t.period && <span className="text-sm text-foreground/50">{t.period}</span>}
              </div>
              <p className="text-sm text-foreground/60">{t.desc}</p>
            </div>
            <ul className="space-y-2.5 flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground/80">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className={`w-full py-3 rounded-full text-sm font-semibold text-center transition-opacity block ${t.accent
                ? "bg-foreground text-background hover:opacity-90"
                : "bg-foreground/5 hover:bg-foreground/10"
                }`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}


/* ------------------------------ STUDIO ------------------------------ */

const artifactTypes = [
  { icon: FileText, title: "Executive reports", desc: "A tight, decision-ready brief pulled from every source at once." },
  { icon: AlignLeft, title: "Summaries", desc: "Plain-language digests of long or dense material, on demand." },
  { icon: HelpCircle, title: "FAQs", desc: "The questions a reader would ask, answered from your sources." },
  { icon: CheckSquare, title: "Quizzes", desc: "Multiple-choice checks generated to test real comprehension." },
  { icon: BookOpen, title: "Study guides", desc: "Structured outlines built for review before an exam or meeting." },
  { icon: Layers, title: "Flashcard decks", desc: "Spaced-repetition cards, ready to drill straight from the notebook." },
  { icon: Network, title: "Visual mind maps", desc: "Concepts and their relationships, laid out as a single diagram." },
  { icon: Table, title: "Data tables", desc: "Figures and comparisons extracted and structured for scanning." },
];

function Studio() {
  return (
    <section id="artifacts" className="max-w-7xl mx-auto px-6 pb-32">
      <div className="max-w-2xl mb-16">
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">
          The studio
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-balance">
          From consumption to creation.
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Slide deck */}
        <div className="group relative  border border-white/50 rounded-3xl p-10 flex flex-col justify-between min-h-[540px] hover:shadow-float hover:-translate-y-1 transition-all duration-500 overflow-hidden shadow-lg">
          <div className="absolute -top-16 -right-16 size-48 bg-accent-blue/15 blur-3xl rounded-full animate-float" />
          <div className="relative">
            <div className="size-11 rounded-2xl flex items-center justify-center mb-5 bg-accent-blue/10 text-accent-blue">
              <Tv className="size-5" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 mb-2">
              Studio · Slides
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-3">
              Presentation-ready decks.
            </h3>
            <p className="text-sm text-foreground/60 max-w-[36ch] leading-relaxed">
              Convert any notebook into a minimalist, editorial slide deck. Titles,
              transitions, and citation footers — generated automatically.
            </p>
          </div>

          <div className="relative w-full aspect-video bg-foreground rounded-2xl p-6 flex flex-col justify-between shadow-soft">
            <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase">
              <span>Slide 04 · 12</span>
              <span>Urban Epistemology</span>
            </div>
            <div>
              <div className="text-[10px] font-mono text-white/40 mb-2">Chapter II</div>
              <div className="text-xl font-bold italic leading-tight text-white">
                The sidewalk as an asynchronous protocol.
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="h-0.5 w-8 rounded-full bg-white/40" />
              <div className="h-0.5 w-8 rounded-full bg-white/40" />
              <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-primary to-accent-pink" />
              <div className="h-0.5 w-8 rounded-full bg-white/15" />
            </div>
          </div>
        </div>

        {/* Podcast */}
        <div className="group relative bg-white/50 border border-white/60 rounded-3xl p-10 flex flex-col justify-between min-h-[540px] hover:shadow-float hover:-translate-y-1 transition-all duration-500 overflow-hidden  shadow-lg">
          <div className="absolute -bottom-16 -left-16 size-48 bg-accent-pink/15 blur-3xl rounded-full animate-float [animation-delay:1.5s]" />
          <div className="relative">
            <div className="size-11 rounded-2xl flex items-center justify-center mb-5 bg-accent-pink/10 text-accent-pink">
              <Headphones className="size-5" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 mb-2">
              Studio · Audio
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-3">
              Two hosts, one notebook.
            </h3>
            <p className="text-sm text-foreground/60 max-w-[36ch] leading-relaxed">
              Generate a natural, conversational podcast where two AI hosts debate,
              question, and simplify your uploaded material.
            </p>
          </div>

          <div className="relative space-y-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-gradient-to-br from-primary via-accent-blue to-accent-pink flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Mic className="size-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold">Conversational synthesis</div>
                <div className="text-[10px] font-mono text-foreground/40 uppercase mt-1">
                  Hosts A & B · 12 min
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-end gap-1 h-10 mb-3">
                {[3, 6, 4, 8, 5, 9, 7, 4, 6, 8, 5, 3, 7, 9, 6, 4, 5, 8, 6, 3, 5, 7, 4, 6, 8].map(
                  (h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${i < 8
                        ? "bg-gradient-to-t from-primary to-accent-pink"
                        : "bg-foreground/10"
                        }`}
                      style={{ height: `${h * 10}%` }}
                    />
                  ),
                )}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-foreground/40 uppercase">
                <span>04:12</span>
                <span>12:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artifact library — small cards */}
      <div className="mt-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 mb-4">
          Also in the studio
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {artifactTypes.map((item, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-white/50 border border-white/60 flex flex-col gap-5 hover:shadow-float hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex items-center justify-between">
                <item.icon className="size-4 text-primary" strokeWidth={1.5} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold tracking-tight mb-1.5">{item.title}</h4>
                <p className="text-foreground/60 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
/* ------------------------------ FAQ ------------------------------ */
const faqs = [
  {
    q: "Is my data used to train models?",
    a: "No. Your sources, conversations, and notes stay in your workspace. Nothing is used for training, ever.",
  },
  {
    q: "What file types can I upload?",
    a: "PDFs, Word, Markdown, plain text, web URLs, YouTube links, audio files (MP3/WAV), and pasted notes. We handle up to 500 sources per notebook on Studio.",
  },
  {
    q: "How are answers grounded?",
    a: "Every response is generated from a retrieval pass over your sources. Each claim links to a citation with the originating passage and location.",
  },
  {
    q: "Can I collaborate with others?",
    a: "Yes — Lab plans support up to 10 collaborators per notebook with role-based permissions and shared activity history.",
  },
  {
    q: "Do you support offline use?",
    a: "Reading and note-taking work offline; AI features require a connection. Generated artifacts are cached for offline review.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 pb-32">
      <div className="max-w-2xl mb-12">
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">
          Questions
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-balance">
          Things people ask before signing up.
        </h2>
      </div>
      <div className="bg-white/50 border border-white/60 rounded-3xl divide-y divide-border overflow-hidden">
        {faqs.map((f, i) => (
          <button
            key={i}
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full text-left p-6 hover:bg-white/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-base">{f.q}</span>
              {open === i ? (
                <Minus className="size-4 text-primary shrink-0" />
              ) : (
                <Plus className="size-4 text-foreground/40 shrink-0" />
              )}
            </div>
            {open === i && (
              <p className="text-sm text-foreground/60 leading-relaxed mt-3 animate-fade-up">
                {f.a}
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ CTA ------------------------------ */
function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-32">
      <div className="relative bg-gradient-to-br from-primary/15 via-accent-blue/10 to-accent-pink/15 border border-white/60 rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden">
        <div className="absolute -top-20 -left-20 size-72 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-accent-blue/20 blur-3xl animate-float [animation-delay:2s]" />
        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-balance mb-6 text-gradient">
            Begin your curation.
          </h2>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto mb-10">
            Open your first notebook and start curating.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Enter DocContextly <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FOOTER ----------------------------- */
function Footer() {
  return (
    <footer className="border-t border-border bg-white/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Logo size={22} />
          <span className="text-xs text-foreground/40 hidden md:inline">
            · research that feels like thinking
          </span>
        </div>
        <div className="flex gap-6 text-xs font-medium text-foreground/50 uppercase tracking-widest">
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms
          </a>
          <a href="#" className="hover:text-foreground">
            Changelog
          </a>
          <a href="#" className="hover:text-foreground">
            Contact
          </a>
        </div>
        <p className="text-xs text-foreground/40">© 2026 DocContextly Labs</p>
      </div>
    </footer>
  );
}
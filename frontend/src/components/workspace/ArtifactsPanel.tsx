"use client";

import {
  Plus,
  X,
  Sparkles,
  ChevronRight,
  StickyNote,
  CheckCircle2,
  Headphones,
  Presentation,
  FileText,
  BookOpen,
  ListChecks,
  HelpCircle,
  Calendar,
  Network,
  type MessageSquare,
} from "lucide-react";

type Tab =
  | "assistant"
  | "podcast"
  | "flashcards"
  | "mindmap"
  | "guide"
  | "quiz"
  | "faqs"
  | "slides"
  | "summary"
  | "report"
  | "datatable";

const GENERATE_ACTIONS: {
  id: Exclude<Tab, "assistant">;
  label: string;
  Icon: typeof MessageSquare;
  desc: string;
  color: string;
}[] = [
  {
    id: "summary",
    label: "Summary",
    Icon: StickyNote,
    desc: "Synthesis of main ideas",
    color: "accent-blue",
  },
  {
    id: "podcast",
    label: "Podcast",
    Icon: Headphones,
    desc: "Two-host audio overview",
    color: "accent-pink",
  },
  {
    id: "slides",
    label: "Slide deck",
    Icon: Presentation,
    desc: "Presentation-ready slides",
    color: "primary",
  },
  {
    id: "guide",
    label: "Study guide",
    Icon: FileText,
    desc: "Structured primer",
    color: "accent-blue",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    Icon: BookOpen,
    desc: "Active recall cards",
    color: "primary",
  },
  {
    id: "quiz",
    label: "Quiz",
    Icon: ListChecks,
    desc: "Test your understanding",
    color: "accent-pink",
  },
  {
    id: "faqs",
    label: "FAQs",
    Icon: HelpCircle,
    desc: "Common questions answered",
    color: "accent-mint",
  },

  { id: "mindmap", label: "Mind map", Icon: Network, desc: "Concept graph", color: "accent-blue" },
  { id: "report", label: "Report", Icon: FileText, desc: "Analytical document", color: "primary" },
  {
    id: "datatable",
    label: "Data table",
    Icon: ListChecks,
    desc: "Structured data",
    color: "accent-pink",
  },
];

interface ArtifactsPanelProps {
  onGenerate: (t: Tab) => void;
  activeTabs: Tab[];
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function ArtifactsPanel({
  onGenerate,
  activeTabs,
  mobileOpen,
  onMobileClose,
}: ArtifactsPanelProps) {
  const body = (
    <>
      <header className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
          Artifacts
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onMobileClose}
            className="lg:hidden size-6 rounded-full bg-foreground/5 grid place-items-center cursor-pointer"
            aria-label="Close"
          >
            <X className="size-3" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Generate */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-3.5 text-primary" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
              Generate
            </h3>
          </div>
          <div className="space-y-1.5">
            {GENERATE_ACTIONS.map(({ id, label, Icon, desc, color }) => {
              const isOpen = activeTabs.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => onGenerate(id)}
                  className="group w-full flex items-center gap-3 p-2.5 rounded-xl bg-white border border-border hover:border-primary/30 hover:shadow-soft transition-all text-left cursor-pointer"
                >
                  <div
                    className="size-8 rounded-lg grid place-items-center shrink-0"
                    style={{ background: `color-mix(in oklab, var(--${color}) 14%, transparent)` }}
                  >
                    <Icon className="size-4" style={{ color: `var(--${color})` }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate">{label}</span>
                      {isOpen && (
                        <span className="text-[9px] font-mono px-1.5 py-px rounded bg-primary/10 text-primary">
                          OPEN
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-foreground/50 truncate">{desc}</p>
                  </div>
                  <ChevronRight className="size-3.5 text-foreground/30 group-hover:text-foreground/60 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Auto-summary */}
        {/* <div className="bg-white rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-3.5 text-accent-blue" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
              AI summary
            </span>
          </div>
          <div className="space-y-2">
            <Bullet color="primary">7 sources analyzed</Bullet>
            <Bullet color="accent-blue">3 areas of consensus</Bullet>
            <Bullet color="accent-pink">1 open disagreement</Bullet>
            <Bullet color="accent-mint">12 key terms identified</Bullet>
          </div>
        </div> */}

        {/* Key takeaways */}
        {/* <div className="bg-white rounded-2xl p-4 border border-border">
          <h4 className="text-xs font-bold mb-3 uppercase tracking-widest text-foreground/50">
            Key takeaways
          </h4>
          <ol className="space-y-3 text-xs text-foreground/70">
            <li className="flex gap-2">
              <span className="font-mono text-primary font-bold">01</span>
              Sparse routing reduces FLOPs ~38% with negligible in-domain loss.
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-primary font-bold">02</span>
              Long-context benchmarks may overstate true retrieval ability.
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-primary font-bold">03</span>
              Data quality is overtaking parameter count in the 7B–34B range.
            </li>
          </ol>
        </div> */}
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-80 shrink-0 bg-white/60 backdrop-blur-xl border border-border rounded-2xl flex-col overflow-hidden">
        {body}
      </aside>
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex justify-end animate-fade-up"
          onClick={onMobileClose}
        >
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <aside
            className="relative w-80 max-w-[90vw] bg-white border-l border-border flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {body}
          </aside>
        </div>
      )}
    </>
  );
}

function Bullet({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <CheckCircle2 className="size-3.5" style={{ color: `var(--${color})` }} />
      <span className="text-foreground/70">{children}</span>
    </div>
  );
}

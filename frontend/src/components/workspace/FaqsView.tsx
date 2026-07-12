"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Search, ChevronRight, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useArtifact } from "@/hooks/useArtifact";
import { ArtifactHeader } from "./ArtifactHeader";
import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";

interface FaqsViewProps {
  notebookId: string;
  excludedSourceIds: string[];
}

export function FaqsView({ notebookId, excludedSourceIds }: FaqsViewProps) {
  const {
    artifact,
    status,
    errorMessage,
    isLoading,
    isGenerating,
    generate,
    retry,
    deleteArtifact,
    history,
    selectedArtifactId,
    setSelectedArtifactId,
  } = useArtifact(notebookId, "faqs", excludedSourceIds);

  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Set default open item when artifact is ready
  useEffect(() => {
    if (artifact?.status === "ready" && artifact.content_json?.items?.length > 0) {
      setOpenId("faq-0");
    } else {
      setOpenId(null);
    }
  }, [artifact?.id]);

  const rawItems =
    artifact?.status === "ready" && artifact.content_json?.items ? artifact.content_json.items : [];

  const faqItems = rawItems.map((item: any, i: number) => ({
    id: `faq-${i}`,
    category: "General",
    question: item.question || "",
    answer: item.answer || "",
  }));

  const filtered = faqItems.filter((f: any) => {
    const q = query.trim().toLowerCase();
    return !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
  });

  // 1. Loading active list
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/60 font-medium">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  // 2. Generating or Processing State
  if (isGenerating || status === "processing") {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft text-center animate-pulse">
          <Sparkles className="size-12 text-primary mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold tracking-tight mb-2">Generating FAQs</h3>
          <p className="text-sm text-foreground/60 mb-6">
            Synthesizing potential questions and answers based on your source documents...
          </p>
          <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent-pink rounded-full animate-infinite-scroll" />
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State
  if (status === "error") {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-red-50/50 backdrop-blur-xl border border-red-200/50 rounded-3xl p-8 shadow-soft text-center">
          <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold tracking-tight mb-2">Generation Failed</h3>
          <p className="text-sm text-red-600/80 mb-6">
            {errorMessage || "An unexpected error occurred while generating FAQs."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => retry()}
              className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-600/20 hover:scale-105 transition-all cursor-pointer"
            >
              Retry Generation
            </button>
            <button
              onClick={() => deleteArtifact()}
              className="px-5 py-2.5 rounded-full bg-white border border-red-200 text-foreground text-sm font-semibold hover:bg-red-50/50 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Empty State
  if (!artifact) {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
          <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
            <HelpCircle className="size-6 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">Generate FAQs</h2>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            Create a list of the most relevant and constructive questions and answers synthesized
            from your notebooks.
          </p>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            Generate FAQs
          </button>
        </div>

        <ArtifactGenerationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          type="faqs"
          onGenerate={generate}
          isGenerating={isGenerating}
          prefilledOptions={null}
        />
      </div>
    );
  }

  // 5. Ready State
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <ArtifactHeader
        title="FAQs"
        type="faqs"
        history={history}
        selectedArtifactId={selectedArtifactId}
        onSelectArtifactId={setSelectedArtifactId}
        onGenerateAgain={() => setIsDialogOpen(true)}
        onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
        icon={<HelpCircle className="size-3 text-accent-mint" />}
      />

      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-3 text-gradient">
            Questions, answered.
          </h2>
          <p className="text-foreground/60 mb-8 font-medium">
            The {faqItems.length} most likely questions a reader would ask about this notebook,
            synthesized from your sources.
          </p>

          {/* Search */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-border text-sm outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
              />
            </div>
          </div>

          {/* FAQ list */}
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-sm text-foreground/50">
                No FAQs match your search.
              </div>
            )}
            {filtered.map((f: any) => {
              const open = openId === f.id;
              return (
                <div
                  key={f.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    open
                      ? "border-primary/30 bg-white shadow-soft"
                      : "border-border bg-white/60 hover:bg-white"
                  }`}
                >
                  <button
                    onClick={() => setOpenId(open ? null : f.id)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 cursor-pointer"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-foreground/40">
                          {f.category}
                        </span>
                      </span>
                      <span className="block text-sm font-bold tracking-tight leading-snug">
                        {f.question}
                      </span>
                    </span>
                    <span
                      className={`size-7 shrink-0 rounded-full grid place-items-center transition-all ${
                        open
                          ? "bg-primary text-primary-foreground rotate-90"
                          : "bg-foreground/5 text-foreground/60"
                      }`}
                    >
                      <ChevronRight className="size-3.5" />
                    </span>
                  </button>
                  {open && (
                    <div className="px-5 pb-5 animate-fade-up">
                      <p className="text-sm leading-relaxed text-foreground/75">{f.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 rounded-2xl border border-dashed border-border bg-white/40 flex items-center gap-3">
            <Sparkles className="size-4 text-primary shrink-0" />
            <p className="text-xs text-foreground/65 flex-1 font-medium">
              Don't see your question? Ask the Assistant — it'll cite the relevant passages.
            </p>
          </div>
        </div>
      </div>

      <ArtifactGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        type="faqs"
        onGenerate={generate}
        isGenerating={isGenerating}
        prefilledOptions={artifact?.options_json}
      />
    </div>
  );
}

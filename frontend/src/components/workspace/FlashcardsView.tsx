"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Sparkles, BookOpen, Layers } from "lucide-react";
import { useArtifact } from "@/hooks/useArtifact";
import { ArtifactHeader } from "./ArtifactHeader";
import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";

interface FlashcardsViewProps {
  notebookId: string;
  excludedSourceIds: string[];
}

export function FlashcardsView({ notebookId, excludedSourceIds }: FlashcardsViewProps) {
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
  } = useArtifact(notebookId, "flashcards", excludedSourceIds);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Reset index when active artifact changes
  useEffect(() => {
    setIdx(0);
    setFlipped(false);
  }, [artifact?.id]);

  const cards =
    artifact?.status === "ready" && artifact.content_json?.cards ? artifact.content_json.cards : [];

  const total = cards.length;
  const card = cards[idx];

  // 1. Loading active list
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/60 font-medium">Loading flashcards...</p>
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
          <h3 className="text-xl font-bold tracking-tight mb-2">Generating Flashcards</h3>
          <p className="text-sm text-foreground/60 mb-6">
            Analyzing source documents to extract key definitions and concepts...
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
            {errorMessage || "An unexpected error occurred while generating flashcards."}
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
            <BookOpen className="size-6 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">Flashcards Generation</h2>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            Generate custom flashcards mapping terms, key quotes, and explanations from your
            uploaded notebooks.
          </p>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            Generate Flashcards
          </button>
        </div>

        <ArtifactGenerationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          type="flashcards"
          onGenerate={generate}
          isGenerating={isGenerating}
          prefilledOptions={null}
        />
      </div>
    );
  }

  // 5. Active Card View
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <ArtifactHeader
        title="Flashcards"
        type="flashcards"
        history={history}
        selectedArtifactId={selectedArtifactId}
        onSelectArtifactId={setSelectedArtifactId}
        onGenerateAgain={() => setIsDialogOpen(true)}
        onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
        icon={<Layers className="size-3 text-primary" />}
      />

      <div className="flex-1 overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight">
              Card {idx + 1} of {total}
            </h2>
          </div>

          {card && (
            <button
              onClick={() => setFlipped((f) => !f)}
              className="w-full min-h-[300px] rounded-3xl bg-gradient-to-br from-white via-white to-primary/5 border border-border shadow-soft p-10 flex flex-col items-center justify-center text-center mb-6 hover:shadow-float transition-all duration-300 relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 relative z-10">
                {flipped ? "Answer / Definition" : "Question / Concept"}
              </p>
              <p className="text-2xl font-bold tracking-tight text-balance leading-tight relative z-10">
                {flipped ? card.back : card.front}
              </p>
              <p className="text-[11px] text-foreground/40 mt-8 font-medium relative z-10">
                Tap card to flip
              </p>
            </button>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setIdx((i) => Math.max(0, i - 1));
                setFlipped(false);
              }}
              disabled={idx === 0}
              className="px-4 py-2 rounded-full bg-foreground/5 hover:bg-foreground/10 disabled:opacity-40 text-sm font-semibold cursor-pointer"
            >
              Previous
            </button>
            <div className="flex gap-1.5 max-w-[200px] overflow-x-auto scrollbar-none py-2">
              {cards.map((_:unknown, i:number) => (
                <div
                  key={i}
                  className={`h-1 w-6 rounded-full shrink-0 transition-colors ${
                    i === idx ? "bg-primary" : i < idx ? "bg-primary/40" : "bg-foreground/10"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => {
                setIdx((i) => Math.min(total - 1, i + 1));
                setFlipped(false);
              }}
              disabled={idx === total - 1}
              className="px-4 py-2 rounded-full bg-foreground text-background disabled:opacity-40 text-sm font-semibold cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ArtifactGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        type="flashcards"
        onGenerate={generate}
        isGenerating={isGenerating}
        prefilledOptions={artifact?.options_json}
      />
    </div>
  );
}

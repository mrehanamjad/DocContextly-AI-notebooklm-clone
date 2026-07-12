"use client";

import { useState, useEffect } from "react";
import {
  StickyNote,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useArtifact } from "@/hooks/useArtifact";
import { ArtifactHeader } from "./ArtifactHeader";
import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";

interface SummaryViewProps {
  notebookId: string;
  excludedSourceIds: string[];
  autoOpenDialog?: { prompt: string; timestamp: number } | null;
  onDialogOpenHandled?: () => void;
}

export function SummaryView({
  notebookId,
  excludedSourceIds,
  autoOpenDialog,
  onDialogOpenHandled,
}: SummaryViewProps) {
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
  } = useArtifact(notebookId, "summary", excludedSourceIds);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customPrefill, setCustomPrefill] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (autoOpenDialog && autoOpenDialog.timestamp) {
      setCustomPrefill({ prompt: autoOpenDialog.prompt });
      setIsDialogOpen(true);
      if (onDialogOpenHandled) {
        onDialogOpenHandled();
      }
    }
  }, [autoOpenDialog, onDialogOpenHandled]);

  const summaryContent =
    artifact?.status === "ready" && artifact.content_json
      ? (artifact.content_json as {
          title: string;
          overview: string;
          key_points: string[];
          sections: Array<{
            heading: string;
            bullets: string[];
          }>;
        })
      : null;

  // 1. Loading active list
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/60 font-medium">Loading summary...</p>
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
          <h3 className="text-xl font-bold tracking-tight mb-2">Generating Summary</h3>
          <p className="text-sm text-foreground/60 mb-6">
            Analyzing source documents, extracting core concepts, and summarizing key takeaways...
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
            {errorMessage || "An unexpected error occurred while generating summary."}
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
  if (!artifact || !summaryContent) {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
          <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
            <StickyNote className="size-6 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">Notebook Summary</h2>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            Generate a concise, structured overview, key takeaways list, and detailed bulleted
            section summaries from all notebook sources.
          </p>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            Generate Summary
          </button>
        </div>

        <ArtifactGenerationDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setCustomPrefill(null);
          }}
          type="summary"
          onGenerate={generate}
          isGenerating={isGenerating}
          prefilledOptions={customPrefill || null}
        />
      </div>
    );
  }

  // 5. Ready State
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <ArtifactHeader
        title="Summary"
        type="summary"
        history={history}
        selectedArtifactId={selectedArtifactId}
        onSelectArtifactId={setSelectedArtifactId}
        onGenerateAgain={() => setIsDialogOpen(true)}
        onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
        icon={<StickyNote className="size-3 text-primary" />}
      />

      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight mb-6 pb-4 border-b border-border">
            {summaryContent.title || "Summary"}
          </h2>

          {/* Overview */}
          {summaryContent.overview && (
            <div className="mb-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                Overview
              </h3>
              <p className="text-sm leading-relaxed text-foreground/80">
                {summaryContent.overview}
              </p>
            </div>
          )}

          {/* Key Takeaways */}
          {summaryContent.key_points && summaryContent.key_points.length > 0 && (
            <div className="mb-8 bg-gradient-to-br from-white via-white to-primary/5 border border-border rounded-3xl p-6 md:p-8 shadow-soft">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" /> Key Takeaways
              </h3>
              <ul className="space-y-3">
                {summaryContent.key_points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex gap-3 items-start">
                    <span className="font-mono text-primary font-bold text-xs shrink-0 mt-0.5">
                      {String(pIdx + 1).padStart(2, "0")}
                    </span>
                    <p className="text-xs font-medium text-foreground/75 leading-relaxed">{pt}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Outline Sections */}
          <div className="space-y-8 mb-12">
            {summaryContent.sections?.map((section, idx) => (
              <div
                key={idx}
                className="bg-white/40 border border-border/80 rounded-2xl p-6 shadow-soft"
              >
                <h3 className="text-base font-bold tracking-tight mb-3 flex items-center gap-2">
                  <ChevronRight className="size-4 text-primary shrink-0" />
                  {section.heading}
                </h3>
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-2 pl-4 list-disc text-xs text-foreground/75 leading-relaxed">
                    {section.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ArtifactGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setCustomPrefill(null);
        }}
        type="summary"
        onGenerate={generate}
        isGenerating={isGenerating}
        prefilledOptions={customPrefill || artifact?.options_json}
      />
    </div>
  );
}

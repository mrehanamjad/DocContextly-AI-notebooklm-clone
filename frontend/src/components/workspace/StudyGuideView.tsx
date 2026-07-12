"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Layers,
} from "lucide-react";
import { useArtifact } from "@/hooks/useArtifact";
import { ArtifactHeader } from "./ArtifactHeader";
import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";

interface StudyGuideViewProps {
  notebookId: string;
  excludedSourceIds: string[];
}

export function StudyGuideView({ notebookId, excludedSourceIds }: StudyGuideViewProps) {
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
  } = useArtifact(notebookId, "study-guide", excludedSourceIds);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const guideContent =
    artifact?.status === "ready" && artifact.content_json
      ? (artifact.content_json as {
          title: string;
          overview: string;
          sections: Array<{
            heading: string;
            explanation: string;
            key_points: string[];
            important_terms: string[];
          }>;
          review_questions: string[];
        })
      : null;

  // 1. Loading active list
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/60 font-medium">Loading study guide...</p>
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
          <h3 className="text-xl font-bold tracking-tight mb-2">Generating Study Guide</h3>
          <p className="text-sm text-foreground/60 mb-6">
            Synthesizing overview, key terms, outlines, and review questions from your notebook
            sources...
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
            {errorMessage || "An unexpected error occurred while generating study guide."}
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
  if (!artifact || !guideContent) {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
          <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
            <FileText className="size-6 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">Study Guide Generation</h2>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            Generate an organized overview, key concept sections, term glossary, and review
            questions synthesized from all sources.
          </p>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            Generate Study Guide
          </button>
        </div>

        <ArtifactGenerationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          type="study-guide"
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
        title="Study Guide"
        type="study-guide"
        history={history}
        selectedArtifactId={selectedArtifactId}
        onSelectArtifactId={setSelectedArtifactId}
        onGenerateAgain={() => setIsDialogOpen(true)}
        onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
        icon={<FileText className="size-3 text-primary" />}
      />

      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight mb-6 pb-4 border-b border-border">
            {guideContent.title || "Study Guide"}
          </h2>

          {/* Overview */}
          {guideContent.overview && (
            <div className="mb-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                Overview
              </h3>
              <p className="text-sm leading-relaxed text-foreground/80">{guideContent.overview}</p>
            </div>
          )}

          {/* Guide Sections */}
          <div className="space-y-8 mb-12">
            {guideContent.sections?.map((section, idx) => (
              <div
                key={idx}
                className="bg-white/40 border border-border/80 rounded-2xl p-6 shadow-soft"
              >
                <h3 className="text-lg font-bold tracking-tight mb-3 flex items-center gap-2">
                  <span className="size-5 rounded-full bg-primary/10 text-primary text-[11px] font-mono font-bold grid place-items-center">
                    {idx + 1}
                  </span>
                  {section.heading}
                </h3>
                <p className="text-sm text-foreground/75 leading-relaxed mb-4">
                  {section.explanation}
                </p>

                {/* Key points */}
                {section.key_points?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2 flex items-center gap-1">
                      <BookOpen className="size-3" /> Key Points
                    </h4>
                    <ul className="space-y-1.5 pl-5 list-disc text-xs text-foreground/70">
                      {section.key_points.map((pt, pIdx) => (
                        <li key={pIdx} className="leading-relaxed">
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Important terms */}
                {section.important_terms?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2 flex items-center gap-1">
                      <Layers className="size-3" /> Important Terms
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {section.important_terms.map((termStr, tIdx) => {
                        const colonIdx = termStr.indexOf(":");
                        const term =
                          colonIdx !== -1 ? termStr.substring(0, colonIdx).trim() : termStr;
                        const definition =
                          colonIdx !== -1 ? termStr.substring(colonIdx + 1).trim() : "";
                        return (
                          <div
                            key={tIdx}
                            className="p-3 bg-white/60 border border-border rounded-xl"
                          >
                            <span className="block text-xs font-bold text-primary mb-1">
                              {term}
                            </span>
                            {definition && (
                              <span className="block text-[11px] text-foreground/60 leading-normal">
                                {definition}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Review Questions */}
          {guideContent.review_questions?.length > 0 && (
            <div className="bg-gradient-to-br from-white via-white to-primary/5 border border-border rounded-3xl p-6 md:p-8">
              <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                <HelpCircle className="size-5 text-primary" />
                Review Questions
              </h3>
              <div className="space-y-3">
                {guideContent.review_questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="flex gap-3 items-start p-3 bg-white/60 border border-border rounded-xl"
                  >
                    <span className="text-xs font-mono font-bold text-foreground/45 mt-0.5">
                      {qIdx + 1}.
                    </span>
                    <p className="text-xs font-semibold text-foreground/80 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ArtifactGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        type="study-guide"
        onGenerate={generate}
        isGenerating={isGenerating}
        prefilledOptions={artifact?.options_json}
      />
    </div>
  );
}

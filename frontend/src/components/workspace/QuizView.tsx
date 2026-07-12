"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Check,
  X,
  RotateCcw,
  ListChecks,
  Sparkles,
  Quote,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useArtifact } from "@/hooks/useArtifact";
import { adaptBackendQuizQuestionToFrontend } from "@/lib/api/types";
import { ArtifactHeader } from "./ArtifactHeader";
import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";

interface QuizViewProps {
  notebookId: string;
  excludedSourceIds: string[];
}

export function QuizView({ notebookId, excludedSourceIds }: QuizViewProps) {
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
  } = useArtifact(notebookId, "quiz", excludedSourceIds);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Reset local interactive state when a new artifact is loaded
  useEffect(() => {
    setIdx(0);
    setSelected(null);
    setAnswers({});
    setRevealed(false);
    setFinished(false);
  }, [artifact?.id]);

  console.log("artifact:", artifact);
  console.log("status:", status);
  console.log("errorMessage:", errorMessage);
  console.log("isLoading:", isLoading);
  console.log("isGenerating:", isGenerating);
  console.log("history:", history);
  console.log("selectedArtifactId:", selectedArtifactId);

  const questions =
    artifact?.status === "ready" && artifact.content_json?.questions
      ? artifact.content_json.questions.map((q: any, i: number) =>
          adaptBackendQuizQuestionToFrontend(
            q,
            i,
            q.difficulty ||
              (artifact?.options_json?.difficulty === "mix"
                ? "medium"
                : artifact?.options_json?.difficulty || "medium"),
          ),
        )
      : [];

  const total = questions.length;
  const q = questions[idx];
  const score = questions.reduce(
    (n: number, qq: any) => n + (answers[qq.id] === qq.answerIndex ? 1 : 0),
    0,
  );

  function submit() {
    if (selected === null || !q) return;
    setAnswers((a) => ({ ...a, [q.id]: selected }));
    setRevealed(true);
  }

  function next() {
    if (idx + 1 >= total) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  function handleReset() {
    setIdx(0);
    setSelected(null);
    setAnswers({});
    setRevealed(false);
    setFinished(false);
  }

  // 1. Loading active artifact list
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/60 font-medium">Loading quiz details...</p>
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
          <h3 className="text-xl font-bold tracking-tight mb-2">Generating Quiz</h3>
          <p className="text-sm text-foreground/60 mb-6">
            Reading sources, checking definitions, and creating multiple-choice questions...
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
            {errorMessage || "An unexpected error occurred while generating the quiz."}
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

  // 4. Empty State (No artifact yet)
  if (!artifact) {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
          <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
            <ListChecks className="size-6 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">Quiz Generation</h2>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            Test your comprehension of the loaded sources. Define the quantity of questions and
            difficulty level.
          </p>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            Generate Quiz
          </button>
        </div>

        <ArtifactGenerationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          type="quiz"
          onGenerate={generate}
          isGenerating={isGenerating}
          prefilledOptions={null}
        />
      </div>
    );
  }

  // Helper to render the quiz completion screen
  const renderFinishedState = () => {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 via-accent-pink/20 to-accent-blue/20 grid place-items-center mx-auto mb-6">
          <Trophy className="size-7 text-primary" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-2">
          Quiz complete
        </div>
        <h2 className="text-4xl font-extrabold tracking-tighter mb-3">
          {score} / {total} correct
        </h2>
        <p className="text-foreground/60 mb-8">
          {pct >= 80
            ? "Excellent grasp of the material."
            : pct >= 50
              ? "Solid foundation — review the misses below."
              : "Worth another pass through your sources."}
        </p>

        <div className="text-left space-y-3 mb-8">
          {questions.map((qq: any, i: number) => {
            const correct = answers[qq.id] === qq.answerIndex;
            return (
              <div
                key={qq.id}
                className={`p-4 rounded-2xl border ${
                  correct
                    ? "bg-accent-mint/10 border-accent-mint/30"
                    : "bg-accent-pink/5 border-accent-pink/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`size-5 shrink-0 rounded-full grid place-items-center text-[10px] font-bold text-white mt-0.5 ${
                      correct ? "bg-accent-mint" : "bg-accent-pink"
                    }`}
                  >
                    {correct ? <Check className="size-3" /> : <X className="size-3" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold mb-1 leading-snug">
                      Q{i + 1}. {qq.question}
                    </p>
                    <p className="text-xs text-foreground/60">
                      Correct answer:{" "}
                      <span className="font-semibold text-foreground/80">
                        {qq.options[qq.answerIndex]}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold cursor-pointer"
          >
            <RotateCcw className="size-3.5" /> Retake quiz
          </button>
        </div>
      </div>
    );
  };

  // Helper to render the interactive quiz questions
  const renderInteractiveState = () => {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Question {idx + 1} of {total}
          </h2>
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border capitalize ${
              q?.difficulty === "easy"
                ? "text-accent-mint border-accent-mint/30 bg-accent-mint/5"
                : q?.difficulty === "medium"
                  ? "text-accent-blue border-accent-blue/30 bg-accent-blue/5"
                  : "text-accent-pink border-accent-pink/30 bg-accent-pink/5"
            }`}
          >
            {q?.difficulty || "medium"}
          </span>
        </div>

        <div className="flex gap-1.5 mb-6">
          {questions.map((_: any, i: number) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i === idx ? "bg-primary" : i < idx ? "bg-primary/40" : "bg-foreground/10"
              }`}
            />
          ))}
        </div>

        {q && (
          <div className="bg-gradient-to-br from-white via-white to-primary/5 border border-border rounded-3xl p-6 md:p-8 shadow-soft mb-5">
            <p className="text-lg md:text-xl font-bold tracking-tight leading-snug mb-6 text-balance">
              {q.question}
            </p>

            <div className="space-y-2">
              {q.options.map((opt: string, i: number) => {
                const isSelected = selected === i;
                const isCorrect = revealed && i === q.answerIndex;
                const isWrong = revealed && isSelected && i !== q.answerIndex;
                return (
                  <button
                    key={i}
                    onClick={() => !revealed && setSelected(i)}
                    disabled={revealed}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left text-sm transition-all ${
                      isCorrect
                        ? "border-accent-mint/50 bg-accent-mint/10 font-medium"
                        : isWrong
                          ? "border-accent-pink/50 bg-accent-pink/10 font-medium"
                          : isSelected
                            ? "border-primary/50 bg-primary/5 font-medium"
                            : "border-border bg-white hover:border-primary/30 hover:bg-primary/5"
                    } ${revealed ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <span
                      className={`size-6 shrink-0 rounded-full grid place-items-center text-[10px] font-mono font-bold border ${
                        isCorrect
                          ? "bg-accent-mint text-white border-accent-mint"
                          : isWrong
                            ? "bg-accent-pink text-white border-accent-pink"
                            : isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-foreground/50"
                      }`}
                    >
                      {isCorrect ? (
                        <Check className="size-3" />
                      ) : isWrong ? (
                        <X className="size-3" />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {revealed && q.explanation && (
              <div className="mt-5 p-4 rounded-2xl bg-foreground/5 border border-border animate-fade-up">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="size-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                    Explanation
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-foreground/75 mb-3">{q.explanation}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-foreground/55">
            Score: <span className="font-bold text-foreground">{score}</span> /{" "}
            {Object.keys(answers).length || "—"}
          </span>
          {revealed ? (
            <button
              onClick={next}
              className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              {idx + 1 >= total ? "See results" : "Next question"}
              <ChevronRight className="size-3.5" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={selected === null}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/30 disabled:opacity-40 disabled:shadow-none cursor-pointer"
            >
              Submit answer
            </button>
          )}
        </div>
      </div>
    );
  };

  // Unified layout with fixed top header and scrollable content
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <ArtifactHeader
        title="Quiz"
        type="quiz"
        history={history}
        selectedArtifactId={selectedArtifactId}
        onSelectArtifactId={setSelectedArtifactId}
        onGenerateAgain={() => setIsDialogOpen(true)}
        onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
        icon={<ListChecks className="size-3" />}
      />

      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        {finished ? renderFinishedState() : renderInteractiveState()}
      </div>

      <ArtifactGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        type="quiz"
        onGenerate={generate}
        isGenerating={isGenerating}
        prefilledOptions={artifact?.options_json}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";
import type { ArtifactType } from "@/lib/api/types";
import { toast } from "sonner";

interface ArtifactGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: ArtifactType;
  onGenerate: (payload: any) => Promise<any>;
  isGenerating: boolean;
  prefilledOptions?: Record<string, any> | null;
}

export function ArtifactGenerationDialog({
  isOpen,
  onClose,
  type,
  onGenerate,
  isGenerating,
  prefilledOptions,
}: ArtifactGenerationDialogProps) {
  // Common states
  const [prompt, setPrompt] = useState("");

  // Quiz states
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mix">("medium");

  // Flashcards states
  const [numberOfCards, setNumberOfCards] = useState(5);

  // FAQ states
  const [numberOfFaqs, setNumberOfFaqs] = useState(5);

  // Study Guide states
  const [size, setSize] = useState<"short" | "medium" | "large">("medium");

  // Voice Overview states
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [voiceStyle, setVoiceStyle] = useState<"default" | "energetic" | "calm">("default");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load prefilled options when dialog opens or prefilledOptions changes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setPrompt(prefilledOptions?.prompt || "");

      if (type === "quiz") {
        setNumberOfQuestions(
          prefilledOptions?.number_of_questions || prefilledOptions?.question_count || 5,
        );
        setDifficulty(prefilledOptions?.difficulty || "medium");
      } else if (type === "flashcards") {
        setNumberOfCards(prefilledOptions?.number_of_cards || prefilledOptions?.card_count || 5);
      } else if (type === "faqs") {
        setNumberOfFaqs(prefilledOptions?.number_of_faqs || prefilledOptions?.faq_count || 5);
      } else if (type === "study-guide") {
        setSize(prefilledOptions?.size || "medium");
      } else if (type === "voice_overview") {
        setLength(prefilledOptions?.length || "medium");
        setVoiceStyle(prefilledOptions?.voice_style || "default");
      } else if (type === "slide_deck") {
        setLength(prefilledOptions?.length || "medium");
      }
    }
  }, [isOpen, type, prefilledOptions]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: Record<string, any> = {};
    if (prompt.trim()) {
      payload.prompt = prompt.trim();
    }

    // Apply validations and populate payloads based on type
    if (type === "quiz") {
      const val = Math.min(Math.max(numberOfQuestions, 3), 15);
      payload.number_of_questions = val;
      payload.difficulty = difficulty;
    } else if (type === "flashcards") {
      const val = Math.min(Math.max(numberOfCards, 3), 15);
      payload.number_of_cards = val;
    } else if (type === "faqs") {
      const val = Math.min(Math.max(numberOfFaqs, 3), 15);
      payload.number_of_faqs = val;
    } else if (type === "study-guide") {
      payload.size = size;
    } else if (type === "voice_overview") {
      payload.length = length;
      payload.voice_style = voiceStyle;
      payload.host_names = null;
    } else if (type === "slide_deck") {
      payload.length = length;
    }

    try {
      toast.info(`Initiating ${getDisplayName()} generation...`);
      await onGenerate(payload);
      onClose();
      toast.success(`${getDisplayName()} generation requested!`);
    } catch (err: any) {
      if (err.message === "VALIDATION_FAILED") {
        return; // Validation hook already showed the toast, just abort without closing dialog or showing another error
      }
      console.error(err);
      const errMsg = err.message || "Failed to initiate generation. Please try again.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
    }
  };

  const getDisplayName = () => {
    switch (type) {
      case "quiz":
        return "Quiz";
      case "flashcards":
        return "Flashcards";
      case "faqs":
        return "FAQs";
      case "study-guide":
        return "Study Guide";
      case "summary":
        return "Summary";
      case "mindmap":
        return "Mind Map";
      case "voice_overview":
        return "Voice Overview";
      case "slide_deck":
        return "Slide Deck";
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl relative text-foreground">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-foreground/5 text-foreground/45 hover:text-foreground/80 transition-colors cursor-pointer"
        >
          <X className="size-4.5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <span>Generate {getDisplayName()}</span>
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dynamic Configuration Fields */}
          {type === "quiz" && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-2 bg-foreground/5 p-1 rounded-xl border border-border">
                  {[
                    { label: "Fewer", value: 3 },
                    { label: "Standard", value: 5 },
                    { label: "More", value: 10 },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNumberOfQuestions(opt.value)}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        numberOfQuestions === opt.value
                          ? "bg-white text-foreground shadow-sm"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2 bg-foreground/5 p-1 rounded-xl border border-border">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                        difficulty === d
                          ? "bg-white text-foreground shadow-sm"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {type === "flashcards" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">
                Number of Cards (3 - 15)
              </label>
              <input
                type="number"
                min={3}
                max={15}
                value={numberOfCards}
                onChange={(e) => setNumberOfCards(parseInt(e.target.value) || 5)}
                className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
          )}

          {type === "faqs" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">
                Number of FAQ Items (3 - 15)
              </label>
              <input
                type="number"
                min={3}
                max={15}
                value={numberOfFaqs}
                onChange={(e) => setNumberOfFaqs(parseInt(e.target.value) || 5)}
                className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
          )}

          {type === "study-guide" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">
                Guide Size
              </label>
              <select
                value={size}
                onChange={(e: any) => setSize(e.target.value)}
                className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          )}

          {(type === "voice_overview" || type === "slide_deck") && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                  Length
                </label>
                <div className="grid grid-cols-3 gap-2 bg-foreground/5 p-1 rounded-xl border border-border">
                  {(["short", "medium", "long"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLength(l)}
                      className={`py-2 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                        length === l
                          ? "bg-white text-foreground shadow-sm"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {type === "voice_overview" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                    Voice Style
                  </label>
                <div className="space-y-2">
                  {[
                    {
                      id: "default",
                      title: "Default",
                      subtitle: "Andrew + Ava",
                      desc: "Warm male + expressive female",
                      recommended: true,
                    },
                    {
                      id: "energetic",
                      title: "Energetic",
                      subtitle: "Guy + Jenny",
                      desc: "Upbeat conversation",
                    },
                    {
                      id: "calm",
                      title: "Calm",
                      subtitle: "Brian + Aria",
                      desc: "Relaxed and measured",
                    },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setVoiceStyle(style.id as any)}
                      className={`w-full flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        voiceStyle === style.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-foreground/5 hover:bg-foreground/10"
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {style.title}{" "}
                          <span className="text-foreground/45 font-medium font-mono text-[10px] ml-1">
                            ({style.subtitle})
                          </span>
                        </span>
                        {style.recommended && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            Recommended
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-foreground/60 mt-0.5">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              )}
            </>
          )}

          {/* Common Prompt Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">
              Additional Instructions (Optional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                type === "voice_overview"
                  ? "Focus on specific topics or leave blank for a general conversation..."
                  : type === "slide_deck"
                  ? "Describe the focus of your presentation..."
                  : "e.g. Focus on chapters 3 and 4, emphasize terminology..."
              }
              rows={3}
              maxLength={2000}
              className="w-full px-4 py-2.5 bg-foreground/5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-full hover:bg-foreground/5 border border-border text-foreground text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-black/10 hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

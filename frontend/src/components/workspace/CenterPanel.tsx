"use client";

import { X, MoreHorizontal } from "lucide-react";
import type { ComponentType } from "react";
import { AssistantView } from "./AssistantView";
import { PodcastView } from "./PodcastView";
import { FlashcardsView } from "./FlashcardsView";
import { QuizView } from "./QuizView";
import { FaqsView } from "./FaqsView";

import { MindMapView } from "./MindMapView";
import { StudyGuideView } from "./StudyGuideView";
import { SummaryView } from "./SummaryView";
import {
  MessageSquare,
  Headphones,
  BookOpen,
  ListChecks,
  HelpCircle,
  Presentation,
  Calendar,
  Network,
  FileText,
  StickyNote,
} from "lucide-react";
import type { FrontendChatMessage } from "@/lib/api/types";
import { SlidesView } from "./SlidesView";
import { ReportView } from "./ReportView";
import { DataTableView } from "./DataTableView";
import { FileText as FileTextIcon, Table as TableIcon } from "lucide-react";

export type Tab =
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

export const TAB_META: Record<Tab, { label: string; Icon: any }> = {
  assistant: { label: "Assistant", Icon: MessageSquare },
  podcast: { label: "Podcast", Icon: Headphones },
  flashcards: { label: "Flashcards", Icon: BookOpen },
  quiz: { label: "Quiz", Icon: ListChecks },
  faqs: { label: "FAQs", Icon: HelpCircle },
  slides: { label: "Slide deck", Icon: Presentation },

  mindmap: { label: "Mind map", Icon: Network },
  guide: { label: "Study guide", Icon: FileText },
  summary: { label: "Summary", Icon: StickyNote },
  report: { label: "Report", Icon: FileTextIcon },
  datatable: { label: "Data table", Icon: TableIcon },
};

interface CenterPanelProps {
  notebookId: string;
  excludedSourceIds: string[];
  selectedSourcesCount: number;
  openTabs: Tab[];
  activeTab: Tab;
  onActivate: (t: Tab) => void;
  onClose: (t: Tab) => void;
  onOpenCitations: (m: FrontendChatMessage) => void;
  chatPrefill?: { text: string; timestamp: number } | null;
  summaryPrefill?: { prompt: string; timestamp: number } | null;
  onClearSummaryPrefill?: () => void;
}

export function CenterPanel({
  notebookId,
  excludedSourceIds,
  selectedSourcesCount,
  openTabs,
  activeTab,
  onActivate,
  onClose,
  onOpenCitations,
  chatPrefill,
  summaryPrefill,
  onClearSummaryPrefill,
}: CenterPanelProps) {
  return (
    <section className="flex-1 min-w-0  bg-white/60 backdrop-blur-xl border border-border rounded-2xl flex flex-col overflow-hidden">
      <header className="px-2 py-2 border-b border-border flex items-center gap-1 overflow-x-auto scrollbar-none">
        {openTabs.map((id) => {
          const meta = TAB_META[id];
          if (!meta) return null;
          const { label, Icon } = meta;
          const active = id === activeTab;
          const closable = id !== "assistant";
          return (
            <div
              key={id}
              className={`group flex items-center gap-1.5 pl-3 ${closable ? "pr-1" : "pr-3"} py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                active
                  ? "bg-foreground text-background"
                  : "text-foreground/60 hover:bg-foreground/5"
              }`}
            >
              <button
                onClick={() => onActivate(id)}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Icon className="size-3.5" />
                {label}
              </button>
              {closable && (
                <button
                  onClick={() => onClose(id)}
                  className={`size-4 rounded grid place-items-center ml-0.5 cursor-pointer ${
                    active
                      ? "hover:bg-white/20"
                      : "hover:bg-foreground/10 opacity-60 group-hover:opacity-100"
                  }`}
                  aria-label={`Close ${label}`}
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          );
        })}
      </header>

      <div className="flex-1 overflow-hidden relative">
        {openTabs.map((id) => (
          <div key={id} className={`absolute inset-0 ${id === activeTab ? "" : "hidden"}`}>
            {id === "assistant" && (
              <AssistantView
                notebookId={notebookId}
                excludedSourceIds={excludedSourceIds}
                selectedSourcesCount={selectedSourcesCount}
                onOpenCitations={onOpenCitations}
                prefillPrompt={chatPrefill}
              />
            )}
            {id === "podcast" && (
              <PodcastView notebookId={notebookId} excludedSourceIds={excludedSourceIds} />
            )}
            {id === "flashcards" && (
              <FlashcardsView notebookId={notebookId} excludedSourceIds={excludedSourceIds} />
            )}
            {id === "quiz" && (
              <QuizView notebookId={notebookId} excludedSourceIds={excludedSourceIds} />
            )}
            {id === "faqs" && (
              <FaqsView notebookId={notebookId} excludedSourceIds={excludedSourceIds} />
            )}

            {id === "mindmap" && (
              <MindMapView notebookId={notebookId} excludedSourceIds={excludedSourceIds} />
            )}
            {id === "guide" && (
              <StudyGuideView notebookId={notebookId} excludedSourceIds={excludedSourceIds} />
            )}
            {id === "summary" && (
              <SummaryView
                notebookId={notebookId}
                excludedSourceIds={excludedSourceIds}
                autoOpenDialog={summaryPrefill}
                onDialogOpenHandled={onClearSummaryPrefill}
              />
            )}
            {id === "slides" && <SlidesView notebookId={notebookId} excludedSourceIds={excludedSourceIds} />}
            {id === "report" && (
              <ReportView notebookId={notebookId} excludedSourceIds={excludedSourceIds} />
            )}
            {id === "datatable" && (
              <DataTableView notebookId={notebookId} excludedSourceIds={excludedSourceIds} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

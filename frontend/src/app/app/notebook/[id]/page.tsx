"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AmbientBg } from "@/components/branding/AmbientBg";
import { Logo } from "@/components/branding/Logo";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { SourcesPanel } from "@/components/workspace/SourcesPanel";
import { CenterPanel, type Tab } from "@/components/workspace/CenterPanel";
import { ArtifactsPanel } from "@/components/workspace/ArtifactsPanel";
import { UploadDialog } from "@/components/workspace/UploadDialog";
import { CitationsSheet } from "@/components/workspace/CitationsSheet";
import { SourcePreviewDrawer } from "@/components/workspace/SourcePreviewDrawer";
import { useNotebookDetail } from "@/hooks/useNotebooks";
import { useSources } from "@/hooks/useSources";
import { useAuth } from "@/context/AuthContext";
import type { FrontendChatMessage } from "@/lib/api/types";

export default function NotebookWorkspace() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const id = params?.id as string;

  const { data: nb, isLoading: isNotebookLoading, isError } = useNotebookDetail(id);

  // ─── Sources hook (fetching, mapping, selection, polling, excluded IDs) ───
  const {
    sources,
    rawSources,
    selected,
    setSelected,
    toggleSelection,
    toggleAll,
    excludedSourceIds, // Ready for Phase 4 chat integration
    isLoading: isSourcesLoading,
  } = useSources(id, !!nb);

  // ─── Tabs / UI state ──────────────────────────────────
  const [openTabs, setOpenTabs] = useState<Tab[]>(["assistant"]);
  const [activeTab, setActiveTab] = useState<Tab>("assistant");
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [previewSourceId, setPreviewSourceId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showCitations, setShowCitations] = useState<FrontendChatMessage | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"sources" | "insights" | null>(null);
  const [slideFocusMode, setSlideFocusMode] = useState(false);

  // Prefill states for context-aware drawer actions
  const [chatPrefill, setChatPrefill] = useState<{ text: string; timestamp: number } | null>(null);
  const [summaryPrefill, setSummaryPrefill] = useState<{
    prompt: string;
    timestamp: number;
  } | null>(null);

  // ─── Clear preview if the previewed source no longer exists ───
  const previewSource = previewSourceId ? sources.find((s) => s.id === previewSourceId) : null;
  const previewRaw = previewSourceId
    ? rawSources.find((s) => s.source_id === previewSourceId)
    : undefined;
  if (previewSourceId && !previewSource) {
    // Source was deleted while previewing — clear it
    // Using a microtask to avoid setState during render
    queueMicrotask(() => setPreviewSourceId(null));
  }

  // ─── Loading / Error states ────────────────────────────
  if (isAuthLoading || isNotebookLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AmbientBg />
        <div className="text-center z-10">
          <Logo size={48} className="animate-pulse mx-auto mb-4" />
          <p className="text-sm text-foreground/60 font-semibold animate-pulse">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !nb) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative p-6">
        <AmbientBg />
        <div className="text-center z-10 bg-white/40 border border-white/60 p-8 rounded-3xl max-w-md shadow-soft">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Notebook Not Found</h2>
          <p className="text-xs text-foreground/60 mb-6">
            The notebook you are trying to access doesn't exist or you don't have access to it.
          </p>
          <Link
            href="/app"
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return null;

  function openTab(t: Tab) {
    setOpenTabs((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setActiveTab(t);
    setMobilePanel(null);
  }

  function closeTab(t: Tab) {
    if (t === "assistant") return;
    setOpenTabs((prev) => {
      const next = prev.filter((x) => x !== t);
      if (activeTab === t) {
        const idx = prev.indexOf(t);
        setActiveTab(next[Math.max(0, idx - 1)] ?? "assistant");
      }
      return next;
    });
  }

  return (
    <div className="h-screen text-foreground relative flex flex-col">
      <AmbientBg />
      <WorkspaceHeader
        nb={nb}
        onOpenSources={() => setMobilePanel("sources")}
        onOpenInsights={() => setMobilePanel("insights")}
      />

      <div
        className={`flex-1 flex min-h-0 gap-3 px-3 pb-3`}
      >

        <SourcesPanel
          notebookId={id}
          sources={sources}
          selected={selected}
          onToggleSelection={toggleSelection}
          onToggleAll={toggleAll}
          activeId={activeSourceId}
          onActivate={(sid) => {
            setActiveSourceId(sid);
            setPreviewSourceId(sid);
          }}
          onUpload={() => setShowUpload(true)}
          mobileOpen={mobilePanel === "sources"}
          onMobileClose={() => setMobilePanel(null)}
        />
        <CenterPanel
          notebookId={id}
          excludedSourceIds={excludedSourceIds}
          selectedSourcesCount={selected.size}
          openTabs={openTabs}
          activeTab={activeTab}
          onActivate={setActiveTab}
          onClose={closeTab}
          onOpenCitations={setShowCitations}
          chatPrefill={chatPrefill}
          summaryPrefill={summaryPrefill}
          onClearSummaryPrefill={() => setSummaryPrefill(null)}
        />
        <ArtifactsPanel
          onGenerate={openTab}
          activeTabs={openTabs}
          mobileOpen={mobilePanel === "insights"}
          onMobileClose={() => setMobilePanel(null)}
        />
      </div>

      {showUpload && <UploadDialog notebookId={id} onClose={() => setShowUpload(false)} />}
      {showCitations && (
        <CitationsSheet
          msg={showCitations}
          onClose={() => setShowCitations(null)}
          onOpenSource={(sourceId) => {
            setPreviewSourceId(sourceId);
            setActiveSourceId(sourceId);
            setShowCitations(null);
          }}
        />
      )}
      {previewSource && (
        <SourcePreviewDrawer
          notebookId={id}
          source={previewSource}
          sourceResponse={previewRaw}
          onClose={() => setPreviewSourceId(null)}
          onAskAboutThis={(sourceId, title) => {
            setPreviewSourceId(null);
            setSelected(new Set([sourceId]));
            openTab("assistant");
            setChatPrefill({
              text: `I'd like to ask about **${title}**.\n\n`,
              timestamp: Date.now(),
            });
          }}
          onSummarize={(sourceId) => {
            setPreviewSourceId(null);
            setSelected(new Set([sourceId]));
            openTab("summary");
            setSummaryPrefill({
              prompt:
                "Create a well-structured summary highlighting the main ideas, important concepts, and key takeaways from this source.",
              timestamp: Date.now(),
            });
          }}
        />
      )}
    </div>
  );
}

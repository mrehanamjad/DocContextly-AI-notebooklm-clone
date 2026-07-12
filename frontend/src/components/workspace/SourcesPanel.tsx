"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpen,
  FileText,
  Globe,
  Youtube,
  FileAudio,
  StickyNote,
  Table,
  Minus,
  Check,
  Plus,
  X,
  Search,
  ChevronRight,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Copy,
} from "lucide-react";
import type { Source, SourceKind } from "@/lib/types-data";
import { sourceAccent } from "@/lib/types-data";
import sourcesApi from "@/lib/api/sources";
import { toast } from "sonner";

interface SourcesPanelProps {
  notebookId: string;
  sources: Source[];
  selected: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
  activeId: string | null;
  onActivate: (id: string) => void;
  onUpload: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const KIND_GROUPS: { id: SourceKind | "all"; label: string; Icon: typeof FileText }[] = [
  { id: "all", label: "All", Icon: BookOpen },
  { id: "pdf", label: "PDFs", Icon: FileText },
  { id: "doc", label: "Docs", Icon: FileText },
  { id: "url", label: "Web", Icon: Globe },
  { id: "youtube", label: "YouTube", Icon: Youtube },
  { id: "audio", label: "Audio", Icon: FileAudio },
  { id: "note", label: "Notes", Icon: StickyNote },
  { id: "csv", label: "CSV", Icon: Table },
];

export function kindIconFor(kind: SourceKind) {
  switch (kind) {
    case "pdf":
    case "doc":
      return FileText;
    case "url":
      return Globe;
    case "youtube":
      return Youtube;
    case "audio":
      return FileAudio;
    case "note":
      return StickyNote;
    case "csv":
      return Table;
  }
}

export function SourceCheckbox({
  checked,
  indeterminate,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      disabled={disabled}
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`size-4 rounded-[5px] border grid place-items-center transition-all cursor-pointer ${checked || indeterminate
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-white border-foreground/25 hover:border-foreground/50"
        } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {indeterminate ? (
        <Minus className="size-3" strokeWidth={3} />
      ) : checked ? (
        <Check className="size-3" strokeWidth={3} />
      ) : null}
    </button>
  );
}

function CodeBlock({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const codeElement = Array.isArray(children) ? children[0] : children;
  const rawText = (codeElement as any)?.props?.children;
  const text = Array.isArray(rawText) ? rawText.join("") : String(rawText ?? "");
  const language =
    /language-(\w+)/.exec((codeElement as any)?.props?.className || "")?.[1] ?? "text";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked, ignore */
    }
  };

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-border bg-foreground/[0.03]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-foreground/[0.03]">
        <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-wide">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-foreground/50 hover:text-foreground/80 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11.5px] leading-relaxed m-0 bg-transparent">
        {children}
      </pre>
    </div>
  );
}

export function MarkdownView({ children }: { children: string }) {
  return (
    <div
      className="text-[13px] leading-relaxed text-foreground/85
      [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-3
      [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2
      [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2
      [&_p]:mb-3 [&_p:last-child]:mb-0
      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
      [&_li]:mb-1
      [&_a]:text-primary [&_a]:underline [&_a:hover]:opacity-80
      [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-foreground/70 [&_blockquote]:my-3
      [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-foreground/8 [&_code]:text-[12px] [&_code]:font-mono
      [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[11.5px] [&_pre_code]:leading-relaxed
      [&_table]:w-full [&_table]:text-[12px] [&_table]:my-3 [&_table]:border-collapse
      [&_th]:border [&_th]:border-border [&_th]:bg-foreground/[0.04] [&_th]:px-2 [&_th]:py-1 [&_th]:text-left
      [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1
      [&_hr]:border-border [&_hr]:my-4
      [&_strong]:font-semibold [&_strong]:text-foreground"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: CodeBlock }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function SourcesPanel({
  notebookId,
  sources,
  selected,
  onToggleSelection,
  onToggleAll,
  activeId,
  onActivate,
  onUpload,
  mobileOpen,
  onMobileClose,
}: SourcesPanelProps) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SourceKind | "all">("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const filtered = sources.filter((s) => {
    const q = query.trim().toLowerCase();
    const matchesQ =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.excerpt.toLowerCase().includes(q) ||
      s.meta.toLowerCase().includes(q);
    const matchesK = filter === "all" || s.kind === filter;
    return matchesQ && matchesK;
  });

  const grouped = KIND_GROUPS.filter((g) => g.id !== "all")
    .map((g) => ({
      ...g,
      items: filtered.filter((s) => s.kind === g.id),
    }))
    .filter((g) => g.items.length > 0);

  const filteredIds = filtered.map((s) => s.id);
  const selectedInFiltered = filteredIds.filter((id) => selected.has(id)).length;
  const allSelected = filteredIds.length > 0 && selectedInFiltered === filteredIds.length;
  const someSelected = selectedInFiltered > 0 && !allSelected;

  const handleRetry = async (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    setMutatingId(sourceId);
    try {
      await sourcesApi.retryIngestSource(sourceId, notebookId);
      queryClient.invalidateQueries({ queryKey: ["sources", notebookId] });
      queryClient.invalidateQueries({ queryKey: ["sources-count", notebookId] });
      toast.success("Source retry initiated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to retry source. Please try again.");
    } finally {
      setMutatingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this source?")) return;
    setMutatingId(sourceId);
    try {
      await sourcesApi.deleteSource(sourceId, notebookId);
      queryClient.invalidateQueries({ queryKey: ["sources", notebookId] });
      queryClient.invalidateQueries({ queryKey: ["sources-count", notebookId] });
      toast.success("Source deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete source. Please try again.");
    } finally {
      setMutatingId(null);
    }
  };

  const body = (
    <>
      <div className="p-3 border-b border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
            Sources · {selected.size}/{sources.length}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onMobileClose}
              className="md:hidden size-6 rounded-full bg-foreground/5 grid place-items-center cursor-pointer"
              aria-label="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Enhanced Add Source Button - Now with gradient and better styling */}
        <button
          onClick={onUpload}
          className="w-full group relative overflow-hidden flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20 hover:border-primary/40 hover:from-primary/15 hover:via-primary/10 hover:to-primary/15 transition-all duration-300 text-xs font-semibold text-foreground/70 hover:text-foreground cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="relative flex items-center gap-2">
            <Plus className="size-4 transition-transform group-hover:rotate-90 duration-300" />
            <span>Add New Source</span>
          </span>
          <span className="relative text-[9px] font-medium text-foreground/40 group-hover:text-foreground/60 transition-colors">
            ✦
          </span>
        </button>

        <div className="relative">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sources"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-foreground/5 border-none text-xs outline-none focus:bg-white focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-0.5 scrollbar-none">
          {KIND_GROUPS.map((g) => {
            const active = filter === g.id;
            const count =
              g.id === "all" ? sources.length : sources.filter((s) => s.kind === g.id).length;
            if (g.id !== "all" && count === 0) return null;
            return (
              <button
                key={g.id}
                onClick={() => setFilter(g.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${active
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-white/60 text-foreground/60 border-border hover:text-foreground hover:border-foreground/20"
                  }`}
              >
                <g.Icon className="size-3" />
                {g.label}
                <span className={`ml-0.5 ${active ? "text-background/70" : "text-foreground/40"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 px-1 pt-0.5 cursor-pointer select-none hover:bg-foreground/[0.02] rounded-md py-1 transition-colors">
          <SourceCheckbox
            checked={allSelected}
            onChange={onToggleAll}
            indeterminate={someSelected}
          />
          <span className="text-[11px] font-semibold text-foreground/70">Select all sources</span>
          <span className="ml-auto text-[10px] text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded-full">
            {selectedInFiltered} selected
          </span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-10 px-4">
            <div className="size-10 rounded-full bg-foreground/5 grid place-items-center mx-auto mb-2">
              <Search className="size-4 text-foreground/40" />
            </div>
            <p className="text-xs text-foreground/60">No sources match.</p>
          </div>
        )}
        {grouped.map((g) => {
          const isCollapsed = collapsed[g.id];
          return (
            <div key={g.id}>
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronRight
                  className={`size-3 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                />
                <g.Icon className="size-3" />
                <span>{g.label}</span>
                <span className="text-foreground/30">· {g.items.length}</span>
              </button>
              {!isCollapsed && (
                <div className="mt-1 space-y-1">
                  {g.items.map((s) => {
                    const active = activeId === s.id;
                    const isSelected = selected.has(s.id);
                    const isProcessing = s.tag === "Processing";
                    const isError = s.tag === "Error";
                    const Icon = kindIconFor(s.kind);

                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (!isProcessing) onActivate(s.id);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isProcessing) onActivate(s.id);
                        }}
                        className={`group w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2 cursor-pointer ${active
                            ? "bg-primary/8 border-primary/40 shadow-soft ring-1 ring-primary/20"
                            : isError
                              ? "bg-red-50/50 border-red-200 hover:border-red-300"
                              : isSelected
                                ? "bg-white/70 border-border hover:border-foreground/15"
                                : "bg-white/30 border-border hover:bg-white hover:border-foreground/10 opacity-70"
                          } ${isProcessing ? "cursor-wait opacity-80" : ""}`}
                      >
                        <div
                          onClick={(e) => {
                            if (isProcessing) return;
                            e.stopPropagation();
                            onToggleSelection(s.id);
                          }}
                          className="pt-0.5"
                        >
                          <SourceCheckbox
                            checked={isSelected}
                            disabled={isProcessing}
                            onChange={() => onToggleSelection(s.id)}
                          />
                        </div>
                        <div
                          className={`size-7 shrink-0 rounded-lg grid place-items-center bg-white border border-border ${isError ? "text-red-500 border-red-200" : sourceAccent(s.kind)
                            }`}
                        >
                          {isProcessing ? (
                            <Loader2 className="size-3.5 animate-spin text-primary" />
                          ) : isError ? (
                            <AlertTriangle className="size-3.5 text-red-500" />
                          ) : (
                            <Icon className="size-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold leading-tight line-clamp-2 mb-0.5 ${isError ? "text-red-700" : ""}`}
                          >
                            {s.title}
                          </p>
                          {isError ? (
                            <p className="text-[9px] text-red-500 font-semibold line-clamp-1">
                              {s.excerpt}
                            </p>
                          ) : (
                            <p className="text-[10px] text-foreground/40 truncate">{s.meta}</p>
                          )}
                        </div>

                        {/* Action buttons for retry/delete */}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-1">
                          {isError && (
                            <button
                              disabled={mutatingId === s.id}
                              onClick={(e) => handleRetry(e, s.id)}
                              className="size-6 rounded-md hover:bg-foreground/5 grid place-items-center text-foreground/60 transition-colors"
                              title="Retry indexing"
                            >
                              <RotateCcw className="size-3" />
                            </button>
                          )}
                          <button
                            disabled={mutatingId === s.id}
                            onClick={(e) => handleDelete(e, s.id)}
                            className="size-6 rounded-md hover:bg-red-50 hover:text-red-500 grid place-items-center text-foreground/40 transition-colors"
                            title="Delete source"
                          >
                            {mutatingId === s.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Trash2 className="size-3" />
                            )}
                          </button>
                        </div>

                        {active && !isError && (
                          <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex w-72 shrink-0 bg-white/60 backdrop-blur-xl border border-border rounded-2xl flex-col overflow-hidden">
        {body}
      </aside>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex animate-fade-up" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <aside
            className="relative w-72 max-w-[85vw] bg-white border-r border-border flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {body}
          </aside>
        </div>
      )}
    </>
  );
}
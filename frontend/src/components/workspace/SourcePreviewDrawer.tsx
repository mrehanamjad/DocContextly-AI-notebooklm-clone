"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Table,
  Play,
  Link2,
  X,
  Sparkles,
  MessageSquare,
  Globe,
  Youtube,
  Loader2,
  AlertTriangle,
  ExternalLink,
  HardDrive,
  Clock,
  Layers,
} from "lucide-react";
import { sourceAccent, sourceIcon, type Source } from "@/lib/types-data";
import { kindIconFor, MarkdownView } from "./SourcesPanel";
import type { SourceResponse } from "@/lib/api/types";
import { useSourcePreview, PreviewType } from "@/hooks/useSourcePreview";

interface PdfPreviewProps {
  pages: string[];
  title: string;
}

function PdfPreview({ pages, title }: PdfPreviewProps) {
  const [page, setPage] = useState(0);
  const total = pages.length;
  const current = pages[page] ?? "";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] text-foreground/60">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground/5 font-mono font-semibold">
          <FileText className="size-3.5 text-primary" /> PDF
        </div>
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="size-7 rounded-md bg-foreground/5 hover:bg-foreground/10 grid place-items-center disabled:opacity-30 disabled:hover:bg-foreground/5"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="tabular-nums">
            Page {page + 1} / {total}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
            disabled={page >= total - 1}
            className="size-7 rounded-md bg-foreground/5 hover:bg-foreground/10 grid place-items-center disabled:opacity-30 disabled:hover:bg-foreground/5"
            aria-label="Next page"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="rounded-lg bg-foreground/[0.04] p-4">
        <div
          className="bg-white text-neutral-900 mx-auto shadow-[0_4px_20px_-2px_rgba(0,0,0,0.15)] rounded-sm"
          style={{ width: "100%", maxWidth: 480, aspectRatio: "8.5 / 11" }}
        >
          <div
            className="h-full w-full p-8 overflow-y-auto"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {page === 0 && (
              <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-4 font-bold">
                {title}
              </div>
            )}
            <div className="text-[11.5px] leading-relaxed whitespace-pre-wrap">{current}</div>
            <div className="mt-6 pt-3 border-t border-neutral-200 text-[9px] text-neutral-400 flex items-center justify-between">
              <span>{title}</span>
              <span>
                {page + 1} / {total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        cur.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if ((c === "\r" && text[i + 1] === "\n") || c === "\n") {
          if (c === "\r" && text[i + 1] === "\n") i++;
          cur.push(field);
          rows.push(cur);
          cur = [];
          field = "";
        }
      } else field += c;
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  return rows.filter((r) => r.length > 1 || (r[0] && r[0].length > 0));
}

function CsvPreview({ csv }: { csv: string }) {
  const rows = parseCsv(csv);
  if (rows.length === 0) return <p className="text-xs text-foreground/50">Empty file.</p>;
  const [header, ...body] = rows;

  const displayBody = body.slice(0, 100);
  const isLimited = body.length > 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-foreground/60">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground/5 font-mono font-semibold">
          <Table className="size-3.5 text-accent-mint" /> CSV
        </div>
        <span className="tabular-nums">
          {body.length} rows · {header.length} cols
        </span>
      </div>

      {isLimited && (
        <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10.5px] text-amber-600/90 font-medium">
          Showing first 100 of {body.length} rows. The full document is indexed and available for
          chat queries.
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-auto max-h-[420px]">
          <table className="w-full text-[11.5px] border-collapse">
            <thead className="sticky top-0 bg-foreground/[0.04] backdrop-blur">
              <tr>
                <th className="px-2 py-1.5 text-left font-semibold text-foreground/50 border-b border-border w-10">
                  #
                </th>
                {header.map((h, i) => (
                  <th
                    key={i}
                    className="px-2 py-1.5 text-left font-semibold border-b border-border whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayBody.map((row, ri) => (
                <tr key={ri} className="odd:bg-foreground/[0.015] hover:bg-primary/5">
                  <td className="px-2 py-1.5 text-foreground/40 tabular-nums border-b border-border/60">
                    {ri + 1}
                  </td>
                  {header.map((_, ci) => {
                    const v = row[ci] ?? "";
                    const num = v !== "" && !isNaN(Number(v));
                    return (
                      <td
                        key={ci}
                        className={`px-2 py-1.5 border-b border-border/60 whitespace-nowrap ${num ? "text-right tabular-nums font-mono text-[11px]" : ""}`}
                      >
                        {v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DocxPreview({
  title,
  markdown,
  excerpt,
}: {
  title: string;
  markdown?: string;
  excerpt: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] text-foreground/60">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground/5 font-mono font-semibold">
          <FileText className="size-3.5 text-accent-blue" /> DOCX
        </div>
        <span>Page 1 / 1</span>
      </div>
      <div className="rounded-lg bg-foreground/[0.04] p-4">
        <div
          className="bg-white text-neutral-900 mx-auto shadow-[0_4px_20px_-2px_rgba(0,0,0,0.15)] rounded-sm"
          style={{ width: "100%", maxWidth: 480, aspectRatio: "8.5 / 11" }}
        >
          <div
            className="h-full w-full px-10 py-10 overflow-y-auto"
            style={{ fontFamily: "Calibri, 'Helvetica Neue', sans-serif" }}
          >
            <h1 className="text-[18px] font-bold mb-4 text-neutral-900">{title}</h1>
            {markdown ? (
              <div className="text-[11.5px] leading-[1.55] text-neutral-800 [&_h1]:text-[15px] [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-2 [&_h2]:text-[13px] [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:text-[12px] [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5 [&_strong]:font-semibold [&_code]:font-mono [&_code]:text-[10.5px] [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-neutral-100 [&_pre]:p-2 [&_pre]:rounded [&_pre]:my-2 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:w-full [&_table]:text-[10.5px] [&_table]:my-2 [&_table]:border-collapse [&_th]:border [&_th]:border-neutral-300 [&_th]:px-1.5 [&_th]:py-1 [&_th]:bg-neutral-50 [&_th]:text-left [&_td]:border [&_td]:border-neutral-300 [&_td]:px-1.5 [&_td]:py-1 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-600 [&_blockquote]:my-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-[11.5px] leading-[1.55] text-neutral-800">{excerpt}</p>
            )}
            <div className="mt-6 pt-2 border-t border-neutral-200 text-[9px] text-neutral-400 flex items-center justify-between">
              <span>{title}</span>
              <span>1 / 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocxFallbackPreview({
  title,
  fileSize,
  excerpt,
  downloadUrl,
}: {
  title: string;
  fileSize?: number;
  excerpt?: string;
  downloadUrl?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-foreground/[0.02] p-5 flex flex-col items-center text-center">
        <div className="size-12 rounded-2xl bg-blue-500/10 grid place-items-center mb-3">
          <FileText className="size-6 text-blue-500" />
        </div>
        <h4 className="text-sm font-bold text-foreground/80 mb-1 max-w-full truncate px-4">
          {title}
        </h4>
        {fileSize && <p className="text-xs text-foreground/50 mb-4">{formatFileSize(fileSize)}</p>}

        {downloadUrl && (
          <div className="flex items-center gap-2.5 w-full max-w-xs">
            <a
              href={downloadUrl}
              download={title}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              Download
            </a>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              Open File <ExternalLink className="size-3" />
            </a>
          </div>
        )}
      </div>

      {excerpt && (
        <div className="p-4 rounded-xl border border-border bg-foreground/[0.01] space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-foreground/45 font-bold">
            Document Abstract
          </p>
          <p className="text-xs text-foreground/70 leading-relaxed">{excerpt}</p>
        </div>
      )}
    </div>
  );
}

function EmptyPreviewState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-foreground/40 border border-dashed border-border rounded-xl">
      <FileText className="size-8 mb-2 opacity-50 text-foreground/30" />
      <p className="text-xs font-semibold">{title}</p>
      <p className="text-[10px] mt-0.5">{description}</p>
    </div>
  );
}

// ─── Helpers for metadata grid ──────────────────────────

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function sourceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    upload: "File Upload",
    website: "Web Page",
    youtube: "YouTube",
    topic: "AI Research",
    note: "Text Note",
  };
  return labels[type] ?? type;
}

function statusLabel(status: string): string {
  if (status === "processing") return "Indexing…";
  if (status === "error") return "Failed";
  return "Ready";
}

function statusColor(status: string): string {
  if (status === "processing") return "text-amber-600 font-medium";
  if (status === "error") return "text-red-500 font-medium";
  return "text-emerald-600 font-medium";
}

function PreviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-5">
      <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-2 w-12 bg-foreground/10 rounded" />
            <div className="h-3.5 w-24 bg-foreground/5 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-3 w-20 bg-foreground/10 rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-foreground/5 rounded" />
          <div className="h-4 w-[90%] bg-foreground/5 rounded" />
          <div className="h-4 w-[95%] bg-foreground/5 rounded" />
          <div className="h-4 w-[60%] bg-foreground/5 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Preview Renderer Registry ──────────────────────────

interface PreviewComponentProps {
  source: Source;
  detail: SourceResponse;
  fileContent?: string;
  onClose: () => void;
}

function PdfPreviewRenderer({ source, detail }: PreviewComponentProps) {
  if (detail.source_type === "upload" && (detail.source_data as any).pdf_pages) {
    return <PdfPreview pages={(detail.source_data as any).pdf_pages} title={source.title} />;
  }
  const url = detail.source_type === "upload" ? detail.source_data.imagekit_url : undefined;
  if (!url) {
    return (
      <EmptyPreviewState title="PDF preview unavailable" description="No file URL was provided." />
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] text-foreground/60">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground/5 font-mono font-semibold">
          <FileText className="size-3.5 text-primary" /> PDF Viewer
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:underline font-semibold cursor-pointer"
        >
          Open PDF <ExternalLink className="size-3" />
        </a>
      </div>
      <div className="rounded-xl border border-border overflow-hidden bg-foreground/[0.02] shadow-inner">
        <iframe src={url} className="w-full h-[550px] border-0" title={source.title} />
      </div>
    </div>
  );
}

function CsvPreviewRenderer({ fileContent }: PreviewComponentProps) {
  if (!fileContent || !fileContent.trim()) {
    return (
      <EmptyPreviewState
        title="Empty CSV File"
        description="This document does not contain any data."
      />
    );
  }
  return <CsvPreview csv={fileContent} />;
}

function MarkdownPreviewRenderer({ detail, fileContent }: PreviewComponentProps) {
  const content = (detail.source_type === "website" || detail.source_type === "youtube" || detail.source_type === "note")
    ? detail.source_data.content
    : fileContent || "";
  if (!content || !content.trim()) {
    return (
      <EmptyPreviewState
        title="No text available"
        description="This document contains no readable text."
      />
    );
  }
  return <MarkdownView>{content}</MarkdownView>;
}

function TextPreviewRenderer({ detail, fileContent }: PreviewComponentProps) {
  const content = (detail.source_type === "website" || detail.source_type === "youtube" || detail.source_type === "note")
    ? detail.source_data.content
    : fileContent || "";
  if (!content || !content.trim()) {
    return (
      <EmptyPreviewState
        title="No text available"
        description="This document contains no readable text."
      />
    );
  }
  return (
    <pre className="text-xs text-foreground/85 whitespace-pre-wrap font-mono p-4 rounded-xl border border-border bg-foreground/[0.02] max-h-[500px] overflow-y-auto leading-relaxed shadow-inner">
      {content}
    </pre>
  );
}

function DocxPreviewRenderer({ source, detail }: PreviewComponentProps) {
  if ((detail.source_type === "website" || detail.source_type === "youtube" || detail.source_type === "note") && detail.source_data.content) {
    return (
      <DocxPreview
        title={source.title}
        markdown={detail.source_data.content}
        excerpt={source.excerpt}
      />
    );
  }
  const url = detail.source_type === "upload" ? detail.source_data.imagekit_url : undefined;
  return (
    <DocxFallbackPreview
      title={source.title}
      fileSize={detail.source_type === "upload" ? detail.source_data.file_size_bytes : undefined}
      excerpt={source.excerpt}
      downloadUrl={url}
    />
  );
}

function YoutubePreviewRenderer({ source, detail }: PreviewComponentProps) {
  const url = detail.source_type === "youtube" || detail.source_type === "website" ? detail.source_data.url : source.url;
  let youtubeEmbedId: string | null = null;
  if (url) {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    youtubeEmbedId = match?.[1] ?? null;
  }
  return (
    <div className="space-y-3">
      {youtubeEmbedId ? (
        <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-soft">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={source.title}
          />
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-foreground/5 border border-border grid place-items-center text-foreground/40 text-xs">
          <div className="flex flex-col items-center gap-2">
            <Play className="size-8" />
            <span>Video preview unavailable</span>
          </div>
        </div>
      )}
      {(detail.source_type === "youtube" || detail.source_type === "website" || detail.source_type === "note") && detail.source_data.content && (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-foreground/45 font-bold">
            Transcript Preview
          </p>
          <div className="p-4 rounded-xl border border-border bg-foreground/[0.01] max-h-[300px] overflow-y-auto">
            <MarkdownView>{detail.source_data.content}</MarkdownView>
          </div>
        </div>
      )}
    </div>
  );
}

function UnsupportedPreviewRenderer({ source, detail }: PreviewComponentProps) {
  return (
    <div className="space-y-3">
      <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10">
        <p className="text-xs text-primary font-semibold mb-0.5">✓ Indexed and Ready</p>
        <p className="text-[11px] text-foreground/60 leading-relaxed">
          This source is fully indexed with {detail.total_chunks || 0} segments and is ready for
          search/queries.
        </p>
      </div>
      {source.excerpt && (
        <div className="p-4 rounded-xl border border-border bg-foreground/[0.01] space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-foreground/45 font-bold">
            Excerpt
          </p>
          <p className="text-xs text-foreground/75 leading-relaxed">{source.excerpt}</p>
        </div>
      )}
    </div>
  );
}

const PREVIEW_REGISTRY: Record<PreviewType, React.ComponentType<PreviewComponentProps>> = {
  pdf: PdfPreviewRenderer,
  csv: CsvPreviewRenderer,
  markdown: MarkdownPreviewRenderer,
  text: TextPreviewRenderer,
  docx: DocxPreviewRenderer,
  youtube: YoutubePreviewRenderer,
  unsupported: UnsupportedPreviewRenderer,
};

// ─── Main component ────────────────────────────────────

interface SourcePreviewDrawerProps {
  notebookId: string;
  source: Source;
  sourceResponse?: SourceResponse;
  onClose: () => void;
  onAskAboutThis?: (sourceId: string, title: string) => void;
  onSummarize?: (sourceId: string) => void;
}

export function SourcePreviewDrawer({
  notebookId,
  source,
  sourceResponse,
  onClose,
  onAskAboutThis,
  onSummarize,
}: SourcePreviewDrawerProps) {
  const Icon = kindIconFor(source.kind);

  const { previewType, detail, fileContent, isLoading, isError, errorMsg, retry } =
    useSourcePreview(notebookId, source.id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const activeDetail = detail || sourceResponse;

  // ─── Build metadata grid ───
  const meta: { label: string; value: string; icon?: React.ReactNode }[] = [];

  if (activeDetail) {
    meta.push({
      label: "Source type",
      value: sourceTypeLabel(activeDetail.source_type),
    });
    meta.push({
      label: "Status",
      value: statusLabel(activeDetail.status),
    });
    if (activeDetail.source_type === "upload" && activeDetail.source_data.file_size_bytes) {
      meta.push({
        label: "File size",
        value: formatFileSize(activeDetail.source_data.file_size_bytes),
        icon: <HardDrive className="size-3 text-foreground/40" />,
      });
    }
    if (activeDetail?.total_chunks && activeDetail.total_chunks > 0) {
      meta.push({
        label: "Chunks",
        value: `${activeDetail.total_chunks} indexed segments`,
        icon: <Layers className="size-3 text-foreground/40" />,
      });
    }
    if (activeDetail.source_type === "upload" && activeDetail.source_data.file_type) {
      meta.push({
        label: "MIME type",
        value: activeDetail.source_data.file_type,
      });
    }
    meta.push({
      label: "Added",
      value: formatDate(activeDetail.created_at),
      icon: <Clock className="size-3 text-foreground/40" />,
    });
  } else {
    meta.push({ label: "Type", value: source.kind.toUpperCase() });
    meta.push({ label: "Details", value: source.meta });
    if (source.tag) meta.push({ label: "Tag", value: source.tag });
  }

  // ─── External URL (website, YouTube, or ImageKit file URL) ───
  let externalUrl = source.url;
  if (activeDetail) {
    if (activeDetail.source_type === "website" || activeDetail.source_type === "youtube") {
      externalUrl = activeDetail.source_data.url || source.url;
    } else if (activeDetail.source_type === "upload") {
      externalUrl = activeDetail.source_data.imagekit_url || source.url;
    }
  }

  const isYoutube = source.kind === "youtube";

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-up">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="relative w-full max-w-[640px] h-full bg-background border-l border-border shadow-soft flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-border flex items-start gap-3">
          <div
            className={`size-10 shrink-0 rounded-xl grid place-items-center bg-white border border-border ${sourceAccent(source.kind)}`}
          >
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-[10px] font-mono font-bold ${sourceAccent(source.kind)}`}>
                {sourceIcon(source.kind)}
              </span>
              {activeDetail?.status === "processing" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold inline-flex items-center gap-1">
                  <Loader2 className="size-2.5 animate-spin" /> Processing
                </span>
              )}
              {activeDetail?.status === "error" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold inline-flex items-center gap-1">
                  <AlertTriangle className="size-2.5" /> Error
                </span>
              )}
              {!activeDetail && source.tag && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/5 text-foreground/60 font-semibold">
                  {source.tag}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold leading-tight">{source.title}</h3>
            <p className="text-[11px] text-foreground/50 mt-0.5">{source.meta}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {externalUrl && (activeDetail?.source_type !== "upload" || activeDetail?.source_data?.imagekit_url !== externalUrl) && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full bg-foreground/5 grid place-items-center hover:bg-foreground/10 transition-colors cursor-pointer"
                aria-label="Open externally"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="size-8 rounded-full bg-foreground/5 grid place-items-center hover:bg-foreground/10 transition-colors cursor-pointer"
              aria-label="Close preview"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <PreviewSkeleton />
          ) : isError ? (
            <div className="px-5 py-8 text-center space-y-4">
              <div className="size-12 rounded-full bg-red-500/10 grid place-items-center mx-auto">
                <AlertTriangle className="size-6 text-red-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground/80">Failed to load preview</h4>
                <p className="text-xs text-foreground/50 max-w-sm mx-auto">
                  {errorMsg || "An error occurred while fetching source details."}
                </p>
              </div>
              <button
                onClick={retry}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-md shadow-primary/20 transition-all cursor-pointer"
              >
                Retry Fetch
              </button>
            </div>
          ) : (
            <>
              {/* Metadata grid */}
              <div className="px-5 py-4 border-b border-border grid grid-cols-2 gap-3">
                {meta.map((m) => (
                  <div key={m.label}>
                    <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-semibold mb-0.5">
                      {m.label}
                    </p>
                    <p
                      className={`text-xs ${m.label === "Status" && activeDetail ? statusColor(activeDetail.status) : "text-foreground/80"} flex items-center gap-1`}
                    >
                      {m.icon}
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Processing status banner */}
              {activeDetail?.status === "processing" && (
                <div className="px-5 py-4 border-b border-border bg-amber-50/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Loader2 className="size-4 text-amber-600 animate-spin" />
                    <p className="text-sm font-semibold text-amber-700">Source is being indexed</p>
                  </div>
                  <p className="text-xs text-amber-600/80 leading-relaxed">
                    The document is being processed and will be available for chat and artifact
                    generation shortly. This page will update automatically.
                  </p>
                </div>
              )}

              {/* Error status banner */}
              {activeDetail?.status === "error" && (
                <div className="px-5 py-4 border-b border-border bg-red-50/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="size-4 text-red-500" />
                    <p className="text-sm font-semibold text-red-600">Ingestion failed</p>
                  </div>
                  <p className="text-xs text-red-500/80 leading-relaxed">
                    {activeDetail.error_message ||
                      "An error occurred during document processing. Try retrying from the sources panel."}
                  </p>
                </div>
              )}

              {/* AI summary (only if source is ready) */}
              {(!activeDetail || activeDetail.status === "ready") && (
                <div className="px-5 py-4 border-b border-border bg-foreground/[0.02]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="size-3.5 text-primary" />
                    <p className="text-[10px] uppercase tracking-wider text-foreground/50 font-bold">
                      Source details
                    </p>
                  </div>
                  <p className="text-xs text-foreground/75 leading-relaxed">{source.excerpt}</p>
                </div>
              )}

              {/* External URL link for web sources */}
              {(source.kind === "url" || isYoutube) &&
                externalUrl &&
                (activeDetail?.source_type !== "upload" || activeDetail?.source_data?.imagekit_url !== externalUrl) && (
                  <div className="px-5 py-3 border-b border-border bg-foreground/[0.02] flex items-center gap-2">
                    {isYoutube ? (
                      <Youtube className="size-3.5 text-red-500 shrink-0" />
                    ) : (
                      <Globe className="size-3.5 text-foreground/50 shrink-0" />
                    )}
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary truncate hover:underline"
                    >
                      {externalUrl}
                    </a>
                  </div>
                )}

              {/* Content preview */}
              <div className="px-5 py-5">
                <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-bold mb-3">
                  {previewType === "pdf"
                    ? "PDF preview"
                    : previewType === "csv"
                      ? "CSV preview"
                      : previewType === "docx"
                        ? "Document preview"
                        : previewType === "markdown" || previewType === "text"
                          ? "Markdown preview"
                          : "Source info"}
                </p>

                {activeDetail &&
                  (() => {
                    const Renderer = PREVIEW_REGISTRY[previewType] || UnsupportedPreviewRenderer;
                    return (
                      <Renderer
                        source={source}
                        detail={activeDetail}
                        fileContent={fileContent}
                        onClose={onClose}
                      />
                    );
                  })()}
              </div>
            </>
          )}
        </div>

        <footer className="p-3 border-t border-border flex items-center gap-2">
          <button
            onClick={() => onAskAboutThis?.(source.id, source.title)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-semibold transition-colors cursor-pointer"
          >
            <MessageSquare className="size-3.5" /> Ask about this
          </button>
          <button
            onClick={() => onSummarize?.(source.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-foreground text-background hover:opacity-90 text-xs font-semibold transition-opacity cursor-pointer"
          >
            <Sparkles className="size-3.5" /> Summarize
          </button>
        </footer>
      </aside>
    </div>
  );
}

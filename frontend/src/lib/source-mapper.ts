/**
 * Maps backend SourceResponse objects to the frontend Source shape
 * used by SourcesPanel, SourcePreviewDrawer, etc.
 */
import type { SourceResponse } from "@/lib/api/types";
import type { Source, SourceKind } from "@/lib/types-data";

/**
 * Resolve the frontend `SourceKind` from a backend `SourceResponse`.
 *
 * - "upload" → inspect file_name extension → pdf | doc | csv | audio
 * - "website" → url
 * - "youtube" → youtube
 * - "topic"   → url  (research-crawled web pages)
 * - "note"    → note
 */
function resolveKind(sr: SourceResponse): SourceKind {
  switch (sr.source_type) {
    case "website":
      return "url";
    case "youtube":
      return "youtube";
    case "note":
      return "note";
    case "upload": {
      const fileName = (sr.source_data.file_name ?? sr.title ?? "").toLowerCase();
      const mimeType = (sr.source_data.file_type ?? "").toLowerCase();

      if (fileName.endsWith(".pdf") || mimeType.includes("pdf")) return "pdf";
      if (
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc") ||
        mimeType.includes("word") ||
        mimeType.includes("document")
      )
        return "doc";
      if (fileName.endsWith(".csv") || mimeType.includes("csv")) return "csv";
      if (
        fileName.endsWith(".mp3") ||
        fileName.endsWith(".wav") ||
        fileName.endsWith(".m4a") ||
        fileName.endsWith(".ogg") ||
        mimeType.startsWith("audio/")
      )
        return "audio";
      if (
        fileName.endsWith(".md") ||
        fileName.endsWith(".txt") ||
        mimeType.includes("text/plain") ||
        mimeType.includes("text/markdown")
      )
        return "doc";

      // fallback
      return "pdf";
    }
    default:
      return "pdf";
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildMeta(sr: SourceResponse): string {
  const parts: string[] = [];

  if (sr.source_type === "upload" && sr.source_data.file_size_bytes) {
    parts.push(formatFileSize(sr.source_data.file_size_bytes));
  }

  if (sr.total_chunks > 0) {
    parts.push(`${sr.total_chunks} chunk${sr.total_chunks === 1 ? "" : "s"}`);
  }

  if (sr.status === "processing") {
    parts.push("indexing…");
  } else if (sr.status === "error") {
    parts.push("failed");
  }

  if (parts.length === 0) {
    // At minimum show the source type
    parts.push(sr.source_type);
  }

  return parts.join(" · ");
}

function buildExcerpt(sr: SourceResponse): string {
  if (sr.status === "error") {
    return sr.error_message || "Source ingestion failed.";
  }
  if (sr.status === "processing") {
    return "This source is still being processed. It will be available shortly.";
  }
  return `Source "${sr.title}" has been indexed with ${sr.total_chunks} chunks and is ready for retrieval.`;
}

function buildTag(sr: SourceResponse): string | undefined {
  if (sr.status === "processing") return "Processing";
  if (sr.status === "error") return "Error";
  return undefined;
}

/**
 * Map a single backend SourceResponse to the frontend Source shape.
 */
export function mapSourceResponseToSource(sr: SourceResponse): Source {
  const kind = resolveKind(sr);

  let url: string | undefined = undefined;
  if (sr.source_type === "upload") {
    url = sr.source_data.imagekit_url;
  } else if (sr.source_type === "website" || sr.source_type === "youtube") {
    url = sr.source_data.url;
  }

  return {
    id: sr.source_id,
    kind,
    title: sr.title,
    meta: buildMeta(sr),
    excerpt: buildExcerpt(sr),
    tag: buildTag(sr),
    url,
  };
}

/**
 * Map an array of backend source responses to frontend Source objects.
 */
export function mapSourcesToFrontend(responses: SourceResponse[]): Source[] {
  return responses.map(mapSourceResponseToSource);
}

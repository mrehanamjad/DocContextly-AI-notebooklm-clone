/**
 * Maps backend BackendCitation objects to the frontend Citation shape
 * used by CitationsSheet, AssistantView, etc.
 */
import type { BackendCitation, Citation } from "@/lib/api/types";

/**
 * Convert a single backend citation to the frontend Citation format.
 */
export function mapBackendCitation(bc: BackendCitation, index: number): Citation {
  return {
    id: `${bc.source_id}-${bc.chunk_index}`,
    sourceId: bc.source_id,
    sourceTitle: bc.file_name,
    page: bc.page_number > 0 ? `p. ${bc.page_number}` : undefined,
    snippet: bc.chunk_text,
  };
}

/**
 * Convert an array of backend citations to frontend Citation objects.
 */
export function mapBackendCitations(citations: BackendCitation[]): Citation[] {
  return citations.map(mapBackendCitation);
}

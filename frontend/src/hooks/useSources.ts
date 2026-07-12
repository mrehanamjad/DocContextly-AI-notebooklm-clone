import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import sourcesApi from "@/lib/api/sources";
import { mapSourcesToFrontend } from "@/lib/source-mapper";
import type { SourceResponse } from "@/lib/api/types";
import type { Source } from "@/lib/types-data";

interface UseSourcesReturn {
  /** Mapped frontend Source objects */
  sources: Source[];
  /** Raw backend SourceResponse objects (for preview drawer, etc.) */
  rawSources: SourceResponse[];
  /** Set of currently selected source IDs */
  selected: Set<string>;
  /** Set selection manually */
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  /** Toggle a single source's selection */
  toggleSelection: (id: string) => void;
  /** Toggle all sources on/off */
  toggleAll: () => void;
  /**
   * IDs of sources the user has UN-checked.
   * Pass this to `MessageRequest.excluded_source_ids` when sending chat messages.
   */
  excludedSourceIds: string[];
  /** True while the initial source list is loading */
  isLoading: boolean;
  /** True if any source is still in "processing" status */
  hasProcessing: boolean;
  /** Total source count from the backend */
  total: number;
}

/**
 * Hook that encapsulates all source-related state for a notebook workspace:
 * fetching, mapping, selection, polling, and excluded_source_ids computation.
 */
export function useSources(notebookId: string, enabled: boolean): UseSourcesReturn {
  // ─── Fetch sources with auto-polling for processing items ───
  const { data: sourcesData, isLoading } = useQuery({
    queryKey: ["sources", notebookId],
    queryFn: () => sourcesApi.listSources(notebookId, 1, 100),
    enabled: !!notebookId && enabled,
    staleTime: 30_000,
    refetchInterval: (query) => {
      const list = query.state.data?.sources;
      if (list?.some((s) => s.status === "processing")) return 5_000;
      return false;
    },
  });

  const rawSources: SourceResponse[] = sourcesData?.sources ?? [];

  const sources: Source[] = useMemo(
    () => (sourcesData ? mapSourcesToFrontend(sourcesData.sources) : []),
    [sourcesData],
  );

  const hasProcessing = rawSources.some((s) => s.status === "processing");

  // ─── Selection state ───
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Auto-select all "ready" sources when the list loads or changes
  useEffect(() => {
    if (rawSources.length > 0) {
      const readyIds = rawSources.filter((s) => s.status === "ready").map((s) => s.source_id);
      setSelected(new Set(readyIds));
    }
  }, [rawSources]);

  const toggleSelection = useCallback((sourceId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sourceId)) next.delete(sourceId);
      else next.add(sourceId);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const allIds = sources.map((s) => s.id);
      const allSelected = allIds.length > 0 && allIds.every((id) => prev.has(id));
      return allSelected ? new Set<string>() : new Set(allIds);
    });
  }, [sources]);

  // ─── Excluded source IDs (inverse of selected, filtered to ready sources) ───
  const excludedSourceIds: string[] = useMemo(() => {
    return rawSources
      .filter((s) => s.status === "ready" && !selected.has(s.source_id))
      .map((s) => s.source_id);
  }, [rawSources, selected]);

  return {
    sources,
    rawSources,
    selected,
    setSelected,
    toggleSelection,
    toggleAll,
    excludedSourceIds,
    isLoading,
    hasProcessing,
    total: sourcesData?.total ?? 0,
  };
}

export default useSources;

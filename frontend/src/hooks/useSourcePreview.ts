"use client";

import { useQuery } from "@tanstack/react-query";
import { sourcesApi } from "@/lib/api/sources";
import { SourceResponse } from "@/lib/api/types";
import { useCallback, useMemo } from "react";

export type PreviewType = "pdf" | "csv" | "markdown" | "text" | "docx" | "youtube" | "unsupported";

export interface UseSourcePreviewResult {
  previewType: PreviewType;
  detail: SourceResponse | null;
  fileContent: string | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMsg: string | null;
  retry: () => void;
}

export function useSourcePreview(
  notebookId: string,
  sourceId: string | null,
): UseSourcePreviewResult {
  // 1. Fetch Source Details using TanStack React Query
  const {
    data: detail,
    isLoading: isDetailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ["source", notebookId, sourceId],
    queryFn: ({ signal }) => {
      if (!sourceId) throw new Error("No source ID provided");
      return sourcesApi.getSource(sourceId, notebookId, { signal });
    },
    enabled: !!sourceId && !!notebookId,
    staleTime: 300_000, // 5 minutes
    gcTime: 1_800_000, // 30 minutes
  });

  // 2. Determine the Preview Type based on MIME type and fallback
  const previewType = useMemo<PreviewType>((): PreviewType => {
    if (!detail) return "unsupported";

    const type = detail.source_type;
    if (type === "website" || type === "note") {
      return "markdown";
    }
    if (type === "youtube") {
      return "youtube";
    }

    if (type === "upload") {
      const mimeType = detail.source_data.file_type?.toLowerCase() || "";
      const fileName = (detail.source_data.file_name || detail.title || "").toLowerCase();

      if (mimeType.includes("pdf") || fileName.endsWith(".pdf")) {
        return "pdf";
      }
      if (mimeType.includes("csv") || fileName.endsWith(".csv")) {
        return "csv";
      }
      if (mimeType.includes("markdown") || mimeType.includes("md") || fileName.endsWith(".md")) {
        return "markdown";
      }
      if (
        mimeType.includes("text/plain") ||
        mimeType.startsWith("text/") ||
        fileName.endsWith(".txt")
      ) {
        return "text";
      }
      if (
        mimeType.includes("word") ||
        mimeType.includes("officedocument.wordprocessingml") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")
      ) {
        return "docx";
      }
    }

    return "unsupported";
  }, [detail]);

  // Determine if we need to fetch the file contents from ImageKit
  const imagekitUrl = detail?.source_type === "upload" ? detail.source_data.imagekit_url : undefined;
  const shouldFetchFile = useMemo(() => {
    if (!imagekitUrl) return false;
    // For uploaded text, csv, or markdown files, we fetch the content from ImageKit
    return (
      detail?.source_type === "upload" &&
      (previewType === "csv" || previewType === "markdown" || previewType === "text")
    );
  }, [detail, imagekitUrl, previewType]);

  // 3. Fetch file from ImageKit independently and cache
  const {
    data: fileContent,
    isLoading: isLoadingFile,
    error: fileError,
    refetch: refetchFile,
  } = useQuery({
    queryKey: ["source-file", imagekitUrl],
    queryFn: async ({ signal }) => {
      if (!imagekitUrl) throw new Error("No URL to download");
      const response = await fetch(imagekitUrl, { signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch file content: ${response.status} ${response.statusText}`);
      }
      return response.text();
    },
    enabled: !!shouldFetchFile && !!imagekitUrl,
    staleTime: 300_000, // 5 minutes
    gcTime: 1_800_000, // 30 minutes
  });

  const retry = useCallback(() => {
    refetchDetail();
    if (shouldFetchFile) {
      refetchFile();
    }
  }, [refetchDetail, refetchFile, shouldFetchFile]);

  const isLoading = isDetailLoading || (shouldFetchFile && isLoadingFile);
  const isError = !!detailError || (shouldFetchFile && !!fileError);
  const errorMsg = useMemo(() => {
    if (detailError) {
      return detailError instanceof Error ? detailError.message : "Failed to fetch source details.";
    }
    if (shouldFetchFile && fileError) {
      return fileError instanceof Error ? fileError.message : "Failed to fetch file contents.";
    }
    return null;
  }, [detailError, fileError, shouldFetchFile]);

  return {
    previewType,
    detail: detail || null,
    fileContent,
    isLoading,
    isError,
    errorMsg,
    retry,
  };
}

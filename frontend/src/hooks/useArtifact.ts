// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import artifactsApi from "@/lib/api/artifacts";
// import type { ArtifactType, ArtifactResponse, ArtifactListResponse } from "@/lib/api/types";
// import { useState, useMemo, useEffect } from "react";

// function mapFrontendTypeToBackend(type: string): string {
//   switch (type) {
//     case "faqs":
//       return "faq";
//     case "study-guide":
//       return "study_guide";
//     default:
//       return type;
//   }
// }

// function mapBackendTypeToFrontend(type: string): string {
//   switch (type) {
//     case "faq":
//       return "faqs";
//     case "study_guide":
//       return "study-guide";
//     default:
//       return type;
//   }
// }

// export function useArtifact(
//   notebookId: string,
//   type: ArtifactType,
//   excludedSourceIds: string[] = [],
// ) {
//   const queryClient = useQueryClient();
//   const [isGeneratingState, setIsGenerating] = useState(false);
//   const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);

//   // 1. Fetch artifact list (no polling, just cache)
//   const { data: listData, isLoading: isLoadingList } = useQuery<ArtifactListResponse>({
//     queryKey: ["artifacts", notebookId],
//     queryFn: () => artifactsApi.listArtifacts(notebookId, 100, 1),
//     enabled: !!notebookId,
//   });

//   console.log("listData:", listData);
//   console.log("isLoadingList:", isLoadingList);

//   const isComplete = listData ? !listData.has_more : false;
//   const backendType = mapFrontendTypeToBackend(type);
//   const shouldFetchType = !!notebookId && !isLoadingList && !isComplete;

//   // 1b. Fetch type-specific history if there are more than 100 artifacts in total
//   useQuery({
//     queryKey: ["artifacts", notebookId, "type-fetch", type],
//     queryFn: async () => {
//       const res = await artifactsApi.listArtifacts(notebookId, 100, 1, backendType);

//       console.log("type-fetch res:", res);
//       // Merge those artifacts into the global cache
//       queryClient.setQueryData<ArtifactListResponse>(["artifacts", notebookId], (prev) => {
//         if (!prev) return prev;

//         // Merge by artifact id, never create duplicates
//         const existingIds = new Set(prev.artifacts.map((a) => a.id));
//         const newArtifacts = res.artifacts.filter((a) => !existingIds.has(a.id));

//         return {
//           ...prev,
//           artifacts: [...prev.artifacts, ...newArtifacts],
//         };
//       });
//       return res;
//     },
//     enabled: shouldFetchType,
//     staleTime: Infinity,
//   });

//   const artifacts = useMemo(() => listData?.artifacts ?? [], [listData]);

//   // Expose the complete list of normalized artifacts for history (of this type)
//   const history = useMemo(() => {
//     return artifacts
//       .map((a) => ({
//         ...a,
//         artifact_type: mapBackendTypeToFrontend(a.artifact_type) as ArtifactType,
//       }))
//       .filter((a) => a.artifact_type === type)
//       .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
//   }, [artifacts, type]);

//   // Determine active artifact ID (either selected by user or latest from history)
//   const activeId = selectedArtifactId || (history.length > 0 ? history[0].id : null);

//   // 2. Fetch the detailed active artifact and poll if processing
//   const {
//     data: detailData,
//     isLoading: isLoadingDetail,
//     refetch: refetchDetail,
//   } = useQuery({
//     queryKey: ["artifact", notebookId, activeId],
//     queryFn: () => artifactsApi.getArtifact(notebookId, activeId!),
//     enabled: !!notebookId && !!activeId,
//     refetchInterval: (query) => {
//       const status = query.state.data?.status;
//       if (status === "processing") {
//         return 3000;
//       }
//       return false;
//     },
//   });

//   // 3. Mutation for generating artifacts
//   const generateMutation = useMutation({
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     mutationFn: async (payload: any) => {
//       setIsGenerating(true);
//       const reqPayload = {
//         excluded_source_ids: excludedSourceIds,
//         ...payload,
//       };

//       let res: ArtifactResponse;
//       switch (type) {
//         case "quiz":
//           res = await artifactsApi.createQuiz(notebookId, reqPayload);
//           break;
//         case "flashcards":
//           res = await artifactsApi.createFlashcards(notebookId, reqPayload);
//           break;
//         case "faqs":
//           res = await artifactsApi.createFAQs(notebookId, reqPayload);
//           break;
//         case "study-guide":
//           res = await artifactsApi.createStudyGuide(notebookId, reqPayload);
//           break;
//         case "summary":
//           res = await artifactsApi.createSummary(notebookId, reqPayload);
//           break;
//         case "mindmap":
//           res = await artifactsApi.createMindMap(notebookId, reqPayload);
//           break;
//         case "slide_deck":
//           res = await artifactsApi.createSlideDeck(notebookId, reqPayload);
//           break;
//         case "voice_overview":
//           res = await artifactsApi.createVoiceOverview(notebookId, reqPayload);
//           break;
//         case "report":
//           res = await artifactsApi.createReport(notebookId, reqPayload);
//           break;
//         case "datatable":
//           res = await artifactsApi.createDataTable(notebookId, reqPayload);
//           break;
//         default:
//           throw new Error(`Unsupported artifact type: ${type}`);
//       }
//       return res;
//     },
//     onSuccess: (data) => {
//       // Manually insert the newly created artifact into the cached list
//       queryClient.setQueryData<ArtifactListResponse>(["artifacts", notebookId], (prev) => {
//         if (!prev) {
//           return {
//             artifacts: [data],
//             total: 1,
//             size: 100,
//             page: 1,
//             has_more: false,
//           };
//         }
//         const exists = prev.artifacts.some((a) => a.id === data.id);
//         if (exists) return prev;
//         return {
//           ...prev,
//           artifacts: [data, ...prev.artifacts],
//           total: prev.total + 1,
//         };
//       });

//       // Prepopulate detail query
//       queryClient.setQueryData(["artifact", notebookId, data.id], data);

//       setSelectedArtifactId(data.id); // automatically select the newly generated one
//     },
//     onSettled: () => {
//       setIsGenerating(false);
//     },
//   });

//   // 4. Mutation for retrying failed generation
//   const retryMutation = useMutation({
//     mutationFn: async () => {
//       if (!activeId) throw new Error("No active artifact to retry");
//       setIsGenerating(true);
//       return artifactsApi.retryArtifact(notebookId, activeId);
//     },
//     onSuccess: (data) => {
//       // Manually update the artifact in the list cache
//       queryClient.setQueryData<ArtifactListResponse>(["artifacts", notebookId], (prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           artifacts: prev.artifacts.map((a) => (a.id === data.id ? data : a)),
//         };
//       });
//       // Prepopulate/update detail query
//       queryClient.setQueryData(["artifact", notebookId, data.id], data);
//     },
//     onSettled: () => {
//       setIsGenerating(false);
//     },
//   });

//   // 5. Mutation for deleting artifact
//   const deleteMutation = useMutation({
//     mutationFn: async (idToDelete?: string) => {
//       const targetId = idToDelete || activeId;
//       if (!targetId) return;
//       return artifactsApi.deleteArtifact(notebookId, targetId);
//     },
//     onSuccess: (_, idToDelete) => {
//       const targetId = idToDelete || activeId;
//       if (targetId) {
//         // Manually remove deleted artifact from the list cache
//         queryClient.setQueryData<ArtifactListResponse>(["artifacts", notebookId], (prev) => {
//           if (!prev) return prev;
//           return {
//             ...prev,
//             artifacts: prev.artifacts.filter((a) => a.id !== targetId),
//             total: Math.max(0, prev.total - 1),
//           };
//         });
//         // Remove detail query cache
//         queryClient.removeQueries({ queryKey: ["artifact", notebookId, targetId] });
//       }
//       setSelectedArtifactId(null);
//     },
//   });

//   // Sync polled detailed active artifact status updates to the list cache
//   useEffect(() => {
//     if (detailData && notebookId) {
//       queryClient.setQueryData<ArtifactListResponse>(["artifacts", notebookId], (prev) => {
//         if (!prev) return prev;

//         let changed = false;
//         const updatedArtifacts = prev.artifacts.map((a) => {
//           if (a.id === detailData.id) {
//             // Only update if status, error_message, or updated_at changed
//             if (
//               a.status !== detailData.status ||
//               a.error_message !== detailData.error_message ||
//               a.updated_at !== detailData.updated_at
//             ) {
//               changed = true;
//               return {
//                 ...a,
//                 status: detailData.status,
//                 error_message: detailData.error_message,
//                 content_json: detailData.content_json,
//                 updated_at: detailData.updated_at,
//               };
//             }
//           }
//           return a;
//         });

//         if (!changed) return prev;
//         return {
//           ...prev,
//           artifacts: updatedArtifacts,
//         };
//       });
//     }
//   }, [detailData, notebookId, queryClient]);

//   const activeArtifact = detailData ?? null;

//   return {
//     artifact: activeArtifact,
//     status: activeArtifact?.status ?? history.find((h) => h.id === activeId)?.status ?? null,
//     errorMessage: activeArtifact?.error_message ?? null,
//     isLoading: isLoadingList || isLoadingDetail,
//     isGenerating: isGeneratingState || generateMutation.isPending || retryMutation.isPending,
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     generate: (payload?: any) => generateMutation.mutateAsync(payload),
//     retry: () => retryMutation.mutateAsync(),
//     deleteArtifact: (idToDelete?: string) => deleteMutation.mutateAsync(idToDelete),
//     refetch: refetchDetail,
//     // History & Selection management
//     history,
//     selectedArtifactId: activeId,
//     setSelectedArtifactId,
//   };
// }

// export default useArtifact;



import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import artifactsApi from "@/lib/api/artifacts";
import type { ArtifactType, ArtifactResponse, ArtifactListResponse } from "@/lib/api/types";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSourceValidation } from "@/hooks/useSourceValidation";

function mapFrontendTypeToBackend(type: string): string {
  switch (type) {
    case "faqs":
      return "faq";
    case "study-guide":
      return "study_guide";
    default:
      return type;
  }
}

function mapBackendTypeToFrontend(type: string): string {
  switch (type) {
    case "faq":
      return "faqs";
    case "study_guide":
      return "study-guide";
    default:
      return type;
  }
}

export function useArtifact(
  notebookId: string,
  type: ArtifactType,
  excludedSourceIds: string[] = [],
) {
  const queryClient = useQueryClient();
  const [isGeneratingState, setIsGenerating] = useState(false);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);

  // 1. Fetch artifact list (no polling, just cache)
  const { data: listData, isLoading: isLoadingList } = useQuery<ArtifactListResponse>({
    queryKey: ["artifacts", notebookId],
    queryFn: () => artifactsApi.listArtifacts(notebookId, 100, 1),
    enabled: !!notebookId,
  });

  console.log("listData:", listData);
  console.log("isLoadingList:", isLoadingList);

  const isComplete = listData ? !listData.has_more : false;
  const backendType = mapFrontendTypeToBackend(type);
  const shouldFetchType = !!notebookId && !isLoadingList && !isComplete;

  // 1b. Fetch type-specific history if there are more than 100 artifacts in total
  useQuery({
    queryKey: ["artifacts", notebookId, "type-fetch", type],
    queryFn: async () => {
      const res = await artifactsApi.listArtifacts(notebookId, 100, 1, backendType);

      console.log("type-fetch res:", res);
      // Merge those artifacts into the global cache
      queryClient.setQueryData<ArtifactListResponse>(["artifacts", notebookId], (prev) => {
        if (!prev) return prev;

        // Merge by artifact id, never create duplicates
        const existingIds = new Set(prev.artifacts.map((a) => a.id));
        const newArtifacts = res.artifacts.filter((a) => !existingIds.has(a.id));

        return {
          ...prev,
          artifacts: [...prev.artifacts, ...newArtifacts],
        };
      });
      return res;
    },
    enabled: shouldFetchType,
    staleTime: Infinity,
  });

  const artifacts = useMemo(() => listData?.artifacts ?? [], [listData]);

  // Expose the complete list of normalized artifacts for history (of this type)
  const history = useMemo(() => {
    return artifacts
      .map((a) => ({
        ...a,
        artifact_type: mapBackendTypeToFrontend(a.artifact_type) as ArtifactType,
      }))
      .filter((a) => a.artifact_type === type)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [artifacts, type]);

  // Determine active artifact ID (either selected by user or latest from history)
  const activeId = selectedArtifactId || (history.length > 0 ? history[0].id : null);

  // 2. Fetch the detailed active artifact and poll if processing
  const {
    data: detailData,
    isLoading: isLoadingDetail,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ["artifact", notebookId, activeId],
    queryFn: () => artifactsApi.getArtifact(notebookId, activeId!),
    enabled: !!notebookId && !!activeId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "processing") {
        return 3000;
      }
      return false;
    },
  });

  // 3. Mutation for generating artifacts
  const { validate, isValid } = useSourceValidation(notebookId, excludedSourceIds);

  const generateMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (payload: any) => {
      if (!validate()) {
        throw new Error("VALIDATION_FAILED");
      }
      if (!notebookId) {
        throw new Error(
          "Cannot generate artifact: notebookId is missing. The parent component " +
            "rendered this view before the notebook id was resolved.",
        );
      }
      setIsGenerating(true);
      const reqPayload = {
        excluded_source_ids: excludedSourceIds,
        ...payload,
      };

      let res: ArtifactResponse;
      switch (type) {
        case "quiz":
          res = await artifactsApi.createQuiz(notebookId, reqPayload);
          break;
        case "flashcards":
          res = await artifactsApi.createFlashcards(notebookId, reqPayload);
          break;
        case "faqs":
          res = await artifactsApi.createFAQs(notebookId, reqPayload);
          break;
        case "study-guide":
          res = await artifactsApi.createStudyGuide(notebookId, reqPayload);
          break;
        case "summary":
          res = await artifactsApi.createSummary(notebookId, reqPayload);
          break;
        case "mindmap":
          res = await artifactsApi.createMindMap(notebookId, reqPayload);
          break;
        case "slide_deck":
          res = await artifactsApi.createSlideDeck(notebookId, reqPayload);
          break;
        case "voice_overview":
          res = await artifactsApi.createVoiceOverview(notebookId, reqPayload);
          break;
        case "report":
          res = await artifactsApi.createReport(notebookId, reqPayload);
          break;
        case "datatable":
          res = await artifactsApi.createDataTable(notebookId, reqPayload);
          break;
        default:
          throw new Error(`Unsupported artifact type: ${type}`);
      }
      return res;
    },
    onSuccess: (data) => {
      // Manually insert the newly created artifact into the cached list
      queryClient.setQueryData<ArtifactListResponse>(["artifacts", notebookId], (prev) => {
        if (!prev) {
          return {
            artifacts: [data],
            total: 1,
            size: 100,
            page: 1,
            has_more: false,
          };
        }
        const exists = prev.artifacts.some((a) => a.id === data.id);
        if (exists) return prev;
        return {
          ...prev,
          artifacts: [data, ...prev.artifacts],
          total: prev.total + 1,
        };
      });

      // Prepopulate detail query
      queryClient.setQueryData(["artifact", notebookId, data.id], data);

      setSelectedArtifactId(data.id); // automatically select the newly generated one
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  // 4. Mutation for retrying failed generation
  const retryMutation = useMutation({
    mutationFn: async () => {
      if (!activeId) throw new Error("No active artifact to retry");
      setIsGenerating(true);
      toast.info("Retrying artifact generation...");
      return artifactsApi.retryArtifact(notebookId, activeId);
    },
    onSuccess: (data) => {
      // Manually update the artifact in the list cache
      queryClient.setQueryData<ArtifactListResponse>(["artifacts", notebookId], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          artifacts: prev.artifacts.map((a) => (a.id === data.id ? data : a)),
        };
      });
      // Prepopulate/update detail query
      queryClient.setQueryData(["artifact", notebookId, data.id], data);
      toast.success("Artifact generation restarted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to retry artifact generation.");
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  // 5. Mutation for deleting artifact
  const deleteMutation = useMutation({
    mutationFn: async (idToDelete?: string) => {
      const targetId = idToDelete || activeId;
      if (!targetId) return;
      return artifactsApi.deleteArtifact(notebookId, targetId);
    },
    onSuccess: (_, idToDelete) => {
      const targetId = idToDelete || activeId;
      if (targetId) {
        // Manually remove deleted artifact from the list cache
        queryClient.setQueryData<ArtifactListResponse>(["artifacts", notebookId], (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            artifacts: prev.artifacts.filter((a) => a.id !== targetId),
            total: Math.max(0, prev.total - 1),
          };
        });
        // Remove detail query cache
        queryClient.removeQueries({ queryKey: ["artifact", notebookId, targetId] });
      }
      setSelectedArtifactId(null);
      toast.success("Artifact deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete artifact.");
    },
  });

  // Sync polled detailed active artifact status updates to the list cache
  useEffect(() => {
    if (detailData && notebookId) {
      queryClient.setQueryData<ArtifactListResponse>(["artifacts", notebookId], (prev) => {
        if (!prev) return prev;

        let changed = false;
        const updatedArtifacts = prev.artifacts.map((a) => {
          if (a.id === detailData.id) {
            // Only update if status, error_message, or updated_at changed
            if (
              a.status !== detailData.status ||
              a.error_message !== detailData.error_message ||
              a.updated_at !== detailData.updated_at
            ) {
              changed = true;
              return {
                ...a,
                status: detailData.status,
                error_message: detailData.error_message,
                content_json: detailData.content_json,
                updated_at: detailData.updated_at,
              };
            }
          }
          return a;
        });

        if (!changed) return prev;
        return {
          ...prev,
          artifacts: updatedArtifacts,
        };
      });
    }
  }, [detailData, notebookId, queryClient]);

  // Toast notifications for polling completion
  const previousStatus = useRef<string | null>(null);
  useEffect(() => {
    if (detailData?.status) {
      if (previousStatus.current === "processing" && detailData.status === "ready") {
        toast.success(`${type} generated successfully!`);
      } else if (previousStatus.current === "processing" && detailData.status === "error") {
        toast.error(`Failed to generate ${type}.`);
      }
      previousStatus.current = detailData.status;
    }
  }, [detailData?.status, type]);

  const activeArtifact = detailData ?? null;

  return {
    artifact: activeArtifact,
    status: activeArtifact?.status ?? history.find((h) => h.id === activeId)?.status ?? null,
    errorMessage: activeArtifact?.error_message ?? null,
    isLoading: isLoadingList || isLoadingDetail,
    isGenerating: isGeneratingState || generateMutation.isPending || retryMutation.isPending,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generate: (payload?: any) => generateMutation.mutateAsync(payload),
    retry: () => retryMutation.mutateAsync(),
    deleteArtifact: (idToDelete?: string) => deleteMutation.mutateAsync(idToDelete),
    refetch: refetchDetail,
    // History & Selection management
    history,
    selectedArtifactId: activeId,
    setSelectedArtifactId,
    isValid,
    validate,
  };
}

export default useArtifact;
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";

export function useSourceValidation(notebookId: string, excludedSourceIds: string[] = []) {
  const queryClient = useQueryClient();

  // Read directly from the query cache to avoid extra network requests
  const data = queryClient.getQueryData<{ sources: any[] }>(["sources", notebookId]);
  const sources = data?.sources || [];
  const totalSources = sources.length;
  
  // Only 'ready' sources are selectable for generation.
  const readySources = sources.filter(s => s.status === "ready");
  const selectedCount = readySources.length - excludedSourceIds.length;

  const hasNoSources = totalSources === 0;
  const hasNoSelection = totalSources > 0 && selectedCount <= 0;
  
  const isValid = !hasNoSources && !hasNoSelection;

  const validate = (): boolean => {
    if (hasNoSources) {
      toast.warning("No sources available", {
        description: "Please upload at least one source before using Chat or generating artifacts."
      });
      return false;
    }
    if (hasNoSelection) {
      toast.warning("No source selected", {
        description: "Please select at least one source from the left panel before chatting or generating artifacts."
      });
      return false;
    }
    return true;
  };

  return { isValid, hasNoSources, hasNoSelection, validate };
}

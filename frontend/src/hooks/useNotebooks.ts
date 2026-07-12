"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import notebooksApi from "@/lib/api/notebooks";
import { NotebookCreate, NotebookUpdate } from "@/lib/api/types";

// Stable list of elegant emojis
const EMOJIS = ["◐", "◑", "✦", "◇", "❉", "◈", "❈", "❊", "❋", "✿", "❀", "❃", "❄", "❆", "❇", "❈"];

// Stable list of curated gradients matching the premium glassmorphic dashboard theme
const GRADIENTS = [
  "from-primary/30 via-accent-blue/20 to-accent-pink/30",
  "from-accent-mint/30 via-accent-blue/20 to-primary/20",
  "from-accent-pink/30 via-primary/20 to-accent-blue/20",
  "from-accent-blue/30 via-primary/20 to-accent-mint/20",
  "from-primary/20 via-accent-pink/20 to-accent-mint/20",
];

/**
 * Generate stable visual parameters deterministically based on notebook ID/title
 */
export function getVisualsForNotebook(id: string, title: string) {
  let hash = 0;
  const str = (id || "") + (title || "");
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const emojiIndex = Math.abs(hash) % EMOJIS.length;
  const gradientIndex = Math.abs(hash) % GRADIENTS.length;


  return {
    emoji: EMOJIS[emojiIndex],
    gradient: GRADIENTS[gradientIndex],
  };
}

export function useNotebooksList(page: number = 1, size: number = 20) {
  return useQuery({
    queryKey: ["notebooks", page, size],
    queryFn: () => notebooksApi.listNotebooks(page, size),
  });
}

export function useNotebookDetail(id: string) {
  return useQuery({
    queryKey: ["notebook", id],
    queryFn: () => notebooksApi.getNotebook(id),
    enabled: !!id,
  });
}

export function useCreateNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotebookCreate) => notebooksApi.createNotebook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
    },
  });
}

export function useUpdateNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NotebookUpdate }) =>
      notebooksApi.updateNotebook(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      queryClient.invalidateQueries({ queryKey: ["notebook", variables.id] });
    },
  });
}

export function useDeleteNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notebooksApi.deleteNotebook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
    },
  });
}

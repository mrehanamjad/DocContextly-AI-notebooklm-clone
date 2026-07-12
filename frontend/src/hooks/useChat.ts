import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import chatApi from "@/lib/api/chat";
import { mapBackendCitations } from "@/lib/citation-mapper";
import type { MessageResponse, FrontendChatMessage } from "@/lib/api/types";
import { toast } from "sonner";
import { useSourceValidation } from "@/hooks/useSourceValidation";

export function useChat(notebookId: string, excludedSourceIds: string[]) {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<FrontendChatMessage[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Streaming states
  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch sessions for this notebook
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["chat-sessions", notebookId],
    queryFn: () => chatApi.listSessions(notebookId, 1, 10),
    enabled: !!notebookId,
  });

  // 2. Initialize session: load recent or create a new one
  useEffect(() => {
    if (isLoadingSessions || !notebookId) return;

    const init = async () => {
      try {
        setIsInitializing(true);
        const sessions = sessionsData?.sessions ?? [];
        if (sessions.length > 0) {
          // Use the most recent session
          setSessionId(sessions[0].id);
        } else {
          // Create new session if none exists
          const newSession = await chatApi.createSession({
            notebook_id: notebookId,
            title: "Workspace Chat",
          });
          setSessionId(newSession.id);
          refetchSessions();
        }
      } catch (err: any) {
        console.error("Failed to initialize chat session:", err);
        toast.error(err.message || "Failed to initialize chat session.");
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [sessionsData, isLoadingSessions, notebookId, refetchSessions]);

  // 3. Fetch messages for the active session
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["chat-messages", sessionId],
    queryFn: () => chatApi.listMessages(sessionId!, 1, 100),
    enabled: !!sessionId,
  });

  // Map messages and keep in sync with local state
  useEffect(() => {
    if (messagesData?.messages) {
      // Messages from backend are in ascending order or descending order?
      // Typically chat history should be rendered in order of creation.
      // Let's sort them by created_at (ascending) to be safe.
      const mapped: FrontendChatMessage[] = [...messagesData.messages]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((msg, index, arr) => {
          const isLastAssistant = msg.role === "assistant" && index === arr.length - 1;

          return {
            id: msg.id,
            role: msg.role === "human" ? "user" : "assistant",
            content: msg.content,
            citations: msg.citations ? mapBackendCitations(msg.citations) : undefined,
          };
        });
      setLocalMessages(mapped);
    }
  }, [messagesData]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 4. Animate typing effect — Gemini-style word-by-word reveal.
  // Total duration is capped so long responses don't take forever;
  // the actual "fade in" look is handled by StreamingText's CSS animation.
  const animateText = useCallback((text: string, onComplete: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!text.trim()) {
      setStreaming(false);
      setStreamedText(text);
      onComplete();
      return;
    }

    setStreaming(true);
    setStreamedText("");

    // Keep whitespace as part of the token stream so words separate naturally
    const words = text.split(/(\s+)/).filter((w) => w !== "");
    const totalWords = words.length;

    const TICK_MS = 32;
    // Cap total reveal time regardless of length: short answers feel snappy,
    // very long ones still finish within ~1.1s
    const TARGET_DURATION_MS = Math.min(1100, Math.max(280, totalWords * 18));
    const totalTicks = Math.max(1, Math.round(TARGET_DURATION_MS / TICK_MS));
    const wordsPerTick = Math.max(1, Math.ceil(totalWords / totalTicks));

    let index = 0;

    timerRef.current = setInterval(() => {
      index += wordsPerTick;
      if (index >= totalWords) {
        setStreamedText(text);
        if (timerRef.current) clearInterval(timerRef.current);
        setStreaming(false);
        onComplete();
      } else {
        setStreamedText(words.slice(0, index).join(""));
      }
    }, TICK_MS);
  }, []);

  // 5. Send message action
  const { validate, isValid } = useSourceValidation(notebookId, excludedSourceIds);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !sessionId || isSending || streaming) return;
      if (!validate()) return;

      setIsSending(true);

      // Create local user message for instant response UI
      const userMessageId = `u-temp-${Date.now()}`;
      const tempUserMsg: FrontendChatMessage = {
        id: userMessageId,
        role: "user",
        content: text,
      };

      setLocalMessages((prev) => [...prev, tempUserMsg]);

      try {
        const response = await chatApi.sendMessage(sessionId, {
          question: text,
          excluded_source_ids: excludedSourceIds,
        });

        // Backend successfully returned the Turn
        const { assistant_message } = response;

        // Animate the assistant reply
        animateText(assistant_message.content, () => {
          // When typing is done, append the finalized assistant message with citations to state
          const newAssistantMsg: FrontendChatMessage = {
            id: assistant_message.id,
            role: "assistant",
            content: assistant_message.content,
            citations: assistant_message.citations
              ? mapBackendCitations(assistant_message.citations)
              : undefined,
          };

          setLocalMessages((prev) => [...prev, newAssistantMsg]);

          // Invalidate React Query cache so background state stays accurate
          queryClient.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
        });
      } catch (err: any) {
        console.error("Chat error:", err);
        toast.error(err.message || "Failed to send message.");
        // Append an error message so the user knows it failed
        setLocalMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "Sorry, I encountered an error. Please check your connection and try again.",
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, excludedSourceIds, isSending, streaming, animateText, queryClient],
  );

  // 6. Reset chat session (clears conversation list by creating a fresh session)
  const resetChat = useCallback(async () => {
    if (!notebookId) return;
    try {
      setIsInitializing(true);
      if (sessionId) {
        await chatApi.deleteSession(sessionId);
      }
      const newSession = await chatApi.createSession({
        notebook_id: notebookId,
        title: "Workspace Chat",
      });
      setSessionId(newSession.id);
      setLocalMessages([]);
      queryClient.invalidateQueries({ queryKey: ["chat-sessions", notebookId] });
      toast.success("Chat session reset.");
    } catch (err: any) {
      console.error("Failed to reset chat:", err);
      toast.error(err.message || "Failed to reset chat.");
    } finally {
      setIsInitializing(false);
    }
  }, [notebookId, sessionId, queryClient]);

  // Combined loading states
  const isLoading = isInitializing || isLoadingSessions || isLoadingMessages;

  return {
    messages: localMessages,
    sendMessage,
    resetChat,
    isLoading,
    isSending,
    streaming,
    streamedText,
    isValid,
    validate,
  };
}

export default useChat;

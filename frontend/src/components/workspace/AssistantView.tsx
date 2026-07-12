"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, ArrowUp, Paperclip, Quote, Trash2, Copy, Check, ArrowDown } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import type { ChatMessage } from "@/lib/types-data";
import { AssistantMessageRenderer } from "./AssistantMessageRenderer";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface AssistantViewProps {
  notebookId: string;
  excludedSourceIds: string[];
  selectedSourcesCount: number;
  onOpenCitations: (m: ChatMessage) => void;
  prefillPrompt?: { text: string; timestamp: number } | null;
}

export function AssistantView({
  notebookId,
  excludedSourceIds,
  selectedSourcesCount,
  onOpenCitations,
  prefillPrompt,
}: AssistantViewProps) {
  const { messages, sendMessage, resetChat, isLoading, isSending, streaming, streamedText, isValid, validate } =
    useChat(notebookId, excludedSourceIds);

  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (prefillPrompt && prefillPrompt.text) {
      setInput(prefillPrompt.text);
      setTimeout(() => {
        const ta = textareaRef.current;
        if (ta) {
          ta.focus();
          ta.setSelectionRange(prefillPrompt.text.length, prefillPrompt.text.length);
        }
      }, 50);
    }
  }, [prefillPrompt]);

  // Auto-grow the textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  }, [input]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedText, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollButton(distanceFromBottom > 200);
  };

  const handleSend = (text: string) => {
    if (!text.trim() || isSending || streaming) return;
    if (!validate()) return;
    sendMessage(text);
    setInput("");
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-full flex flex-col">
        {/* Chat header area with Reset/Clear action */}
        <div className="px-6 py-2 border-b border-border bg-foreground/[0.01] flex items-center justify-between shrink-0">
          <span className="text-xs text-foreground/50 font-medium">Assistant Conversation</span>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={isLoading || messages.length === 0}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-foreground/60 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="Reset chat history"
              >
                <Trash2 className="size-3.5" />
                Clear Chat
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear this conversation?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all messages in this chat. This action can&apos;t
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={resetChat}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Clear chat
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Message history */}
        <div className="relative flex-1 min-h-0">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto px-6 md:px-12 py-6 space-y-6"
          >
            {isLoading && messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-foreground/40 gap-2">
                <Loader2 className="size-6 animate-spin text-primary" />
                <p className="text-xs font-medium">Initializing assistant...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-foreground/45 max-w-sm mx-auto">
                <div className="size-12 rounded-2xl bg-primary/5 grid place-items-center mb-3">
                  <MessageSquareOutline className="size-6 text-primary/60" />
                </div>
                <h4 className="text-sm font-bold text-foreground/70 mb-1">Ask your assistant</h4>
                <p className="text-xs leading-relaxed">
                  Ask questions about the uploaded sources. Responses will draw context directly
                  from selected files and cite specific passages.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  msg={m}
                  onOpenCitations={onOpenCitations}
                />
              ))
            )}

            {/* In-flight backend loader */}
            {isSending && !streaming && (
              <div className="flex items-start max-w-3xl animate-fade-up">
                <div className="flex-1 py-1.5 flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-primary/70" />
                  <span className="text-xs text-foreground/40">Thinking…</span>
                </div>
              </div>
            )}

            {/* Streaming response */}
            {streaming && (
              <div className="flex items-start max-w-3xl animate-fade-up">
                <div className="flex-1">
                  <AssistantMessageRenderer text={streamedText} isStreaming />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {showScrollButton && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border shadow-soft text-xs font-medium text-foreground/70 hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              <ArrowDown className="size-3.5" />
              New messages
            </button>
          )}
        </div>

        {/* Input container */}
        <div className="p-3 pb-1 border-t border-border bg-gradient-to-b from-transparent to-white/40">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-soft border border-border p-2 flex items-end gap-2">
              <button
                className="size-9 rounded-xl bg-foreground/5 hover:bg-foreground/10 grid place-items-center shrink-0 disabled:opacity-40"
                title="Add attachment (managed via sidebar)"
                disabled
              >
                <Paperclip className="size-4 text-foreground/45" />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!validate()) return;
                    handleSend(input);
                  }
                }}
                rows={1}
                disabled={isLoading || isSending || streaming}
                placeholder="Ask your research assistant…"
                className="flex-1 bg-transparent outline-none resize-none text-sm py-2 px-1 max-h-32 placeholder:text-foreground/40 disabled:opacity-50"
              />
              <Button
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  if (!validate()) return;
                  handleSend(input);
                }}
                disabled={!input.trim() || isLoading || isSending || streaming || !isValid}
                className="size-9 rounded-xl shadow-lg shadow-primary/30 disabled:opacity-40 disabled:shadow-none"
              >
                {isSending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 px-2">
              <p className="text-[10px] text-foreground/40">
                Grounded in {selectedSourcesCount} source{selectedSourcesCount === 1 ? "" : "s"}{" "}
                {excludedSourceIds.length > 0 && `(${excludedSourceIds.length} excluded)`} ·
                responses cite passages
              </p>
              <p className="text-[10px] text-foreground/40 font-mono">⏎ to send · ⇧⏎ newline</p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function MessageSquareOutline(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </svg>
  );
}

interface MessageBubbleProps {
  msg: ChatMessage;
  onOpenCitations: (m: ChatMessage) => void;
}

function MessageBubble({ msg, onOpenCitations }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  if (msg.role === "user") {
    return (
      <div className="group flex items-start max-w-3xl ml-auto justify-end animate-fade-up">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-2.5 text-sm max-w-[80%] whitespace-pre-wrap">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start max-w-3xl animate-fade-up">
      <div className="flex-1 space-y-3 min-w-0">
        <AssistantMessageRenderer text={msg.content} isStreaming={false} />

        <div className="flex flex-wrap items-center gap-2">
          {msg.citations && msg.citations.length > 0 && (
            <button
              onClick={() => onOpenCitations(msg)}
              className="flex gap-1.5 items-center hover:opacity-85 transition-opacity text-left cursor-pointer"
            >
              <Quote className="size-3 text-foreground/40" />
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-foreground/5 text-[10px] font-mono border border-border hover:bg-primary/10 transition-colors">
                <span className="text-primary font-bold">({msg.citations.length})</span>
                <span className="text-foreground/60">Citations - Sources referenced</span>
              </span>
            </button>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-foreground/40 hover:text-foreground/70 transition-all cursor-pointer"
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
            </TooltipTrigger>
            <TooltipContent side="bottom">Copy message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
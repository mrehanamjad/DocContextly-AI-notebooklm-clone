"use client";

import { X, ChevronRight } from "lucide-react";
import type { FrontendChatMessage } from "@/lib/api/types";

interface CitationsSheetProps {
  msg: FrontendChatMessage;
  onClose: () => void;
  onOpenSource?: (sourceId: string) => void;
}

export function CitationsSheet({ msg, onClose, onOpenSource }: CitationsSheetProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex justify-end animate-fade-up"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-float border-l border-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-border p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold tracking-tight">Citations</h3>
            <p className="text-[11px] text-foreground/50">
              {msg.citations?.length ?? 0} sources referenced
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full hover:bg-foreground/5 grid place-items-center cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {msg.citations?.map((c, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-border bg-white/60 hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="size-5 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold grid place-items-center">
                  {i + 1}
                </span>
                <span className="text-sm font-bold flex-1">{c.sourceTitle}</span>
                {c.page && (
                  <span className="text-[10px] font-mono text-foreground/50">{c.page}</span>
                )}
              </div>
              <p className="text-xs text-foreground/75 leading-relaxed italic border-l-2 border-primary/30 pl-3 my-3">
                "{c.snippet}"
              </p>
              {onOpenSource && (
                <button
                  onClick={() => onOpenSource(c.sourceId)}
                  className="text-[11px] font-semibold text-primary flex items-center gap-1 cursor-pointer"
                >
                  Open source <ChevronRight className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

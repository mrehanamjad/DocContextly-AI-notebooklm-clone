// "use client";

// import { useState, useEffect } from "react";
// import { ChevronDown, Loader2 } from "lucide-react";

// interface ThinkingBlockProps {
//   reasoning: string;
//   isThinking: boolean;
// }

// export function ThinkingBlock({ reasoning, isThinking }: ThinkingBlockProps) {
//   const [isOpen, setIsOpen] = useState(false);

//   // Auto-expand if currently actively thinking
//   useEffect(() => {
//     if (isThinking) {
//       setIsOpen(true);
//     }
//   }, [isThinking]);

//   // Trim whitespace
//   const trimmed = reasoning.trim();
//   if (!trimmed && !isThinking) return null;

//   return (
//     <div className="my-3 overflow-hidden rounded-2xl border border-foreground/5 bg-foreground/[0.02] shadow-soft backdrop-blur-sm transition-all duration-300">
//       {/* Header Button */}
//       <button
//         onClick={() => setIsOpen((prev) => !prev)}
//         className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-foreground/50 hover:text-foreground/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-colors select-none font-medium cursor-pointer"
//         aria-expanded={isOpen}
//       >
//         <span className="flex items-center gap-2">
//           {isThinking ? (
//             <Loader2 className="size-3.5 animate-spin text-primary shrink-0" />
//           ) : (
//             <span className="text-base shrink-0">🧠</span>
//           )}
//           <span>{isThinking ? "Thinking..." : "Thought process"}</span>
//         </span>
//         <ChevronDown
//           className={`size-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
//         />
//       </button>

//       {/* Expandable Panel */}
//       <div
//         className={`transition-all duration-300 ease-in-out ${
//           isOpen ? "max-h-[500px] opacity-100 border-t border-foreground/5" : "max-h-0 opacity-0"
//         } overflow-y-auto`}
//       >
//         {isOpen && (
//           <div className="p-4 text-xs font-mono leading-relaxed text-foreground/60 whitespace-pre-wrap select-text bg-foreground/[0.01]">
//             {trimmed || "..."}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, BrainCircuit } from "lucide-react";

interface ThinkingBlockProps {
  reasoning: string;
  isThinking: boolean;
}

export function ThinkingBlock({ reasoning, isThinking }: ThinkingBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userToggled, setUserToggled] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-expand while actively thinking, auto-collapse once done
  // (unless the user has manually toggled it)
  useEffect(() => {
    if (!userToggled) {
      setIsOpen(isThinking);
    }
  }, [isThinking, userToggled]);

  // Auto-scroll reasoning body to bottom as new tokens stream in
  useEffect(() => {
    if (isThinking && isOpen && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [reasoning, isThinking, isOpen]);

  const trimmed = reasoning.trim();
  if (!trimmed && !isThinking) return null;

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border transition-all duration-300 ${
        isThinking
          ? "border-primary/20 bg-gradient-to-br from-primary/[0.04] via-accent-blue/[0.03] to-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.02)]"
          : "border-foreground/[0.06] bg-foreground/[0.015]"
      }`}
    >
      {/* Header */}
      <button
        onClick={() => {
          setUserToggled(true);
          setIsOpen((prev) => !prev);
        }}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-colors select-none font-medium cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <span className="relative flex items-center justify-center size-5 shrink-0">
            <BrainCircuit
              className={`size-4 ${
                isThinking ? "text-primary" : "text-foreground/40"
              } transition-colors`}
            />
            {isThinking && (
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            )}
          </span>

          {isThinking ? (
            <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,rgba(120,120,120,0.5)_0%,rgba(0,0,0,0.85)_50%,rgba(120,120,120,0.5)_100%)] bg-[length:200%_100%] animate-shimmer font-semibold">
              Thinking…
            </span>
          ) : (
            <span className="text-foreground/55 group-hover:text-foreground/80 transition-colors font-semibold">
              Thought process
            </span>
          )}
        </span>

        <ChevronDown
          className={`size-3.5 text-foreground/40 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Body */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            ref={bodyRef}
            className="max-h-64 overflow-y-auto border-t border-foreground/[0.06] px-4 py-3 text-[11.5px] font-mono leading-relaxed text-foreground/55 whitespace-pre-wrap select-text bg-foreground/[0.012]"
          >
            {trimmed || (
              <span className="text-foreground/30 italic">Warming up…</span>
            )}
            {isThinking && (
              <span className="inline-block w-1 h-3 bg-primary/60 align-middle ml-0.5 caret-blink" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
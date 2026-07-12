// // "use client";

// // import { Sparkles, ChevronDown, Trash2 } from "lucide-react";
// // import type { ArtifactResponse } from "@/lib/api/types";

// // interface ArtifactHeaderProps {
// //   title: string;
// //   type: string;
// //   history: ArtifactResponse[];
// //   selectedArtifactId: string | null;
// //   onSelectArtifactId: (id: string) => void;
// //   onGenerateAgain: () => void;
// //   onDelete?: () => void;
// //   icon: React.ReactNode;
// // }

// // function timeAgo(dateString: string): string {
// //   const date = new Date(dateString);
// //   const now = new Date();
// //   const diffMs = now.getTime() - date.getTime();
// //   const diffSec = Math.floor(diffMs / 1000);
// //   const diffMin = Math.floor(diffSec / 60);
// //   const diffHr = Math.floor(diffMin / 60);
// //   const diffDays = Math.floor(diffHr / 24);

// //   if (diffSec < 10) return "just now";
// //   if (diffSec < 60) return `${diffSec}s ago`;
// //   if (diffMin < 60) return `${diffMin}m ago`;
// //   if (diffHr < 24) return `${diffHr}h ago`;
// //   return `${diffDays}d ago`;
// // }

// // export function ArtifactHeader({
// //   title,
// //   type,
// //   history,
// //   selectedArtifactId,
// //   onSelectArtifactId,
// //   onGenerateAgain,
// //   onDelete,
// //   icon,
// // }: ArtifactHeaderProps) {
// //   const activeIndex = history.findIndex((a) => a.id === selectedArtifactId);
// //   const activeArtifact = activeIndex !== -1 ? history[activeIndex] : history[0];

// //   if (!activeArtifact) return null;

// //   const currentGenNum = history.length - Math.max(0, activeIndex);

// //   // Format options details
// //   const getOptionsSummary = () => {
// //     const opts = activeArtifact.options_json || {};
// //     const parts: string[] = [];

// //     if (type === "quiz") {
// //       const qCount = opts.number_of_questions || opts.question_count || 5;
// //       const diff = opts.difficulty || "mix";
// //       parts.push(`Questions: ${qCount}`);
// //       parts.push(`Difficulty: ${diff.charAt(0).toUpperCase() + diff.slice(1)}`);
// //     } else if (type === "flashcards") {
// //       const cCount = opts.number_of_cards || opts.card_count || 5;
// //       parts.push(`Cards: ${cCount}`);
// //     } else if (type === "faqs") {
// //       const fCount = opts.number_of_faqs || opts.faq_count || 5;
// //       parts.push(`FAQ Items: ${fCount}`);
// //     } else if (type === "study-guide") {
// //       const size = opts.size || "medium";
// //       parts.push(`Size: ${size.charAt(0).toUpperCase() + size.slice(1)}`);
// //     } else if (type === "voice_overview" || type === "voice-overview") {
// //       const lengthVal = opts.length || "medium";
// //       const voiceVal = opts.voice_style || "default";
// //       parts.push(`Length: ${lengthVal.charAt(0).toUpperCase() + lengthVal.slice(1)}`);
// //       parts.push(`Style: ${voiceVal.charAt(0).toUpperCase() + voiceVal.slice(1)}`);
// //     }

// //     if (opts.prompt && typeof opts.prompt === "string" && opts.prompt.trim()) {
// //       parts.push(`Prompt: "${opts.prompt.trim()}"`);
// //     }

// //     return parts.join(" · ");
// //   };

// //   return (
// //     <div className="border-b border-foreground/5 bg-white/40 backdrop-blur-md px-6 py-4 md:px-8 flex flex-col gap-3 shrink-0">
// //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

// //         {/* Left: Icon & Title & Version dropdown */}
// //         <div className="flex items-center gap-3 flex-wrap">
// //           <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 flex items-center gap-1.5">
// //             {icon}
// //             <span>{title}</span>
// //           </div>

// //           {history.length > 1 && (
// //             <div className="relative inline-flex items-center">
// //               <select
// //                 value={selectedArtifactId || ""}
// //                 onChange={(e) => onSelectArtifactId(e.target.value)}
// //                 className="appearance-none pl-3 pr-8 py-1 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-full text-xs font-semibold text-foreground/80 cursor-pointer focus:outline-none transition-all"
// //               >
// //                 {history.map((art, idx) => {
// //                   const num = history.length - idx;
// //                   return (
// //                     <option key={art.id} value={art.id}>
// //                       {num === history.length ? `Current (Gen #${num})` : `Gen #${num}`} ({timeAgo(art.created_at)})
// //                     </option>
// //                   );
// //                 })}
// //               </select>
// //               <ChevronDown className="size-3 text-foreground/50 absolute right-2.5 pointer-events-none" />
// //             </div>
// //           )}
// //         </div>

// //         {/* Right: Actions */}
// //         <div className="flex items-center gap-2 self-end sm:self-auto">
// //           {onDelete && (
// //             <button
// //               onClick={() => onDelete()}
// //               title="Delete this version"
// //               className="p-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50/50 transition-all cursor-pointer"
// //             >
// //               <Trash2 className="size-4" />
// //             </button>
// //           )}

// //           <button
// //             onClick={onGenerateAgain}
// //             className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-semibold hover:scale-102 transition-all cursor-pointer"
// //           >
// //             <Sparkles className="size-3.5" />
// //             <span>Generate Again</span>
// //           </button>
// //         </div>
// //       </div>

// //       {/* Metadata Panel */}
// //       <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground/60 font-medium">
// //         <span className="font-bold text-foreground">Generation #{currentGenNum}</span>
// //         <span className="text-foreground/30">•</span>
// //         <span>Generated {timeAgo(activeArtifact.created_at)}</span>
// //         {getOptionsSummary() && (
// //           <>
// //             <span className="text-foreground/30">•</span>
// //             <span className="text-foreground/50 italic select-all truncate max-w-md" title={getOptionsSummary()}>
// //               {getOptionsSummary()}
// //             </span>
// //           </>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { Sparkles, ChevronDown, Trash2, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
// import type { ArtifactResponse } from "@/lib/api/types";
// import { useState, useRef, useEffect } from "react";

// interface ArtifactHeaderProps {
//   title: string;
//   type: string;
//   history: ArtifactResponse[];
//   selectedArtifactId: string | null;
//   onSelectArtifactId: (id: string) => void;
//   onGenerateAgain: () => void;
//   onDelete?: () => void;
//   icon: React.ReactNode;
// }

// function timeAgo(dateString: string): string {
//   const date = new Date(dateString);
//   const now = new Date();
//   const diffMs = now.getTime() - date.getTime();
//   const diffSec = Math.floor(diffMs / 1000);
//   const diffMin = Math.floor(diffSec / 60);
//   const diffHr = Math.floor(diffMin / 60);
//   const diffDays = Math.floor(diffHr / 24);

//   if (diffSec < 10) return "just now";
//   if (diffSec < 60) return `${diffSec}s ago`;
//   if (diffMin < 60) return `${diffMin}m ago`;
//   if (diffHr < 24) return `${diffHr}h ago`;
//   return `${diffDays}d ago`;
// }

// function formatDate(dateString: string): string {
//   const date = new Date(dateString);
//   return date.toLocaleString("en-US", {
//     month: "short",
//     day: "numeric",
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });
// }

// export function ArtifactHeader({
//   title,
//   type,
//   history,
//   selectedArtifactId,
//   onSelectArtifactId,
//   onGenerateAgain,
//   onDelete,
//   icon,
// }: ArtifactHeaderProps) {
//   const [isHistoryOpen, setIsHistoryOpen] = useState(false);
//   const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
//   const historyRef = useRef<HTMLDivElement>(null);

//   const activeIndex = history.findIndex((a) => a.id === selectedArtifactId);
//   const activeArtifact = activeIndex !== -1 ? history[activeIndex] : history[0];

//   // Close history on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
//         setIsHistoryOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   if (!activeArtifact) return null;

//   const currentGenNum = history.length - Math.max(0, activeIndex);

//   const getOptionsSummary = () => {
//     const opts = activeArtifact.options_json || {};
//     const parts: string[] = [];

//     if (type === "quiz") {
//       const qCount = opts.number_of_questions || opts.question_count || 5;
//       const diff = opts.difficulty || "mix";
//       parts.push(`Questions: ${qCount}`);
//       parts.push(`Difficulty: ${diff.charAt(0).toUpperCase() + diff.slice(1)}`);
//     } else if (type === "flashcards") {
//       const cCount = opts.number_of_cards || opts.card_count || 5;
//       parts.push(`Cards: ${cCount}`);
//     } else if (type === "faqs") {
//       const fCount = opts.number_of_faqs || opts.faq_count || 5;
//       parts.push(`FAQ Items: ${fCount}`);
//     } else if (type === "study-guide") {
//       const size = opts.size || "medium";
//       parts.push(`Size: ${size.charAt(0).toUpperCase() + size.slice(1)}`);
//     } else if (type === "voice_overview" || type === "voice-overview") {
//       const lengthVal = opts.length || "medium";
//       const voiceVal = opts.voice_style || "default";
//       parts.push(`Length: ${lengthVal.charAt(0).toUpperCase() + lengthVal.slice(1)}`);
//       parts.push(`Style: ${voiceVal.charAt(0).toUpperCase() + voiceVal.slice(1)}`);
//     }

//     if (opts.prompt && typeof opts.prompt === "string" && opts.prompt.trim()) {
//       parts.push(`Prompt: "${opts.prompt.trim()}"`);
//     }

//     return parts.join(" · ");
//   };

//   // Navigation controls
//   const goToPrevious = () => {
//     if (activeIndex < history.length - 1) {
//       onSelectArtifactId(history[activeIndex + 1].id);
//     }
//   };

//   const goToNext = () => {
//     if (activeIndex > 0) {
//       onSelectArtifactId(history[activeIndex - 1].id);
//     }
//   };

//   return (
//     <div className="border-b border-foreground/5 bg-white/40 backdrop-blur-md px-6 py-4 md:px-8 flex flex-col gap-3 shrink-0">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         {/* Left: Icon & Title */}
//         <div className="flex items-center gap-3 flex-wrap">
//           <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 flex items-center gap-1.5">
//             {icon}
//             <span>{title}</span>
//           </div>

//           {/* Version Counter with Dropdown */}
//           <div className="relative" ref={historyRef}>
//             <button
//               onClick={() => setIsHistoryOpen(!isHistoryOpen)}
//               className="inline-flex items-center gap-2 px-3 py-1 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-full text-xs font-semibold text-foreground/80 cursor-pointer transition-all"
//             >
//               <Clock className="size-3.5" />
//               <span>v{currentGenNum}</span>
//               <ChevronDown
//                 className={`size-3.5 transition-transform duration-200 ${isHistoryOpen ? "rotate-180" : ""}`}
//               />
//             </button>

//             {/* History Dropdown */}
//             {isHistoryOpen && (
//               <div className="absolute top-full left-0 mt-2 w-72 max-h-80 overflow-y-auto bg-white rounded-xl shadow-xl border border-foreground/10 z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
//                 <div className="px-3 py-2 text-xs font-semibold text-foreground/50 border-b border-foreground/5 flex items-center justify-between">
//                   <span>Version History</span>
//                   <span className="text-foreground/30 font-normal">{history.length} versions</span>
//                 </div>

//                 {history.map((art, idx) => {
//                   const num = history.length - idx;
//                   const isActive = art.id === selectedArtifactId;
//                   const isHovered = hoveredIndex === idx;

//                   return (
//                     <button
//                       key={art.id}
//                       onClick={() => {
//                         onSelectArtifactId(art.id);
//                         setIsHistoryOpen(false);
//                       }}
//                       onMouseEnter={() => setHoveredIndex(idx)}
//                       onMouseLeave={() => setHoveredIndex(null)}
//                       className={`w-full px-3 py-2.5 text-left transition-all duration-150 flex items-start gap-3 ${
//                         isActive
//                           ? "bg-primary/5 border-l-2 border-primary"
//                           : isHovered
//                             ? "bg-foreground/5 border-l-2 border-foreground/10"
//                             : "border-l-2 border-transparent"
//                       }`}
//                     >
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2">
//                           <span
//                             className={`text-xs font-semibold ${isActive ? "text-primary" : "text-foreground"}`}
//                           >
//                             Generation #{num}
//                           </span>
//                           {isActive && (
//                             <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
//                               Current
//                             </span>
//                           )}
//                           {num === history.length && !isActive && (
//                             <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
//                               Latest
//                             </span>
//                           )}
//                         </div>
//                         <div className="text-[11px] text-foreground/50 mt-0.5">
//                           {formatDate(art.created_at)}
//                           <span className="mx-1.5">•</span>
//                           <span>{timeAgo(art.created_at)}</span>
//                         </div>
//                       </div>
//                       {isActive && (
//                         <div className="size-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right: Actions */}
//         <div className="flex items-center gap-2 self-end sm:self-auto">
//           {/* Navigation Arrows */}
//           {history.length > 1 && (
//             <div className="flex items-center gap-1 mr-1">
//               <button
//                 onClick={goToPrevious}
//                 disabled={activeIndex >= history.length - 1}
//                 className="p-1.5 rounded-full border border-foreground/10 hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
//                 title="Previous version"
//               >
//                 <ChevronLeft className="size-4" />
//               </button>
//               <button
//                 onClick={goToNext}
//                 disabled={activeIndex <= 0}
//                 className="p-1.5 rounded-full border border-foreground/10 hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-notallowed transition-all"
//                 title="Next version"
//               >
//                 <ChevronRight className="size-4" />
//               </button>
//             </div>
//           )}

//           {onDelete && (
//             <button
//               onClick={() => onDelete()}
//               title="Delete this version"
//               className="p-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50/50 transition-all cursor-pointer"
//             >
//               <Trash2 className="size-4" />
//             </button>
//           )}

//           <button
//             onClick={onGenerateAgain}
//             className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-semibold hover:scale-102 transition-all cursor-pointer"
//           >
//             <Sparkles className="size-3.5" />
//             <span>Generate Again</span>
//           </button>
//         </div>
//       </div>

//       {/* Metadata Panel - Enhanced */}
//       <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/60 font-medium">
//         <div className="flex items-center gap-2">
//           <span className="font-bold text-foreground">Generation #{currentGenNum}</span>
//           {activeIndex === 0 && (
//             <span className="text-[10px] font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
//               Latest
//             </span>
//           )}
//           {activeIndex === history.length - 1 && activeIndex !== 0 && (
//             <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
//               Original
//             </span>
//           )}
//         </div>

//         <span className="text-foreground/20">•</span>

//         <div className="flex items-center gap-1.5">
//           <Clock className="size-3 text-foreground/40" />
//           <span>{formatDate(activeArtifact.created_at)}</span>
//           <span className="text-foreground/40">({timeAgo(activeArtifact.created_at)})</span>
//         </div>

//         {getOptionsSummary() && (
//           <>
//             <span className="text-foreground/20">•</span>
//             <span
//               className="text-foreground/60 italic truncate max-w-md flex items-center gap-1"
//               title={getOptionsSummary()}
//             >
//               <span className="text-foreground/30">⚙</span>
//               {getOptionsSummary()}
//             </span>
//           </>
//         )}

//         {/* Version Progress Indicator */}
//         {history.length > 1 && (
//           <div className="flex items-center gap-1.5 ml-auto">
//             <span className="text-[10px] text-foreground/40 font-medium">
//               {history.length - activeIndex}/{history.length}
//             </span>
//             <div className="w-16 h-1 bg-foreground/10 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-foreground/30 rounded-full transition-all duration-300"
//                 style={{ width: `${((history.length - activeIndex) / history.length) * 100}%` }}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




// "use client";

// import { Sparkles, ChevronDown, Trash2 } from "lucide-react";
// import type { ArtifactResponse } from "@/lib/api/types";

// interface ArtifactHeaderProps {
//   title: string;
//   type: string;
//   history: ArtifactResponse[];
//   selectedArtifactId: string | null;
//   onSelectArtifactId: (id: string) => void;
//   onGenerateAgain: () => void;
//   onDelete?: () => void;
//   icon: React.ReactNode;
// }

// function timeAgo(dateString: string): string {
//   const date = new Date(dateString);
//   const now = new Date();
//   const diffMs = now.getTime() - date.getTime();
//   const diffSec = Math.floor(diffMs / 1000);
//   const diffMin = Math.floor(diffSec / 60);
//   const diffHr = Math.floor(diffMin / 60);
//   const diffDays = Math.floor(diffHr / 24);

//   if (diffSec < 10) return "just now";
//   if (diffSec < 60) return `${diffSec}s ago`;
//   if (diffMin < 60) return `${diffMin}m ago`;
//   if (diffHr < 24) return `${diffHr}h ago`;
//   return `${diffDays}d ago`;
// }

// export function ArtifactHeader({
//   title,
//   type,
//   history,
//   selectedArtifactId,
//   onSelectArtifactId,
//   onGenerateAgain,
//   onDelete,
//   icon,
// }: ArtifactHeaderProps) {
//   const activeIndex = history.findIndex((a) => a.id === selectedArtifactId);
//   const activeArtifact = activeIndex !== -1 ? history[activeIndex] : history[0];

//   if (!activeArtifact) return null;

//   const currentGenNum = history.length - Math.max(0, activeIndex);

//   // Format options details
//   const getOptionsSummary = () => {
//     const opts = activeArtifact.options_json || {};
//     const parts: string[] = [];

//     if (type === "quiz") {
//       const qCount = opts.number_of_questions || opts.question_count || 5;
//       const diff = opts.difficulty || "mix";
//       parts.push(`Questions: ${qCount}`);
//       parts.push(`Difficulty: ${diff.charAt(0).toUpperCase() + diff.slice(1)}`);
//     } else if (type === "flashcards") {
//       const cCount = opts.number_of_cards || opts.card_count || 5;
//       parts.push(`Cards: ${cCount}`);
//     } else if (type === "faqs") {
//       const fCount = opts.number_of_faqs || opts.faq_count || 5;
//       parts.push(`FAQ Items: ${fCount}`);
//     } else if (type === "study-guide") {
//       const size = opts.size || "medium";
//       parts.push(`Size: ${size.charAt(0).toUpperCase() + size.slice(1)}`);
//     } else if (type === "voice_overview" || type === "voice-overview") {
//       const lengthVal = opts.length || "medium";
//       const voiceVal = opts.voice_style || "default";
//       parts.push(`Length: ${lengthVal.charAt(0).toUpperCase() + lengthVal.slice(1)}`);
//       parts.push(`Style: ${voiceVal.charAt(0).toUpperCase() + voiceVal.slice(1)}`);
//     }

//     if (opts.prompt && typeof opts.prompt === "string" && opts.prompt.trim()) {
//       parts.push(`Prompt: "${opts.prompt.trim()}"`);
//     }

//     return parts.join(" · ");
//   };

//   return (
//     <div className="border-b border-foreground/5 bg-white/40 backdrop-blur-md px-6 py-4 md:px-8 flex flex-col gap-3 shrink-0">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

//         {/* Left: Icon & Title & Version dropdown */}
//         <div className="flex items-center gap-3 flex-wrap">
//           <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 flex items-center gap-1.5">
//             {icon}
//             <span>{title}</span>
//           </div>

//           {history.length > 1 && (
//             <div className="relative inline-flex items-center">
//               <select
//                 value={selectedArtifactId || ""}
//                 onChange={(e) => onSelectArtifactId(e.target.value)}
//                 className="appearance-none pl-3 pr-8 py-1 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-full text-xs font-semibold text-foreground/80 cursor-pointer focus:outline-none transition-all"
//               >
//                 {history.map((art, idx) => {
//                   const num = history.length - idx;
//                   return (
//                     <option key={art.id} value={art.id}>
//                       {num === history.length ? `Current (Gen #${num})` : `Gen #${num}`} ({timeAgo(art.created_at)})
//                     </option>
//                   );
//                 })}
//               </select>
//               <ChevronDown className="size-3 text-foreground/50 absolute right-2.5 pointer-events-none" />
//             </div>
//           )}
//         </div>

//         {/* Right: Actions */}
//         <div className="flex items-center gap-2 self-end sm:self-auto">
//           {onDelete && (
//             <button
//               onClick={() => onDelete()}
//               title="Delete this version"
//               className="p-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50/50 transition-all cursor-pointer"
//             >
//               <Trash2 className="size-4" />
//             </button>
//           )}

//           <button
//             onClick={onGenerateAgain}
//             className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-semibold hover:scale-102 transition-all cursor-pointer"
//           >
//             <Sparkles className="size-3.5" />
//             <span>Generate Again</span>
//           </button>
//         </div>
//       </div>

//       {/* Metadata Panel */}
//       <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground/60 font-medium">
//         <span className="font-bold text-foreground">Generation #{currentGenNum}</span>
//         <span className="text-foreground/30">•</span>
//         <span>Generated {timeAgo(activeArtifact.created_at)}</span>
//         {getOptionsSummary() && (
//           <>
//             <span className="text-foreground/30">•</span>
//             <span className="text-foreground/50 italic select-all truncate max-w-md" title={getOptionsSummary()}>
//               {getOptionsSummary()}
//             </span>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { Sparkles, ChevronDown, Trash2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { ArtifactShortResponse } from "@/lib/api/types";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ArtifactHeaderProps {
  title: string;
  type: string;
  history: ArtifactShortResponse[];
  selectedArtifactId: string | null;
  onSelectArtifactId: (id: string) => void;
  onGenerateAgain: () => void;
  onDelete?: () => void;
  icon: React.ReactNode;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ArtifactHeader({
  title,
  type,
  history,
  selectedArtifactId,
  onSelectArtifactId,
  onGenerateAgain,
  onDelete,
  icon,
}: ArtifactHeaderProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const activeIndex = history.findIndex((a) => a.id === selectedArtifactId);
  const activeArtifact = activeIndex !== -1 ? history[activeIndex] : history[0];

  if (!activeArtifact) return null;

  const currentGenNum = history.length - Math.max(0, activeIndex);

  const getOptionsSummary = () => {
    const opts = activeArtifact.options_json || {};
    const parts: string[] = [];

    if (type === "quiz") {
      const qCount = opts.number_of_questions || opts.question_count || 5;
      const diff = opts.difficulty || "mix";
      parts.push(`Questions: ${qCount}`);
      parts.push(`Difficulty: ${diff.charAt(0).toUpperCase() + diff.slice(1)}`);
    } else if (type === "flashcards") {
      const cCount = opts.number_of_cards || opts.card_count || 5;
      parts.push(`Cards: ${cCount}`);
    } else if (type === "faqs") {
      const fCount = opts.number_of_faqs || opts.faq_count || 5;
      parts.push(`FAQ Items: ${fCount}`);
    } else if (type === "study-guide") {
      const size = opts.size || "medium";
      parts.push(`Size: ${size.charAt(0).toUpperCase() + size.slice(1)}`);
    } else if (type === "voice_overview" || type === "voice-overview") {
      const lengthVal = opts.length || "medium";
      const voiceVal = opts.voice_style || "default";
      parts.push(`Length: ${lengthVal.charAt(0).toUpperCase() + lengthVal.slice(1)}`);
      parts.push(`Style: ${voiceVal.charAt(0).toUpperCase() + voiceVal.slice(1)}`);
    }

    if (opts.prompt && typeof opts.prompt === "string" && opts.prompt.trim()) {
      parts.push(`Prompt: "${opts.prompt.trim()}"`);
    }

    return parts.join(" · ");
  };

  // Navigation controls
  const goToPrevious = () => {
    if (activeIndex < history.length - 1) {
      onSelectArtifactId(history[activeIndex + 1].id);
    }
  };

  const goToNext = () => {
    if (activeIndex > 0) {
      onSelectArtifactId(history[activeIndex - 1].id);
    }
  };

  return (
    <div className="border-b border-foreground/5 bg-white/40 backdrop-blur-md px-6 py-4 md:px-8 flex flex-col gap-3 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 flex items-center gap-1.5">
            {icon}
            <span>{title}</span>
          </div>

          {/* Version Counter with Dropdown */}
          <DropdownMenu open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-2 px-3 py-1 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-full text-xs font-semibold text-foreground/80 cursor-pointer transition-all">
                <Clock className="size-3.5" />
                <span>v{currentGenNum}</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${isHistoryOpen ? "rotate-180" : ""}`}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-72 max-h-80 overflow-y-auto"
              align="start"
              sideOffset={8}
            >
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Version History</span>
                <span className="text-foreground/50 font-normal text-xs">
                  {history.length} versions
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {history.map((art, idx) => {
                const num = history.length - idx;
                const isActive = art.id === selectedArtifactId;

                return (
                  <DropdownMenuItem
                    key={art.id}
                    onClick={() => {
                      onSelectArtifactId(art.id);
                      setIsHistoryOpen(false);
                    }}
                    className={`flex items-start gap-3 py-2.5 px-3 cursor-pointer ${
                      isActive ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            isActive ? "text-primary" : "text-foreground"
                          }`}
                        >
                          Generation #{num}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Current
                          </span>
                        )}
                        {num === history.length && !isActive && (
                          <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-foreground/50 mt-0.5">
                        {formatDate(art.created_at)}
                        <span className="mx-1.5">•</span>
                        <span>{timeAgo(art.created_at)}</span>
                      </div>
                    </div>
                    {isActive && (
                      <div className="size-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Navigation Arrows */}
          {history.length > 1 && (
            <div className="flex items-center gap-1 mr-1">
              <button
                onClick={goToPrevious}
                disabled={activeIndex >= history.length - 1}
                className="p-1.5 rounded-full border border-foreground/10 hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous version"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={goToNext}
                disabled={activeIndex <= 0}
                className="p-1.5 rounded-full border border-foreground/10 hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Next version"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete()}
              title="Delete this version"
              className="p-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50/50 transition-all cursor-pointer"
            >
              <Trash2 className="size-4" />
            </button>
          )}

          <button
            onClick={onGenerateAgain}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-semibold hover:scale-102 transition-all cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            <span>Generate Again</span>
          </button>
        </div>
      </div>

      {/* Metadata Panel - Enhanced */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/60 font-medium">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">Generation #{currentGenNum}</span>
          {activeIndex === 0 && (
            <span className="text-[10px] font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Latest
            </span>
          )}
          {activeIndex === history.length - 1 && activeIndex !== 0 && (
            <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Original
            </span>
          )}
        </div>

        <span className="text-foreground/20">•</span>

        <div className="flex items-center gap-1.5">
          <Clock className="size-3 text-foreground/40" />
          <span>{formatDate(activeArtifact.created_at)}</span>
          <span className="text-foreground/40">({timeAgo(activeArtifact.created_at)})</span>
        </div>

        {getOptionsSummary() && (
          <>
            <span className="text-foreground/20">•</span>
            <span
              className="text-foreground/60 italic truncate max-w-md flex items-center gap-1"
              title={getOptionsSummary()}
            >
              <span className="text-foreground/30">⚙</span>
              {getOptionsSummary()}
            </span>
          </>
        )}

        {/* Version Progress Indicator */}
        {history.length > 1 && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[10px] text-foreground/40 font-medium">
              {history.length - activeIndex}/{history.length}
            </span>
            <div className="w-16 h-1 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/30 rounded-full transition-all duration-300"
                style={{ width: `${((history.length - activeIndex) / history.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
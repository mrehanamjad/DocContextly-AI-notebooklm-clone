// "use client";

// import { useState, useRef } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import {
//   X,
//   Upload,
//   Link2,
//   Type,
//   Wand2,
//   FileText,
//   BookOpen,
//   FileAudio,
//   Presentation,
//   Youtube,
//   Globe,
//   Clock,
//   Brain,
//   CheckCircle2,
//   Loader2,
//   AlertTriangle,
//   Sparkles,
// } from "lucide-react";
// import sourcesApi from "@/lib/api/sources";

// type SourceTab = "upload" | "url" | "text" | "research";

// interface UploadDialogProps {
//   notebookId: string;
//   onClose: () => void;
// }

// export function UploadDialog({ notebookId, onClose }: UploadDialogProps) {
//   const queryClient = useQueryClient();
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // UI state
//   const [tab, setTab] = useState<SourceTab>("upload");
//   const [stage, setStage] = useState<"idle" | "uploading" | "processing" | "done" | "error">(
//     "idle",
//   );
//   const [progress, setProgress] = useState(0);
//   const [errorMessage, setErrorMessage] = useState("");

//   // Labels for feedback
//   const [stageLabel, setStageLabel] = useState("Uploading…");
//   const [processingLabel, setProcessingLabel] = useState("Extracting text, generating embeddings…");
//   const [doneTitle, setDoneTitle] = useState("Source added");
//   const [doneSubtitle, setDoneSubtitle] = useState("Ready to chat and synthesize");

//   // Form states
//   const [url, setUrl] = useState("");
//   const [pastedTitle, setPastedTitle] = useState("");
//   const [pastedText, setPastedText] = useState("");
//   const [topic, setTopic] = useState("");
//   const [depth, setDepth] = useState<"quick" | "standard" | "deep">("standard");
//   const [researchStep, setResearchStep] = useState(0);

//   const researchSteps = [
//     "Planning research outline…",
//     "Searching the web for sources…",
//     "Reading & ranking 24 articles…",
//     "Cross-referencing key claims…",
//     "Drafting structured report…",
//     "Generating citations & summary…",
//   ];

//   const refreshQueries = () => {
//     queryClient.invalidateQueries({ queryKey: ["sources", notebookId] });
//     queryClient.invalidateQueries({ queryKey: ["sources-count", notebookId] });
//     queryClient.invalidateQueries({ queryKey: ["notebook", notebookId] });
//   };

//   // 1. File Upload
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.size > 25 * 1024 * 1024) {
//       setErrorMessage("File exceeds the maximum 25 MB limit.");
//       setStage("error");
//       return;
//     }

//     setStage("uploading");
//     setStageLabel(`Uploading ${file.name}…`);
//     setProgress(0);

//     // Simulate upload progress
//     const progressInterval = setInterval(() => {
//       setProgress((p) => {
//         if (p >= 90) {
//           clearInterval(progressInterval);
//           return 90;
//         }
//         return p + 10;
//       });
//     }, 100);

//     try {
//       await sourcesApi.uploadFile(notebookId, file);
//       clearInterval(progressInterval);
//       setProgress(100);
//       setStage("processing");
//       setProcessingLabel("Backend is indexing the document in the background.");

//       // Let it settle for a second
//       setTimeout(() => {
//         setDoneTitle("Upload complete");
//         setDoneSubtitle(`"${file.name}" has been uploaded and is being indexed.`);
//         setStage("done");
//         refreshQueries();
//       }, 1000);
//     } catch (err: any) {
//       clearInterval(progressInterval);
//       setErrorMessage(err?.message || "Failed to upload file.");
//       setStage("error");
//     }
//   };

//   // 2. URL Import (Web or YouTube)
//   const handleUrlImport = async () => {
//     const trimmedUrl = url.trim();
//     if (!trimmedUrl) return;

//     const isYoutube = /youtu\.?be/i.test(trimmedUrl);
//     setStage("uploading");
//     setProgress(30);
//     setStageLabel(isYoutube ? "Importing YouTube video…" : "Crawling website…");

//     try {
//       if (isYoutube) {
//         await sourcesApi.importYouTube(notebookId, [trimmedUrl]);
//       } else {
//         await sourcesApi.crawlWebsites(notebookId, [trimmedUrl]);
//       }
//       setProgress(100);
//       setStage("done");
//       setDoneTitle(isYoutube ? "YouTube Video Added" : "Website Added");
//       setDoneSubtitle("Web content is being parsed and indexed in the background.");
//       refreshQueries();
//     } catch (err: any) {
//       setErrorMessage(err?.message || "Failed to crawl or import URL.");
//       setStage("error");
//     }
//   };

//   // 3. Plain text note
//   const handleNoteCreate = async () => {
//     const trimmedText = pastedText.trim();
//     if (!trimmedText) return;

//     setStage("uploading");
//     setStageLabel("Saving note…");
//     setProgress(50);

//     try {
//       await sourcesApi.createNote({
//         notebook_id: notebookId,
//         title: pastedTitle.trim() || "Untitled Note",
//         content: trimmedText,
//       });
//       setProgress(100);
//       setStage("done");
//       setDoneTitle("Note added");
//       setDoneSubtitle("Plain text note saved to workspace.");
//       refreshQueries();
//     } catch (err: any) {
//       setErrorMessage(err?.message || "Failed to create note.");
//       setStage("error");
//     }
//   };

//   // 4. Topic Web Search Research
//   const handleResearchStart = async () => {
//     const trimmedTopic = topic.trim();
//     if (!trimmedTopic) return;

//     setStage("processing");
//     setResearchStep(0);

//     // Animate research steps
//     let currentStep = 0;
//     const stepInterval = setInterval(() => {
//       currentStep++;
//       if (currentStep < researchSteps.length) {
//         setResearchStep(currentStep);
//       } else {
//         clearInterval(stepInterval);
//       }
//     }, 2000);

//     try {
//       await sourcesApi.crawlTopic(notebookId, trimmedTopic);
//       clearInterval(stepInterval);
//       setStage("done");
//       setDoneTitle("Research complete");
//       setDoneSubtitle(`Research report on "${trimmedTopic.slice(0, 40)}..." has been generated.`);
//       refreshQueries();
//     } catch (err: any) {
//       clearInterval(stepInterval);
//       setErrorMessage(err?.message || "Topic research crawl failed.");
//       setStage("error");
//     }
//   };

//   const tabs: { id: SourceTab; label: string; Icon: typeof Upload }[] = [
//     { id: "upload", label: "Upload", Icon: Upload },
//     { id: "url", label: "Web / YouTube", Icon: Link2 },
//     { id: "text", label: "Paste text", Icon: Type },
//     { id: "research", label: "AI Research", Icon: Wand2 },
//   ];

//   const isYoutube = /youtu\.?be/i.test(url);
//   const urlValid = /^https?:\/\/\S+\.\S+/i.test(url.trim());

//   return (
//     <div
//       className="fixed inset-0 z-50 bg-foreground/45 backdrop-blur-sm grid place-items-center p-4 animate-fade-up"
//       onClick={onClose}
//     >
//       <div
//         className="w-full max-w-xl bg-white rounded-3xl shadow-float border border-border overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex items-center justify-between p-5 border-b border-border">
//           <div>
//             <h3 className="font-bold tracking-tight text-foreground">Add a source</h3>
//             <p className="text-[11px] text-foreground/50 mt-0.5">
//               Bring in documents, links, text, or let AI research a topic for you.
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="size-7 rounded-full hover:bg-foreground/5 grid place-items-center cursor-pointer"
//           >
//             <X className="size-4 text-foreground/60" />
//           </button>
//         </div>

//         {stage === "idle" && (
//           <div className="px-5 pt-4">
//             <div className="grid grid-cols-4 gap-1 p-1 bg-foreground/5 rounded-2xl">
//               {tabs.map(({ id, label, Icon }) => (
//                 <button
//                   key={id}
//                   onClick={() => setTab(id)}
//                   className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
//                     tab === id
//                       ? "bg-white shadow-sm text-foreground"
//                       : "text-foreground/55 hover:text-foreground"
//                   }`}
//                 >
//                   <Icon className="size-4" />
//                   <span>{label}</span>
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         <div className="p-5">
//           {stage === "idle" && tab === "upload" && (
//             <>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept=".pdf,.docx,.csv,.md,.txt"
//                 className="hidden"
//               />
//               <div
//                 onClick={() => fileInputRef.current?.click()}
//                 className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary/45 hover:bg-primary/5 transition-colors"
//               >
//                 <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mx-auto mb-3">
//                   <Upload className="size-5 text-primary" />
//                 </div>
//                 <p className="font-semibold text-sm mb-1 text-foreground">
//                   Drop files or click to browse
//                 </p>
//                 <p className="text-xs text-foreground/50">PDF, DOCX, CSV, MD, TXT up to 25 MB</p>
//               </div>
//               <div className="grid grid-cols-4 gap-2 mt-4">
//                 {[
//                   { Icon: FileText, label: "PDF" },
//                   { Icon: BookOpen, label: "DOCX" },
//                   { Icon: FileText, label: "Markdown" },
//                   { Icon: Presentation, label: "TXT" },
//                 ].map(({ Icon, label }) => (
//                   <div
//                     key={label}
//                     className="p-2.5 rounded-xl bg-foreground/5 flex flex-col items-center gap-1"
//                   >
//                     <Icon className="size-4 text-foreground/60" />
//                     <span className="text-[10px] font-semibold text-foreground/60">{label}</span>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}

//           {stage === "idle" && tab === "url" && (
//             <>
//               <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">
//                 Web page or YouTube URL
//               </label>
//               <div className="flex gap-2 mt-2">
//                 <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl bg-foreground/5 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary/30">
//                   {isYoutube ? (
//                     <Youtube className="size-4 text-red-500" />
//                   ) : (
//                     <Globe className="size-4 text-foreground/50" />
//                   )}
//                   <input
//                     value={url}
//                     onChange={(e) => setUrl(e.target.value)}
//                     placeholder="https://example.com/article  or  youtube.com/watch?v=…"
//                     className="flex-1 bg-transparent text-sm outline-none text-foreground"
//                   />
//                 </div>
//                 <button
//                   disabled={!urlValid}
//                   onClick={handleUrlImport}
//                   className="px-4 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-30 cursor-pointer"
//                 >
//                   Import
//                 </button>
//               </div>
//               <div className="grid grid-cols-2 gap-2 mt-4">
//                 <div className="p-3 rounded-xl bg-foreground/5 flex items-center gap-2">
//                   <Globe className="size-4 text-foreground/60" />
//                   <div>
//                     <p className="text-[11px] font-bold text-foreground">Web articles</p>
//                     <p className="text-[10px] text-foreground/50">Clean reader extract</p>
//                   </div>
//                 </div>
//                 <div className="p-3 rounded-xl bg-foreground/5 flex items-center gap-2">
//                   <Youtube className="size-4 text-red-500" />
//                   <div>
//                     <p className="text-[11px] font-bold text-foreground">YouTube videos</p>
//                     <p className="text-[10px] text-foreground/50">Full transcript extraction</p>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}

//           {stage === "idle" && tab === "text" && (
//             <>
//               <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">
//                 Title (optional)
//               </label>
//               <input
//                 value={pastedTitle}
//                 onChange={(e) => setPastedTitle(e.target.value)}
//                 placeholder="e.g. Meeting notes — Q3 strategy"
//                 className="w-full mt-2 px-3 py-2.5 rounded-xl bg-foreground/5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary/30 text-foreground"
//               />
//               <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 block mt-4">
//                 Paste your text
//               </label>
//               <textarea
//                 value={pastedText}
//                 onChange={(e) => setPastedText(e.target.value)}
//                 placeholder="Paste an article, transcript, notes, or any text you want to chat with…"
//                 rows={7}
//                 className="w-full mt-2 px-3 py-2.5 rounded-xl bg-foreground/5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary/30 resize-none text-foreground"
//               />
//               <div className="flex items-center justify-between mt-3">
//                 <span className="text-[11px] text-foreground/50">
//                   {pastedText.trim().length.toLocaleString()} chars · ~
//                   {Math.max(
//                     1,
//                     Math.round(pastedText.trim().split(/\s+/).filter(Boolean).length / 200),
//                   )}{" "}
//                   min read
//                 </span>
//                 <button
//                   disabled={pastedText.trim().length < 20}
//                   onClick={handleNoteCreate}
//                   className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-30 cursor-pointer"
//                 >
//                   Add text
//                 </button>
//               </div>
//             </>
//           )}

//           {stage === "idle" && tab === "research" && (
//             <>
//               <div className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent-pink/10 border border-primary/20">
//                 <div className="size-9 rounded-xl bg-white grid place-items-center shrink-0">
//                   <Brain className="size-4 text-primary" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold text-foreground">AI Research Agent</p>
//                   <p className="text-[11px] text-foreground/60 leading-relaxed">
//                     Give a topic and our agent will search the web, read the best sources, and write
//                     a cited report — added to your notebook as a new source.
//                   </p>
//                 </div>
//               </div>

//               <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 block mt-4">
//                 Research topic
//               </label>
//               <input
//                 value={topic}
//                 onChange={(e) => setTopic(e.target.value)}
//                 placeholder="e.g. State of mixture-of-experts models in 2026"
//                 className="w-full mt-2 px-3 py-2.5 rounded-xl bg-foreground/5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary/30 text-foreground"
//               />

//               <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 block mt-4">
//                 Depth
//               </label>
//               <div className="grid grid-cols-3 gap-2 mt-2">
//                 {(
//                   [
//                     { id: "quick", label: "Quick", time: "~30s", desc: "5 sources" },
//                     { id: "standard", label: "Standard", time: "~2 min", desc: "15 sources" },
//                     { id: "deep", label: "Deep", time: "~5 min", desc: "30+ sources" },
//                   ] as const
//                 ).map((d) => (
//                   <button
//                     key={d.id}
//                     type="button"
//                     onClick={() => setDepth(d.id)}
//                     className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
//                       depth === d.id
//                         ? "bg-foreground text-background"
//                         : "bg-foreground/5 hover:bg-foreground/10"
//                     }`}
//                   >
//                     <p className="text-xs font-bold">{d.label}</p>
//                     <p
//                       className={`text-[10px] ${depth === d.id ? "text-background/70" : "text-foreground/50"}`}
//                     >
//                       {d.desc}
//                     </p>
//                     <p
//                       className={`text-[10px] flex items-center gap-0.5 mt-0.5 ${depth === d.id ? "text-background/70" : "text-foreground/40"}`}
//                     >
//                       <Clock className="size-2.5" />
//                       {d.time}
//                     </p>
//                   </button>
//                 ))}
//               </div>

//               <button
//                 disabled={topic.trim().length < 5}
//                 onClick={handleResearchStart}
//                 className="w-full mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-pink text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-30 cursor-pointer"
//               >
//                 <Sparkles className="size-4" /> Start research
//               </button>
//             </>
//           )}

//           {stage === "uploading" && (
//             <div className="py-6 text-center">
//               <Loader2 className="size-8 mx-auto mb-4 animate-spin text-primary" />
//               <p className="text-sm font-semibold mb-2 text-foreground">{stageLabel}</p>
//               <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden max-w-xs mx-auto mb-2">
//                 <div
//                   className="h-full bg-gradient-to-r from-primary to-accent-pink transition-all"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//               <p className="text-[11px] text-foreground/50">{progress}%</p>
//             </div>
//           )}

//           {stage === "processing" && (
//             <div className="py-6 text-center">
//               <Loader2 className="size-8 mx-auto mb-4 animate-spin text-primary" />
//               {tab === "research" ? (
//                 <div className="py-2">
//                   <div className="flex items-center gap-2 mb-4 justify-center">
//                     <Brain className="size-4 text-primary animate-pulse" />
//                     <p className="text-sm font-bold text-foreground">Researching…</p>
//                   </div>
//                   <div className="space-y-2 max-w-xs mx-auto text-left">
//                     {researchSteps.map((s, i) => {
//                       const status =
//                         i < researchStep ? "done" : i === researchStep ? "active" : "pending";
//                       return (
//                         <div
//                           key={s}
//                           className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs ${
//                             status === "done"
//                               ? "bg-primary/5 text-foreground/70"
//                               : status === "active"
//                                 ? "bg-foreground/5 text-foreground font-semibold"
//                                 : "text-foreground/30"
//                           }`}
//                         >
//                           {status === "done" ? (
//                             <CheckCircle2 className="size-3.5 text-primary" />
//                           ) : status === "active" ? (
//                             <Loader2 className="size-3.5 animate-spin text-primary" />
//                           ) : (
//                             <div className="size-3.5 rounded-full border border-foreground/20" />
//                           )}
//                           <span>{s}</span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <p className="text-sm font-semibold mb-2 text-foreground">Processing source…</p>
//                   <p className="text-[11px] text-foreground/50">{processingLabel}</p>
//                 </>
//               )}
//             </div>
//           )}

//           {stage === "done" && (
//             <div className="py-6 text-center">
//               <div className="size-12 mx-auto mb-3 rounded-full bg-primary/10 grid place-items-center">
//                 <CheckCircle2 className="size-6 text-primary" />
//               </div>
//               <p className="text-sm font-semibold mb-1 text-foreground">{doneTitle}</p>
//               <p className="text-xs text-foreground/50 mb-4">{doneSubtitle}</p>
//               <button
//                 onClick={onClose}
//                 className="px-5 py-2 rounded-full bg-foreground text-background text-sm font-semibold cursor-pointer"
//               >
//                 Done
//               </button>
//             </div>
//           )}

//           {stage === "error" && (
//             <div className="py-6 text-center">
//               <div className="size-12 mx-auto mb-3 rounded-full bg-red-100 grid place-items-center">
//                 <AlertTriangle className="size-6 text-red-500" />
//               </div>
//               <p className="text-sm font-semibold mb-1 text-red-600">Error occurred</p>
//               <p className="text-xs text-foreground/60 mb-6 max-w-sm mx-auto">{errorMessage}</p>
//               <div className="flex gap-2 justify-center">
//                 <button
//                   onClick={() => setStage("idle")}
//                   className="px-5 py-2 rounded-full bg-foreground/10 hover:bg-foreground/15 text-foreground text-xs font-semibold cursor-pointer"
//                 >
//                   Try Again
//                 </button>
//                 <button
//                   onClick={onClose}
//                   className="px-5 py-2 rounded-full bg-foreground text-background text-xs font-semibold cursor-pointer"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  Upload,
  Link2,
  Type,
  Wand2,
  FileText,
  BookOpen,
  FileAudio,
  Presentation,
  Youtube,
  Globe,
  Clock,
  Brain,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Sparkles,
  Trash2,
  Link,
  Info,
} from "lucide-react";
import sourcesApi from "@/lib/api/sources";
import { toast } from "sonner";

type SourceTab = "upload" | "url" | "text" | "research";

interface UploadDialogProps {
  notebookId: string;
  onClose: () => void;
}

export function UploadDialog({ notebookId, onClose }: UploadDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [tab, setTab] = useState<SourceTab>("upload");
  const [stage, setStage] = useState<"idle" | "uploading" | "processing" | "done" | "error">(
    "idle",
  );
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  // Labels for feedback
  const [stageLabel, setStageLabel] = useState("Uploading…");
  const [processingLabel, setProcessingLabel] = useState("Extracting text, generating embeddings…");
  const [doneTitle, setDoneTitle] = useState("Source added");
  const [doneSubtitle, setDoneSubtitle] = useState("Ready to chat and synthesize");

  // Form states
  const [urlsText, setUrlsText] = useState("");
  const [pastedTitle, setPastedTitle] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<number>(8);

  // Parse URLs from textarea
  const parseUrls = (text: string): string[] => {
    const lines = text.split(/\n/);
    const urls: string[] = [];

    for (const line of lines) {
      // Split by spaces, commas, or semicolons
      const parts = line.split(/[\s,;]+/);
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed && /^https?:\/\/\S+\.\S+/i.test(trimmed)) {
          urls.push(trimmed);
        }
      }
    }

    return urls;
  };

  const getValidUrls = (): string[] => {
    const parsed = parseUrls(urlsText);
    // Remove duplicates
    return Array.from(new Set(parsed));
  };

  const validUrls = getValidUrls();
  const isValidUrlCount = validUrls.length > 0 && validUrls.length <= 15;
  const hasInvalidUrls = urlsText.trim() && validUrls.length === 0;

  const refreshQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["sources", notebookId] });
    queryClient.invalidateQueries({ queryKey: ["sources-count", notebookId] });
    queryClient.invalidateQueries({ queryKey: ["notebook", notebookId] });
  };

  // 1. File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("File exceeds the maximum 25 MB limit.");
      setStage("error");
      return;
    }

    setStage("uploading");
    setStageLabel(`Uploading ${file.name}…`);
    setProgress(0);
    toast.info("Upload started...");

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return p + 10;
      });
    }, 100);

    try {
      await sourcesApi.uploadFile(notebookId, file);
      clearInterval(progressInterval);
      setProgress(100);
      setStage("processing");
      setProcessingLabel("Backend is indexing the document in the background.");

      // Let it settle for a second
      setTimeout(() => {
        setDoneTitle("Upload complete");
        setDoneSubtitle(`"${file.name}" has been uploaded and is being indexed.`);
        setStage("done");
        toast.success("File uploaded successfully!");
        refreshQueries();
      }, 1000);
    } catch (err: any) {
      clearInterval(progressInterval);
      setErrorMessage(err?.message || "Failed to upload file.");
      setStage("error");
      toast.error(err?.message || "Failed to upload file.");
    }
  };

  // 2. URL Import (Web or YouTube) - Multiple URLs
  const handleUrlImport = async () => {
    const urls = validUrls;
    if (urls.length === 0 || urls.length > 15) return;

    const isYoutube = urls.some(url => /youtu\.?be/i.test(url));
    const isMixed = urls.some(url => /youtu\.?be/i.test(url)) &&
      urls.some(url => !/youtu\.?be/i.test(url));

    setStage("uploading");
    setProgress(20);
    setStageLabel(
      isMixed
        ? `Importing ${urls.length} URLs (mixed content)…`
        : isYoutube
          ? `Importing ${urls.length} YouTube video${urls.length > 1 ? 's' : ''}…`
          : `Crawling ${urls.length} website${urls.length > 1 ? 's' : ''}…`
    );
    toast.info("Import started...");

    try {
      // Separate YouTube and web URLs
      const youtubeUrls = urls.filter(url => /youtu\.?be/i.test(url));
      const webUrls = urls.filter(url => !/youtu\.?be/i.test(url));

      // Import in parallel for better performance
      const promises = [];

      if (youtubeUrls.length > 0) {
        promises.push(sourcesApi.importYouTube(notebookId, youtubeUrls));
      }

      if (webUrls.length > 0) {
        promises.push(sourcesApi.crawlWebsites(notebookId, webUrls));
      }

      await Promise.all(promises);

      setProgress(100);
      setStage("done");
      setDoneTitle(
        isMixed
          ? `${urls.length} URLs Added`
          : isYoutube
            ? `${urls.length} YouTube Video${urls.length > 1 ? 's' : ''} Added`
            : `${urls.length} Website${urls.length > 1 ? 's' : ''} Added`
      );
      setDoneSubtitle(
        isMixed
          ? "Mixed content is being parsed and indexed in the background."
          : isYoutube
            ? "Video transcripts are being extracted and indexed in the background."
            : "Web content is being parsed and indexed in the background."
      );
      toast.success("URLs imported successfully!");
      refreshQueries();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to crawl or import URLs.");
      setStage("error");
      toast.error(err?.message || "Failed to crawl or import URLs.");
    }
  };

  // 3. Plain text note
  const handleNoteCreate = async () => {
    const trimmedText = pastedText.trim();
    if (!trimmedText) return;

    setStage("uploading");
    setStageLabel("Saving note…");
    setProgress(50);
    toast.info("Saving note...");

    try {
      await sourcesApi.createNote({
        notebook_id: notebookId,
        title: pastedTitle.trim() || "Untitled Note",
        content: trimmedText,
      });
      setProgress(100);
      setStage("done");
      setDoneTitle("Note added");
      setDoneSubtitle("Plain text note saved to workspace.");
      toast.success("Note created successfully!");
      refreshQueries();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create note.");
      setStage("error");
      toast.error(err?.message || "Failed to create note.");
    }
  };

  // 4. Topic Web Search Research
  const handleResearchStart = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || depth === 0) return;

    setStage("processing");
    setProcessingLabel("Searching the web and gathering sources…");
    toast.info("AI Research started...");

    try {
      await sourcesApi.crawlTopic(notebookId, trimmedTopic,depth);
      setStage("done");
      setDoneTitle("Sources added");
      setDoneSubtitle(`Web sources for "${trimmedTopic.slice(0, 40)}..." have been added to your notebook.`);
      toast.success("AI Research completed successfully!");
      refreshQueries();
    } catch (err: any) {
      setErrorMessage(err?.message || "Topic research crawl failed.");
      setStage("error");
      toast.error(err?.message || "Topic research crawl failed.");
    }
  };

  const tabs: { id: SourceTab; label: string; Icon: typeof Upload }[] = [
    { id: "upload", label: "Upload", Icon: Upload },
    { id: "url", label: "Web / YouTube", Icon: Link2 },
    { id: "text", label: "Paste text", Icon: Type },
    { id: "research", label: "AI Research", Icon: Wand2 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/45 backdrop-blur-sm grid place-items-center p-4 animate-fade-up"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-float border border-border overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div>
            <h3 className="font-bold tracking-tight text-foreground">Add a source</h3>
            <p className="text-[11px] text-foreground/50 mt-0.5">
              Bring in documents, links, text, or let AI research a topic for you.
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-7 rounded-full hover:bg-foreground/5 grid place-items-center cursor-pointer"
          >
            <X className="size-4 text-foreground/60" />
          </button>
        </div>

        {stage === "idle" && (
          <div className="px-5 pt-4 shrink-0">
            <div className="grid grid-cols-4 gap-1 p-1 bg-foreground/5 rounded-2xl">
              {tabs.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${tab === id
                      ? "bg-white shadow-sm text-foreground"
                      : "text-foreground/55 hover:text-foreground"
                    }`}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1">
          {stage === "idle" && tab === "upload" && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.csv,.md,.txt"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary/45 hover:bg-primary/5 transition-colors"
              >
                <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mx-auto mb-3">
                  <Upload className="size-5 text-primary" />
                </div>
                <p className="font-semibold text-sm mb-1 text-foreground">
                  Drop files or click to browse
                </p>
                <p className="text-xs text-foreground/50">PDF, DOCX, CSV, MD, TXT up to 25 MB</p>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { Icon: FileText, label: "PDF" },
                  { Icon: BookOpen, label: "DOCX" },
                  { Icon: FileText, label: "Markdown" },
                  { Icon: Presentation, label: "TXT" },
                ].map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="p-2.5 rounded-xl bg-foreground/5 flex flex-col items-center gap-1"
                  >
                    <Icon className="size-4 text-foreground/60" />
                    <span className="text-[10px] font-semibold text-foreground/60">{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {stage === "idle" && tab === "url" && (
            <>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">
                  Web pages or YouTube URLs
                </label>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="p-1 rounded-full hover:bg-foreground/5 transition-colors"
                  title="Show instructions"
                >
                  <Info className="size-4 text-foreground/40" />
                </button>
              </div>
              <p className="text-xs text-foreground/70 mt-1">To add multiple URLs, separate with a space or new line. (Max 10 URLs)</p>
              {/* Info Panel */}
              {showInfo && (
                <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/20 animate-in slide-in-from-top-1 duration-200">
                  <div className="flex items-start gap-2">
                    <Info className="size-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-1.5 text-xs text-foreground/70">
                      <p>• Only the visible text on the website will be imported at this time.</p>
                      <p>• Paid articles are not supported.</p>
                      <p>• Only the text transcript in YouTube will be imported at this time.</p>
                      <p>• Only public YouTube videos are supported.</p>
                      <p>• Recently uploaded videos may not be available to import.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-2">
                <div className="flex items-start gap-2 bg-foreground/5 rounded-xl focus-within:bg-white focus-within:ring-1 focus-within:ring-primary/30 p-2">
                  <div className="flex items-start gap-2 flex-1 min-h-[80px]">
                    <Link className="size-4 text-foreground/50 mt-2 flex-shrink-0" />
                    <textarea
                      value={urlsText}
                      onChange={(e) => setUrlsText(e.target.value)}
                      placeholder="Paste one or more URLs (separated by space or new line)&#10;e.g.&#10;https://example.com/article-1&#10;https://example.com/article-2&#10;https://youtube.com/watch?v=..."
                      className="flex-1 bg-transparent text-sm outline-none text-foreground resize-none min-h-[80px] font-mono text-[13px]"
                      rows={4}
                    />
                  </div>
                </div>

                {/* URL Stats and Validation */}
                {urlsText.trim() && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground/60">
                        {validUrls.length} valid URL{validUrls.length !== 1 ? 's' : ''} found
                        {validUrls.length > 0 && ` (max 15)`}
                      </span>
                      {validUrls.length > 0 && (
                        <button
                          onClick={() => setUrlsText('')}
                          className="text-foreground/40 hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="size-3" />
                          <span>Clear all</span>
                        </button>
                      )}
                    </div>

                    {/* URL List Preview */}
                    {validUrls.length > 0 && (
                      <div className="max-h-24 overflow-y-auto space-y-0.5 bg-foreground/5 rounded-lg p-2">
                        {validUrls.slice(0, 15).map((url, idx) => {
                          const isYt = /youtu\.?be/i.test(url);
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-[11px] text-foreground/70 truncate"
                            >
                              {isYt ? (
                                <Youtube className="size-3 text-red-500 flex-shrink-0" />
                              ) : (
                                <Globe className="size-3 text-foreground/40 flex-shrink-0" />
                              )}
                              <span className="truncate font-mono text-[11px]">{url}</span>
                            </div>
                          );
                        })}
                        {validUrls.length > 15 && (
                          <div className="text-[11px] text-foreground/40 font-medium">
                            +{validUrls.length - 15} more URLs (exceeds limit)
                          </div>
                        )}
                      </div>
                    )}

                    {hasInvalidUrls && (
                      <div className="flex items-center gap-1.5 text-amber-600 text-xs">
                        <AlertTriangle className="size-3.5" />
                        <span>Some entries are not valid URLs. Please check the format.</span>
                      </div>
                    )}

                    {validUrls.length > 15 && (
                      <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                        <AlertTriangle className="size-3.5" />
                        <span>Maximum 15 URLs allowed. Please remove some URLs.</span>
                      </div>
                    )}

                    {validUrls.length > 0 && validUrls.length <= 15 && (
                      <div className="flex items-center gap-1.5 text-emerald-600 text-xs">
                        <CheckCircle2 className="size-3.5" />
                        <span>
                          Ready to import {validUrls.length} URL{validUrls.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  disabled={!isValidUrlCount}
                  onClick={handleUrlImport}
                  className="flex-1 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-30 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  Import {validUrls.length > 0 ? `${validUrls.length} URL${validUrls.length !== 1 ? 's' : ''}` : 'URLs'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-3 rounded-xl bg-foreground/5 flex items-center gap-2">
                  <Globe className="size-4 text-foreground/60" />
                  <div>
                    <p className="text-[11px] font-bold text-foreground">Web articles</p>
                    <p className="text-[10px] text-foreground/50">Clean reader extract</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-foreground/5 flex items-center gap-2">
                  <Youtube className="size-4 text-red-500" />
                  <div>
                    <p className="text-[11px] font-bold text-foreground">YouTube videos</p>
                    <p className="text-[10px] text-foreground/50">Full transcript extraction</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {stage === "idle" && tab === "text" && (
            <>
              <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">
                Title (optional)
              </label>
              <input
                value={pastedTitle}
                onChange={(e) => setPastedTitle(e.target.value)}
                placeholder="e.g. Meeting notes — Q3 strategy"
                className="w-full mt-2 px-3 py-2.5 rounded-xl bg-foreground/5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary/30 text-foreground"
              />
              <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 block mt-4">
                Paste your text
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste an article, transcript, notes, or any text you want to chat with…"
                rows={7}
                className="w-full mt-2 px-3 py-2.5 rounded-xl bg-foreground/5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary/30 resize-none text-foreground"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-foreground/50">
                  {pastedText.trim().length.toLocaleString()} chars · ~
                  {Math.max(
                    1,
                    Math.round(pastedText.trim().split(/\s+/).filter(Boolean).length / 200),
                  )}{" "}
                  min read
                </span>
                <button
                  disabled={pastedText.trim().length < 20}
                  onClick={handleNoteCreate}
                  className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-30 cursor-pointer"
                >
                  Add text
                </button>
              </div>
            </>
          )}

          {stage === "idle" && tab === "research" && (
            <>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent-pink/10 border border-primary/20">
                <div className="size-9 rounded-xl bg-white grid place-items-center shrink-0">
                  <Brain className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">AI Research Agent</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed">
                    Enter a topic, and our AI agent automatically searches the web, gathers the most relevant sources, and adds them to your notebook.
                  </p>
                </div>
              </div>

              <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 block mt-4">
                Research topic
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. State of mixture-of-experts models in 2026"
                className="w-full mt-2 px-3 py-2.5 rounded-xl bg-foreground/5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary/30 text-foreground"
              />

              <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 block mt-4">
                Depth
              </label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(
                  [
                    { id: "quick", label: "Quick", time: "~40s", desc: "5 sources",noOfSources:5 },
                    { id: "standard", label: "Standard", time: "~1min", desc: "8 sources",noOfSources: 8 },
                    { id: "deep", label: "Deep", time: "~2min", desc: "15 sources",noOfSources: 15 },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDepth(d.noOfSources)}
                    className={`p-3 rounded-xl text-left transition-all cursor-pointer ${depth === d.noOfSources
                        ? "bg-foreground text-background"
                        : "bg-foreground/5 hover:bg-foreground/10"
                      }`}
                  >
                    <p className="text-xs font-bold">{d.label}</p>
                    <p
                      className={`text-[10px] ${depth === d.noOfSources ? "text-background/70" : "text-foreground/50"}`}
                    >
                      {d.desc}
                    </p>
                    <p
                      className={`text-[10px] flex items-center gap-0.5 mt-0.5 ${depth === d.noOfSources ? "text-background/70" : "text-foreground/40"}`}
                    >
                      <Clock className="size-2.5" />
                      {d.time}
                    </p>
                  </button>
                ))}
              </div>

              <button
                disabled={topic.trim().length < 5}
                onClick={handleResearchStart}
                className="w-full mt-4 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-30 cursor-pointer bg-foreground text-background text-sm font-semibold"
              >
                <Sparkles className="size-4" /> Start research
              </button>
            </>
          )}

          {stage === "uploading" && (
            <div className="py-6 text-center">
              <Loader2 className="size-8 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-sm font-semibold mb-2 text-foreground">{stageLabel}</p>
              <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden max-w-xs mx-auto mb-2">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent-pink transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-foreground/50">{progress}%</p>
            </div>
          )}

          {stage === "processing" && (
            <div className="py-6 text-center">
              <Loader2 className="size-8 mx-auto mb-4 animate-spin text-primary" />
              {tab === "research" ? (
                <div className="py-2">
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <Brain className="size-4 text-primary animate-pulse" />
                    <p className="text-sm font-bold text-foreground">Researching…</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold mb-2 text-foreground">Processing source…</p>
                  <p className="text-[11px] text-foreground/50">{processingLabel}</p>
                </>
              )}
            </div>
          )}

          {stage === "done" && (
            <div className="py-6 text-center">
              <div className="size-12 mx-auto mb-3 rounded-full bg-primary/10 grid place-items-center">
                <CheckCircle2 className="size-6 text-primary" />
              </div>
              <p className="text-sm font-semibold mb-1 text-foreground">{doneTitle}</p>
              <p className="text-xs text-foreground/50 mb-4">{doneSubtitle}</p>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-foreground text-background text-sm font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {stage === "error" && (
            <div className="py-6 text-center">
              <div className="size-12 mx-auto mb-3 rounded-full bg-red-100 grid place-items-center">
                <AlertTriangle className="size-6 text-red-500" />
              </div>
              <p className="text-sm font-semibold mb-1 text-red-600">Error occurred</p>
              <p className="text-xs text-foreground/60 mb-6 max-w-sm mx-auto">{errorMessage}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setStage("idle")}
                  className="px-5 py-2 rounded-full bg-foreground/10 hover:bg-foreground/15 text-foreground text-xs font-semibold cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-full bg-foreground text-background text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
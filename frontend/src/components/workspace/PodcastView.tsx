// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useQuery } from "@tanstack/react-query";
// import {
//   Headphones,
//   Play,
//   Pause,
//   SkipBack,
//   SkipForward,
//   Volume2,
//   VolumeX,
//   Download,
//   ExternalLink,
//   Sparkles,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";
// import { useArtifact } from "@/hooks/useArtifact";
// import { useAudioPlayer } from "@/hooks/useAudioPlayer";
// import { ArtifactHeader } from "./ArtifactHeader";
// import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";
// import sourcesApi from "@/lib/api/sources";

// interface PodcastViewProps {
//   notebookId: string;
//   excludedSourceIds: string[];
// }

// function formatTime(seconds: number): string {
//   if (isNaN(seconds) || seconds === Infinity) return "0:00";
//   const m = Math.floor(seconds / 60);
//   const s = Math.floor(seconds % 60);
//   return `${m}:${s.toString().padStart(2, "0")}`;
// }

// export function PodcastView({ notebookId, excludedSourceIds }: PodcastViewProps) {
//   const {
//     artifact,
//     status,
//     errorMessage,
//     isLoading,
//     isGenerating,
//     generate,
//     retry,
//     deleteArtifact,
//     history,
//     selectedArtifactId,
//     setSelectedArtifactId,
//   } = useArtifact(notebookId, "voice_overview", excludedSourceIds);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [loadingTextIndex, setLoadingTextIndex] = useState(0);

//   const waveformRef = useRef<HTMLDivElement>(null);

//   const loadingSteps = [
//     "Analyzing source documents...",
//     "Extracting core concepts...",
//     "Generating conversation...",
//     "Writing script...",
//     "Synthesizing voices...",
//     "Rendering audio...",
//   ];

//   // Fetch sources count for metadata
//   const { data: sourcesData } = useQuery({
//     queryKey: ["sources", notebookId],
//     queryFn: () => sourcesApi.listSources(notebookId, 1, 100),
//     enabled: !!notebookId,
//   });

//   const totalSourcesCount = sourcesData?.sources?.length ?? 0;
//   const excludedCount = excludedSourceIds?.length ?? 0;
//   const sourcesUsed = Math.max(0, totalSourcesCount - excludedCount);

//   // Cycle loading step text
//   useEffect(() => {
//     if (status === "processing" || isGenerating) {
//       const interval = setInterval(() => {
//         setLoadingTextIndex((prev) => (prev + 1) % loadingSteps.length);
//       }, 4000);
//       return () => clearInterval(interval);
//     } else {
//       setLoadingTextIndex(0);
//     }
//   }, [status, isGenerating]);

//   // Extract voice content from artifact
//   const voiceContent =
//     artifact?.status === "ready" && artifact.content_json
//       ? (artifact.content_json as {
//           title: string;
//           description: string;
//           duration?: number;
//           audio_url?: string;
//           audio?:
//             | {
//                 audio_url?: string;
//                 url?: string;
//                 audio_file_id?: string;
//                 audio_duration_seconds?: number;
//               }
//             | string;
//           dialogue: Array<{
//             speaker: string;
//             text: string;
//           }>;
//           chapters?: Array<{
//             id: string | number;
//             title: string;
//             start: number;
//             speaker?: string;
//           }>;
//         })
//       : null;

//   // Fixed audio URL extraction to handle nested structure
//   const audioUrl = (() => {
//     if (!voiceContent) return undefined;

//     // Check if audio is an object with audio_url
//     if (typeof voiceContent.audio === "object" && voiceContent.audio !== null) {
//       return voiceContent.audio.audio_url || voiceContent.audio.url;
//     }

//     // Check if audio is a string
//     if (typeof voiceContent.audio === "string") {
//       return voiceContent.audio;
//     }

//     // Fallback to top-level audio_url
//     return voiceContent.audio_url || artifact?.audio_url;
//   })();

//   const [playerState, playerControls] = useAudioPlayer(audioUrl);
//   const {
//     playing,
//     currentTime,
//     duration: playerDuration,
//     volume,
//     muted,
//     playbackRate,
//     error: playerError,
//     isBuffering,
//   } = playerState;

//   const {
//     audioRef,
//     togglePlay,
//     seek,
//     seekRelative,
//     setVolume,
//     toggleMute,
//     cyclePlaybackRate,
//     onPlay,
//     onPause,
//     onEnded,
//     onTimeUpdate,
//     onLoadedMetadata,
//     onWaiting,
//     onPlaying,
//     onError,
//   } = playerControls;

//   const duration =
//     playerDuration || voiceContent?.audio_duration_seconds || voiceContent?.duration || 0;

//   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setVolume(parseFloat(e.target.value));
//   };

//   const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!waveformRef.current || !duration) return;
//     const rect = waveformRef.current.getBoundingClientRect();
//     const clickX = e.clientX - rect.left;
//     const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
//     seek(percent * duration);
//   };

//   // Find active chapter if any
//   const currentChapter =
//     voiceContent?.chapters && voiceContent.chapters.length > 0
//       ? ([...voiceContent.chapters].reverse().find((c) => currentTime >= c.start) ??
//         voiceContent.chapters[0])
//       : null;

//   // 1. Initial page loading
//   if (isLoading) {
//     return (
//       <div className="h-full flex items-center justify-center bg-background">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="size-8 animate-spin text-primary" />
//           <p className="text-sm text-foreground/60 font-medium">Loading voice overview...</p>
//         </div>
//       </div>
//     );
//   }

//   // 2. Active generation / Background processing
//   if (isGenerating || status === "processing") {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center bg-background">
//         <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft text-center animate-pulse">
//           <Sparkles className="size-12 text-primary mx-auto mb-4 animate-bounce" />
//           <h3 className="text-xl font-bold tracking-tight mb-2">Generating Voice Overview</h3>
//           <p className="text-sm text-foreground/60 mb-6 min-h-10">
//             {loadingSteps[loadingTextIndex]}
//           </p>
//           <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
//             <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent-pink rounded-full animate-infinite-scroll" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 3. Error generation
//   if (status === "error") {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center bg-background">
//         <div className="max-w-md w-full bg-red-50/50 backdrop-blur-xl border border-red-200/50 rounded-3xl p-8 shadow-soft text-center">
//           <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-xl font-bold tracking-tight mb-2">Generation Failed</h3>
//           <p className="text-sm text-red-600/80 mb-6">
//             {errorMessage || "An unexpected error occurred while generating audio overview."}
//           </p>
//           <div className="flex gap-3 justify-center">
//             <button
//               onClick={() => retry()}
//               className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-600/20 hover:scale-105 transition-all cursor-pointer"
//             >
//               Retry Generation
//             </button>
//             <button
//               onClick={() => deleteArtifact()}
//               className="px-5 py-2.5 rounded-full bg-white border border-red-200 text-foreground text-sm font-semibold hover:bg-red-50/50 transition-all cursor-pointer"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 4. Empty / Un-generated state
//   if (!artifact || !voiceContent) {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center bg-background">
//         <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
//           <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
//             <Headphones className="size-6 text-primary" />
//           </div>
//           <h2 className="text-2xl font-extrabold tracking-tight mb-2">Voice Overview</h2>
//           <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
//             Generate an engaging, two-host audio conversation explaining the topics in your sources.
//             Alternate voices, choose styling, and read along with the generated transcript.
//           </p>

//           <button
//             onClick={() => setIsDialogOpen(true)}
//             className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
//           >
//             <Sparkles className="size-4" />
//             Generate Voice Overview
//           </button>
//         </div>

//         <ArtifactGenerationDialog
//           isOpen={isDialogOpen}
//           onClose={() => setIsDialogOpen(false)}
//           type="voice_overview"
//           onGenerate={generate}
//           isGenerating={isGenerating}
//           prefilledOptions={null}
//         />
//       </div>
//     );
//   }

//   // 5. Active ready state view
//   return (
//     <div className="h-full flex flex-col overflow-hidden bg-background">
//       {/* Audio element - using ref from useAudioPlayer hook */}
//       {audioUrl && (
//         <audio
//           ref={audioRef}
//           src={audioUrl}
//           preload="auto"
//           onPlay={onPlay}
//           onPause={onPause}
//           onEnded={onEnded}
//           onTimeUpdate={onTimeUpdate}
//           onLoadedMetadata={onLoadedMetadata}
//           onWaiting={onWaiting}
//           onPlaying={onPlaying}
//           onError={onError}
//         />
//       )}

//       <ArtifactHeader
//         title="Voice Overview"
//         type="voice_overview"
//         history={history}
//         selectedArtifactId={selectedArtifactId}
//         onSelectArtifactId={setSelectedArtifactId}
//         onGenerateAgain={() => setIsDialogOpen(true)}
//         onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
//         icon={<Headphones className="size-3.5 text-primary" />}
//       />

//       <div className="flex-1 overflow-y-auto p-8 md:p-12">
//         <div className="max-w-3xl mx-auto">
//           {playerError && (
//             <div className="mb-6 p-4 rounded-xl bg-red-50/50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-3">
//               <AlertCircle className="size-5 shrink-0" />
//               {playerError}
//             </div>
//           )}

//           <div className="flex items-center gap-2 mb-4">
//             <Headphones
//               className={`size-4 text-accent-pink ${playing && !isBuffering ? "animate-pulse" : ""}`}
//             />
//             <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
//               Generated Audio · {formatTime(duration)}
//             </span>
//           </div>
//           <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-3 text-gradient">
//             {voiceContent.title || "Voice Overview"}
//           </h2>
//           {voiceContent.description && (
//             <p className="text-foreground/60 mb-8 leading-relaxed">{voiceContent.description}</p>
//           )}

//           {/* Audio Player Container */}
//           <div className="bg-gradient-to-br from-primary/10 via-accent-blue/5 to-accent-pink/10 border border-white/60 rounded-3xl p-6 mb-8 shadow-soft">
//             {/* Waveform scrubbing timeline */}
//             <div
//               ref={waveformRef}
//               onClick={handleWaveformClick}
//               className="flex items-end gap-0.5 h-20 mb-5 cursor-pointer group"
//               title="Click to seek"
//             >
//               {Array.from({ length: 64 }).map((_, i) => {
//                 const progress = duration > 0 ? (currentTime / duration) * 64 : 0;
//                 const past = i < progress;
//                 return (
//                   <div
//                     key={i}
//                     className={`flex-1 rounded-full transition-colors ${
//                       past
//                         ? "bg-gradient-to-t from-primary to-accent-pink"
//                         : "bg-foreground/10 group-hover:bg-foreground/15"
//                     }`}
//                     style={{ height: `${20 + Math.abs(Math.sin(i * 0.55)) * 70 + 10}%` }}
//                   />
//                 );
//               })}
//             </div>

//             {/* Playback time labels */}
//             <div className="flex items-center justify-between text-[11px] font-mono text-foreground/60 mb-4">
//               <span>{formatTime(currentTime)}</span>
//               {currentChapter && (
//                 <span
//                   className="font-bold text-foreground truncate max-w-xs"
//                   title={currentChapter.title}
//                 >
//                   {currentChapter.title}
//                 </span>
//               )}
//               <span>{formatTime(duration)}</span>
//             </div>

//             {/* Audio Controls */}
//             <div className="flex flex-wrap items-center justify-center gap-4">
//               <button
//                 onClick={() => seekRelative(-10)}
//                 className="size-9 rounded-full bg-white/60 text-foreground grid place-items-center hover:bg-white transition-colors cursor-pointer"
//                 title="Rewind 10s"
//               >
//                 <SkipBack className="size-4" />
//               </button>
//               <button
//                 onClick={togglePlay}
//                 className="size-14 rounded-full bg-foreground text-background grid place-items-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
//                 title={playing ? "Pause" : "Play"}
//                 disabled={isBuffering && !playing}
//               >
//                 {isBuffering && !playing ? (
//                   <Loader2 className="size-5 animate-spin" />
//                 ) : playing ? (
//                   <Pause className="size-5" />
//                 ) : (
//                   <Play className="size-5 ml-0.5" />
//                 )}
//               </button>
//               <button
//                 onClick={() => seekRelative(10)}
//                 className="size-9 rounded-full bg-white/60 text-foreground grid place-items-center hover:bg-white transition-colors cursor-pointer"
//                 title="Forward 10s"
//               >
//                 <SkipForward className="size-4" />
//               </button>

//               {/* Speed cycling toggle */}
//               <button
//                 onClick={cyclePlaybackRate}
//                 className="flex items-center gap-1 px-3 py-1.5 bg-white/60 rounded-full text-[11px] font-mono hover:bg-white transition-colors text-foreground font-semibold cursor-pointer"
//                 title="Cycle Playback Speed"
//               >
//                 {playbackRate.toFixed(2)}x
//               </button>

//               {/* Volume mute + Slider */}
//               <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full text-[11px] font-mono text-foreground select-none">
//                 <button
//                   onClick={toggleMute}
//                   className="hover:text-primary transition-colors cursor-pointer"
//                   title={muted ? "Unmute" : "Mute"}
//                 >
//                   {muted || volume === 0 ? (
//                     <VolumeX className="size-3.5" />
//                   ) : (
//                     <Volume2 className="size-3.5" />
//                   )}
//                 </button>
//                 <input
//                   type="range"
//                   min="0"
//                   max="1"
//                   step="0.05"
//                   value={muted ? 0 : volume}
//                   onChange={handleVolumeChange}
//                   className="w-16 h-1 bg-foreground/15 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
//                   title="Adjust Volume"
//                 />
//               </div>

//               {/* Download link */}
//               {audioUrl && (
//                 <a
//                   href={audioUrl}
//                   download={`voice-overview-${artifact.id}.mp3`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="size-9 rounded-full bg-white/60 hover:bg-white text-foreground transition-colors grid place-items-center cursor-pointer"
//                   title="Download audio file"
//                 >
//                   <Download className="size-4" />
//                 </a>
//               )}

//               {/* Open in new tab */}
//               {audioUrl && (
//                 <a
//                   href={audioUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="size-9 rounded-full bg-white/60 hover:bg-white text-foreground transition-colors grid place-items-center cursor-pointer"
//                   title="Open audio in new tab"
//                 >
//                   <ExternalLink className="size-4" />
//                 </a>
//               )}
//             </div>
//           </div>

//           {/* Chapters Panel (Conditional) */}
//           {voiceContent.chapters && voiceContent.chapters.length > 0 && (
//             <>
//               <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
//                 Chapters
//               </h3>
//               <div className="space-y-1 mb-8">
//                 {voiceContent.chapters.map((c, idx) => {
//                   const active = currentChapter && currentChapter.id === c.id;
//                   return (
//                     <button
//                       key={c.id || idx}
//                       onClick={() => seek(c.start)}
//                       className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors cursor-pointer ${
//                         active ? "bg-primary/10" : "hover:bg-foreground/5"
//                       }`}
//                     >
//                       <span
//                         className={`text-[11px] font-mono w-12 ${
//                           active ? "text-primary font-bold" : "text-foreground/40"
//                         }`}
//                       >
//                         {formatTime(c.start)}
//                       </span>
//                       <span
//                         className={`flex-1 text-sm ${
//                           active ? "font-bold text-foreground" : "text-foreground/70"
//                         }`}
//                       >
//                         {c.title}
//                       </span>
//                       {c.speaker && (
//                         <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-foreground/5 text-foreground/50">
//                           {c.speaker.replace("host_", "Host ")}
//                         </span>
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </>
//           )}

//           {/* Transcript Panel */}
//           <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
//             Transcript
//           </h3>
//           <div className="space-y-4">
//             {voiceContent.dialogue?.map((t, i) => {
//               const isHost1 = t.speaker === "host_1";
//               let displayName = isHost1 ? "Host 1" : t.speaker === "host_2" ? "Host 2" : t.speaker;
//               if (displayName.startsWith("host_")) {
//                 displayName = displayName.replace("host_", "Host ");
//               }
//               const speakerInitial = displayName.charAt(0) || "?";

//               return (
//                 <div key={i} className="flex gap-4">
//                   <div
//                     className={`size-8 shrink-0 rounded-full grid place-items-center text-[10px] font-bold text-white select-none ${
//                       isHost1 ? "bg-primary" : "bg-accent-blue"
//                     }`}
//                   >
//                     {speakerInitial}
//                   </div>
//                   <div>
//                     <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
//                       {displayName}
//                     </p>
//                     <p className="text-sm leading-relaxed text-foreground/80">{t.text}</p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Metadata Grid */}
//           <div className="mt-12 border-t border-border pt-6">
//             <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
//               Generation Details
//             </h3>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
//               <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl">
//                 <span className="text-foreground/40 block mb-1">Length</span>
//                 <span className="font-semibold capitalize text-foreground/80">
//                   {artifact.options_json?.length || "medium"}
//                 </span>
//               </div>
//               <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl">
//                 <span className="text-foreground/40 block mb-1">Voice Style</span>
//                 <span className="font-semibold capitalize text-foreground/80">
//                   {artifact.options_json?.voice_style || "default"}
//                 </span>
//               </div>
//               <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl">
//                 <span className="text-foreground/40 block mb-1">Created Time</span>
//                 <span className="font-semibold text-foreground/80">
//                   {new Date(artifact.created_at).toLocaleString()}
//                 </span>
//               </div>
//               <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl">
//                 <span className="text-foreground/40 block mb-1">Duration</span>
//                 <span className="font-semibold text-foreground/80">{formatTime(duration)}</span>
//               </div>
//               <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl">
//                 <span className="text-foreground/40 block mb-1">Sources Used</span>
//                 <span className="font-semibold text-foreground/80">
//                   {sourcesUsed} {sourcesUsed === 1 ? "source" : "sources"}
//                 </span>
//               </div>
//               {artifact.options_json?.prompt && (
//                 <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl col-span-2 md:col-span-3">
//                   <span className="text-foreground/40 block mb-1">Instructions Prompt</span>
//                   <span className="font-medium text-foreground/70 italic select-all">
//                     "{artifact.options_json.prompt}"
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <ArtifactGenerationDialog
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         type="voice_overview"
//         onGenerate={generate}
//         isGenerating={isGenerating}
//         prefilledOptions={artifact?.options_json}
//       />
//     </div>
//   );
// }





"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Headphones,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useArtifact } from "@/hooks/useArtifact";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { ArtifactHeader } from "./ArtifactHeader";
import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";
import sourcesApi from "@/lib/api/sources";

interface PodcastViewProps {
  notebookId: string;
  excludedSourceIds: string[];
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds === Infinity) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PodcastView({ notebookId, excludedSourceIds }: PodcastViewProps) {
  const {
    artifact,
    status,
    errorMessage,
    isLoading,
    isGenerating,
    generate,
    retry,
    deleteArtifact,
    history,
    selectedArtifactId,
    setSelectedArtifactId,
  } = useArtifact(notebookId, "voice_overview", excludedSourceIds);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const waveformRef = useRef<HTMLDivElement>(null);

  const loadingSteps = [
    "Analyzing source documents...",
    "Extracting core concepts...",
    "Generating conversation...",
    "Writing script...",
    "Synthesizing voices...",
    "Rendering audio...",
  ];

  // Fetch sources count for metadata
  const { data: sourcesData } = useQuery({
    queryKey: ["sources", notebookId],
    queryFn: () => sourcesApi.listSources(notebookId, 1, 100),
    enabled: !!notebookId,
  });

  const totalSourcesCount = sourcesData?.sources?.length ?? 0;
  const excludedCount = excludedSourceIds?.length ?? 0;
  const sourcesUsed = Math.max(0, totalSourcesCount - excludedCount);

  // Cycle loading step text
  useEffect(() => {
    if (status === "processing" || isGenerating) {
      const interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingSteps.length);
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setLoadingTextIndex(0);
    }
  }, [status, isGenerating]);

  // Extract voice content from artifact
  const voiceContent =
    artifact?.status === "ready" && artifact.content_json
      ? (artifact.content_json as {
          title: string;
          description: string;
          duration?: number;
          audio_url?: string;
          audio?:
            | {
                audio_url?: string;
                url?: string;
                audio_file_id?: string;
                audio_duration_seconds?: number;
              }
            | string;
          dialogue: Array<{
            speaker: string;
            text: string;
          }>;
          chapters?: Array<{
            id: string | number;
            title: string;
            start: number;
            speaker?: string;
          }>;
        })
      : null;

  // Fixed audio URL extraction to handle nested structure
  const audioUrl = (() => {
    if (!voiceContent) return undefined;

    // Check if audio is an object with audio_url
    if (typeof voiceContent.audio === "object" && voiceContent.audio !== null) {
      return voiceContent.audio.audio_url || voiceContent.audio.url;
    }

    // Check if audio is a string
    if (typeof voiceContent.audio === "string") {
      return voiceContent.audio;
    }

    // Fallback to top-level audio_url
    return voiceContent.audio_url || artifact?.audio_url;
  })();

  const [playerState, playerControls] = useAudioPlayer(audioUrl);
  const {
    playing,
    currentTime,
    duration: playerDuration,
    volume,
    muted,
    playbackRate,
    error: playerError,
    isBuffering,
  } = playerState;

  const {
    audioRef,
    togglePlay,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    cyclePlaybackRate,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onLoadedMetadata,
    onWaiting,
    onPlaying,
    onError,
  } = playerControls;

  // The backend nests duration inside content_json.audio.audio_duration_seconds
  // (see AudioOverviewStoredContent) — there is no top-level `audio_duration_seconds`
  // or `duration` field. Read it from the nested object first before falling back.
  const nestedAudioDuration =
    typeof voiceContent?.audio === "object" && voiceContent?.audio !== null
      ? voiceContent.audio.audio_duration_seconds
      : undefined;

  const duration =
    playerDuration || nestedAudioDuration || voiceContent?.duration || artifact?.audio_duration_seconds || 0;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current || !duration) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    seek(percent * duration);
  };

  // Find active chapter if any
  const currentChapter =
    voiceContent?.chapters && voiceContent.chapters.length > 0
      ? ([...voiceContent.chapters].reverse().find((c) => currentTime >= c.start) ??
        voiceContent.chapters[0])
      : null;

  // 1. Initial page loading
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/60 font-medium">Loading voice overview...</p>
        </div>
      </div>
    );
  }

  // 2. Active generation / Background processing
  if (isGenerating || status === "processing") {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center bg-background">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft text-center animate-pulse">
          <Sparkles className="size-12 text-primary mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold tracking-tight mb-2">Generating Voice Overview</h3>
          <p className="text-sm text-foreground/60 mb-6 min-h-10">
            {loadingSteps[loadingTextIndex]}
          </p>
          <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent-pink rounded-full animate-infinite-scroll" />
          </div>
        </div>
      </div>
    );
  }

  // 3. Error generation
  if (status === "error") {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center bg-background">
        <div className="max-w-md w-full bg-red-50/50 backdrop-blur-xl border border-red-200/50 rounded-3xl p-8 shadow-soft text-center">
          <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold tracking-tight mb-2">Generation Failed</h3>
          <p className="text-sm text-red-600/80 mb-6">
            {errorMessage || "An unexpected error occurred while generating audio overview."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => retry()}
              className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-600/20 hover:scale-105 transition-all cursor-pointer"
            >
              Retry Generation
            </button>
            <button
              onClick={() => deleteArtifact()}
              className="px-5 py-2.5 rounded-full bg-white border border-red-200 text-foreground text-sm font-semibold hover:bg-red-50/50 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Empty / Un-generated state
  if (!artifact || !voiceContent) {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center bg-background">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
          <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
            <Headphones className="size-6 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">Voice Overview</h2>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            Generate an engaging, two-host audio conversation explaining the topics in your sources.
            Alternate voices, choose styling, and read along with the generated transcript.
          </p>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            Generate Voice Overview
          </button>
        </div>

        <ArtifactGenerationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          type="voice_overview"
          onGenerate={generate}
          isGenerating={isGenerating}
          prefilledOptions={null}
        />
      </div>
    );
  }

  // 5. Active ready state view
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Audio element - using ref from useAudioPlayer hook */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onWaiting={onWaiting}
          onPlaying={onPlaying}
          onError={onError}
        />
      )}

      <ArtifactHeader
        title="Voice Overview"
        type="voice_overview"
        history={history}
        selectedArtifactId={selectedArtifactId}
        onSelectArtifactId={setSelectedArtifactId}
        onGenerateAgain={() => setIsDialogOpen(true)}
        onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
        icon={<Headphones className="size-3.5 text-primary" />}
      />

      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          {playerError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50/50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-3">
              <AlertCircle className="size-5 shrink-0" />
              {playerError}
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <Headphones
              className={`size-4 text-accent-pink ${playing && !isBuffering ? "animate-pulse" : ""}`}
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
              Generated Audio · {formatTime(duration)}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-3 text-gradient">
            {voiceContent.title || "Voice Overview"}
          </h2>
          {voiceContent.description && (
            <p className="text-foreground/60 mb-8 leading-relaxed">{voiceContent.description}</p>
          )}

          {/* Audio Player Container */}
          <div className="bg-gradient-to-br from-primary/10 via-accent-blue/5 to-accent-pink/10 border border-white/60 rounded-3xl p-6 mb-8 shadow-soft">
            {/* Waveform scrubbing timeline */}
            <div
              ref={waveformRef}
              onClick={handleWaveformClick}
              className="flex items-end gap-0.5 h-20 mb-5 cursor-pointer group"
              title="Click to seek"
            >
              {Array.from({ length: 64 }).map((_, i) => {
                const progress = duration > 0 ? (currentTime / duration) * 64 : 0;
                const past = i < progress;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${
                      past
                        ? "bg-gradient-to-t from-primary to-accent-pink"
                        : "bg-foreground/10 group-hover:bg-foreground/15"
                    }`}
                    style={{ height: `${20 + Math.abs(Math.sin(i * 0.55)) * 70 + 10}%` }}
                  />
                );
              })}
            </div>

            {/* Playback time labels */}
            <div className="flex items-center justify-between text-[11px] font-mono text-foreground/60 mb-4">
              <span>{formatTime(currentTime)}</span>
              {currentChapter && (
                <span
                  className="font-bold text-foreground truncate max-w-xs"
                  title={currentChapter.title}
                >
                  {currentChapter.title}
                </span>
              )}
              <span>{formatTime(duration)}</span>
            </div>

            {/* Audio Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => seekRelative(-10)}
                className="size-9 rounded-full bg-white/60 text-foreground grid place-items-center hover:bg-white transition-colors cursor-pointer"
                title="Rewind 10s"
              >
                <SkipBack className="size-4" />
              </button>
              <button
                onClick={togglePlay}
                className="size-14 rounded-full bg-foreground text-background grid place-items-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
                title={playing ? "Pause" : "Play"}
                disabled={isBuffering && !playing}
              >
                {isBuffering && !playing ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : playing ? (
                  <Pause className="size-5" />
                ) : (
                  <Play className="size-5 ml-0.5" />
                )}
              </button>
              <button
                onClick={() => seekRelative(10)}
                className="size-9 rounded-full bg-white/60 text-foreground grid place-items-center hover:bg-white transition-colors cursor-pointer"
                title="Forward 10s"
              >
                <SkipForward className="size-4" />
              </button>

              {/* Speed cycling toggle */}
              <button
                onClick={cyclePlaybackRate}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/60 rounded-full text-[11px] font-mono hover:bg-white transition-colors text-foreground font-semibold cursor-pointer"
                title="Cycle Playback Speed"
              >
                {playbackRate.toFixed(2)}x
              </button>

              {/* Volume mute + Slider */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full text-[11px] font-mono text-foreground select-none">
                <button
                  onClick={toggleMute}
                  className="hover:text-primary transition-colors cursor-pointer"
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="size-3.5" />
                  ) : (
                    <Volume2 className="size-3.5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-foreground/15 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                  title="Adjust Volume"
                />
              </div>

              {/* Download link */}
              {audioUrl && (
                <a
                  href={audioUrl}
                  download={`voice-overview-${artifact.id}.mp3`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-full bg-white/60 hover:bg-white text-foreground transition-colors grid place-items-center cursor-pointer"
                  title="Download audio file"
                >
                  <Download className="size-4" />
                </a>
              )}

              {/* Open in new tab */}
              {audioUrl && (
                <a
                  href={audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-full bg-white/60 hover:bg-white text-foreground transition-colors grid place-items-center cursor-pointer"
                  title="Open audio in new tab"
                >
                  <ExternalLink className="size-4" />
                </a>
              )}
            </div>
          </div>

          {/* Chapters Panel (Conditional) */}
          {voiceContent.chapters && voiceContent.chapters.length > 0 && (
            <>
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
                Chapters
              </h3>
              <div className="space-y-1 mb-8">
                {voiceContent.chapters.map((c, idx) => {
                  const active = currentChapter && currentChapter.id === c.id;
                  return (
                    <button
                      key={c.id || idx}
                      onClick={() => seek(c.start)}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors cursor-pointer ${
                        active ? "bg-primary/10" : "hover:bg-foreground/5"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-mono w-12 ${
                          active ? "text-primary font-bold" : "text-foreground/40"
                        }`}
                      >
                        {formatTime(c.start)}
                      </span>
                      <span
                        className={`flex-1 text-sm ${
                          active ? "font-bold text-foreground" : "text-foreground/70"
                        }`}
                      >
                        {c.title}
                      </span>
                      {c.speaker && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-foreground/5 text-foreground/50">
                          {c.speaker.replace("host_", "Host ")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Transcript Panel */}
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
            Transcript
          </h3>
          <div className="space-y-4">
            {voiceContent.dialogue?.map((t, i) => {
              const isHost1 = t.speaker === "host_1";
              let displayName = isHost1 ? "Host 1" : t.speaker === "host_2" ? "Host 2" : t.speaker;
              if (displayName.startsWith("host_")) {
                displayName = displayName.replace("host_", "Host ");
              }
              const speakerInitial = displayName.charAt(0) || "?";

              return (
                <div key={i} className="flex gap-4">
                  <div
                    className={`size-8 shrink-0 rounded-full grid place-items-center text-[10px] font-bold text-white select-none ${
                      isHost1 ? "bg-primary" : "bg-accent-blue"
                    }`}
                  >
                    {speakerInitial}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
                      {displayName}
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/80">{t.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Metadata Grid */}
          <div className="mt-12 border-t border-border pt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
              Generation Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl">
                <span className="text-foreground/40 block mb-1">Length</span>
                <span className="font-semibold capitalize text-foreground/80">
                  {artifact.options_json?.length || "medium"}
                </span>
              </div>
              <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl">
                <span className="text-foreground/40 block mb-1">Voice Style</span>
                <span className="font-semibold capitalize text-foreground/80">
                  {artifact.options_json?.voice_style || "default"}
                </span>
              </div>
              <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl">
                <span className="text-foreground/40 block mb-1">Created Time</span>
                <span className="font-semibold text-foreground/80">
                  {new Date(artifact.created_at).toLocaleString()}
                </span>
              </div>
              <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl">
                <span className="text-foreground/40 block mb-1">Duration</span>
                <span className="font-semibold text-foreground/80">{formatTime(duration)}</span>
              </div>
              <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl">
                <span className="text-foreground/40 block mb-1">Sources Used</span>
                <span className="font-semibold text-foreground/80">
                  {sourcesUsed} {sourcesUsed === 1 ? "source" : "sources"}
                </span>
              </div>
              {artifact.options_json?.prompt && (
                <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-xl col-span-2 md:col-span-3">
                  <span className="text-foreground/40 block mb-1">Instructions Prompt</span>
                  <span className="font-medium text-foreground/70 italic select-all">
                    "{artifact.options_json.prompt}"
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ArtifactGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        type="voice_overview"
        onGenerate={generate}
        isGenerating={isGenerating}
        prefilledOptions={artifact?.options_json}
      />
    </div>
  );
}
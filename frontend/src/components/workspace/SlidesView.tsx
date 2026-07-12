// "use client";

// import { useState } from "react";
// import { Presentation, Loader2, Sparkles, AlertCircle } from "lucide-react";
// import { useArtifact } from "@/hooks/useArtifact";
// import { ArtifactHeader } from "./ArtifactHeader";
// import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";
// import SlideDeck, { ThemeName, Deck, Slide } from "./SlideDeck";

// interface SlidesViewProps {
//   notebookId: string;
//   excludedSourceIds: string[];
// }

// // Removing the mock adapter because SlideDeck expects content_json structure natively.

// export function SlidesView({ notebookId, excludedSourceIds }: SlidesViewProps) {
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
//   } = useArtifact(notebookId, "slide_deck", excludedSourceIds);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [theme, setTheme] = useState<ThemeName>("editorial");

//   console.log("artifact:", artifact);
//   console.log("status:", status);
//   console.log("errorMessage:", errorMessage);
//   console.log("isLoading:", isLoading);
//   console.log("isGenerating:", isGenerating);
//   console.log("history:", history);
//   console.log("selectedArtifactId:", selectedArtifactId);

//   const deckContent: Deck | null =
//     artifact?.status === "ready" && artifact.content_json
//       ? {
//           title: artifact.content_json.title || "Untitled Presentation",
//           description: artifact.content_json.description || "",
//           slides: Array.isArray(artifact.content_json.slides) ? artifact.content_json.slides : [],
//         }
//       : null;

//   if (isLoading) {
//     return (
//       <div className="h-full flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="size-8 animate-spin text-primary" />
//           <p className="text-sm text-foreground/60 font-medium">Loading slides...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isGenerating || status === "processing") {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
//         <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft text-center animate-pulse">
//           <Sparkles className="size-12 text-primary mx-auto mb-4 animate-bounce" />
//           <h3 className="text-xl font-bold tracking-tight mb-2">Composing your deck</h3>
//           <p className="text-sm text-foreground/60 mb-6 min-h-10">Extracting key arguments...</p>
//           <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
//             <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent-pink rounded-full animate-infinite-scroll" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (status === "error") {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
//         <div className="max-w-md w-full bg-red-50/50 backdrop-blur-xl border border-red-200/50 rounded-3xl p-8 shadow-soft text-center">
//           <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-xl font-bold tracking-tight mb-2">Generation Failed</h3>
//           <p className="text-sm text-red-600/80 mb-6">
//             {errorMessage || "An unexpected error occurred while generating the slides."}
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

//   if (!artifact || !deckContent) {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
//         <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
//           <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
//             <Presentation className="size-6 text-primary" />
//           </div>
//           <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-3 text-gradient">
//             Turn this notebook into a deck.
//           </h2>
//           <p className="text-sm text-foreground/60 mb-8 leading-relaxed">
//             We'll synthesize your sources into a presentation-ready outline.
//           </p>

//           <button
//             onClick={() => setIsDialogOpen(true)}
//             className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
//           >
//             <Sparkles className="size-4" />
//             Generate Slide Deck
//           </button>
//         </div>

//         <ArtifactGenerationDialog
//           isOpen={isDialogOpen}
//           onClose={() => setIsDialogOpen(false)}
//           type="slide_deck"
//           onGenerate={generate}
//           isGenerating={isGenerating}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="h-full w-full ">
//       {/* Header absolutely positioned over the slides, or keep it standard flow */}
     
//         <ArtifactHeader
//           title="Slide Deck"
//           type="slide_deck"
//           history={history}
//           selectedArtifactId={selectedArtifactId}
//           onSelectArtifactId={setSelectedArtifactId}
//           onGenerateAgain={() => setIsDialogOpen(true)}
//           onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
//           icon={<Presentation className="size-3.5" />}
//         />
 

//       {/* <div className=" w-full h-full " style={{ backgroundColor: "#0e0d0c" }}> */}
//         <SlideDeck
//           deck={deckContent}
//           theme={theme}
//           onThemeChange={setTheme}
//           hideThemeSwitcher={false}
//         />
//       {/* </div> */}

//       <ArtifactGenerationDialog
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         type="slide_deck"
//         onGenerate={generate}
//         isGenerating={isGenerating}
//       />
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { Presentation, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useArtifact } from "@/hooks/useArtifact";
import { ArtifactHeader } from "./ArtifactHeader";
import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";
import SlideDeck, { ThemeName, Deck, Slide } from "./SlideDeck";

interface SlidesViewProps {
  notebookId: string;
  excludedSourceIds: string[];
}

// Removing the mock adapter because SlideDeck expects content_json structure natively.

export function SlidesView({ notebookId, excludedSourceIds }: SlidesViewProps) {
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
  } = useArtifact(notebookId, "slide_deck", excludedSourceIds);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeName>("editorial");

  const deckContent: Deck | null =
    artifact?.status === "ready" && artifact.content_json
      ? {
          title: artifact.content_json.title || "Untitled Presentation",
          description: artifact.content_json.description || "",
          slides: Array.isArray(artifact.content_json.slides) ? artifact.content_json.slides : [],
        }
      : null;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/60 font-medium">Loading slides...</p>
        </div>
      </div>
    );
  }

  if (isGenerating || status === "processing") {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft text-center animate-pulse">
          <Sparkles className="size-12 text-primary mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold tracking-tight mb-2">Composing your deck</h3>
          <p className="text-sm text-foreground/60 mb-6 min-h-10">Extracting key arguments...</p>
          <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent-pink rounded-full animate-infinite-scroll" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-red-50/50 backdrop-blur-xl border border-red-200/50 rounded-3xl p-8 shadow-soft text-center">
          <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold tracking-tight mb-2">Generation Failed</h3>
          <p className="text-sm text-red-600/80 mb-6">
            {errorMessage || "An unexpected error occurred while generating the slides."}
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

  if (!artifact || !deckContent) {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
          <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
            <Presentation className="size-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-3 text-gradient">
            Turn this notebook into a deck.
          </h2>
          <p className="text-sm text-foreground/60 mb-8 leading-relaxed">
            We'll synthesize your sources into a presentation-ready outline.
          </p>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            Generate Slide Deck
          </button>
        </div>

        <ArtifactGenerationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          type="slide_deck"
          onGenerate={generate}
          isGenerating={isGenerating}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <ArtifactHeader
        title="Slide Deck"
        type="slide_deck"
        history={history}
        selectedArtifactId={selectedArtifactId}
        onSelectArtifactId={setSelectedArtifactId}
        onGenerateAgain={() => setIsDialogOpen(true)}
        onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
        icon={<Presentation className="size-3.5" />}
      />

      {/* flex-1 + min-h-0 lets the deck fill exactly what's left under the
          header instead of assuming it owns the full viewport. */}
      <div className="flex-1 min-h-0">
        <SlideDeck
          deck={deckContent}
          theme={theme}
          onThemeChange={setTheme}
          hideThemeSwitcher={false}
        />
      </div>

      <ArtifactGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        type="slide_deck"
        onGenerate={generate}
        isGenerating={isGenerating}
      />
    </div>
  );
}
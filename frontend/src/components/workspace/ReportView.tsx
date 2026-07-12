// "use client";

// import { useState } from "react";
// import { FileText, Sparkles, Loader2, AlertCircle } from "lucide-react";
// import { useArtifact } from "@/hooks/useArtifact";
// import { ArtifactHeader } from "./ArtifactHeader";
// import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";

// interface ReportViewProps {
//   notebookId: string;
//   excludedSourceIds: string[];
// }

// export function ReportView({ notebookId, excludedSourceIds }: ReportViewProps) {
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
//   } = useArtifact(notebookId, "report", excludedSourceIds);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const reportContent =
//     artifact?.status === "ready" && artifact.content_json ? artifact.content_json : null;

//   if (isLoading) {
//     return (
//       <div className="h-full flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="size-8 animate-spin text-primary" />
//           <p className="text-sm text-foreground/60 font-medium">Loading report...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isGenerating || status === "processing") {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
//         <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft text-center animate-pulse">
//           <Sparkles className="size-12 text-primary mx-auto mb-4 animate-bounce" />
//           <h3 className="text-xl font-bold tracking-tight mb-2">Generating Report</h3>
//           <p className="text-sm text-foreground/60 mb-6 min-h-10">Synthesizing sources...</p>
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
//             {errorMessage || "An unexpected error occurred while generating the report."}
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

//   if (!artifact || !reportContent) {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
//         <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
//           <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
//             <FileText className="size-6 text-primary" />
//           </div>
//           <h2 className="text-2xl font-extrabold tracking-tight mb-2">Report</h2>
//           <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
//             Generate an analytical report from your uploaded sources.
//           </p>

//           <button
//             onClick={() => setIsDialogOpen(true)}
//             className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
//           >
//             <Sparkles className="size-4" />
//             Generate Report
//           </button>
//         </div>

//         <ArtifactGenerationDialog
//           isOpen={isDialogOpen}
//           onClose={() => setIsDialogOpen(false)}
//           type="report"
//           onGenerate={generate}
//           isGenerating={isGenerating}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="h-full flex flex-col overflow-hidden">
//       <ArtifactHeader
//         title="Report"
//         type="report"
//         history={history}
//         selectedArtifactId={selectedArtifactId}
//         onSelectArtifactId={setSelectedArtifactId}
//         onGenerateAgain={() => setIsDialogOpen(true)}
//         onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
//         icon={<FileText className="size-3.5 text-primary" />}
//       />

//       <div className="flex-1 overflow-y-auto p-8 md:p-12">
//         <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-soft border border-border">
//           <h1 className="text-3xl font-extrabold tracking-tight mb-6">
//             {reportContent.title || artifact.title}
//           </h1>
//           <div className="prose prose-sm max-w-none text-foreground/80">
//             <pre className="whitespace-pre-wrap font-sans text-sm">
//               {JSON.stringify(reportContent, null, 2)}
//             </pre>
//           </div>
//         </div>
//       </div>

//       <ArtifactGenerationDialog
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         type="report"
//         onGenerate={generate}
//         isGenerating={isGenerating}
//       />
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { FileText, Sparkles, Loader2, AlertCircle, ChevronRight, BookOpen, Lightbulb, Target, ListChecks } from "lucide-react";
import { useArtifact } from "@/hooks/useArtifact";
import { ArtifactHeader } from "./ArtifactHeader";
import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";

interface ReportViewProps {
  notebookId: string;
  excludedSourceIds: string[];
}

interface ReportSection {
  heading?: string;
  body?: string;
  bullets?: string[];
}

interface ReportContent {
  title?: string;
  executive_summary?: string;
  sections?: ReportSection[];
  key_findings?: string[];
  conclusion?: string;
  [key: string]: unknown; // For any extra fields
}

export function ReportView({ notebookId, excludedSourceIds }: ReportViewProps) {
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
  } = useArtifact(notebookId, "report", excludedSourceIds);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const reportContent = artifact?.status === "ready" && artifact.content_json 
    ? artifact.content_json as ReportContent
    : null;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/60 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (isGenerating || status === "processing") {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft text-center animate-pulse">
          <Sparkles className="size-12 text-primary mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold tracking-tight mb-2">Generating Report</h3>
          <p className="text-sm text-foreground/60 mb-6 min-h-10">Synthesizing sources...</p>
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
            {errorMessage || "An unexpected error occurred while generating the report."}
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

  if (!artifact || !reportContent) {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
          <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
            <FileText className="size-6 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">Report</h2>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            Generate an analytical report from your uploaded sources.
          </p>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            Generate Report
          </button>
        </div>

        <ArtifactGenerationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          type="report"
          onGenerate={generate}
          isGenerating={isGenerating}
        />
      </div>
    );
  }

  const { title, executive_summary, sections, key_findings, conclusion } = reportContent;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ArtifactHeader
        title="Report"
        type="report"
        history={history}
        selectedArtifactId={selectedArtifactId}
        onSelectArtifactId={setSelectedArtifactId}
        onGenerateAgain={() => setIsDialogOpen(true)}
        onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
        icon={<FileText className="size-3.5 text-primary" />}
      />

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Report Container */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-soft overflow-hidden">
            {/* Header */}
            <div className="border-b border-border/60 p-8 md:p-10 bg-gradient-to-br from-foreground/[0.02] to-transparent">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                {title || "Report"}
              </h1>
            </div>

            <div className="p-8 md:p-10 space-y-8">
              {/* Executive Summary */}
              {executive_summary && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="size-4 text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/50">
                      Executive Summary
                    </h2>
                  </div>
                  <div className="pl-6 border-l-2 border-primary/30">
                    <p className="text-foreground/80 leading-relaxed">
                      {executive_summary}
                    </p>
                  </div>
                </section>
              )}

              {/* Key Findings */}
              {key_findings && key_findings.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="size-4 text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/50">
                      Key Findings
                    </h2>
                  </div>
                  <ul className="space-y-2">
                    {key_findings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-foreground/80">
                        <span className="text-primary mt-1 flex-shrink-0">
                          <ChevronRight className="size-4" />
                        </span>
                        <span className="leading-relaxed">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Sections */}
              {sections && sections.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="size-4 text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/50">
                      Analysis
                    </h2>
                  </div>

                  {sections.map((section, idx) => {
                    if (!section.body && !section.bullets?.length) return null;
                    
                    return (
                      <div key={idx} className="pl-6 border-l-2 border-border/40 space-y-3">
                        {section.heading && (
                          <h3 className="text-lg font-bold tracking-tight">
                            {section.heading}
                          </h3>
                        )}
                        
                        {section.body && (
                          <p className="text-foreground/80 leading-relaxed">
                            {section.body}
                          </p>
                        )}

                        {section.bullets && section.bullets.length > 0 && (
                          <ul className="space-y-1.5">
                            {section.bullets.map((bullet, bulletIdx) => (
                              <li key={bulletIdx} className="flex items-start gap-2.5 text-foreground/70 text-sm">
                                <span className="text-primary mt-1.5 flex-shrink-0">
                                  <span className="block size-1.5 rounded-full bg-primary/60" />
                                </span>
                                <span className="leading-relaxed">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Conclusion */}
              {conclusion && (
                <section className="pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="size-4 text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/50">
                      Conclusion
                    </h2>
                  </div>
                  <div className="pl-6 border-l-2 border-primary/20">
                    <p className="text-foreground/80 leading-relaxed">
                      {conclusion}
                    </p>
                  </div>
                </section>
              )}

              {/* Render any extra fields that might exist */}
              {Object.entries(reportContent).map(([key, value]) => {
                // Skip fields we already rendered
                const knownFields = ['title', 'executive_summary', 'sections', 'key_findings', 'conclusion'];
                if (knownFields.includes(key)) return null;
                if (!value) return null;
                if (typeof value === 'object') return null;

                return (
                  <section key={key} className="pt-2 border-t border-border/20">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">
                      {key.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {String(value)}
                    </p>
                  </section>
                );
              })}
            </div>

            {/* Footer Meta */}
            <div className="border-t border-border/40 px-8 md:px-10 py-4 bg-foreground/[0.02]">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-foreground/30">
                <span>Generated Report</span>
                <span className="flex items-center gap-3">
                  <span>{sections?.length || 0} sections</span>
                  <span className="w-px h-3 bg-border/60" />
                  <span>{key_findings?.length || 0} key findings</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ArtifactGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        type="report"
        onGenerate={generate}
        isGenerating={isGenerating}
      />
    </div>
  );
}
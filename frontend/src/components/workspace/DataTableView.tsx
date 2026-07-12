// "use client";

// import { useState } from "react";
// import { ListChecks, Sparkles, Loader2, AlertCircle } from "lucide-react";
// import { useArtifact } from "@/hooks/useArtifact";
// import { ArtifactHeader } from "./ArtifactHeader";
// import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";

// interface DataTableViewProps {
//   notebookId: string;
//   excludedSourceIds: string[];
// }

// export function DataTableView({ notebookId, excludedSourceIds }: DataTableViewProps) {
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
//   } = useArtifact(notebookId, "datatable", excludedSourceIds);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const tableContent =
//     artifact?.status === "ready" && artifact.content_json ? artifact.content_json : null;

//   if (isLoading) {
//     return (
//       <div className="h-full flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="size-8 animate-spin text-primary" />
//           <p className="text-sm text-foreground/60 font-medium">Loading data table...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isGenerating || status === "processing") {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
//         <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft text-center animate-pulse">
//           <Sparkles className="size-12 text-primary mx-auto mb-4 animate-bounce" />
//           <h3 className="text-xl font-bold tracking-tight mb-2">Generating Data Table</h3>
//           <p className="text-sm text-foreground/60 mb-6 min-h-10">Structuring data...</p>
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
//             {errorMessage || "An unexpected error occurred while generating the data table."}
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

//   if (!artifact || !tableContent) {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
//         <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
//           <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
//             <ListChecks className="size-6 text-primary" />
//           </div>
//           <h2 className="text-2xl font-extrabold tracking-tight mb-2">Data Table</h2>
//           <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
//             Generate a structured data table from your uploaded sources.
//           </p>

//           <button
//             onClick={() => setIsDialogOpen(true)}
//             className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
//           >
//             <Sparkles className="size-4" />
//             Generate Data Table
//           </button>
//         </div>

//         <ArtifactGenerationDialog
//           isOpen={isDialogOpen}
//           onClose={() => setIsDialogOpen(false)}
//           type="datatable"
//           onGenerate={generate}
//           isGenerating={isGenerating}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="h-full flex flex-col overflow-hidden">
//       <ArtifactHeader
//         title="Data Table"
//         type="datatable"
//         history={history}
//         selectedArtifactId={selectedArtifactId}
//         onSelectArtifactId={setSelectedArtifactId}
//         onGenerateAgain={() => setIsDialogOpen(true)}
//         onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
//         icon={<ListChecks className="size-3.5 text-primary" />}
//       />

//       <div className="flex-1 overflow-y-auto p-8 md:p-12">
//         <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-soft border border-border">
//           <h1 className="text-3xl font-extrabold tracking-tight mb-6">
//             {tableContent.title || artifact.title}
//           </h1>
//           <div className="overflow-x-auto">
//             <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/80">
//               {JSON.stringify(tableContent, null, 2)}
//             </pre>
//           </div>
//         </div>
//       </div>

//       <ArtifactGenerationDialog
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         type="datatable"
//         onGenerate={generate}
//         isGenerating={isGenerating}
//       />
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { ListChecks, Sparkles, Loader2, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useArtifact } from "@/hooks/useArtifact";
import { ArtifactHeader } from "./ArtifactHeader";
import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";

interface DataTableViewProps {
  notebookId: string;
  excludedSourceIds: string[];
}

interface TableContent {
  title?: string;
  description?: string;
  columns?: Array<{ name: string; type?: string }>;
  rows?: string[][];
  notes?: string[];
}

export function DataTableView({ notebookId, excludedSourceIds }: DataTableViewProps) {
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
  } = useArtifact(notebookId, "datatable", excludedSourceIds);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const tableContent = artifact?.status === "ready" && artifact.content_json 
    ? artifact.content_json as TableContent
    : null;

  const toggleRow = (index: number) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedRows(newSet);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/60 font-medium">Loading data table...</p>
        </div>
      </div>
    );
  }

  if (isGenerating || status === "processing") {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft text-center animate-pulse">
          <Sparkles className="size-12 text-primary mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold tracking-tight mb-2">Generating Data Table</h3>
          <p className="text-sm text-foreground/60 mb-6 min-h-10">Structuring data...</p>
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
            {errorMessage || "An unexpected error occurred while generating the data table."}
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

  if (!artifact || !tableContent) {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
          <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
            <ListChecks className="size-6 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">Data Table</h2>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            Generate a structured data table from your uploaded sources.
          </p>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            Generate Data Table
          </button>
        </div>

        <ArtifactGenerationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          type="datatable"
          onGenerate={generate}
          isGenerating={isGenerating}
        />
      </div>
    );
  }

  const { title, description, columns, rows, notes } = tableContent;
  const hasData = rows && rows.length > 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ArtifactHeader
        title="Data Table"
        type="datatable"
        history={history}
        selectedArtifactId={selectedArtifactId}
        onSelectArtifactId={setSelectedArtifactId}
        onGenerateAgain={() => setIsDialogOpen(true)}
        onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
        icon={<ListChecks className="size-3.5 text-primary" />}
      />

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">{title || "Data Table"}</h1>
            {description && (
              <p className="text-foreground/60 text-sm leading-relaxed">{description}</p>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header */}
                <thead>
                  <tr className="bg-foreground/5 border-b border-border/60">
                    {columns && columns.length > 0 ? (
                      columns.map((col, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground/60"
                        >
                          <div className="flex items-center gap-2">
                            {col.name}
                            {col.type && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/40">
                                {col.type}
                              </span>
                            )}
                          </div>
                        </th>
                      ))
                    ) : (
                      // Fallback: use first row as header if no columns defined
                      rows && rows.length > 0 && rows[0].map((_, idx) => (
                        <th key={idx} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground/60">
                          Column {idx + 1}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {hasData ? (
                    rows.map((row, rowIdx) => {
                      const isExpanded = expandedRows.has(rowIdx);
                      const hasLongContent = row.some(cell => cell && cell.length > 100);

                      return (
                        <tr
                          key={rowIdx}
                          className={`border-b border-border/30 transition-colors hover:bg-foreground/5 ${
                            rowIdx % 2 === 0 ? 'bg-white' : 'bg-foreground/5'
                          }`}
                        >
                          {row.map((cell, cellIdx) => {
                            const isLong = cell && cell.length > 100;
                            const displayText = isLong && !isExpanded 
                              ? cell.slice(0, 100) + '...' 
                              : cell || '—';

                            return (
                              <td
                                key={cellIdx}
                                className="px-4 py-3 text-sm text-foreground/80 leading-relaxed max-w-xs"
                              >
                                <div className="whitespace-pre-wrap break-words">
                                  {displayText}
                                  {isLong && (
                                    <button
                                      onClick={() => toggleRow(rowIdx)}
                                      className="ml-2 text-primary hover:text-primary/70 transition-colors inline-flex items-center gap-0.5 text-xs font-medium"
                                    >
                                      {isExpanded ? 'Show less' : 'Show more'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={columns?.length || 1}
                        className="px-4 py-8 text-center text-foreground/40 text-sm"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {notes && notes.length > 0 && (
            <div className="mt-6 p-4 bg-foreground/5 rounded-xl border border-border/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">
                Notes
              </h4>
              <ul className="space-y-1.5">
                {notes.map((note, idx) => (
                  <li key={idx} className="text-sm text-foreground/60 flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats */}
          {hasData && (
            <div className="mt-4 flex items-center gap-4 text-xs text-foreground/40">
              <span>{rows.length} rows</span>
              <span className="w-px h-3 bg-border" />
              <span>{columns?.length || rows[0]?.length || 0} columns</span>
              {title && (
                <>
                  <span className="w-px h-3 bg-border" />
                  <span className="truncate max-w-xs">{title}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <ArtifactGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        type="datatable"
        onGenerate={generate}
        isGenerating={isGenerating}
      />
    </div>
  );
}
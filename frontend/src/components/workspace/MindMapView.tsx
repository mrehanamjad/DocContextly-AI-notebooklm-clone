// "use client";

// import { useRef, useState, useEffect } from "react";
// import {
//   Search,
//   GitBranch,
//   Workflow,
//   Focus,
//   ZoomOut,
//   ZoomIn,
//   Maximize2,
//   Plus,
//   Minus,
//   Sparkles,
//   StickyNote,
//   FileText,
//   Lightbulb,
//   X,
//   Tag,
//   Trash2,
//   ChevronRight,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";
// import { useArtifact } from "@/hooks/useArtifact";
// import { ArtifactHeader } from "./ArtifactHeader";
// import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";

// type MMType = "concept" | "note" | "file" | "idea";

// interface MMNode {
//   id: string;
//   parentId: string | null;
//   title: string;
//   description?: string;
//   tags?: string[];
//   type: MMType;
//   collapsed?: boolean;
//   px?: number;
//   py?: number;
// }

// const DEPTH_COLORS = [
//   { ring: "ring-primary/40", bg: "bg-foreground text-background", dot: "bg-primary" },
//   {
//     ring: "ring-accent-blue/40",
//     bg: "bg-white text-foreground border-accent-blue/30",
//     dot: "bg-accent-blue",
//   },
//   {
//     ring: "ring-accent-pink/40",
//     bg: "bg-white text-foreground border-accent-pink/30",
//     dot: "bg-accent-pink",
//   },
//   {
//     ring: "ring-accent-mint/40",
//     bg: "bg-white text-foreground border-accent-mint/30",
//     dot: "bg-accent-mint",
//   },
//   {
//     ring: "ring-foreground/20",
//     bg: "bg-white text-foreground border-border",
//     dot: "bg-foreground/60",
//   },
// ];

// const TYPE_META: Record<MMType, { label: string; Icon: typeof Lightbulb }> = {
//   concept: { label: "Concept", Icon: Sparkles },
//   note: { label: "Note", Icon: StickyNote },
//   file: { label: "File", Icon: FileText },
//   idea: { label: "Idea", Icon: Lightbulb },
// };

// function convertBackendMindMapToFrontendNodes(backendRoot: any): MMNode[] {
//   const nodes: MMNode[] = [];
//   let counter = 0;

//   function traverse(node: any, parentId: string | null, depth: number): string {
//     const id = `mm-${counter++}`;
//     let type: MMType = "concept";
//     if (depth === 0) type = "concept";
//     else if (depth === 1) type = "concept";
//     else if (depth === 2) type = "idea";
//     else type = "note";

//     nodes.push({
//       id,
//       parentId,
//       title: node.label || "",
//       description: node.description || "",
//       type,
//       tags: depth === 0 ? ["Root"] : [],
//     });

//     if (node.children && Array.isArray(node.children)) {
//       for (const child of node.children) {
//         traverse(child, id, depth + 1);
//       }
//     }
//     return id;
//   }

//   traverse(backendRoot, null, 0);
//   return nodes;
// }

// interface MindMapViewProps {
//   notebookId: string;
//   excludedSourceIds: string[];
// }

// export function MindMapView({ notebookId, excludedSourceIds }: MindMapViewProps) {
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
//   } = useArtifact(notebookId, "mindmap", excludedSourceIds);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   const [nodes, setNodes] = useState<MMNode[]>([]);
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [hoverId, setHoverId] = useState<string | null>(null);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [query, setQuery] = useState("");
//   const [focusMode, setFocusMode] = useState(false);
//   const [layout, setLayout] = useState<"tree" | "radial">("tree");
//   const [view, setView] = useState({ tx: 0, ty: 0, scale: 1 });
//   const stageRef = useRef<HTMLDivElement | null>(null);
//   const dragRef = useRef<{
//     kind: "pan" | "node";
//     id?: string;
//     sx: number;
//     sy: number;
//     ox: number;
//     oy: number;
//   } | null>(null);

//   // Sync loaded artifact structure to React state
//   useEffect(() => {
//     if (artifact?.status === "ready" && artifact.content_json?.root) {
//       const parsed = convertBackendMindMapToFrontendNodes(artifact.content_json.root);
//       setNodes(parsed);
//       if (parsed.length > 0) {
//         setSelectedId(parsed[0].id);
//       }
//     } else {
//       setNodes([]);
//       setSelectedId(null);
//     }
//   }, [artifact?.id, artifact?.status]);

//   const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
//   const childrenOf = (id: string | null) => nodes.filter((n) => n.parentId === id);
//   const depthOf = (id: string): number => {
//     const n = byId[id];
//     if (!n || !n.parentId) return 0;
//     return 1 + depthOf(n.parentId);
//   };
//   const ancestorsOf = (id: string): string[] => {
//     const out: string[] = [];
//     let cur: string | null = id;
//     while (cur) {
//       out.push(cur);
//       cur = byId[cur]?.parentId ?? null;
//     }
//     return out;
//   };
//   const descendantsOf = (id: string): string[] => {
//     const out: string[] = [id];
//     for (const c of childrenOf(id)) out.push(...descendantsOf(c.id));
//     return out;
//   };

//   // Visibility respecting collapsed ancestors + focus mode
//   const visibleSet = (() => {
//     const vis = new Set<string>();
//     const walk = (id: string) => {
//       vis.add(id);
//       const n = byId[id];
//       if (n?.collapsed) return;
//       for (const c of childrenOf(id)) walk(c.id);
//     };
//     const roots = nodes.filter((n) => !n.parentId).map((n) => n.id);
//     roots.forEach(walk);
//     if (focusMode && selectedId) {
//       const allowed = new Set<string>([...ancestorsOf(selectedId), ...descendantsOf(selectedId)]);
//       return new Set([...vis].filter((id) => allowed.has(id)));
//     }
//     return vis;
//   })();

//   // Layout computation
//   const positions: Record<string, { x: number; y: number }> = {};
//   if (layout === "tree") {
//     const ROW = 70,
//       COL = 230;
//     let row = 0;
//     const layoutTree = (id: string, depth: number): number => {
//       const n = byId[id];
//       const kids = (n?.collapsed ? [] : childrenOf(id)).filter((c) => visibleSet.has(c.id));
//       if (!kids.length) {
//         positions[id] = { x: depth * COL, y: row * ROW };
//         row += 1;
//         return positions[id].y;
//       }
//       const childYs = kids.map((c) => layoutTree(c.id, depth + 1));
//       const y = (childYs[0] + childYs[childYs.length - 1]) / 2;
//       positions[id] = { x: depth * COL, y };
//       return y;
//     };
//     nodes.filter((n) => !n.parentId && visibleSet.has(n.id)).forEach((r) => layoutTree(r.id, 0));
//   } else {
//     // Radial
//     const place = (id: string, cx: number, cy: number, r: number, a0: number, a1: number) => {
//       positions[id] = { x: cx, y: cy };
//       const n = byId[id];
//       const kids = (n?.collapsed ? [] : childrenOf(id)).filter((c) => visibleSet.has(c.id));
//       if (!kids.length) return;
//       const step = (a1 - a0) / kids.length;
//       kids.forEach((c, i) => {
//         const a = a0 + step * (i + 0.5);
//         const nx = cx + Math.cos(a) * r;
//         const ny = cy + Math.sin(a) * r;
//         place(c.id, nx, ny, r * 0.65, a - step / 2, a + step / 2);
//       });
//     };
//     nodes
//       .filter((n) => !n.parentId && visibleSet.has(n.id))
//       .forEach((r) => place(r.id, 0, 0, 260, 0, Math.PI * 2));
//   }

//   // Apply manual overrides
//   const pos = (id: string) => {
//     const n = byId[id];
//     if (n?.px !== undefined && n.py !== undefined) return { x: n.px, y: n.py };
//     return positions[id] ?? { x: 0, y: 0 };
//   };

//   const highlighted = (() => {
//     if (!selectedId) return new Set<string>();
//     const s = new Set<string>([selectedId]);
//     childrenOf(selectedId).forEach((c) => s.add(c.id));
//     const p = byId[selectedId]?.parentId;
//     if (p) s.add(p);
//     return s;
//   })();

//   const matchesQuery = (n: MMNode) =>
//     !query.trim() ||
//     n.title.toLowerCase().includes(query.toLowerCase()) ||
//     n.description?.toLowerCase().includes(query.toLowerCase()) ||
//     n.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()));

//   // Pan / zoom handlers
//   function onStageMouseDown(e: React.MouseEvent) {
//     if (e.target !== e.currentTarget) return;
//     dragRef.current = { kind: "pan", sx: e.clientX, sy: e.clientY, ox: view.tx, oy: view.ty };
//   }
//   function onMouseMove(e: React.MouseEvent) {
//     const d = dragRef.current;
//     if (!d) return;
//     if (d.kind === "pan") {
//       setView((v) => ({ ...v, tx: d.ox + (e.clientX - d.sx), ty: d.oy + (e.clientY - d.sy) }));
//     } else if (d.kind === "node" && d.id) {
//       const dx = (e.clientX - d.sx) / view.scale;
//       const dy = (e.clientY - d.sy) / view.scale;
//       setNodes((ns) => ns.map((n) => (n.id === d.id ? { ...n, px: d.ox + dx, py: d.oy + dy } : n)));
//     }
//   }
//   function endDrag() {
//     dragRef.current = null;
//   }
//   function onNodeDown(e: React.MouseEvent, id: string) {
//     e.stopPropagation();
//     setSelectedId(id);
//     const p = pos(id);
//     dragRef.current = { kind: "node", id, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y };
//   }
//   function onWheel(e: React.WheelEvent) {
//     e.preventDefault();
//     const delta = -e.deltaY * 0.0015;
//     setView((v) => ({ ...v, scale: Math.min(2.2, Math.max(0.3, v.scale + delta)) }));
//   }

//   function toggleCollapse(id: string) {
//     setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, collapsed: !n.collapsed } : n)));
//   }
//   function addChild(parentId: string) {
//     const id = `n_${Date.now()}`;
//     setNodes((ns) => [...ns, { id, parentId, title: "New idea", description: "", type: "idea" }]);
//     setSelectedId(id);
//     setEditingId(id);
//   }
//   function deleteNode(id: string) {
//     if (!byId[id]?.parentId) return; // don't delete root
//     const toRemove = new Set(descendantsOf(id));
//     setNodes((ns) => ns.filter((n) => !toRemove.has(n.id)));
//     setSelectedId(byId[id]?.parentId ?? null);
//   }
//   function updateNode(id: string, patch: Partial<MMNode>) {
//     setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, ...patch } : n)));
//   }
//   function resetView() {
//     setView({ tx: 0, ty: 0, scale: 1 });
//     setNodes((ns) => ns.map((n) => ({ ...n, px: undefined, py: undefined })));
//   }

//   const selected = selectedId ? byId[selectedId] : null;

//   // 1. Loading active list
//   if (isLoading) {
//     return (
//       <div className="h-full flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="size-8 animate-spin text-primary" />
//           <p className="text-sm text-foreground/60 font-medium">Loading mindmap...</p>
//         </div>
//       </div>
//     );
//   }

//   // 2. Generating or Processing State
//   if (isGenerating || status === "processing") {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
//         <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft text-center animate-pulse">
//           <Sparkles className="size-12 text-primary mx-auto mb-4 animate-bounce" />
//           <h3 className="text-xl font-bold tracking-tight mb-2">Generating Mind Map</h3>
//           <p className="text-sm text-foreground/60 mb-6">
//             Constructing concept connections, structures, and schemas from your source documents...
//           </p>
//           <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
//             <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent-pink rounded-full animate-infinite-scroll" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 3. Error State
//   if (status === "error") {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
//         <div className="max-w-md w-full bg-red-50/50 backdrop-blur-xl border border-red-200/50 rounded-3xl p-8 shadow-soft text-center">
//           <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-xl font-bold tracking-tight mb-2">Generation Failed</h3>
//           <p className="text-sm text-red-600/80 mb-6">
//             {errorMessage || "An unexpected error occurred while generating mind map."}
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

//   // 4. Empty State
//   if (!artifact || nodes.length === 0) {
//     return (
//       <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
//         <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
//           <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
//             <Workflow className="size-6 text-primary" />
//           </div>
//           <h2 className="text-2xl font-extrabold tracking-tight mb-2">Mind Map Generation</h2>
//           <p className="text-sm text-foreground/60 mb-8 leading-relaxed">
//             Generate an interactive canvas showing root concepts and sub-branches mapped directly
//             from your notebooks.
//           </p>

//           <button
//             onClick={() => setIsDialogOpen(true)}
//             className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
//           >
//             <Sparkles className="size-4" />
//             Generate Mind Map
//           </button>
//         </div>

//         <ArtifactGenerationDialog
//           isOpen={isDialogOpen}
//           onClose={() => setIsDialogOpen(false)}
//           type="mindmap"
//           onGenerate={generate}
//           isGenerating={isGenerating}
//           prefilledOptions={null}
//         />
//       </div>
//     );
//   }

//   // 5. Ready State
//   return (
//     <div className="h-full flex flex-col bg-background overflow-hidden">
//       <ArtifactHeader
//         title="Mind Map"
//         type="mindmap"
//         history={history}
//         selectedArtifactId={selectedArtifactId}
//         onSelectArtifactId={setSelectedArtifactId}
//         onGenerateAgain={() => setIsDialogOpen(true)}
//         onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
//         icon={<Workflow className="size-3 text-primary" />}
//       />

//       {/* Toolbar */}
//       <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-white/70 backdrop-blur-xl shrink-0">
//         <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground/[0.04] border border-border/60">
//           <Search className="size-3.5 text-foreground/55" />
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search nodes…"
//             className="bg-transparent outline-none text-xs w-40"
//           />
//         </div>
//         <div className="flex items-center gap-1 rounded-xl bg-foreground/[0.04] border border-border/60 p-0.5">
//           <button
//             onClick={() => setLayout("tree")}
//             className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${layout === "tree" ? "bg-white shadow-soft text-foreground" : "text-foreground/55 hover:text-foreground"}`}
//           >
//             <GitBranch className="size-3" /> Tree
//           </button>
//           <button
//             onClick={() => setLayout("radial")}
//             className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${layout === "radial" ? "bg-white shadow-soft text-foreground" : "text-foreground/55 hover:text-foreground"}`}
//           >
//             <Workflow className="size-3" /> Graph
//           </button>
//         </div>
//         <button
//           onClick={() => setFocusMode((f) => !f)}
//           className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${focusMode ? "bg-foreground text-background border-foreground" : "bg-white border-border/60 text-foreground/70 hover:text-foreground"}`}
//         >
//           <Focus className="size-3" /> Focus
//         </button>
//         <div className="flex-1" />
//         <div className="flex items-center gap-1 rounded-xl bg-foreground/[0.04] border border-border/60 p-0.5">
//           <button
//             onClick={() => setView((v) => ({ ...v, scale: Math.max(0.3, v.scale - 0.15) }))}
//             className="p-1.5 rounded-lg hover:bg-white"
//           >
//             <ZoomOut className="size-3.5" />
//           </button>
//           <div className="text-[10px] font-bold tabular-nums w-10 text-center text-foreground/60">
//             {Math.round(view.scale * 100)}%
//           </div>
//           <button
//             onClick={() => setView((v) => ({ ...v, scale: Math.min(2.2, v.scale + 0.15) }))}
//             className="p-1.5 rounded-lg hover:bg-white"
//           >
//             <ZoomIn className="size-3.5" />
//           </button>
//           <button onClick={resetView} className="p-1.5 rounded-lg hover:bg-white" title="Reset">
//             <Maximize2 className="size-3.5" />
//           </button>
//         </div>
//       </div>

//       <div className="flex-1 flex min-h-0">
//         {/* Stage */}
//         <div
//           ref={stageRef}
//           onMouseDown={onStageMouseDown}
//           onMouseMove={onMouseMove}
//           onMouseUp={endDrag}
//           onMouseLeave={endDrag}
//           onWheel={onWheel}
//           className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
//           style={{
//             backgroundImage:
//               "radial-gradient(circle, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px)",
//             backgroundSize: "22px 22px",
//           }}
//         >
//           <div
//             className="absolute left-1/2 top-1/2 origin-center"
//             style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})` }}
//           >
//             {/* Edges */}
//             <svg
//               className="absolute overflow-visible pointer-events-none"
//               style={{ left: 0, top: 0, width: 1, height: 1 }}
//             >
//               {nodes
//                 .filter((n) => n.parentId && visibleSet.has(n.id) && visibleSet.has(n.parentId))
//                 .map((n) => {
//                   const a = pos(n.parentId!);
//                   const b = pos(n.id);
//                   const active = highlighted.has(n.id) && highlighted.has(n.parentId!);
//                   const mx = (a.x + b.x) / 2;
//                   const d =
//                     layout === "tree"
//                       ? `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
//                       : `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
//                   return (
//                     <path
//                       key={n.id}
//                       d={d}
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth={active ? 2 : 1.2}
//                       className={active ? "text-primary" : "text-foreground/20"}
//                     />
//                   );
//                 })}
//             </svg>

//             {/* Nodes */}
//             {nodes
//               .filter((n) => visibleSet.has(n.id))
//               .map((n) => {
//                 const p = pos(n.id);
//                 const depth = depthOf(n.id);
//                 const c = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];
//                 const kidsCount = childrenOf(n.id).length;
//                 const isSel = selectedId === n.id;
//                 const isHi = highlighted.has(n.id);
//                 const dim =
//                   (selectedId && !isHi && !focusMode) || (query.trim() && !matchesQuery(n));
//                 const T = TYPE_META[n.type];
//                 return (
//                   <div
//                     key={n.id}
//                     className="absolute"
//                     style={{
//                       left: p.x,
//                       top: p.y,
//                       transform: "translate(-50%, -50%)",
//                       transition:
//                         dragRef.current?.id === n.id
//                           ? undefined
//                           : "left 280ms cubic-bezier(0.4,0,0.2,1), top 280ms cubic-bezier(0.4,0,0.2,1)",
//                     }}
//                     onMouseEnter={() => setHoverId(n.id)}
//                     onMouseLeave={() => setHoverId((h) => (h === n.id ? null : h))}
//                   >
//                     <div
//                       onMouseDown={(e) => onNodeDown(e, n.id)}
//                       onDoubleClick={() => setEditingId(n.id)}
//                       className={`group relative select-none cursor-grab active:cursor-grabbing rounded-2xl border shadow-soft px-3.5 py-2.5 min-w-[150px] max-w-[220px] transition ${c.bg} ${isSel ? `ring-2 ${c.ring} scale-[1.04]` : ""} ${dim ? "opacity-30" : ""} ${query.trim() && matchesQuery(n) ? "ring-2 ring-accent-mint/60" : ""}`}
//                     >
//                       <div className="flex items-center gap-1.5">
//                         <span className={`size-1.5 rounded-full ${c.dot}`} />
//                         <T.Icon className="size-3 opacity-60" />
//                         {editingId === n.id ? (
//                           <input
//                             autoFocus
//                             value={n.title}
//                             onChange={(e) => updateNode(n.id, { title: e.target.value })}
//                             onBlur={() => setEditingId(null)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") setEditingId(null);
//                             }}
//                             onMouseDown={(e) => e.stopPropagation()}
//                             className="bg-transparent outline-none text-xs font-bold flex-1 min-w-0 border-b border-current/40"
//                           />
//                         ) : (
//                           <span className="text-xs font-bold tracking-tight truncate">
//                             {n.title}
//                           </span>
//                         )}
//                       </div>
//                       {n.tags && n.tags.length > 0 && (
//                         <div className="flex gap-1 mt-1.5 flex-wrap">
//                           {n.tags.slice(0, 2).map((t) => (
//                             <span
//                               key={t}
//                               className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-foreground/10 opacity-80"
//                             >
//                               {t}
//                             </span>
//                           ))}
//                         </div>
//                       )}

//                       {/* Collapse toggle */}
//                       {kidsCount > 0 && (
//                         <button
//                           onMouseDown={(e) => {
//                             e.stopPropagation();
//                             toggleCollapse(n.id);
//                           }}
//                           className={`absolute -right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full border border-border bg-white text-foreground flex items-center justify-center shadow-soft text-[10px] font-bold transition ${n.collapsed ? "" : "rotate-90"}`}
//                           title={n.collapsed ? "Expand" : "Collapse"}
//                         >
//                           {n.collapsed ? <Plus className="size-3" /> : <Minus className="size-3" />}
//                         </button>
//                       )}

//                       {/* Hover add child */}
//                       {hoverId === n.id && (
//                         <button
//                           onMouseDown={(e) => {
//                             e.stopPropagation();
//                             addChild(n.id);
//                           }}
//                           className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-soft hover:scale-110 transition"
//                           title="Add child"
//                         >
//                           <Plus className="size-3" />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//           </div>

//           {/* Legend */}
//           <div className="absolute bottom-3 left-3 flex items-center gap-3 px-3 py-2 rounded-xl bg-white/80 backdrop-blur-xl border border-border/60 text-[10px] font-bold text-foreground/60">
//             <span className="flex items-center gap-1.5">
//               <span className="size-2 rounded-full bg-primary" /> Root
//             </span>
//             <span className="flex items-center gap-1.5">
//               <span className="size-2 rounded-full bg-accent-blue" /> Branch
//             </span>
//             <span className="flex items-center gap-1.5">
//               <span className="size-2 rounded-full bg-accent-pink" /> Sub
//             </span>
//             <span className="flex items-center gap-1.5">
//               <span className="size-2 rounded-full bg-accent-mint" /> Leaf
//             </span>
//           </div>
//           <div className="absolute bottom-3 right-3 text-[10px] font-medium text-foreground/45 px-2 py-1 rounded-md bg-white/70 border border-border/40">
//             Drag to pan · scroll to zoom · drag nodes to reposition
//           </div>
//         </div>

//         {/* Side panel */}
//         {/* {selected && (
//           <aside className="w-80 border-l border-border bg-white/80 backdrop-blur-xl overflow-y-auto animate-fade-up">
//             <div className="p-5 space-y-4">
//               <div className="flex items-center justify-between">
//                 <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
//                   Node details
//                 </div>
//                 <button
//                   onClick={() => setSelectedId(null)}
//                   className="p-1 rounded-md hover:bg-foreground/5"
//                 >
//                   <X className="size-3.5" />
//                 </button>
//               </div>

//               <div>
//                 <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
//                   Title
//                 </label>
//                 <input
//                   value={selected.title}
//                   onChange={(e) => updateNode(selected.id, { title: e.target.value })}
//                   className="mt-1 w-full bg-transparent border border-border rounded-lg px-2.5 py-1.5 text-sm font-bold outline-none focus:border-primary/50"
//                 />
//               </div>

//               <div>
//                 <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
//                   Type
//                 </label>
//                 <div className="mt-1 grid grid-cols-4 gap-1">
//                   {(Object.keys(TYPE_META) as MMType[]).map((t) => {
//                     const T = TYPE_META[t];
//                     const on = selected.type === t;
//                     return (
//                       <button
//                         key={t}
//                         onClick={() => updateNode(selected.id, { type: t })}
//                         className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-bold transition ${on ? "bg-foreground text-background border-foreground" : "border-border text-foreground/60 hover:text-foreground"}`}
//                       >
//                         <T.Icon className="size-3.5" />
//                         {T.label}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               <div>
//                 <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
//                   Description
//                 </label>
//                 <textarea
//                   value={selected.description ?? ""}
//                   onChange={(e) => updateNode(selected.id, { description: e.target.value })}
//                   rows={4}
//                   className="mt-1 w-full bg-transparent border border-border rounded-lg px-2.5 py-1.5 text-xs leading-relaxed outline-none focus:border-primary/50 resize-none"
//                   placeholder="Add a short description…"
//                 />
//               </div>

//               <div>
//                 <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-1">
//                   <Tag className="size-3" /> Tags
//                 </label>
//                 <input
//                   value={(selected.tags ?? []).join(", ")}
//                   onChange={(e) =>
//                     updateNode(selected.id, {
//                       tags: e.target.value
//                         .split(",")
//                         .map((s) => s.trim())
//                         .filter(Boolean),
//                     })
//                   }
//                   placeholder="comma, separated"
//                   className="mt-1 w-full bg-transparent border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary/50"
//                 />
//               </div>

//               <div className="pt-2 grid grid-cols-2 gap-2">
//                 <button
//                   onClick={() => addChild(selected.id)}
//                   className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-foreground text-background text-xs font-bold hover:opacity-90"
//                 >
//                   <Plus className="size-3.5" /> Add child
//                 </button>
//                 <button
//                   onClick={() => deleteNode(selected.id)}
//                   disabled={!selected.parentId}
//                   className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-bold text-foreground/70 hover:text-destructive hover:border-destructive/40 disabled:opacity-40 disabled:cursor-not-allowed"
//                 >
//                   <Trash2 className="size-3.5" /> Delete
//                 </button>
//               </div>

//               <div className="pt-2 border-t border-border/60">
//                 <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-2">
//                   Connected
//                 </div>
//                 <div className="space-y-1">
//                   {selected.parentId && (
//                     <button
//                       onClick={() => setSelectedId(selected.parentId)}
//                       className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-foreground/5 text-xs"
//                     >
//                       <ChevronRight className="size-3 rotate-180 text-foreground/45" />
//                       <span className="font-medium truncate">{byId[selected.parentId]?.title}</span>
//                     </button>
//                   )}
//                   {childrenOf(selected.id).map((c) => (
//                     <button
//                       key={c.id}
//                       onClick={() => setSelectedId(c.id)}
//                       className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-foreground/5 text-xs"
//                     >
//                       <ChevronRight className="size-3 text-foreground/45" />
//                       <span className="font-medium truncate">{c.title}</span>
//                     </button>
//                   ))}
//                   {childrenOf(selected.id).length === 0 && !selected.parentId && (
//                     <div className="text-[11px] text-foreground/40 italic">No connections yet.</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </aside>
//         )} */}
//       </div>

//       <ArtifactGenerationDialog
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         type="mindmap"
//         onGenerate={generate}
//         isGenerating={isGenerating}
//         prefilledOptions={artifact?.options_json}
//       />
//     </div>
//   );
// }





"use client";

import { useRef, useState, useEffect } from "react";
import {
  Search,
  GitBranch,
  Workflow,
  Focus,
  ZoomOut,
  ZoomIn,
  Maximize2,
  Sparkles,
  StickyNote,
  FileText,
  Lightbulb,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useArtifact } from "@/hooks/useArtifact";
import { ArtifactHeader } from "./ArtifactHeader";
import { ArtifactGenerationDialog } from "./ArtifactGenerationDialog";

type MMType = "concept" | "note" | "file" | "idea";

interface MMNode {
  id: string;
  parentId: string | null;
  title: string;
  description?: string;
  tags?: string[];
  type: MMType;
  collapsed?: boolean;
  px?: number;
  py?: number;
}

const DEPTH_COLORS = [
  { ring: "ring-primary/40", bg: "bg-foreground text-background", dot: "bg-primary" },
  {
    ring: "ring-accent-blue/40",
    bg: "bg-white text-foreground border-accent-blue/30",
    dot: "bg-accent-blue",
  },
  {
    ring: "ring-accent-pink/40",
    bg: "bg-white text-foreground border-accent-pink/30",
    dot: "bg-accent-pink",
  },
  {
    ring: "ring-accent-mint/40",
    bg: "bg-white text-foreground border-accent-mint/30",
    dot: "bg-accent-mint",
  },
  {
    ring: "ring-foreground/20",
    bg: "bg-white text-foreground border-border",
    dot: "bg-foreground/60",
  },
];

const TYPE_META: Record<MMType, { label: string; Icon: typeof Lightbulb }> = {
  concept: { label: "Concept", Icon: Sparkles },
  note: { label: "Note", Icon: StickyNote },
  file: { label: "File", Icon: FileText },
  idea: { label: "Idea", Icon: Lightbulb },
};

function convertBackendMindMapToFrontendNodes(backendRoot: any): MMNode[] {
  const nodes: MMNode[] = [];
  let counter = 0;

  function traverse(node: any, parentId: string | null, depth: number): string {
    const id = `mm-${counter++}`;
    let type: MMType = "concept";
    if (depth === 0) type = "concept";
    else if (depth === 1) type = "concept";
    else if (depth === 2) type = "idea";
    else type = "note";

    nodes.push({
      id,
      parentId,
      title: node.label || "",
      description: node.description || "",
      type,
      tags: depth === 0 ? ["Root"] : [],
    });

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child, id, depth + 1);
      }
    }
    return id;
  }

  traverse(backendRoot, null, 0);
  return nodes;
}

interface MindMapViewProps {
  notebookId: string;
  excludedSourceIds: string[];
}

export function MindMapView({ notebookId, excludedSourceIds }: MindMapViewProps) {
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
  } = useArtifact(notebookId, "mindmap", excludedSourceIds);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [nodes, setNodes] = useState<MMNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [layout, setLayout] = useState<"tree" | "radial">("tree");
  const [view, setView] = useState({ tx: 0, ty: 0, scale: 1 });
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    kind: "pan";
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  } | null>(null);

  // Sync loaded artifact structure to React state
  useEffect(() => {
    if (artifact?.status === "ready" && artifact.content_json?.root) {
      const parsed = convertBackendMindMapToFrontendNodes(artifact.content_json.root);
      setNodes(parsed);
      if (parsed.length > 0) {
        setSelectedId(parsed[0].id);
      }
    } else {
      setNodes([]);
      setSelectedId(null);
    }
  }, [artifact?.id, artifact?.status]);

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const childrenOf = (id: string | null) => nodes.filter((n) => n.parentId === id);
  const depthOf = (id: string): number => {
    const n = byId[id];
    if (!n || !n.parentId) return 0;
    return 1 + depthOf(n.parentId);
  };
  const ancestorsOf = (id: string): string[] => {
    const out: string[] = [];
    let cur: string | null = id;
    while (cur) {
      out.push(cur);
      cur = byId[cur]?.parentId ?? null;
    }
    return out;
  };
  const descendantsOf = (id: string): string[] => {
    const out: string[] = [id];
    for (const c of childrenOf(id)) out.push(...descendantsOf(c.id));
    return out;
  };

  // Visibility respecting collapsed ancestors + focus mode
  const visibleSet = (() => {
    const vis = new Set<string>();
    const walk = (id: string) => {
      vis.add(id);
      const n = byId[id];
      if (n?.collapsed) return;
      for (const c of childrenOf(id)) walk(c.id);
    };
    const roots = nodes.filter((n) => !n.parentId).map((n) => n.id);
    roots.forEach(walk);
    if (focusMode && selectedId) {
      const allowed = new Set<string>([...ancestorsOf(selectedId), ...descendantsOf(selectedId)]);
      return new Set([...vis].filter((id) => allowed.has(id)));
    }
    return vis;
  })();

  // Layout computation
  const positions: Record<string, { x: number; y: number }> = {};
  if (layout === "tree") {
    const ROW = 70,
      COL = 230;
    let row = 0;
    const layoutTree = (id: string, depth: number): number => {
      const n = byId[id];
      const kids = (n?.collapsed ? [] : childrenOf(id)).filter((c) => visibleSet.has(c.id));
      if (!kids.length) {
        positions[id] = { x: depth * COL, y: row * ROW };
        row += 1;
        return positions[id].y;
      }
      const childYs = kids.map((c) => layoutTree(c.id, depth + 1));
      const y = (childYs[0] + childYs[childYs.length - 1]) / 2;
      positions[id] = { x: depth * COL, y };
      return y;
    };
    nodes.filter((n) => !n.parentId && visibleSet.has(n.id)).forEach((r) => layoutTree(r.id, 0));
  } else {
    // Radial
    const place = (id: string, cx: number, cy: number, r: number, a0: number, a1: number) => {
      positions[id] = { x: cx, y: cy };
      const n = byId[id];
      const kids = (n?.collapsed ? [] : childrenOf(id)).filter((c) => visibleSet.has(c.id));
      if (!kids.length) return;
      const step = (a1 - a0) / kids.length;
      kids.forEach((c, i) => {
        const a = a0 + step * (i + 0.5);
        const nx = cx + Math.cos(a) * r;
        const ny = cy + Math.sin(a) * r;
        place(c.id, nx, ny, r * 0.65, a - step / 2, a + step / 2);
      });
    };
    nodes
      .filter((n) => !n.parentId && visibleSet.has(n.id))
      .forEach((r) => place(r.id, 0, 0, 260, 0, Math.PI * 2));
  }

  // Apply manual overrides
  const pos = (id: string) => {
    const n = byId[id];
    if (n?.px !== undefined && n.py !== undefined) return { x: n.px, y: n.py };
    return positions[id] ?? { x: 0, y: 0 };
  };

  const highlighted = (() => {
    if (!selectedId) return new Set<string>();
    const s = new Set<string>([selectedId]);
    childrenOf(selectedId).forEach((c) => s.add(c.id));
    const p = byId[selectedId]?.parentId;
    if (p) s.add(p);
    return s;
  })();

  const matchesQuery = (n: MMNode) =>
    !query.trim() ||
    n.title.toLowerCase().includes(query.toLowerCase()) ||
    n.description?.toLowerCase().includes(query.toLowerCase()) ||
    n.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()));

  // Pan handlers (no node dragging)
  function onStageMouseDown(e: React.MouseEvent) {
    if (e.target !== e.currentTarget) return;
    dragRef.current = { kind: "pan", sx: e.clientX, sy: e.clientY, ox: view.tx, oy: view.ty };
  }
  function onMouseMove(e: React.MouseEvent) {
    const d = dragRef.current;
    if (!d || d.kind !== "pan") return;
    setView((v) => ({ ...v, tx: d.ox + (e.clientX - d.sx), ty: d.oy + (e.clientY - d.sy) }));
  }
  function endDrag() {
    dragRef.current = null;
  }
  function onNodeClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setSelectedId(id);
  }
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setView((v) => ({ ...v, scale: Math.min(2.2, Math.max(0.3, v.scale + delta)) }));
  }

  function toggleCollapse(id: string) {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, collapsed: !n.collapsed } : n)));
  }
  function resetView() {
    setView({ tx: 0, ty: 0, scale: 1 });
  }

  const selected = selectedId ? byId[selectedId] : null;

  // 1. Loading active list
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/60 font-medium">Loading mindmap...</p>
        </div>
      </div>
    );
  }

  // 2. Generating or Processing State
  if (isGenerating || status === "processing") {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft text-center animate-pulse">
          <Sparkles className="size-12 text-primary mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold tracking-tight mb-2">Generating Mind Map</h3>
          <p className="text-sm text-foreground/60 mb-6">
            Constructing concept connections, structures, and schemas from your source documents...
          </p>
          <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent-pink rounded-full animate-infinite-scroll" />
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State
  if (status === "error") {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-red-50/50 backdrop-blur-xl border border-red-200/50 rounded-3xl p-8 shadow-soft text-center">
          <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold tracking-tight mb-2">Generation Failed</h3>
          <p className="text-sm text-red-600/80 mb-6">
            {errorMessage || "An unexpected error occurred while generating mind map."}
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

  // 4. Empty State
  if (!artifact || nodes.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-soft">
          <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-6">
            <Workflow className="size-6 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">Mind Map Generation</h2>
          <p className="text-sm text-foreground/60 mb-8 leading-relaxed">
            Generate an interactive canvas showing root concepts and sub-branches mapped directly
            from your notebooks.
          </p>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            Generate Mind Map
          </button>
        </div>

        <ArtifactGenerationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          type="mindmap"
          onGenerate={generate}
          isGenerating={isGenerating}
          prefilledOptions={null}
        />
      </div>
    );
  }

  // 5. Ready State
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <ArtifactHeader
        title="Mind Map"
        type="mindmap"
        history={history}
        selectedArtifactId={selectedArtifactId}
        onSelectArtifactId={setSelectedArtifactId}
        onGenerateAgain={() => setIsDialogOpen(true)}
        onDelete={() => deleteArtifact(selectedArtifactId || undefined)}
        icon={<Workflow className="size-3 text-primary" />}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-white/70 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground/[0.04] border border-border/60">
          <Search className="size-3.5 text-foreground/55" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes…"
            className="bg-transparent outline-none text-xs w-40"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-foreground/[0.04] border border-border/60 p-0.5">
          <button
            onClick={() => setLayout("tree")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${layout === "tree" ? "bg-white shadow-soft text-foreground" : "text-foreground/55 hover:text-foreground"}`}
          >
            <GitBranch className="size-3" /> Tree
          </button>
          <button
            onClick={() => setLayout("radial")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${layout === "radial" ? "bg-white shadow-soft text-foreground" : "text-foreground/55 hover:text-foreground"}`}
          >
            <Workflow className="size-3" /> Graph
          </button>
        </div>
        <button
          onClick={() => setFocusMode((f) => !f)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${focusMode ? "bg-foreground text-background border-foreground" : "bg-white border-border/60 text-foreground/70 hover:text-foreground"}`}
        >
          <Focus className="size-3" /> Focus
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1 rounded-xl bg-foreground/[0.04] border border-border/60 p-0.5">
          <button
            onClick={() => setView((v) => ({ ...v, scale: Math.max(0.3, v.scale - 0.15) }))}
            className="p-1.5 rounded-lg hover:bg-white"
          >
            <ZoomOut className="size-3.5" />
          </button>
          <div className="text-[10px] font-bold tabular-nums w-10 text-center text-foreground/60">
            {Math.round(view.scale * 100)}%
          </div>
          <button
            onClick={() => setView((v) => ({ ...v, scale: Math.min(2.2, v.scale + 0.15) }))}
            className="p-1.5 rounded-lg hover:bg-white"
          >
            <ZoomIn className="size-3.5" />
          </button>
          <button onClick={resetView} className="p-1.5 rounded-lg hover:bg-white" title="Reset View">
            <Maximize2 className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Stage */}
        <div
          ref={stageRef}
          onMouseDown={onStageMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onWheel={onWheel}
          className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage:
              "radial-gradient(circle, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 origin-center"
            style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})` }}
          >
            {/* Edges */}
            <svg
              className="absolute overflow-visible pointer-events-none"
              style={{ left: 0, top: 0, width: 1, height: 1 }}
            >
              {nodes
                .filter((n) => n.parentId && visibleSet.has(n.id) && visibleSet.has(n.parentId))
                .map((n) => {
                  const a = pos(n.parentId!);
                  const b = pos(n.id);
                  const active = highlighted.has(n.id) && highlighted.has(n.parentId!);
                  const mx = (a.x + b.x) / 2;
                  const d =
                    layout === "tree"
                      ? `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
                      : `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
                  return (
                    <path
                      key={n.id}
                      d={d}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={active ? 2.5 : 1.5}
                      strokeOpacity={active ? 0.8 : 0.25}
                      className={active ? "text-primary" : "text-foreground"}
                    />
                  );
                })}
            </svg>

            {/* Nodes */}
            {nodes
              .filter((n) => visibleSet.has(n.id))
              .map((n) => {
                const p = pos(n.id);
                const depth = depthOf(n.id);
                const c = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];
                const kidsCount = childrenOf(n.id).length;
                const isSel = selectedId === n.id;
                const isHi = highlighted.has(n.id);
                const dim =
                  (selectedId && !isHi && !focusMode) || (query.trim() && !matchesQuery(n));
                const T = TYPE_META[n.type];
                return (
                  <div
                    key={n.id}
                    className="absolute"
                    style={{
                      left: p.x,
                      top: p.y,
                      transform: "translate(-50%, -50%)",
                      transition:
                        "left 280ms cubic-bezier(0.4,0,0.2,1), top 280ms cubic-bezier(0.4,0,0.2,1)",
                    }}
                    onMouseEnter={() => setHoverId(n.id)}
                    onMouseLeave={() => setHoverId((h) => (h === n.id ? null : h))}
                  >
                    <div
                      onClick={(e) => onNodeClick(e, n.id)}
                      className={`group relative select-none cursor-pointer rounded-2xl border shadow-soft px-3.5 py-2.5 min-w-[150px] max-w-[220px] transition-all ${c.bg} ${isSel ? `ring-2 ${c.ring} scale-[1.04] shadow-lg` : "hover:shadow-md hover:scale-[1.02]"} ${dim ? "opacity-30" : ""} ${query.trim() && matchesQuery(n) ? "ring-2 ring-accent-mint/60" : ""}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`size-1.5 rounded-full ${c.dot}`} />
                        <T.Icon className="size-3 opacity-60" />
                        <span className="text-xs font-bold tracking-tight truncate">
                          {n.title}
                        </span>
                      </div>
                      {n.tags && n.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {n.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-foreground/10 opacity-80"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Collapse toggle - still interactive for viewing */}
                      {kidsCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCollapse(n.id);
                          }}
                          className={`absolute -right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full border border-border bg-white text-foreground flex items-center justify-center shadow-soft text-[10px] font-bold transition hover:scale-110 ${n.collapsed ? "" : "rotate-90"}`}
                          title={n.collapsed ? "Expand" : "Collapse"}
                        >
                          {n.collapsed ? (
                            <span className="text-[10px] font-bold">+</span>
                          ) : (
                            <span className="text-[10px] font-bold">−</span>
                          )}
                        </button>
                      )}

                      {/* Hover tooltip showing node info */}
                      {hoverId === n.id && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-foreground/80 text-background text-[9px] font-medium whitespace-nowrap pointer-events-none">
                          Click to focus
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 px-3 py-2 rounded-xl bg-white/80 backdrop-blur-xl border border-border/60 text-[10px] font-bold text-foreground/60">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" /> Root
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-accent-blue" /> Branch
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-accent-pink" /> Sub
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-accent-mint" /> Leaf
            </span>
          </div>
          <div className="absolute bottom-3 right-3 text-[10px] font-medium text-foreground/45 px-2 py-1 rounded-md bg-white/70 border border-border/40">
            Click node to focus · drag to pan · scroll to zoom
          </div>
        </div>

        {/* Info Panel - View Only */}
        {selected && (
          <aside className="w-80 border-l border-border bg-white/80 backdrop-blur-xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                  Node Details
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1 rounded-md hover:bg-foreground/5 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <span className="text-foreground/60 text-sm">✕</span>
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                  Title
                </label>
                <div className="mt-1 w-full border border-border/50 rounded-lg px-2.5 py-1.5 text-sm font-bold bg-foreground/5">
                  {selected.title}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                  Type
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/10 text-xs font-medium">
                    {(() => {
                      const T = TYPE_META[selected.type];
                      return <T.Icon className="size-3.5" />;
                    })()}
                    <span>{TYPE_META[selected.type].label}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                    Description
                  </label>
                  <div className="mt-1 w-full border border-border/50 rounded-lg px-2.5 py-1.5 text-xs leading-relaxed bg-foreground/5 min-h-[40px]">
                    {selected.description}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selected.tags && selected.tags.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                    Tags
                  </label>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {selected.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-foreground/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Connections */}
              <div className="pt-2 border-t border-border/60">
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-2">
                  Connected Nodes
                </div>
                <div className="space-y-1">
                  {selected.parentId && (
                    <button
                      onClick={() => setSelectedId(selected.parentId)}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-foreground/5 text-xs transition-colors"
                    >
                      <span className="text-foreground/45">↑</span>
                      <span className="font-medium truncate">{byId[selected.parentId]?.title}</span>
                      <span className="text-[10px] text-foreground/40 ml-auto">parent</span>
                    </button>
                  )}
                  {childrenOf(selected.id).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-foreground/5 text-xs transition-colors"
                    >
                      <span className="text-foreground/45">↓</span>
                      <span className="font-medium truncate">{c.title}</span>
                      <span className="text-[10px] text-foreground/40 ml-auto">
                        {childrenOf(c.id).length} children
                      </span>
                    </button>
                  ))}
                  {childrenOf(selected.id).length === 0 && !selected.parentId && (
                    <div className="text-[11px] text-foreground/40 italic text-center py-2">
                      No connected nodes.
                    </div>
                  )}
                </div>
              </div>

              {/* Node info */}
              <div className="pt-2 border-t border-border/60 text-[10px] text-foreground/40 space-y-0.5">
                <div>ID: {selected.id}</div>
                <div>Depth: {depthOf(selected.id)}</div>
                <div>Children: {childrenOf(selected.id).length}</div>
              </div>
            </div>
          </aside>
        )}
      </div>

      <ArtifactGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        type="mindmap"
        onGenerate={generate}
        isGenerating={isGenerating}
        prefilledOptions={artifact?.options_json}
      />
    </div>
  );
}
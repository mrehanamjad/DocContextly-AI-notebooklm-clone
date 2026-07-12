// import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { Icon } from "@iconify/react";
// import html2canvas from "html2canvas-pro";
// import jsPDF from "jspdf";
// import PptxGenJS from "pptxgenjs";

// /* ============================================================
//    Types — mirrors the deck JSON schema as a discriminated union
//    on `type`, so each slide's `content` shape is checked at
//    compile time.
//    ============================================================ */

// export type VisualType = "image" | "icon" | "none";
// export type VisualPlacement = "background" | "right" | "left" | "top";

// export interface Visual {
//   type: VisualType;
//   query: string | null;
//   resolved: string | null;
//   placement: VisualPlacement;
// }

// export interface ParagraphCard {
//   title: string;
//   text: string;
// }

// export interface BulletCard {
//   title: string;
//   bullets: string[];
// }

// export interface TableColumn {
//   header: string;
//   items: string[];
// }

// export interface ParagraphSlide {
//   type: "paragraph";
//   title: string;
//   visual: Visual;
//   content: string[];
// }

// export interface BulletsSlide {
//   type: "bullets_points";
//   title: string;
//   visual: Visual;
//   content: string[];
// }

// export interface ParagraphCardsSlide {
//   type: "2_paragraph_cards" | "3_paragraph_cards";
//   title: string;
//   visual: Visual;
//   content: ParagraphCard[];
// }

// export interface BulletCardsSlide {
//   type: "2_bullets_point_cards" | "3_bullets_point_cards";
//   title: string;
//   visual: Visual;
//   content: BulletCard[];
// }

// export interface TableSlide {
//   type: "table";
//   title: string;
//   visual: Visual;
//   content: TableColumn[];
// }

// export type Slide =
//   | ParagraphSlide
//   | BulletsSlide
//   | ParagraphCardsSlide
//   | BulletCardsSlide
//   | TableSlide;

// export interface Deck {
//   title: string;
//   description?: string;
//   slides: Slide[];
// }

// /* ============================================================
//    Themes — each one is a full visual identity (type, shape,
//    frame treatment, decoration), not just a recolor. Styling
//    lives entirely in CSS, switched via a [data-theme] attribute,
//    so the same JSX renders any theme.
//    ============================================================ */

// export type ThemeName = "editorial" | "console" | "blueprint" | "studio";

// export interface ThemeMeta {
//   id: ThemeName;
//   label: string;
//   /** Swatch shown on the theme-switcher button — illustrative only. */
//   swatch: string;
// }

// export const THEME_META: ThemeMeta[] = [
//   {
//     id: "editorial",
//     label: "Editorial",
//     swatch: "linear-gradient(135deg, #f4f1ea 50%, #c1581f 50%)",
//   },
//   { id: "console", label: "Console", swatch: "linear-gradient(135deg, #0c0e0c 50%, #ff6a3d 50%)" },
//   {
//     id: "blueprint",
//     label: "Blueprint",
//     swatch: "linear-gradient(135deg, #eef2f6 50%, #ff7a1a 50%)",
//   },
//   { id: "studio", label: "Studio", swatch: "linear-gradient(135deg, #fbeee2 50%, #ef5b6e 50%)" },
// ];

// /* ============================================================
//    Constants
//    ============================================================ */

// const SLIDE_W = 1280;
// const SLIDE_H = 720;

// const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
// const typeLabel = (t: string) => t.replace(/_/g, " ");

// /* ============================================================
//    Icon badge — thin wrapper so size/color stay consistent
//    ============================================================ */

// const IconBadge: React.FC<{
//   icon: string | null;
//   size: number;
//   className?: string;
// }> = ({ icon, size, className }) => {
//   if (!icon) return null;
//   return (
//     <div className={`sd-icon-badge ${className ?? ""}`} style={{ width: size, height: size }}>
//       <Icon icon={icon} style={{ fontSize: size * 0.45, color: "var(--sd-paper)" }} />
//     </div>
//   );
// };

// /* ============================================================
//    Slide chrome — eyebrow / index / footer shared by every type
//    ============================================================ */

// const SlideChrome: React.FC<{
//   deckTitle: string;
//   type: string;
//   index: number;
//   total: number;
//   isDark: boolean;
// }> = ({ deckTitle, type, index, total, isDark }) => (
//   <>
//     <div className={`sd-border ${isDark ? "is-dark" : ""}`} />

//     {/* Theme-only decoration. Hidden by default in CSS; specific themes
//         turn these on and style them — same markup, different skin. */}
//     <span className="sd-corner tl" />
//     <span className="sd-corner tr" />
//     <span className="sd-corner bl" />
//     <span className="sd-corner br" />
//     <span className="sd-regmark" />

//     <div className={`sd-index ${isDark ? "is-dark" : ""}`}>
//       {pad(index + 1)} / {pad(total)}
//       <span className="sd-cursor" />
//     </div>
//     <div className={`sd-footer-l ${isDark ? "is-dark" : ""}`}>{deckTitle}</div>
//     <div className={`sd-footer-r ${isDark ? "is-dark" : ""}`}>
//       {pad(index + 1)} / {pad(total)}
//     </div>
//   </>
// );

// /* ============================================================
//    Per-type slide views
//    ============================================================ */

// const getLayoutClass = (visual?: Visual) => {
//   if (!visual || visual.type !== "image") return "";
//   if (visual.placement === "background") return "layout-bg";
//   if (visual.placement === "left") return "layout-side layout-side-left";
//   if (visual.placement === "top") return "layout-top";
//   return "layout-side layout-side-right";
// };

// const VisualRenderer: React.FC<{ visual?: Visual }> = ({ visual }) => {
//   const [error, setError] = useState(false);
//   if (!visual || visual.type !== "image" || !visual.resolved || error) return null;
  
//   const handleErr = () => setError(true);
//   const Tracker = <img src={visual.resolved} alt="" onError={handleErr} style={{ display: 'none' }} aria-hidden="true" />;

//   if (visual.placement === "background") {
//     return (
//       <>
//         {Tracker}
//         <div className="sd-bg-photo" style={{ backgroundImage: `url('${visual.resolved}')` }} role="img" aria-label="Slide background image" />
//         <div className="sd-bg-overlay" />
//       </>
//     );
//   }
//   if (visual.placement === "left") {
//     return (
//       <>
//         {Tracker}
//         <div className="sd-side-photo left" style={{ backgroundImage: `url('${visual.resolved}')` }} role="img" aria-label="Slide side image" />
//       </>
//     );
//   }
//   if (visual.placement === "top") {
//     return (
//       <>
//         {Tracker}
//         <div className="sd-top-photo" style={{ backgroundImage: `url('${visual.resolved}')` }} role="img" aria-label="Slide top image" />
//       </>
//     );
//   }
//   return (
//     <>
//       {Tracker}
//       <div className="sd-side-photo right" style={{ backgroundImage: `url('${visual.resolved}')` }} role="img" aria-label="Slide side image" />
//     </>
//   );
// };

// const ParagraphView: React.FC<{ slide: ParagraphSlide }> = React.memo(({ slide }) => {
//   const { visual, title, content } = slide;
//   const text = (Array.isArray(content) ? content[0] : content) || "";

//   return (
//     <div className={`sd-type-paragraph ${getLayoutClass(visual)}`}>
//       <VisualRenderer visual={visual} />
//       <h1 className="sd-slide-title">{title || ""}</h1>
//       <div className="sd-content-area">
//         <p className="sd-body-text">{text}</p>
//       </div>
//     </div>
//   );
// });

// const BulletsView: React.FC<{ slide: BulletsSlide }> = React.memo(({ slide }) => {
//   const hasIcon = slide?.visual?.type === "icon";
//   const bullets = Array.isArray(slide.content) ? slide.content : [];
//   return (
//     <div className={`sd-type-bullets ${getLayoutClass(slide.visual)}`}>
//       <VisualRenderer visual={slide.visual} />
//       <h1 className="sd-slide-title">{slide.title || ""}</h1>
//       <div className="sd-content-area">
//         <ul className="sd-bullet-list">
//           {bullets.map((item, i) => (
//             <li key={i}>{item}</li>
//           ))}
//         </ul>
//       </div>
//       {hasIcon && (
//         <IconBadge icon={slide.visual.resolved} size={160} className="sd-bullets-icon" />
//       )}
//     </div>
//   );
// });

// const ParagraphCardsView: React.FC<{ slide: ParagraphCardsSlide }> = React.memo(({ slide }) => {
//   const hasIcon = slide?.visual?.type === "icon";
//   const cards = Array.isArray(slide.content) ? slide.content : [];
//   return (
//     <div className={`sd-type-cards ${hasIcon ? "has-icon" : ""} ${getLayoutClass(slide.visual)}`}>
//       <VisualRenderer visual={slide.visual} />
//       {hasIcon && <IconBadge icon={slide.visual.resolved} size={56} className="sd-cards-icon" />}
//       <h1 className="sd-slide-title">{slide.title || ""}</h1>
//       <div className="sd-card-row">
//         {cards.map((card, i) => (
//           <div className="sd-pcard" key={i}>
//             <h3>{card?.title || ""}</h3>
//             <p>{card?.text || ""}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// });

// const BulletCardsView: React.FC<{ slide: BulletCardsSlide }> = React.memo(({ slide }) => {
//   const hasIcon = slide?.visual?.type === "icon";
//   const cards = Array.isArray(slide.content) ? slide.content : [];
//   return (
//     <div className={`sd-type-cards ${hasIcon ? "has-icon" : ""} ${getLayoutClass(slide.visual)}`}>
//       <VisualRenderer visual={slide.visual} />
//       {hasIcon && <IconBadge icon={slide.visual.resolved} size={56} className="sd-cards-icon" />}
//       <h1 className="sd-slide-title">{slide.title || ""}</h1>
//       <div className="sd-card-row">
//         {cards.map((card, i) => (
//           <div className="sd-pcard" key={i}>
//             <h3>{card?.title || ""}</h3>
//             <ul>
//               {Array.isArray(card?.bullets) ? card.bullets.map((b, j) => (
//                 <li key={j}>{b}</li>
//               )) : null}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// });

// const TableView: React.FC<{ slide: TableSlide }> = React.memo(({ slide }) => {
//   const cols = Array.isArray(slide.content) ? slide.content : [];
//   return (
//     <div className={`sd-type-table ${getLayoutClass(slide.visual)}`}>
//       <VisualRenderer visual={slide.visual} />
//       <h1 className="sd-slide-title">{slide.title || ""}</h1>
//       <div className="sd-content-area">
//         {cols.map((col, i) => (
//           <div className="sd-tcol" key={i}>
//             <div className="sd-thead">{col?.header || ""}</div>
//             {Array.isArray(col?.items) ? col.items.map((item, j) => (
//               <div className="sd-trow" key={j}>
//                 {item}
//               </div>
//             )) : null}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// });

// /* ============================================================
//    Slide dispatcher
//    ============================================================ */

// const SlideBody: React.FC<{ slide: Slide }> = ({ slide }) => {
//   if (!slide || !slide.type) {
//     return (
//       <div className="sd-type-paragraph">
//         <h1 className="sd-slide-title">Unknown Content</h1>
//         <div className="sd-content-area">
//           <p className="sd-body-text">This slide failed to load correctly.</p>
//         </div>
//       </div>
//     );
//   }

//   switch (slide.type) {
//     case "paragraph":
//       return <ParagraphView slide={slide as ParagraphSlide} />;
//     case "bullets_points":
//       return <BulletsView slide={slide as BulletsSlide} />;
//     case "2_paragraph_cards":
//     case "3_paragraph_cards":
//       return <ParagraphCardsView slide={slide as ParagraphCardsSlide} />;
//     case "2_bullets_point_cards":
//     case "3_bullets_point_cards":
//       return <BulletCardsView slide={slide as BulletCardsSlide} />;
//     case "table":
//       return <TableView slide={slide as TableSlide} />;
//     default:
//       return (
//         <div className="sd-type-paragraph">
//           <h1 className="sd-slide-title">Unsupported slide type</h1>
//           <div className="sd-content-area">
//             <p className="sd-body-text">The requested slide type ({(slide as any).type}) is not supported by this viewer.</p>
//           </div>
//         </div>
//       );
//   }
// };

// const isDarkSlide = (slide: Slide): boolean =>
//   slide.type === "paragraph" &&
//   slide.visual.type === "image" &&
//   slide.visual.placement === "background";

// /* ============================================================
//    SlideDeck — main component
//    ============================================================ */

// export interface SlideDeckProps {
//   deck: Deck;
//   /** Start on this slide index (default 0) */
//   initialIndex?: number;
//   /** Initial/controlled theme (default "editorial") */
//   theme?: ThemeName;
//   /** Fired when the person picks a different theme from the switcher */
//   onThemeChange?: (theme: ThemeName) => void;
//   /** Hide the built-in theme switcher pills in the control bar */
//   hideThemeSwitcher?: boolean;
// }

// const SlideDeck: React.FC<SlideDeckProps> = ({
//   deck,
//   initialIndex = 0,
//   theme = "editorial",
//   onThemeChange,
//   hideThemeSwitcher = false,
// }) => {
//   const [current, setCurrent] = useState(
//     Math.min(Math.max(initialIndex, 0), Math.max(deck.slides.length - 1, 0)),
//   );
//   const [scale, setScale] = useState(1);
//   const [exporting, setExporting] = useState<"pdf" | "pptx" | null>(null);
//   const [themeName, setThemeName] = useState<ThemeName>(theme);
//   const stageRef = useRef<HTMLDivElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   // Present mode: fullscreen the whole component and auto-hide the
//   // control bar after a moment of inactivity, like a real presenter view.
//   const [isPresenting, setIsPresenting] = useState(false);
//   const [controlsHidden, setControlsHidden] = useState(false);

//   // Stay in sync if the caller controls `theme` from outside.
//   useEffect(() => setThemeName(theme), [theme]);

//   const selectTheme = useCallback(
//     (t: ThemeName) => {
//       setThemeName(t);
//       onThemeChange?.(t);
//     },
//     [onThemeChange],
//   );

//   // Hidden, full-resolution (unscaled) copies of every slide, used only as
//   // a capture source for export. Kept off-screen rather than display:none
//   // so the browser still lays them out and paints images/icons into them.
//   const exportNodeRefs = useRef<(HTMLDivElement | null)[]>([]);

//   const total = deck.slides.length;
//   const slide = deck.slides[current];

//   // Fit the fixed 1280x720 canvas to the viewport, like object-fit: contain
//   // on an image — only the zoom level changes, never the layout.
//   useEffect(() => {
//     const fit = () => {
//       const el = stageRef.current;
//       if (!el) return;
//       const { width, height } = el.getBoundingClientRect();
//       setScale(Math.min(width / SLIDE_W, height / SLIDE_H));
//     };
//     fit();
//     const ro = new ResizeObserver(fit);
//     if (stageRef.current) ro.observe(stageRef.current);
//     window.addEventListener("resize", fit);
//     return () => {
//       ro.disconnect();
//       window.removeEventListener("resize", fit);
//     };
//   }, []);

//   const goTo = useCallback((i: number) => setCurrent(((i % total) + total) % total), [total]);
//   const next = useCallback(() => goTo(current + 1), [goTo, current]);
//   const prev = useCallback(() => goTo(current - 1), [goTo, current]);

//   const enterPresent = useCallback(async () => {
//     const el = containerRef.current as any;
//     if (!el) return;
//     try {
//       if (el.requestFullscreen) await el.requestFullscreen();
//       else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
//     } catch (err) {
//       console.error("Couldn't enter fullscreen:", err);
//     }
//   }, []);

//   const exitPresent = useCallback(() => {
//     const doc = document as any;
//     if (doc.fullscreenElement || doc.webkitFullscreenElement) {
//       (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
//     }
//   }, []);

//   const togglePresent = useCallback(() => {
//     if (isPresenting) exitPresent();
//     else enterPresent();
//   }, [isPresenting, enterPresent, exitPresent]);

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (exporting) return;
//       if (e.key === "ArrowRight" || e.key === " ") next();
//       if (e.key === "ArrowLeft") prev();
//       if (e.key === "f" || e.key === "F") togglePresent();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [next, prev, exporting, togglePresent]);

//   // Keep state in sync with real fullscreen status — covers the browser's
//   // own Escape-to-exit, not just our button.
//   useEffect(() => {
//     const onFsChange = () => {
//       const doc = document as any;
//       setIsPresenting(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
//     };
//     document.addEventListener("fullscreenchange", onFsChange);
//     document.addEventListener("webkitfullscreenchange", onFsChange);
//     return () => {
//       document.removeEventListener("fullscreenchange", onFsChange);
//       document.removeEventListener("webkitfullscreenchange", onFsChange);
//     };
//   }, []);

//   // While presenting, fade the control bar out after a moment of no
//   // mouse/keyboard activity, and bring it back on the next movement.
//   useEffect(() => {
//     if (!isPresenting) {
//       setControlsHidden(false);
//       return;
//     }
//     let timer: ReturnType<typeof setTimeout>;
//     const reset = () => {
//       setControlsHidden(false);
//       clearTimeout(timer);
//       timer = setTimeout(() => setControlsHidden(true), 2500);
//     };
//     reset();
//     window.addEventListener("mousemove", reset);
//     window.addEventListener("keydown", reset);
//     return () => {
//       clearTimeout(timer);
//       window.removeEventListener("mousemove", reset);
//       window.removeEventListener("keydown", reset);
//     };
//   }, [isPresenting]);

//   const dark = useMemo(() => isDarkSlide(slide), [slide]);

//   // Renders every slide (hidden, at native 1280x720) to a PNG data URL,
//   // in order. Used as the shared source for both PDF and PPTX export so
//   // the exported file matches what's on screen pixel-for-pixel.
//   const captureSlideImages = useCallback(async (): Promise<string[]> => {
//     // Give any in-flight icon/image fetches in the hidden copies a moment
//     // to resolve before we start snapshotting.
//     await new Promise((r) => setTimeout(r, 300));

//     const images: string[] = [];
//     for (const node of exportNodeRefs.current) {
//       if (!node) continue;
//       const canvas = await html2canvas(node, {
//         scale: 2,
//         useCORS: true,
//         backgroundColor: "#f4f1ea",
//         width: SLIDE_W,
//         height: SLIDE_H,
//       });
//       images.push(canvas.toDataURL("image/png"));
//     }
//     return images;
//   }, []);

//   const handleExportPDF = useCallback(async () => {
//     if (exporting) return;
//     setExporting("pdf");
//     try {
//       const images = await captureSlideImages();
//       const pdf = new jsPDF({
//         orientation: "landscape",
//         unit: "px",
//         format: [SLIDE_W, SLIDE_H],
//       });
//       images.forEach((img, i) => {
//         if (i > 0) pdf.addPage([SLIDE_W, SLIDE_H], "landscape");
//         pdf.addImage(img, "PNG", 0, 0, SLIDE_W, SLIDE_H);
//       });
//       pdf.save(`${deck.title || "deck"}.pdf`);
//     } catch (err) {
//       console.error("PDF export failed:", err);
//     } finally {
//       setExporting(null);
//     }
//   }, [captureSlideImages, deck.title, exporting]);

//   const handleExportPPTX = useCallback(async () => {
//     if (exporting) return;
//     setExporting("pptx");
//     try {
//       const images = await captureSlideImages();
//       const pptx = new PptxGenJS();
//       pptx.defineLayout({ name: "DECK_16x9", width: 13.333, height: 7.5 });
//       pptx.layout = "DECK_16x9";
//       images.forEach((img) => {
//         const s = pptx.addSlide();
//         s.addImage({ data: img, x: 0, y: 0, w: 13.333, h: 7.5 });
//       });
//       await pptx.writeFile({ fileName: `${deck.title || "deck"}.pptx` });
//     } catch (err) {
//       console.error("PPTX export failed:", err);
//     } finally {
//       setExporting(null);
//     }
//   }, [captureSlideImages, deck.title, exporting]);

//   if (!slide) {
//     return <div className="sd-empty">No slides in deck.</div>;
//   }

//   return (
//     <div className="sd-root" data-theme={themeName} ref={containerRef}>
//       <style>{DECK_STYLES}</style>

//       <div className="sd-stage" ref={stageRef}>
//         <div className="sd-slide" style={{ transform: `scale(${scale})` }} key={current}>
//           <SlideChrome
//             deckTitle={deck.title}
//             type={slide.type}
//             index={current}
//             total={total}
//             isDark={dark}
//           />
//           <SlideBody slide={slide} />
//         </div>

//         <button className="sd-nav-zone left" aria-label="Previous slide" onClick={prev} />
//         <button className="sd-nav-zone right" aria-label="Next slide" onClick={next} />
//       </div>

//       <div className={`sd-controls ${controlsHidden ? "idle-hidden" : ""}`}>
//         <button onClick={prev} aria-label="Previous" disabled={!!exporting}>
//           <Icon icon="lucide:chevron-left" />
//         </button>
//         {!isPresenting && (
//           <div className="sd-dots">
//             {deck.slides.map((_, i) => (
//               <div
//                 key={i}
//                 className={`sd-dot ${i === current ? "active" : ""}`}
//                 onClick={() => !exporting && goTo(i)}
//               />
//             ))}
//           </div>
//         )}
//         <button onClick={next} aria-label="Next" disabled={!!exporting}>
//           <Icon icon="lucide:chevron-right" />
//         </button>
//         <span className="sd-counter">
//           {pad(current + 1)} / {pad(total)}
//         </span>

//         {!isPresenting && !hideThemeSwitcher && (
//           <>
//             <div className="sd-export-divider" />
//             <div className="sd-theme-switcher">
//               {THEME_META.map((t) => (
//                 <button
//                   key={t.id}
//                   className={`sd-theme-swatch ${themeName === t.id ? "active" : ""}`}
//                   style={{ background: t.swatch }}
//                   onClick={() => selectTheme(t.id)}
//                   disabled={!!exporting}
//                   title={t.label}
//                   aria-label={`Switch to ${t.label} theme`}
//                 />
//               ))}
//             </div>
//           </>
//         )}

//         <div className="sd-export-divider" />

//         <button
//           className="sd-export-btn"
//           onClick={togglePresent}
//           aria-label={isPresenting ? "Exit presentation" : "Present"}
//           title={isPresenting ? "Exit presentation (Esc)" : "Present fullscreen (F)"}
//         >
//           <Icon icon={isPresenting ? "lucide:minimize" : "lucide:maximize"} />
//           <span>{isPresenting ? "Exit" : "Present"}</span>
//         </button>

//         {!isPresenting && (
//           <>
//             <div className="sd-export-divider" />

//             <button
//               className="sd-export-btn"
//               onClick={handleExportPDF}
//               disabled={!!exporting}
//               aria-label="Export as PDF"
//               title="Export as PDF"
//             >
//               {exporting === "pdf" ? (
//                 <Icon icon="lucide:loader-2" className="sd-spin" />
//               ) : (
//                 <Icon icon="lucide:file-text" />
//               )}
//               <span>PDF</span>
//             </button>

//             <button
//               className="sd-export-btn"
//               onClick={handleExportPPTX}
//               disabled={!!exporting}
//               aria-label="Export as PowerPoint"
//               title="Export as PowerPoint"
//             >
//               {exporting === "pptx" ? (
//                 <Icon icon="lucide:loader-2" className="sd-spin" />
//               ) : (
//                 <Icon icon="lucide:presentation" />
//               )}
//               <span>PPTX</span>
//             </button>
//           </>
//         )}
//       </div>

//       {/* Off-screen, full-resolution render of every slide — the source
//           html2canvas captures from for both export formats. */}
//       <div className="sd-export-source" aria-hidden="true">
//         {deck.slides.map((s, i) => (
//           <div
//             key={i}
//             className="sd-slide"
//             ref={(el) => {
//               exportNodeRefs.current[i] = el;
//             }}
//           >
//             <SlideChrome
//               deckTitle={deck.title}
//               type={s.type}
//               index={i}
//               total={total}
//               isDark={isDarkSlide(s)}
//             />
//             <SlideBody slide={s} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SlideDeck;

// /* ============================================================
//    Styles — design tokens + layout for every slide type.
//    Kept as one template literal so this file is a drop-in,
//    dependency-free (besides @iconify/react) single component.
//    ============================================================ */

// const DECK_STYLES = `
//   .sd-root{
//     --sd-ink:#1c1b19;
//     --sd-paper:#f4f1ea;
//     --sd-rust:#c1581f;
//     --sd-accent-2:#1c1b19;
//     --sd-muted: rgba(28,27,25,0.62);

//     --sd-display-font:'Helvetica Neue', Arial, sans-serif;
//     --sd-body-font:'Helvetica Neue', Arial, sans-serif;
//     --sd-label-font:'Helvetica Neue', Arial, sans-serif;

//     --sd-title-weight:800;
//     --sd-title-tracking:-1px;
//     --sd-title-transform:none;

//     --sd-frame-display:block;
//     --sd-frame-style:solid;
//     --sd-frame-width:2px;
//     --sd-frame-color:var(--sd-ink);

//     --sd-card-bg:#ffffff;
//     --sd-card-border:1px solid rgba(28,27,25,0.12);
//     --sd-card-radius:0px;
//     --sd-card-shadow:none;
//     --sd-card-accent:4px solid var(--sd-rust);
//     --sd-card-rotate:0deg;

//     --sd-badge-radius:50%;
//     --sd-badge-bg:var(--sd-rust);

//     --sd-rule-bg:var(--sd-ink);
//     --sd-row-stripe:rgba(28,27,25,0.035);

//     --sd-corner-display:none;
//     --sd-cursor-display:none;
//     --sd-regmark-display:none;
//     --sd-bg-pattern:none;
//     --sd-bg-pattern-opacity:0;

//     width:100%;
//     height:100%;
//     background:#0e0d0c;
//     font-family:var(--sd-body-font);
//     position:relative;
//     overflow:hidden;
//     border-radius:20px;
//     display:flex;
//     flex-direction:column;
//   }
//   /* Edge-to-edge once real browser fullscreen kicks in for Present mode. */
//   .sd-root:fullscreen, .sd-root:-webkit-full-screen{ border-radius:0; }

//   .sd-stage{
//     width:100%;
//     flex:1;
//     min-height:0;
//     display:flex;
//     align-items:center;
//     justify-content:center;
//     position:relative;
//     padding:8px 8px 76px;
//   }
//   .sd-root:fullscreen .sd-stage, .sd-root:-webkit-full-screen .sd-stage{ padding-bottom:8px; }

//   .sd-slide{
//     width:${SLIDE_W}px;
//     height:${SLIDE_H}px;
//     flex-shrink:0;
//     transform-origin:center center;
//     background:var(--sd-paper);
//     color:var(--sd-ink);
//     position:relative;
//     overflow:hidden;
//     border-radius:10px;
//     box-shadow:0 24px 60px -20px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.25);
//     transition:background-color 0.35s ease, color 0.35s ease;
//     animation:sd-slide-in 0.22s ease both;
//   }
//   .sd-root:fullscreen .sd-slide, .sd-root:-webkit-full-screen .sd-slide{
//     border-radius:0; box-shadow:none;
//   }
//   .sd-export-source .sd-slide{ border-radius:0 !important; box-shadow:none !important; animation:none !important; }

//   /* Only opacity animates here — transform is driven by the inline
//      scale-to-fit style, so the keyframe leaves it alone. */
//   @keyframes sd-slide-in{
//     from{ opacity:0; }
//     to{ opacity:1; }
//   }
//   .sd-slide::after{
//     content:"";
//     position:absolute; inset:0; z-index:0; pointer-events:none;
//     background-image:var(--sd-bg-pattern);
//     opacity:var(--sd-bg-pattern-opacity);
//   }

//   .sd-border{
//     position:absolute; inset:32px;
//     border:var(--sd-frame-width) var(--sd-frame-style) var(--sd-frame-color);
//     display:var(--sd-frame-display);
//     pointer-events:none; z-index:5;
//   }
//   .sd-border.is-dark{ border-color:rgba(244,241,234,0.7); }

//   /* viewfinder-style corner marks, used by console/blueprint themes */
//   .sd-corner{
//     position:absolute; width:22px; height:22px;
//     display:var(--sd-corner-display);
//     z-index:5; pointer-events:none;
//     border-color:var(--sd-rust);
//   }
//   .sd-corner.tl{ top:32px; left:32px; border-top:2px solid; border-left:2px solid; }
//   .sd-corner.tr{ top:32px; right:32px; border-top:2px solid; border-right:2px solid; }
//   .sd-corner.bl{ bottom:32px; left:32px; border-bottom:2px solid; border-left:2px solid; }
//   .sd-corner.br{ bottom:32px; right:32px; border-bottom:2px solid; border-right:2px solid; }

//   /* registration-mark glyph, used by the blueprint theme */
//   .sd-regmark{
//     position:absolute; top:40px; left:80px;
//     display:var(--sd-regmark-display);
//     font-size:16px; color:var(--sd-rust); z-index:6;
//   }
//   .sd-regmark::before{ content:"⌖"; }

//   /* blinking cursor glyph after the page index, used by the console theme */
//   .sd-cursor{
//     display:var(--sd-cursor-display);
//     margin-left:4px;
//   }
//   .sd-cursor::before{
//     content:"_"; animation: sd-blink 1s step-end infinite;
//   }
//   @keyframes sd-blink{ 50%{ opacity:0; } }

//   .sd-eyebrow{
//     position:absolute; top:72px; left:80px;
//     font-family:var(--sd-label-font);
//     font-size:13px; letter-spacing:4px; font-weight:700;
//     text-transform:uppercase; color:var(--sd-rust); z-index:6;
//   }
//   .sd-eyebrow.is-dark{ color:#f2a36a; }

//   .sd-index{
//     position:absolute; top:72px; right:80px;
//     font-family:var(--sd-label-font);
//     font-size:13px; letter-spacing:2px; font-weight:600;
//     color:var(--sd-ink); opacity:0.55; z-index:6;
//   }
//   .sd-index.is-dark{ color:#f4f1ea; opacity:0.85; }

//   .sd-footer-l{
//     position:absolute; left:80px; bottom:48px;
//     font-family:var(--sd-label-font);
//     font-size:12px; letter-spacing:2px; font-weight:600;
//     text-transform:uppercase; opacity:0.55; z-index:6; color:var(--sd-ink);
//   }
//   .sd-footer-r{
//     position:absolute; right:80px; bottom:48px;
//     font-family:var(--sd-label-font);
//     font-size:12px; letter-spacing:2px; font-weight:600;
//     text-transform:uppercase; opacity:0.55; z-index:6; color:var(--sd-ink);
//   }
//   .sd-footer-l.is-dark, .sd-footer-r.is-dark{ color:#f4f1ea; opacity:0.8; }

//   .sd-slide-title{
//     position:absolute; left:80px; top:130px; width:1080px;
//     font-family:var(--sd-display-font);
//     font-size:48px; font-weight:var(--sd-title-weight);
//     letter-spacing:var(--sd-title-tracking);
//     text-transform:var(--sd-title-transform);
//     line-height:1.05; z-index:6; margin:0;
//   }

//   .sd-icon-badge{
//     border-radius:var(--sd-badge-radius); background:var(--sd-badge-bg);
//     display:flex; align-items:center; justify-content:center;
//     flex-shrink:0;
//   }

//   /* paragraph */
//   .sd-type-paragraph .sd-content-area{
//     position:absolute; left:80px; right:80px; top:230px; bottom:96px;
//   }
//   .layout-bg .sd-slide-title { top: auto; bottom: 260px; z-index: 2; }
//   .layout-bg .sd-content-area, .layout-bg .sd-card-row{
//     left:80px; right:80px; top:auto; bottom:96px; height:auto; z-index: 2;
//   }
//   .sd-body-text{ font-family:var(--sd-body-font); font-size:24px; line-height:1.6; font-weight:400; max-width:760px; margin:0; }
//   .layout-bg .sd-body-text{ max-width:880px; }

//   .sd-bg-photo{ position:absolute; inset:0; background-size:cover; background-position:center; z-index:0; }
//   .sd-bg-overlay{
//     position:absolute; inset:0; z-index:1;
//     background:linear-gradient(0deg, rgba(14,13,12,0.88) 0%, rgba(14,13,12,0.55) 45%, rgba(14,13,12,0.15) 75%);
//   }
//   .layout-bg .sd-slide-title,
//   .layout-bg .sd-body-text, .layout-bg h3, .layout-bg p, .layout-bg li, .layout-bg .sd-thead, .layout-bg .sd-trow { color:#f4f1ea !important; border-color: rgba(244,241,234,0.3) !important; }

//   .sd-side-photo{ position:absolute; top:0; bottom:0; background-size:cover; background-position:center; z-index:0; }
//   .sd-side-photo.right{ right:0; width:560px; }
//   .sd-side-photo.left{ left:0; width:560px; }
//   .sd-top-photo{ position:absolute; top:0; left:0; right:0; height:320px; background-size:cover; background-position:center; z-index:0; }

//   .layout-side.layout-side-right .sd-slide-title{ width:540px; }
//   .layout-side.layout-side-right .sd-content-area, .layout-side.layout-side-right .sd-card-row{ right:auto; width:520px; }
//   .layout-side.layout-side-left .sd-slide-title{ width:540px; left:auto; right:80px; }
//   .layout-side.layout-side-left .sd-content-area, .layout-side.layout-side-left .sd-card-row{ left:auto; right:80px; width:520px; }

//   .layout-top .sd-slide-title{ top: 350px; }
//   .layout-top .sd-content-area, .layout-top .sd-card-row{ top: 430px; bottom: 80px; height:auto; }

//   /* bullets_points */
//   .sd-type-bullets .sd-content-area{ position:absolute; left:80px; top:230px; width:680px; }
//   .sd-bullets-icon{ position:absolute; right:120px; top:260px; }
//   .sd-bullet-list{ list-style:none; margin:0; padding:0; font-family:var(--sd-body-font); }
//   .sd-bullet-list li{
//     position:relative; padding-left:30px; margin-bottom:24px;
//     font-size:22px; line-height:1.5; font-weight:400;
//   }
//   .sd-bullet-list li::before{
//     content:""; position:absolute; left:0; top:11px; width:16px; height:3px; background:var(--sd-rust);
//   }

//   /* N_paragraph_cards / bullet cards */
//   .sd-cards-icon{ position:absolute; left:80px; top:72px; }
//   .sd-type-cards.has-icon .sd-slide-title{ left:152px; top:80px; font-size:36px; width:900px; }
//   .sd-type-cards.has-icon .sd-eyebrow, .sd-type-cards.has-icon .sd-index{ display:none; }

//   .sd-card-row{ position:absolute; left:80px; right:80px; top:230px; bottom:110px; display:flex; gap:28px; }
//   .sd-pcard{
//     flex:1; background:var(--sd-card-bg); border:var(--sd-card-border);
//     border-radius:var(--sd-card-radius); box-shadow:var(--sd-card-shadow);
//     border-top:var(--sd-card-accent); padding:32px 28px; display:flex; flex-direction:column;
//     transform:rotate(var(--sd-card-rotate));
//   }
//   .sd-card-row .sd-pcard:nth-child(even){ transform:rotate(calc(var(--sd-card-rotate) * -1)); }
//   .sd-pcard h3{ font-family:var(--sd-display-font); font-size:20px; font-weight:700; margin:0 0 14px; letter-spacing:-0.2px; }
//   .sd-pcard p{ font-family:var(--sd-body-font); font-size:17px; line-height:1.55; color:var(--sd-muted); font-weight:400; margin:0; }
//   .sd-pcard ul{ list-style:none; margin:0; padding:0; font-family:var(--sd-body-font); }
//   .sd-pcard ul li{ position:relative; padding-left:22px; margin-bottom:12px; font-size:16px; line-height:1.5; }
//   .sd-pcard ul li::before{
//     content:""; position:absolute; left:0; top:9px; width:10px; height:2px; background:var(--sd-rust);
//   }

//   /* table */
//   .sd-type-table .sd-content-area{
//     position:absolute; left:80px; right:80px; top:230px; bottom:96px; display:flex; gap:28px;
//   }
//   .sd-tcol{ flex:1; }
//   .sd-thead{
//     background:var(--sd-rule-bg); color:var(--sd-paper);
//     font-family:var(--sd-label-font);
//     font-size:14px; letter-spacing:1.5px; font-weight:700; text-transform:uppercase; padding:16px 22px;
//   }
//   .sd-trow{
//     font-family:var(--sd-body-font);
//     padding:18px 22px; border:1px solid rgba(28,27,25,0.14); border-top:none;
//     font-size:17px; line-height:1.5; font-weight:400;
//   }
//   .sd-trow:nth-child(even){ background:var(--sd-row-stripe); }

//   /* nav + controls */
//   .sd-nav-zone{
//     position:absolute; top:0; bottom:0; width:18%; z-index:50;
//     cursor:pointer; background:transparent; border:none; padding:0;
//   }
//   .sd-nav-zone.left{ left:0; }
//   .sd-nav-zone.right{ right:0; }

//   /* Fixed to viewport like version 1 */
//   .sd-controls{
//     position:fixed; bottom:18px; left:50%; transform:translateX(-50%);
//     display:flex; align-items:center; gap:14px; z-index:100;
//     background:rgba(20,19,18,0.55); backdrop-filter:blur(6px);
//     padding:10px 18px; border-radius:999px;
//     transition:opacity 0.35s ease, transform 0.35s ease;
//     opacity:1;
//   }
//   .sd-controls.idle-hidden{
//     opacity:0; pointer-events:none;
//     transform:translateX(-50%) translateY(14px);
//   }
//   .sd-controls button{
//     width:30px; height:30px; border-radius:50%;
//     border:1px solid rgba(244,241,234,0.3); background:rgba(244,241,234,0.08);
//     color:#f4f1ea; cursor:pointer; display:flex; align-items:center; justify-content:center;
//     font-size:16px;
//   }
//   .sd-controls button:hover{ background:rgba(244,241,234,0.18); }

//   /* Fill the screen properly once the browser puts the root into
//      native fullscreen for Present mode. */
//   .sd-root:fullscreen,
//   .sd-root:-webkit-full-screen{
//     width:100vw; height:100vh; background:#0e0d0c;
//   }

//   .sd-dots{ display:flex; gap:7px; }
//   .sd-dot{
//     width:7px; height:7px; border-radius:50%; background:rgba(244,241,234,0.3);
//     cursor:pointer; transition:background 0.2s, transform 0.2s;
//   }
//   .sd-dot.active{ background:#f2a36a; transform:scale(1.3); }

//   .sd-counter{ color:#f4f1ea; font-size:12px; letter-spacing:1px; min-width:48px; text-align:center; opacity:0.75; }

//   .sd-export-divider{
//     width:1px; height:18px; background:rgba(244,241,234,0.25); margin:0 2px;
//   }

//   .sd-export-btn{
//     width:auto !important; border-radius:999px !important;
//     padding:0 14px !important; gap:6px; font-size:12px !important;
//     letter-spacing:0.5px; text-transform:uppercase; font-weight:600;
//   }
//   .sd-export-btn span{ line-height:1; }
//   .sd-export-btn:disabled{ opacity:0.5; cursor:default; }
//   .sd-export-btn:disabled:hover{ background:rgba(244,241,234,0.08); }

//   .sd-spin{ animation: sd-spin-rotate 0.8s linear infinite; }
//   @keyframes sd-spin-rotate{ to{ transform:rotate(360deg); } }

//   /* Off-screen capture source: real layout/paint, just parked outside
//      the viewport so it never appears in the visible UI. */
//   .sd-export-source{
//     position:fixed;
//     top:0;
//     left:-100000px;
//     width:${SLIDE_W}px;
//     pointer-events:none;
//   }
//   .sd-export-source .sd-slide{ transform:none; margin-bottom:1px; }

//   .sd-theme-switcher{ display:flex; align-items:center; gap:6px; }
//   .sd-theme-swatch{
//     width:20px !important; height:20px !important; border-radius:50% !important;
//     padding:0 !important; border:2px solid rgba(244,241,234,0.25) !important;
//     background-clip:padding-box;
//   }
//   .sd-theme-swatch.active{ border-color:#f4f1ea !important; transform:scale(1.12); }
//   .sd-theme-swatch:disabled{ opacity:0.5; cursor:default; }

//   .sd-empty{ color:#f4f1ea; padding:40px; font-family:'Helvetica Neue', Arial, sans-serif; }

//   /* ============================================================
//      THEME: editorial (default) — warm broadsheet. Hairline frame,
//      Helvetica, circular rust badges, flat white cards. This is the
//      baseline the tokens above already encode, so no overrides needed.
//      ============================================================ */

//   /* ============================================================
//      THEME: console — dark dev-tool aesthetic for technical decks.
//      Monospace labels, viewfinder corner brackets instead of a frame,
//      a blinking cursor after the page index, square outline badges,
//      borderless ghost cards with a glowing left rule.
//      ============================================================ */
//   .sd-root[data-theme="console"]{
//     --sd-ink:#eef1ee;
//     --sd-paper:#101210;
//     --sd-rust:#ff6a3d;
//     --sd-accent-2:#5ee6c8;
//     --sd-muted: rgba(238,241,238,0.6);

//     --sd-display-font:'Space Grotesk', 'Inter', -apple-system, sans-serif;
//     --sd-body-font:'Inter', -apple-system, sans-serif;
//     --sd-label-font:'JetBrains Mono', 'SFMono-Regular', Menlo, monospace;

//     --sd-title-weight:600;
//     --sd-title-tracking:-0.5px;
//     --sd-title-transform:none;

//     --sd-frame-display:none;
//     --sd-corner-display:block;
//     --sd-cursor-display:inline-block;

//     --sd-card-bg:rgba(255,255,255,0.03);
//     --sd-card-border:1px solid rgba(255,255,255,0.1);
//     --sd-card-radius:2px;
//     --sd-card-accent:none;
//     --sd-badge-radius:6px;
//     --sd-rule-bg:rgba(255,255,255,0.08);
//     --sd-row-stripe:rgba(255,255,255,0.03);
//   }
//   .sd-root[data-theme="console"] .sd-pcard{
//     border-left:2px solid var(--sd-rust);
//     box-shadow:-12px 0 24px -18px var(--sd-rust);
//   }
//   .sd-root[data-theme="console"] .sd-thead{ color:var(--sd-paper); }
//   .sd-root[data-theme="console"] .sd-trow{ border-color:rgba(255,255,255,0.08); color:var(--sd-ink); }
//   .sd-root[data-theme="console"] .sd-corner{ border-color:var(--sd-rust); opacity:0.8; }
//   .sd-root[data-theme="console"] .sd-eyebrow::before{ content:"$ "; opacity:0.6; }
//   .sd-root[data-theme="console"] .layout-bg .sd-bg-overlay{
//     background:linear-gradient(0deg, rgba(8,9,8,0.92) 0%, rgba(8,9,8,0.6) 45%, rgba(8,9,8,0.2) 75%);
//   }

//   /* ============================================================
//      THEME: blueprint — technical drawing language. Pale grid paper,
//      dashed frame, registration mark, condensed mono labels, outline
//      badges, sheet-style numbering and dashed card dividers.
//      ============================================================ */
//   .sd-root[data-theme="blueprint"]{
//     --sd-ink:#13233f;
//     --sd-paper:#eef2f6;
//     --sd-rust:#ff7a1a;
//     --sd-accent-2:#13233f;
//     --sd-muted: rgba(19,35,63,0.6);

//     --sd-display-font:'Archivo Narrow', 'Arial Narrow', sans-serif;
//     --sd-body-font:'Archivo Narrow', 'Arial Narrow', sans-serif;
//     --sd-label-font:'JetBrains Mono', 'SFMono-Regular', Menlo, monospace;

//     --sd-title-weight:700;
//     --sd-title-tracking:0px;
//     --sd-title-transform:none;

//     --sd-frame-style:dashed;
//     --sd-frame-color:rgba(19,35,63,0.45);
//     --sd-regmark-display:block;

//     --sd-card-bg:transparent;
//     --sd-card-border:1px solid rgba(19,35,63,0.3);
//     --sd-card-accent:none;
//     --sd-badge-radius:4px;
//     --sd-badge-bg:transparent;
//     --sd-rule-bg:#13233f;
//     --sd-row-stripe:rgba(19,35,63,0.045);

//     --sd-bg-pattern:
//       repeating-linear-gradient(0deg, rgba(19,35,63,0.07) 0px, rgba(19,35,63,0.07) 1px, transparent 1px, transparent 32px),
//       repeating-linear-gradient(90deg, rgba(19,35,63,0.07) 0px, rgba(19,35,63,0.07) 1px, transparent 1px, transparent 32px);
//     --sd-bg-pattern-opacity:1;
//   }
//   .sd-root[data-theme="blueprint"] .sd-icon-badge{
//     border:1.5px solid var(--sd-rust);
//   }
//   .sd-root[data-theme="blueprint"] .sd-icon-badge svg,
//   .sd-root[data-theme="blueprint"] .sd-icon-badge iconify-icon,
//   .sd-root[data-theme="blueprint"] .sd-icon-badge [class*="iconify"]{
//     color:var(--sd-rust) !important;
//   }
//   .sd-root[data-theme="blueprint"] .sd-pcard{
//     border-top:1px dashed var(--sd-rust);
//   }
//   .sd-root[data-theme="blueprint"] .sd-thead{
//     background:transparent; color:var(--sd-ink);
//     border-bottom:1.5px solid var(--sd-ink);
//   }
//   .sd-root[data-theme="blueprint"] .sd-trow{ border-color:rgba(19,35,63,0.25); }
//   .sd-root[data-theme="blueprint"] .sd-footer-r::after{ content:" — SHEET"; opacity:0.6; }
//   .sd-root[data-theme="blueprint"] .layout-bg .sd-bg-overlay{
//     background:linear-gradient(0deg, rgba(10,16,28,0.9) 0%, rgba(10,16,28,0.55) 45%, rgba(10,16,28,0.15) 75%);
//   }

//   /* ============================================================
//      THEME: studio — warm, playful zine layout. No hairline frame;
//      rounded sticker cards alternate tilt and accent color, badges
//      are soft rounded squares, page numbers get a marker-pen font.
//      ============================================================ */
//   .sd-root[data-theme="studio"]{
//     --sd-ink:#2b1810;
//     --sd-paper:#fbeee2;
//     --sd-rust:#ef5b6e;
//     --sd-accent-2:#e8a33d;
//     --sd-muted: rgba(43,24,16,0.62);

//     --sd-display-font:'Poppins', 'Segoe UI', sans-serif;
//     --sd-body-font:'Poppins', 'Segoe UI', sans-serif;
//     --sd-label-font:'Poppins', 'Segoe UI', sans-serif;

//     --sd-title-weight:700;
//     --sd-title-tracking:-0.5px;
//     --sd-title-transform:none;

//     --sd-frame-display:none;

//     --sd-card-bg:#ffffff;
//     --sd-card-border:none;
//     --sd-card-radius:18px;
//     --sd-card-shadow:0 14px 30px -16px rgba(43,24,16,0.35);
//     --sd-card-accent:6px solid var(--sd-rust);
//     --sd-card-rotate:-1deg;

//     --sd-badge-radius:28%;
//     --sd-rule-bg:var(--sd-ink);
//     --sd-row-stripe:rgba(43,24,16,0.04);
//   }
//   .sd-root[data-theme="studio"] .sd-card-row .sd-pcard:nth-child(2){ --sd-rust:#e8a33d; border-top-color:#e8a33d; }
//   .sd-root[data-theme="studio"] .sd-card-row .sd-pcard:nth-child(3){ --sd-rust:#5ea88c; border-top-color:#5ea88c; }
//   .sd-root[data-theme="studio"] .sd-thead{ border-radius:10px 10px 0 0; }
//   .sd-root[data-theme="studio"] .sd-trow:last-child{ border-radius:0 0 10px 10px; }
//   .sd-root[data-theme="studio"] .sd-footer-r{
//     font-family:'Permanent Marker', cursive; font-size:16px; letter-spacing:0; text-transform:none; opacity:0.85;
//   }
//   .sd-root[data-theme="studio"] .layout-bg .sd-bg-overlay{
//     background:linear-gradient(0deg, rgba(43,24,16,0.85) 0%, rgba(43,24,16,0.5) 45%, rgba(43,24,16,0.1) 75%);
//   }

//   @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Archivo+Narrow:wght@500;600;700&family=Poppins:wght@400;600;700;800&family=Permanent+Marker&display=swap');
// `;



import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import PptxGenJS from "pptxgenjs";
import html2canvas from "html2canvas-pro";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


/* ============================================================
   Types — mirrors the deck JSON schema as a discriminated union
   on `type`, so each slide's `content` shape is checked at
   compile time.
   ============================================================ */

export type VisualType = "image" | "icon" | "none";
export type VisualPlacement = "background" | "right" | "left" | "top";

export interface Visual {
  type: VisualType;
  query: string | null;
  resolved: string | null;
  placement: VisualPlacement;
}

export interface ParagraphCard {
  title: string;
  text: string;
}

export interface BulletCard {
  title: string;
  bullets: string[];
}

export interface TableColumn {
  header: string;
  items: string[];
}

export interface ParagraphSlide {
  type: "paragraph";
  title: string;
  visual: Visual;
  content: string[];
}

export interface BulletsSlide {
  type: "bullets_points";
  title: string;
  visual: Visual;
  content: string[];
}

export interface ParagraphCardsSlide {
  type: "2_paragraph_cards" | "3_paragraph_cards";
  title: string;
  visual: Visual;
  content: ParagraphCard[];
}

export interface BulletCardsSlide {
  type: "2_bullets_point_cards" | "3_bullets_point_cards";
  title: string;
  visual: Visual;
  content: BulletCard[];
}

export interface TableSlide {
  type: "table";
  title: string;
  visual: Visual;
  content: TableColumn[];
}

export type Slide =
  | ParagraphSlide
  | BulletsSlide
  | ParagraphCardsSlide
  | BulletCardsSlide
  | TableSlide;

export interface Deck {
  title: string;
  description?: string;
  slides: Slide[];
}

/* ============================================================
   Themes — each one is a full visual identity (type, shape,
   frame treatment, decoration), not just a recolor. Styling
   lives entirely in CSS, switched via a [data-theme] attribute,
   so the same JSX renders any theme.
   ============================================================ */

export type ThemeName = "editorial" | "console" | "blueprint" | "studio";

export interface ThemeMeta {
  id: ThemeName;
  label: string;
  /** Swatch shown on the theme-switcher button — illustrative only. */
  swatch: string;
}

export const THEME_META: ThemeMeta[] = [
  {
    id: "editorial",
    label: "Editorial",
    swatch: "linear-gradient(135deg, #f4f1ea 50%, #c1581f 50%)",
  },
  { id: "console", label: "Console", swatch: "linear-gradient(135deg, #0c0e0c 50%, #ff6a3d 50%)" },
  {
    id: "blueprint",
    label: "Blueprint",
    swatch: "linear-gradient(135deg, #eef2f6 50%, #ff7a1a 50%)",
  },
  { id: "studio", label: "Studio", swatch: "linear-gradient(135deg, #fbeee2 50%, #ef5b6e 50%)" },
];

/* ============================================================
   Constants
   ============================================================ */

const SLIDE_W = 1280;
const SLIDE_H = 720;

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const typeLabel = (t: string) => t.replace(/_/g, " ");

/* ============================================================
   Icon badge — thin wrapper so size/color stay consistent
   ============================================================ */

const IconBadge: React.FC<{
  icon: string | null;
  size: number;
  className?: string;
}> = ({ icon, size, className }) => {
  if (!icon) return null;
  return (
    <div className={`sd-icon-badge ${className ?? ""}`} style={{ width: size, height: size }}>
      <Icon icon={icon} style={{ fontSize: size * 0.45, color: "var(--sd-paper)" }} />
    </div>
  );
};

/* ============================================================
   Slide chrome — eyebrow / index / footer shared by every type
   ============================================================ */

const SlideChrome: React.FC<{
  deckTitle: string;
  type: string;
  index: number;
  total: number;
  isDark: boolean;
}> = ({ deckTitle, type, index, total, isDark }) => (
  <>
    <div className={`sd-border ${isDark ? "is-dark" : ""}`} />

    {/* Theme-only decoration. Hidden by default in CSS; specific themes
        turn these on and style them — same markup, different skin. */}
    <span className="sd-corner tl" />
    <span className="sd-corner tr" />
    <span className="sd-corner bl" />
    <span className="sd-corner br" />
    <span className="sd-regmark" />

    <div className={`sd-index ${isDark ? "is-dark" : ""}`}>
      {pad(index + 1)} / {pad(total)}
      <span className="sd-cursor" />
    </div>
    <div className={`sd-footer-l ${isDark ? "is-dark" : ""}`}>{deckTitle}</div>
    <div className={`sd-footer-r ${isDark ? "is-dark" : ""}`}>
      {pad(index + 1)} / {pad(total)}
    </div>
  </>
);

/* ============================================================
   Per-type slide views
   ============================================================ */

const getLayoutClass = (visual?: Visual) => {
  if (!visual || visual.type !== "image") return "";
  if (visual.placement === "background") return "layout-bg";
  if (visual.placement === "left") return "layout-side layout-side-left";
  if (visual.placement === "top") return "layout-top";
  return "layout-side layout-side-right";
};

const VisualRenderer: React.FC<{ visual?: Visual }> = ({ visual }) => {
  const [error, setError] = useState(false);
  if (!visual || visual.type !== "image" || !visual.resolved || error) return null;
  
  const handleErr = () => setError(true);
  const Tracker = <img src={visual.resolved} alt="" onError={handleErr} style={{ display: 'none' }} aria-hidden="true" />;

  if (visual.placement === "background") {
    return (
      <>
        {Tracker}
        <div className="sd-bg-photo" style={{ backgroundImage: `url('${visual.resolved}')` }} role="img" aria-label="Slide background image" />
        <div className="sd-bg-overlay" />
      </>
    );
  }
  if (visual.placement === "left") {
    return (
      <>
        {Tracker}
        <div className="sd-side-photo left" style={{ backgroundImage: `url('${visual.resolved}')` }} role="img" aria-label="Slide side image" />
      </>
    );
  }
  if (visual.placement === "top") {
    return (
      <>
        {Tracker}
        <div className="sd-top-photo" style={{ backgroundImage: `url('${visual.resolved}')` }} role="img" aria-label="Slide top image" />
      </>
    );
  }
  return (
    <>
      {Tracker}
      <div className="sd-side-photo right" style={{ backgroundImage: `url('${visual.resolved}')` }} role="img" aria-label="Slide side image" />
    </>
  );
};

const ParagraphView: React.FC<{ slide: ParagraphSlide }> = React.memo(({ slide }) => {
  const { visual, title, content } = slide;
  const text = (Array.isArray(content) ? content[0] : content) || "";

  return (
    <div className={`sd-type-paragraph ${getLayoutClass(visual)}`}>
      <VisualRenderer visual={visual} />
      <h1 className="sd-slide-title">{title || ""}</h1>
      <div className="sd-content-area">
        <p className="sd-body-text">{text}</p>
      </div>
    </div>
  );
});

const BulletsView: React.FC<{ slide: BulletsSlide }> = React.memo(({ slide }) => {
  const hasIcon = slide?.visual?.type === "icon";
  const bullets = Array.isArray(slide.content) ? slide.content : [];
  return (
    <div className={`sd-type-bullets ${getLayoutClass(slide.visual)}`}>
      <VisualRenderer visual={slide.visual} />
      <h1 className="sd-slide-title">{slide.title || ""}</h1>
      <div className="sd-content-area">
        <ul className="sd-bullet-list">
          {bullets.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
      {hasIcon && (
        <IconBadge icon={slide.visual.resolved} size={160} className="sd-bullets-icon" />
      )}
    </div>
  );
});

const ParagraphCardsView: React.FC<{ slide: ParagraphCardsSlide }> = React.memo(({ slide }) => {
  const hasIcon = slide?.visual?.type === "icon";
  const cards = Array.isArray(slide.content) ? slide.content : [];
  return (
    <div className={`sd-type-cards ${hasIcon ? "has-icon" : ""} ${getLayoutClass(slide.visual)}`}>
      <VisualRenderer visual={slide.visual} />
      {hasIcon && <IconBadge icon={slide.visual.resolved} size={56} className="sd-cards-icon" />}
      <h1 className="sd-slide-title">{slide.title || ""}</h1>
      <div className="sd-card-row">
        {cards.map((card, i) => (
          <div className="sd-pcard" key={i}>
            <h3>{card?.title || ""}</h3>
            <p>{card?.text || ""}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

const BulletCardsView: React.FC<{ slide: BulletCardsSlide }> = React.memo(({ slide }) => {
  const hasIcon = slide?.visual?.type === "icon";
  const cards = Array.isArray(slide.content) ? slide.content : [];
  return (
    <div className={`sd-type-cards ${hasIcon ? "has-icon" : ""} ${getLayoutClass(slide.visual)}`}>
      <VisualRenderer visual={slide.visual} />
      {hasIcon && <IconBadge icon={slide.visual.resolved} size={56} className="sd-cards-icon" />}
      <h1 className="sd-slide-title">{slide.title || ""}</h1>
      <div className="sd-card-row">
        {cards.map((card, i) => (
          <div className="sd-pcard" key={i}>
            <h3>{card?.title || ""}</h3>
            <ul>
              {Array.isArray(card?.bullets) ? card.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              )) : null}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
});

const TableView: React.FC<{ slide: TableSlide }> = React.memo(({ slide }) => {
  const cols = Array.isArray(slide.content) ? slide.content : [];
  return (
    <div className={`sd-type-table ${getLayoutClass(slide.visual)}`}>
      <VisualRenderer visual={slide.visual} />
      <h1 className="sd-slide-title">{slide.title || ""}</h1>
      <div className="sd-content-area">
        {cols.map((col, i) => (
          <div className="sd-tcol" key={i}>
            <div className="sd-thead">{col?.header || ""}</div>
            {Array.isArray(col?.items) ? col.items.map((item, j) => (
              <div className="sd-trow" key={j}>
                {item}
              </div>
            )) : null}
          </div>
        ))}
      </div>
    </div>
  );
});

/* ============================================================
   Slide dispatcher
   ============================================================ */

const SlideBody: React.FC<{ slide: Slide }> = ({ slide }) => {
  if (!slide || !slide.type) {
    return (
      <div className="sd-type-paragraph">
        <h1 className="sd-slide-title">Unknown Content</h1>
        <div className="sd-content-area">
          <p className="sd-body-text">This slide failed to load correctly.</p>
        </div>
      </div>
    );
  }

  switch (slide.type) {
    case "paragraph":
      return <ParagraphView slide={slide as ParagraphSlide} />;
    case "bullets_points":
      return <BulletsView slide={slide as BulletsSlide} />;
    case "2_paragraph_cards":
    case "3_paragraph_cards":
      return <ParagraphCardsView slide={slide as ParagraphCardsSlide} />;
    case "2_bullets_point_cards":
    case "3_bullets_point_cards":
      return <BulletCardsView slide={slide as BulletCardsSlide} />;
    case "table":
      return <TableView slide={slide as TableSlide} />;
    default:
      return (
        <div className="sd-type-paragraph">
          <h1 className="sd-slide-title">Unsupported slide type</h1>
          <div className="sd-content-area">
            <p className="sd-body-text">The requested slide type ({(slide as any).type}) is not supported by this viewer.</p>
          </div>
        </div>
      );
  }
};

const isDarkSlide = (slide: Slide): boolean =>
  slide && slide.type === "paragraph" &&
  slide.visual.type === "image" &&
  slide.visual.placement === "background";

/* ============================================================
   SlideDeck — main component
   ============================================================ */

export interface SlideDeckProps {
  deck: Deck;
  /** Start on this slide index (default 0) */
  initialIndex?: number;
  /** Initial/controlled theme (default "editorial") */
  theme?: ThemeName;
  /** Fired when the person picks a different theme from the switcher */
  onThemeChange?: (theme: ThemeName) => void;
  /** Hide the built-in theme switcher pills in the control bar */
  hideThemeSwitcher?: boolean;
}

const SlideDeck: React.FC<SlideDeckProps> = ({
  deck,
  initialIndex = 0,
  theme = "editorial",
  onThemeChange,
  hideThemeSwitcher = false,
}) => {
  const [current, setCurrent] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(deck.slides.length - 1, 0)),
  );
  const [scale, setScale] = useState(1);
  const [exporting, setExporting] = useState<"pdf" | "pptx" | null>(null);
  const [themeName, setThemeName] = useState<ThemeName>(theme);
  const stageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Present mode: fullscreen the whole component and auto-hide the
  // control bar after a moment of inactivity, like a real presenter view.
  const [isPresenting, setIsPresenting] = useState(false);
  const [controlsHidden, setControlsHidden] = useState(false);

  // Stay in sync if the caller controls `theme` from outside.
  useEffect(() => setThemeName(theme), [theme]);

  const selectTheme = useCallback(
    (t: ThemeName) => {
      setThemeName(t);
      onThemeChange?.(t);
    },
    [onThemeChange],
  );

  // Hidden, full-resolution (unscaled) copies of every slide, used only as
  // a capture source for export. Kept off-screen rather than display:none
  // so the browser still lays them out and paints images/icons into them.
  const exportNodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const total = deck.slides.length;
  const slide = deck.slides[current];

  // Fit the fixed 1280x720 canvas to the viewport, like object-fit: contain
  // on an image — only the zoom level changes, never the layout.
  useEffect(() => {
    const fit = () => {
      const el = stageRef.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / SLIDE_W, height / SLIDE_H));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  const goTo = useCallback((i: number) => setCurrent(((i % total) + total) % total), [total]);
  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  const enterPresent = useCallback(async () => {
    const el = containerRef.current as any;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (err) {
      console.error("Couldn't enter fullscreen:", err);
    }
  }, []);

  const exitPresent = useCallback(() => {
    const doc = document as any;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
    }
  }, []);

  const togglePresent = useCallback(() => {
    if (isPresenting) exitPresent();
    else enterPresent();
  }, [isPresenting, enterPresent, exitPresent]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (exporting) return;
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "f" || e.key === "F") togglePresent();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, exporting, togglePresent]);

  // Keep state in sync with real fullscreen status — covers the browser's
  // own Escape-to-exit, not just our button.
  useEffect(() => {
    const onFsChange = () => {
      const doc = document as any;
      setIsPresenting(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  // While presenting, fade the control bar out after a moment of no
  // mouse/keyboard activity, and bring it back on the next movement.
  useEffect(() => {
    if (!isPresenting) {
      setControlsHidden(false);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      setControlsHidden(false);
      clearTimeout(timer);
      timer = setTimeout(() => setControlsHidden(true), 2500);
    };
    reset();
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [isPresenting]);

  const dark = useMemo(() => isDarkSlide(slide), [slide]);

  // Renders every slide (hidden, at native 1280x720) to a PNG data URL,
  // in order. Used as the shared source for both PDF and PPTX export so
  // the exported file matches what's on screen pixel-for-pixel.
  const captureSlideImages = useCallback(async (): Promise<string[]> => {
    // Give any in-flight icon/image fetches in the hidden copies a moment
    // to resolve before we start snapshotting.
    await new Promise((r) => setTimeout(r, 300));

    const images: string[] = [];
    for (const node of exportNodeRefs.current) {
      if (!node) continue;
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f4f1ea",
        width: SLIDE_W,
        height: SLIDE_H,
      });
      images.push(canvas.toDataURL("image/png"));
    }
    return images;
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (exporting) return;
    setExporting("pdf");
    toast.info("Preparing PDF export... this might take a moment.");
    try {
      const images = await captureSlideImages();
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [SLIDE_W, SLIDE_H],
      });
      images.forEach((img, i) => {
        if (i > 0) pdf.addPage([SLIDE_W, SLIDE_H], "landscape");
        pdf.addImage(img, "PNG", 0, 0, SLIDE_W, SLIDE_H);
      });
      pdf.save(`${deck.title || "deck"}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("PDF export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  }, [captureSlideImages, deck.title, exporting]);

  const handleExportPPTX = useCallback(async () => {
    if (exporting) return;
    setExporting("pptx");
    toast.info("Preparing PPTX export... this might take a moment.");
    try {
      const images = await captureSlideImages();
      const pptx = new PptxGenJS();
      pptx.defineLayout({ name: "DECK_16x9", width: 13.333, height: 7.5 });
      pptx.layout = "DECK_16x9";
      images.forEach((img) => {
        const s = pptx.addSlide();
        s.addImage({ data: img, x: 0, y: 0, w: 13.333, h: 7.5 });
      });
      await pptx.writeFile({ fileName: `${deck.title || "deck"}.pptx` });
      toast.success("PPTX exported successfully!");
    } catch (err) {
      console.error("PPTX export failed:", err);
      toast.error("PPTX export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  }, [captureSlideImages, deck.title, exporting]);

  if (!slide) {
    return <div className="sd-empty">No slides in deck.</div>;
  }

  return (
    <div className="sd-root" data-theme={themeName} ref={containerRef}>
      <style>{DECK_STYLES}</style>

      <div className="sd-stage" ref={stageRef}>
        <div className="sd-slide" style={{ transform: `scale(${scale})` }} key={current}>
          <SlideChrome
            deckTitle={deck.title}
            type={slide.type}
            index={current}
            total={total}
            isDark={dark}
          />
          <SlideBody slide={slide} />
        </div>

        <button className="sd-nav-zone left" aria-label="Previous slide" onClick={prev} />
        <button className="sd-nav-zone right" aria-label="Next slide" onClick={next} />
      </div>

      <div className={`sd-controls ${controlsHidden ? "idle-hidden" : ""}`}>
        {/* Navigation - always visible */}
        <button onClick={prev} aria-label="Previous" disabled={!!exporting}>
          <Icon icon="lucide:chevron-left" />
        </button>
        
        {/* Dots - only on larger screens */}
        <div className="sd-dots-desktop">
          {deck.slides.map((_, i) => (
            <div
              key={i}
              className={`sd-dot ${i === current ? "active" : ""}`}
              onClick={() => !exporting && goTo(i)}
            />
          ))}
        </div>

        <button onClick={next} aria-label="Next" disabled={!!exporting}>
          <Icon icon="lucide:chevron-right" />
        </button>

        <span className="sd-counter">
          {pad(current + 1)} / {pad(total)}
        </span>

        {/* Divider - hidden on small screens */}
        <div className="sd-divider" />

        {/* Theme Switcher - only on larger screens */}
        {!isPresenting && !hideThemeSwitcher && (
          <>
            {/* Desktop: show swatches directly */}
            <div className="sd-theme-switcher-desktop">
              {THEME_META.map((t) => (
                <button
                  key={t.id}
                  className={`sd-theme-swatch ${themeName === t.id ? "active" : ""}`}
                  style={{ background: t.swatch }}
                  onClick={() => selectTheme(t.id)}
                  disabled={!!exporting}
                  title={t.label}
                  aria-label={`Switch to ${t.label} theme`}
                />
              ))}
            </div>

            {/* Mobile: dropdown with icons */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="sd-control-btn sd-theme-btn-mobile" disabled={!!exporting}>
                  <Icon icon="lucide:palette" className="sd-control-icon" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="sd-dropdown-content" align="end">
                {THEME_META.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    className={`sd-dropdown-item ${themeName === t.id ? "active" : ""}`}
                    onClick={() => selectTheme(t.id)}
                  >
                    <span className="sd-dropdown-swatch" style={{ background: t.swatch }} />
                    <span>{t.label}</span>
                    {themeName === t.id && (
                      <Icon icon="lucide:check" className="sd-dropdown-check" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {/* Divider - hidden on small screens */}
        <div className="sd-divider" />

        {/* Present button - always visible */}
        <button
          className="sd-control-btn"
          onClick={togglePresent}
          aria-label={isPresenting ? "Exit presentation" : "Present"}
          title={isPresenting ? "Exit presentation (Esc)" : "Present fullscreen (F)"}
        >
          <Icon icon={isPresenting ? "lucide:minimize" : "lucide:maximize"} />
          <span className="sd-btn-label">{isPresenting ? "Exit" : "Present"}</span>
        </button>

        {/* Divider - hidden on small screens */}
        <div className="sd-divider" />

        {/* Export dropdown - always visible */}
        {!isPresenting && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="sd-control-btn" disabled={!!exporting}>
                {exporting ? (
                  <Icon icon="lucide:loader-2" className="sd-spin" />
                ) : (
                  <Icon icon="lucide:download" />
                )}
                <span className="sd-btn-label">Export</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="sd-dropdown-content" align="end">
              <DropdownMenuItem
                className="sd-dropdown-item"
                onClick={handleExportPDF}
                disabled={!!exporting}
              >
                <Icon icon="lucide:file-text" />
                <span>PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="sd-dropdown-item"
                onClick={handleExportPPTX}
                disabled={!!exporting}
              >
                <Icon icon="lucide:presentation" />
                <span>PowerPoint</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Off-screen, full-resolution render of every slide — the source
          html2canvas captures from for both export formats. */}
      <div className="sd-export-source" aria-hidden="true">
        {deck.slides.map((s, i) => (
          <div
            key={i}
            className="sd-slide"
            ref={(el) => {
              exportNodeRefs.current[i] = el;
            }}
          >
            <SlideChrome
              deckTitle={deck.title}
              type={s.type}
              index={i}
              total={total}
              isDark={isDarkSlide(s)}
            />
            <SlideBody slide={s} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideDeck;

/* ============================================================
   Styles — design tokens + layout for every slide type.
   Kept as one template literal so this file is a drop-in,
   dependency-free (besides @iconify/react) single component.
   ============================================================ */

const DECK_STYLES = `
  .sd-root{
    --sd-ink:#1c1b19;
    --sd-paper:#f4f1ea;
    --sd-rust:#c1581f;
    --sd-accent-2:#1c1b19;
    --sd-muted: rgba(28,27,25,0.62);

    --sd-display-font:'Helvetica Neue', Arial, sans-serif;
    --sd-body-font:'Helvetica Neue', Arial, sans-serif;
    --sd-label-font:'Helvetica Neue', Arial, sans-serif;

    --sd-title-weight:800;
    --sd-title-tracking:-1px;
    --sd-title-transform:none;

    --sd-frame-display:block;
    --sd-frame-style:solid;
    --sd-frame-width:2px;
    --sd-frame-color:var(--sd-ink);

    --sd-card-bg:#ffffff;
    --sd-card-border:1px solid rgba(28,27,25,0.12);
    --sd-card-radius:0px;
    --sd-card-shadow:none;
    --sd-card-accent:4px solid var(--sd-rust);
    --sd-card-rotate:0deg;

    --sd-badge-radius:50%;
    --sd-badge-bg:var(--sd-rust);

    --sd-rule-bg:var(--sd-ink);
    --sd-row-stripe:rgba(28,27,25,0.035);

    --sd-corner-display:none;
    --sd-cursor-display:none;
    --sd-regmark-display:none;
    --sd-bg-pattern:none;
    --sd-bg-pattern-opacity:0;

    width:100%;
    height:100%;
    background:#0e0d0c;
    font-family:var(--sd-body-font);
    position:relative;
    overflow:hidden;
    border-radius:20px;
    display:flex;
    flex-direction:column;
  }
  /* Edge-to-edge once real browser fullscreen kicks in for Present mode. */
  .sd-root:fullscreen, .sd-root:-webkit-full-screen{ border-radius:0; }

  .sd-stage{
    width:100%;
    flex:1;
    min-height:0;
    display:flex;
    align-items:center;
    justify-content:center;
    position:relative;
    padding:8px 8px 76px;
  }
  .sd-root:fullscreen .sd-stage, .sd-root:-webkit-full-screen .sd-stage{ padding-bottom:8px; }

  .sd-slide{
    width:${SLIDE_W}px;
    height:${SLIDE_H}px;
    flex-shrink:0;
    transform-origin:center center;
    background:var(--sd-paper);
    color:var(--sd-ink);
    position:relative;
    overflow:hidden;
    border-radius:10px;
    box-shadow:0 24px 60px -20px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.25);
    transition:background-color 0.35s ease, color 0.35s ease;
    animation:sd-slide-in 0.22s ease both;
  }
  .sd-root:fullscreen .sd-slide, .sd-root:-webkit-full-screen .sd-slide{
    border-radius:0; box-shadow:none;
  }
  .sd-export-source .sd-slide{ border-radius:0 !important; box-shadow:none !important; animation:none !important; }

  /* Only opacity animates here — transform is driven by the inline
     scale-to-fit style, so the keyframe leaves it alone. */
  @keyframes sd-slide-in{
    from{ opacity:0; }
    to{ opacity:1; }
  }
  .sd-slide::after{
    content:"";
    position:absolute; inset:0; z-index:0; pointer-events:none;
    background-image:var(--sd-bg-pattern);
    opacity:var(--sd-bg-pattern-opacity);
  }

  .sd-border{
    position:absolute; inset:32px;
    border:var(--sd-frame-width) var(--sd-frame-style) var(--sd-frame-color);
    display:var(--sd-frame-display);
    pointer-events:none; z-index:5;
  }
  .sd-border.is-dark{ border-color:rgba(244,241,234,0.7); }

  /* viewfinder-style corner marks, used by console/blueprint themes */
  .sd-corner{
    position:absolute; width:22px; height:22px;
    display:var(--sd-corner-display);
    z-index:5; pointer-events:none;
    border-color:var(--sd-rust);
  }
  .sd-corner.tl{ top:32px; left:32px; border-top:2px solid; border-left:2px solid; }
  .sd-corner.tr{ top:32px; right:32px; border-top:2px solid; border-right:2px solid; }
  .sd-corner.bl{ bottom:32px; left:32px; border-bottom:2px solid; border-left:2px solid; }
  .sd-corner.br{ bottom:32px; right:32px; border-bottom:2px solid; border-right:2px solid; }

  /* registration-mark glyph, used by the blueprint theme */
  .sd-regmark{
    position:absolute; top:40px; left:80px;
    display:var(--sd-regmark-display);
    font-size:16px; color:var(--sd-rust); z-index:6;
  }
  .sd-regmark::before{ content:"⌖"; }

  /* blinking cursor glyph after the page index, used by the console theme */
  .sd-cursor{
    display:var(--sd-cursor-display);
    margin-left:4px;
  }
  .sd-cursor::before{
    content:"_"; animation: sd-blink 1s step-end infinite;
  }
  @keyframes sd-blink{ 50%{ opacity:0; } }

  .sd-eyebrow{
    position:absolute; top:72px; left:80px;
    font-family:var(--sd-label-font);
    font-size:13px; letter-spacing:4px; font-weight:700;
    text-transform:uppercase; color:var(--sd-rust); z-index:6;
  }
  .sd-eyebrow.is-dark{ color:#f2a36a; }

  .sd-index{
    position:absolute; top:72px; right:80px;
    font-family:var(--sd-label-font);
    font-size:13px; letter-spacing:2px; font-weight:600;
    color:var(--sd-ink); opacity:0.55; z-index:6;
  }
  .sd-index.is-dark{ color:#f4f1ea; opacity:0.85; }

  .sd-footer-l{
    position:absolute; left:80px; bottom:48px;
    font-family:var(--sd-label-font);
    font-size:12px; letter-spacing:2px; font-weight:600;
    text-transform:uppercase; opacity:0.55; z-index:6; color:var(--sd-ink);
  }
  .sd-footer-r{
    position:absolute; right:80px; bottom:48px;
    font-family:var(--sd-label-font);
    font-size:12px; letter-spacing:2px; font-weight:600;
    text-transform:uppercase; opacity:0.55; z-index:6; color:var(--sd-ink);
  }
  .sd-footer-l.is-dark, .sd-footer-r.is-dark{ color:#f4f1ea; opacity:0.8; }

  .sd-slide-title{
    position:absolute; left:80px; top:130px; width:1080px;
    font-family:var(--sd-display-font);
    font-size:48px; font-weight:var(--sd-title-weight);
    letter-spacing:var(--sd-title-tracking);
    text-transform:var(--sd-title-transform);
    line-height:1.05; z-index:6; margin:0;
  }

  .sd-icon-badge{
    border-radius:var(--sd-badge-radius); background:var(--sd-badge-bg);
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  }

  /* paragraph */
  .sd-type-paragraph .sd-content-area{
    position:absolute; left:80px; right:80px; top:230px; bottom:96px;
  }
  .layout-bg .sd-slide-title { top: auto; bottom: 260px; z-index: 2; }
  .layout-bg .sd-content-area, .layout-bg .sd-card-row{
    left:80px; right:80px; top:auto; bottom:96px; height:auto; z-index: 2;
  }
  .sd-body-text{ font-family:var(--sd-body-font); font-size:24px; line-height:1.6; font-weight:400; max-width:760px; margin:0; }
  .layout-bg .sd-body-text{ max-width:880px; }

  .sd-bg-photo{ position:absolute; inset:0; background-size:cover; background-position:center; z-index:0; }
  .sd-bg-overlay{
    position:absolute; inset:0; z-index:1;
    background:linear-gradient(0deg, rgba(14,13,12,0.88) 0%, rgba(14,13,12,0.55) 45%, rgba(14,13,12,0.15) 75%);
  }
  .layout-bg .sd-slide-title,
  .layout-bg .sd-body-text, .layout-bg h3, .layout-bg p, .layout-bg li, .layout-bg .sd-thead, .layout-bg .sd-trow { color:#f4f1ea !important; border-color: rgba(244,241,234,0.3) !important; }

  .sd-side-photo{ position:absolute; top:0; bottom:0; background-size:cover; background-position:center; z-index:0; }
  .sd-side-photo.right{ right:0; width:560px; }
  .sd-side-photo.left{ left:0; width:560px; }
  .sd-top-photo{ position:absolute; top:0; left:0; right:0; height:320px; background-size:cover; background-position:center; z-index:0; }

  .layout-side.layout-side-right .sd-slide-title{ width:540px; }
  .layout-side.layout-side-right .sd-content-area, .layout-side.layout-side-right .sd-card-row{ right:auto; width:520px; }
  .layout-side.layout-side-left .sd-slide-title{ width:540px; left:auto; right:80px; }
  .layout-side.layout-side-left .sd-content-area, .layout-side.layout-side-left .sd-card-row{ left:auto; right:80px; width:520px; }

  .layout-top .sd-slide-title{ top: 350px; }
  .layout-top .sd-content-area, .layout-top .sd-card-row{ top: 430px; bottom: 80px; height:auto; }

  /* bullets_points */
  .sd-type-bullets .sd-content-area{ position:absolute; left:80px; top:230px; width:680px; }
  .sd-bullets-icon{ position:absolute; right:120px; top:260px; }
  .sd-bullet-list{ list-style:none; margin:0; padding:0; font-family:var(--sd-body-font); }
  .sd-bullet-list li{
    position:relative; padding-left:30px; margin-bottom:24px;
    font-size:22px; line-height:1.5; font-weight:400;
  }
  .sd-bullet-list li::before{
    content:""; position:absolute; left:0; top:11px; width:16px; height:3px; background:var(--sd-rust);
  }

  /* N_paragraph_cards / bullet cards */
  .sd-cards-icon{ position:absolute; left:80px; top:72px; }
  .sd-type-cards.has-icon .sd-slide-title{ left:152px; top:80px; font-size:36px; width:900px; }
  .sd-type-cards.has-icon .sd-eyebrow, .sd-type-cards.has-icon .sd-index{ display:none; }

  .sd-card-row{ position:absolute; left:80px; right:80px; top:230px; bottom:110px; display:flex; gap:28px; }
  .sd-pcard{
    flex:1; background:var(--sd-card-bg); border:var(--sd-card-border);
    border-radius:var(--sd-card-radius); box-shadow:var(--sd-card-shadow);
    border-top:var(--sd-card-accent); padding:32px 28px; display:flex; flex-direction:column;
    transform:rotate(var(--sd-card-rotate));
  }
  .sd-card-row .sd-pcard:nth-child(even){ transform:rotate(calc(var(--sd-card-rotate) * -1)); }
  .sd-pcard h3{ font-family:var(--sd-display-font); font-size:20px; font-weight:700; margin:0 0 14px; letter-spacing:-0.2px; }
  .sd-pcard p{ font-family:var(--sd-body-font); font-size:17px; line-height:1.55; color:var(--sd-muted); font-weight:400; margin:0; }
  .sd-pcard ul{ list-style:none; margin:0; padding:0; font-family:var(--sd-body-font); }
  .sd-pcard ul li{ position:relative; padding-left:22px; margin-bottom:12px; font-size:16px; line-height:1.5; }
  .sd-pcard ul li::before{
    content:""; position:absolute; left:0; top:9px; width:10px; height:2px; background:var(--sd-rust);
  }

  /* table */
  .sd-type-table .sd-content-area{
    position:absolute; left:80px; right:80px; top:230px; bottom:96px; display:flex; gap:28px;
  }
  .sd-tcol{ flex:1; }
  .sd-thead{
    background:var(--sd-rule-bg); color:var(--sd-paper);
    font-family:var(--sd-label-font);
    font-size:14px; letter-spacing:1.5px; font-weight:700; text-transform:uppercase; padding:16px 22px;
  }
  .sd-trow{
    font-family:var(--sd-body-font);
    padding:18px 22px; border:1px solid rgba(28,27,25,0.14); border-top:none;
    font-size:17px; line-height:1.5; font-weight:400;
  }
  .sd-trow:nth-child(even){ background:var(--sd-row-stripe); }

  /* nav + controls */
  .sd-nav-zone{
    position:absolute; top:0; bottom:0; width:18%; z-index:50;
    cursor:pointer; background:transparent; border:none; padding:0;
  }
  .sd-nav-zone.left{ left:0; }
  .sd-nav-zone.right{ right:0; }

  /* Fixed to viewport like version 1 */
  .sd-controls{
    position:fixed; bottom:18px; left:50%; transform:translateX(-50%);
    display:flex; align-items:center; gap:6px; z-index:100;
    background:rgba(20,19,18,0.65); backdrop-filter:blur(12px);
    padding:8px 14px; border-radius:999px;
    transition:opacity 0.35s ease, transform 0.35s ease;
    opacity:1;
    border:1px solid rgba(255,255,255,0.08);
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
  }

  /* Responsive control bar */
  @media (max-width: 768px) {
    .sd-controls {
      gap:4px;
      padding:6px 10px;
      bottom:12px;
      border-radius:40px;
    }
    .sd-controls button {
      width:28px;
      height:28px;
      font-size:14px;
    }
    .sd-dots-desktop {
      display: none !important;
    }
    .sd-theme-switcher-desktop {
      display: none !important;
    }
    .sd-theme-btn-mobile {
      display: flex !important;
    }
    .sd-divider {
      display: none !important;
    }
    .sd-btn-label {
      display: none !important;
    }
    .sd-counter {
      font-size:11px;
      min-width:40px;
    }
    .sd-control-btn {
      width:28px !important;
      height:28px !important;
      padding:0 !important;
    }
  }

  @media (min-width: 769px) {
    .sd-theme-btn-mobile {
      display: none !important;
    }
    .sd-controls {
      gap:10px;
      padding:10px 22px;
    }
    .sd-controls button {
      width:32px;
      height:32px;
    }
    .sd-divider {
      width:1px;
      height:22px;
      background:rgba(244,241,234,0.15);
    }
    .sd-btn-label {
      display: inline;
    }
    .sd-control-btn {
      width:auto !important;
      height:32px !important;
      padding:0 14px !important;
      gap:6px;
      font-size:12px;
      letter-spacing:0.3px;
      font-weight:500;
      border-radius:999px !important;
    }
    .sd-control-btn span {
      line-height:1;
    }
  }

  .sd-controls.idle-hidden{
    opacity:0; pointer-events:none;
    transform:translateX(-50%) translateY(14px);
  }

  .sd-controls button,
  .sd-control-btn {
    border:1px solid rgba(244,241,234,0.15);
    background:rgba(244,241,234,0.06);
    color:#f4f1ea;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    transition:all 0.2s ease;
    border-radius:50%;
    font-size:15px;
    flex-shrink:0;
  }
  .sd-controls button:hover,
  .sd-control-btn:hover {
    background:rgba(244,241,234,0.15);
    border-color:rgba(244,241,234,0.3);
    transform:scale(1.05);
  }
  .sd-controls button:active,
  .sd-control-btn:active {
    transform:scale(0.95);
  }
  .sd-controls button:disabled,
  .sd-control-btn:disabled {
    opacity:0.4;
    cursor:default;
    transform:none !important;
  }
  .sd-controls button:disabled:hover,
  .sd-control-btn:disabled:hover {
    background:rgba(244,241,234,0.06);
    border-color:rgba(244,241,234,0.15);
  }

  .sd-dots-desktop {
    display:flex;
    gap:5px;
    margin:0 2px;
  }
  .sd-dot{
    width:6px;
    height:6px;
    border-radius:50%;
    background:rgba(244,241,234,0.25);
    cursor:pointer;
    transition:all 0.25s ease;
  }
  .sd-dot:hover {
    background:rgba(244,241,234,0.5);
    transform:scale(1.2);
  }
  .sd-dot.active {
    background:#f2a36a;
    transform:scale(1.3);
    box-shadow:0 0 12px rgba(242,163,106,0.3);
  }

  .sd-counter {
    color:#f4f1ea;
    font-size:12px;
    letter-spacing:1px;
    min-width:48px;
    text-align:center;
    opacity:0.75;
    font-weight:500;
    flex-shrink:0;
  }

  .sd-theme-switcher-desktop {
    display:flex;
    align-items:center;
    gap:5px;
  }
  .sd-theme-swatch{
    width:22px !important;
    height:22px !important;
    border-radius:50% !important;
    padding:0 !important;
    border:2px solid rgba(244,241,234,0.2) !important;
    background-clip:padding-box;
    transition:all 0.25s ease;
    flex-shrink:0;
  }
  .sd-theme-swatch:hover {
    transform:scale(1.15);
    border-color:rgba(244,241,234,0.5) !important;
  }
  .sd-theme-swatch.active {
    border-color:#f4f1ea !important;
    transform:scale(1.15);
    box-shadow:0 0 20px rgba(242,163,106,0.2);
  }
  .sd-theme-swatch:disabled {
    opacity:0.4;
    cursor:default;
    transform:none !important;
  }

  /* Dropdown styles */
  .sd-dropdown-content {
    background:rgba(20,19,18,0.92) !important;
    backdrop-filter:blur(16px) !important;
    border:1px solid rgba(255,255,255,0.08) !important;
    border-radius:12px !important;
    padding:6px !important;
    min-width:160px !important;
    box-shadow:0 16px 48px rgba(0,0,0,0.6) !important;
  }
  .sd-dropdown-item {
    color:#f4f1ea !important;
    padding:8px 12px !important;
    border-radius:8px !important;
    cursor:pointer !important;
    display:flex !important;
    align-items:center !important;
    gap:10px !important;
    font-size:13px !important;
    font-weight:500 !important;
    transition:all 0.15s ease !important;
  }
  .sd-dropdown-item:hover {
    background:rgba(255,255,255,0.08) !important;
  }
  .sd-dropdown-item.active {
    background:rgba(242,163,106,0.12) !important;
    color:#f2a36a !important;
  }
  .sd-dropdown-item:disabled {
    opacity:0.4 !important;
    cursor:default !important;
  }
  .sd-dropdown-swatch {
    width:18px !important;
    height:18px !important;
    border-radius:50% !important;
    flex-shrink:0 !important;
    border:1px solid rgba(255,255,255,0.1) !important;
  }
  .sd-dropdown-check {
    margin-left:auto !important;
    width:16px !important;
    height:16px !important;
  }

  .sd-spin {
    animation: sd-spin-rotate 0.8s linear infinite;
  }
  @keyframes sd-spin-rotate {
    to { transform:rotate(360deg); }
  }

  /* Off-screen capture source: real layout/paint, just parked outside
     the viewport so it never appears in the visible UI. */
  .sd-export-source{
    position:fixed;
    top:0;
    left:-100000px;
    width:${SLIDE_W}px;
    pointer-events:none;
  }
  .sd-export-source .sd-slide {
    transform:none;
    margin-bottom:1px;
  }

  .sd-empty {
    color:#f4f1ea;
    padding:40px;
    font-family:'Helvetica Neue', Arial, sans-serif;
  }

  /* ============================================================
     THEME: editorial (default) — warm broadsheet. Hairline frame,
     Helvetica, circular rust badges, flat white cards. This is the
     baseline the tokens above already encode, so no overrides needed.
     ============================================================ */

  /* ============================================================
     THEME: console — dark dev-tool aesthetic for technical decks.
     Monospace labels, viewfinder corner brackets instead of a frame,
     a blinking cursor after the page index, square outline badges,
     borderless ghost cards with a glowing left rule.
     ============================================================ */
  .sd-root[data-theme="console"]{
    --sd-ink:#eef1ee;
    --sd-paper:#101210;
    --sd-rust:#ff6a3d;
    --sd-accent-2:#5ee6c8;
    --sd-muted: rgba(238,241,238,0.6);

    --sd-display-font:'Space Grotesk', 'Inter', -apple-system, sans-serif;
    --sd-body-font:'Inter', -apple-system, sans-serif;
    --sd-label-font:'JetBrains Mono', 'SFMono-Regular', Menlo, monospace;

    --sd-title-weight:600;
    --sd-title-tracking:-0.5px;
    --sd-title-transform:none;

    --sd-frame-display:none;
    --sd-corner-display:block;
    --sd-cursor-display:inline-block;

    --sd-card-bg:rgba(255,255,255,0.03);
    --sd-card-border:1px solid rgba(255,255,255,0.1);
    --sd-card-radius:2px;
    --sd-card-accent:none;
    --sd-badge-radius:6px;
    --sd-rule-bg:rgba(255,255,255,0.08);
    --sd-row-stripe:rgba(255,255,255,0.03);
  }
  .sd-root[data-theme="console"] .sd-pcard{
    border-left:2px solid var(--sd-rust);
    box-shadow:-12px 0 24px -18px var(--sd-rust);
  }
  .sd-root[data-theme="console"] .sd-thead{ color:var(--sd-paper); }
  .sd-root[data-theme="console"] .sd-trow{ border-color:rgba(255,255,255,0.08); color:var(--sd-ink); }
  .sd-root[data-theme="console"] .sd-corner{ border-color:var(--sd-rust); opacity:0.8; }
  .sd-root[data-theme="console"] .sd-eyebrow::before{ content:"$ "; opacity:0.6; }
  .sd-root[data-theme="console"] .layout-bg .sd-bg-overlay{
    background:linear-gradient(0deg, rgba(8,9,8,0.92) 0%, rgba(8,9,8,0.6) 45%, rgba(8,9,8,0.2) 75%);
  }

  /* ============================================================
     THEME: blueprint — technical drawing language. Pale grid paper,
     dashed frame, registration mark, condensed mono labels, outline
     badges, sheet-style numbering and dashed card dividers.
     ============================================================ */
  .sd-root[data-theme="blueprint"]{
    --sd-ink:#13233f;
    --sd-paper:#eef2f6;
    --sd-rust:#ff7a1a;
    --sd-accent-2:#13233f;
    --sd-muted: rgba(19,35,63,0.6);

    --sd-display-font:'Archivo Narrow', 'Arial Narrow', sans-serif;
    --sd-body-font:'Archivo Narrow', 'Arial Narrow', sans-serif;
    --sd-label-font:'JetBrains Mono', 'SFMono-Regular', Menlo, monospace;

    --sd-title-weight:700;
    --sd-title-tracking:0px;
    --sd-title-transform:none;

    --sd-frame-style:dashed;
    --sd-frame-color:rgba(19,35,63,0.45);
    --sd-regmark-display:block;

    --sd-card-bg:transparent;
    --sd-card-border:1px solid rgba(19,35,63,0.3);
    --sd-card-accent:none;
    --sd-badge-radius:4px;
    --sd-badge-bg:transparent;
    --sd-rule-bg:#13233f;
    --sd-row-stripe:rgba(19,35,63,0.045);

    --sd-bg-pattern:
      repeating-linear-gradient(0deg, rgba(19,35,63,0.07) 0px, rgba(19,35,63,0.07) 1px, transparent 1px, transparent 32px),
      repeating-linear-gradient(90deg, rgba(19,35,63,0.07) 0px, rgba(19,35,63,0.07) 1px, transparent 1px, transparent 32px);
    --sd-bg-pattern-opacity:1;
  }
  .sd-root[data-theme="blueprint"] .sd-icon-badge{
    border:1.5px solid var(--sd-rust);
  }
  .sd-root[data-theme="blueprint"] .sd-icon-badge svg,
  .sd-root[data-theme="blueprint"] .sd-icon-badge iconify-icon,
  .sd-root[data-theme="blueprint"] .sd-icon-badge [class*="iconify"]{
    color:var(--sd-rust) !important;
  }
  .sd-root[data-theme="blueprint"] .sd-pcard{
    border-top:1px dashed var(--sd-rust);
  }
  .sd-root[data-theme="blueprint"] .sd-thead{
    background:transparent; color:var(--sd-ink);
    border-bottom:1.5px solid var(--sd-ink);
  }
  .sd-root[data-theme="blueprint"] .sd-trow{ border-color:rgba(19,35,63,0.25); }
  .sd-root[data-theme="blueprint"] .sd-footer-r::after{ content:" — SHEET"; opacity:0.6; }
  .sd-root[data-theme="blueprint"] .layout-bg .sd-bg-overlay{
    background:linear-gradient(0deg, rgba(10,16,28,0.9) 0%, rgba(10,16,28,0.55) 45%, rgba(10,16,28,0.15) 75%);
  }

  /* ============================================================
     THEME: studio — warm, playful zine layout. No hairline frame;
     rounded sticker cards alternate tilt and accent color, badges
     are soft rounded squares, page numbers get a marker-pen font.
     ============================================================ */
  .sd-root[data-theme="studio"]{
    --sd-ink:#2b1810;
    --sd-paper:#fbeee2;
    --sd-rust:#ef5b6e;
    --sd-accent-2:#e8a33d;
    --sd-muted: rgba(43,24,16,0.62);

    --sd-display-font:'Poppins', 'Segoe UI', sans-serif;
    --sd-body-font:'Poppins', 'Segoe UI', sans-serif;
    --sd-label-font:'Poppins', 'Segoe UI', sans-serif;

    --sd-title-weight:700;
    --sd-title-tracking:-0.5px;
    --sd-title-transform:none;

    --sd-frame-display:none;

    --sd-card-bg:#ffffff;
    --sd-card-border:none;
    --sd-card-radius:18px;
    --sd-card-shadow:0 14px 30px -16px rgba(43,24,16,0.35);
    --sd-card-accent:6px solid var(--sd-rust);
    --sd-card-rotate:-1deg;

    --sd-badge-radius:28%;
    --sd-rule-bg:var(--sd-ink);
    --sd-row-stripe:rgba(43,24,16,0.04);
  }
  .sd-root[data-theme="studio"] .sd-card-row .sd-pcard:nth-child(2){ --sd-rust:#e8a33d; border-top-color:#e8a33d; }
  .sd-root[data-theme="studio"] .sd-card-row .sd-pcard:nth-child(3){ --sd-rust:#5ea88c; border-top-color:#5ea88c; }
  .sd-root[data-theme="studio"] .sd-thead{ border-radius:10px 10px 0 0; }
  .sd-root[data-theme="studio"] .sd-trow:last-child{ border-radius:0 0 10px 10px; }
  .sd-root[data-theme="studio"] .sd-footer-r{
    font-family:'Permanent Marker', cursive; font-size:16px; letter-spacing:0; text-transform:none; opacity:0.85;
  }
  .sd-root[data-theme="studio"] .layout-bg .sd-bg-overlay{
    background:linear-gradient(0deg, rgba(43,24,16,0.85) 0%, rgba(43,24,16,0.5) 45%, rgba(43,24,16,0.1) 75%);
  }

  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Archivo+Narrow:wght@500;600;700&family=Poppins:wght@400;600;700;800&family=Permanent+Marker&display=swap');
`;
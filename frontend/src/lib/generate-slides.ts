// ============================================================
// generateSlides.ts
// Converts structured slide JSON into polished HTML + Tailwind CSS
// ============================================================

// ─── Types ───────────────────────────────────────────────────

export type SlideType =
  | "paragraph"
  | "bullets_points"
  | "2_paragraph_cards"
  | "2_bullets_point_cards"
  | "3_paragraph_cards"
  | "3_bullets_point_cards"
  | "table";

export type Theme = "corporate" | "dark_neon" | "editorial" | "glassmorphism" | "brutalist";

interface ParagraphCard {
  title: string;
  text: string;
}

interface BulletsCard {
  title: string;
  bullets: string[];
}

interface TableColumn {
  header: string;
  items: string[];
}

export interface Slide {
  title: string;
  type: SlideType;
  content: string[] | ParagraphCard[] | BulletsCard[] | TableColumn[];
}

export interface SlideData {
  title: string;
  slides: Slide[];
}

export interface GeneratedSlide {
  title: string;
  type: SlideType;
  html: string;
}

// ─── Theme Configs ────────────────────────────────────────────

interface ThemeConfig {
  /** Wrapper div classes applied to every slide */
  slide: string;
  /** The slide title element */
  slideTitle: string;
  /** Single paragraph block */
  paragraph: string;
  /** UL wrapper for bullet lists */
  bulletList: string;
  /** Individual LI for bullets */
  bulletItem: string;
  /** Bullet icon/marker (raw HTML) */
  bulletIcon: string;
  /** Grid wrapper for 2-col cards */
  grid2: string;
  /** Grid wrapper for 3-col cards */
  grid3: string;
  /** A generic card shell */
  card: string;
  /** Card inner title */
  cardTitle: string;
  /** Card inner body text */
  cardText: string;
  /** Table <table> element */
  table: string;
  /** Table <thead> */
  thead: string;
  /** Table <th> */
  th: string;
  /** Table <tr> on even rows */
  trEven: string;
  /** Table <tr> on odd rows */
  trOdd: string;
  /** Table <td> */
  td: string;
  /** Accent bar shown under the slide title (raw HTML, or empty string) */
  accentBar: string;
  /** Google Fonts <link> tag(s) to inject once */
  fontLink: string;
  /** Any extra <style> block (e.g. custom keyframes) */
  extraStyles: string;
}

// ─── 1. CORPORATE ─────────────────────────────────────────────
// Clean white canvas, Inter/DM Sans, strong column grid, sky-blue accent
const corporateTheme: ThemeConfig = {
  fontLink: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">`,
  extraStyles: `
    .corp-slide * { font-family: 'Inter', sans-serif; }
    .corp-accent-bar { background: linear-gradient(90deg,#0ea5e9,#6366f1); }
  `,
  slide:
    "corp-slide bg-white rounded-2xl shadow-xl border border-slate-100 p-10 flex flex-col gap-6 min-h-[380px]",
  slideTitle: "text-2xl font-extrabold tracking-tight text-slate-900 leading-tight",
  accentBar: `<div class="corp-accent-bar h-1 w-16 rounded-full mt-1 mb-2"></div>`,
  paragraph: "text-slate-600 text-base leading-relaxed font-medium",
  bulletList: "flex flex-col gap-2 mt-1",
  bulletItem: "flex items-start gap-3 text-slate-700 text-sm font-medium leading-snug",
  bulletIcon: `<span class="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center"><svg class="w-3 h-3 text-sky-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></span>`,
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-5 mt-1",
  grid3: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-1",
  card: "bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200",
  cardTitle: "text-sm font-bold text-sky-700 uppercase tracking-widest",
  cardText: "text-slate-600 text-sm leading-relaxed",
  table: "w-full border-collapse text-sm mt-1",
  thead: "",
  th: "text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-sky-700 border-b-2 border-sky-200 bg-sky-50",
  trEven: "bg-white",
  trOdd: "bg-slate-50",
  td: "py-3 px-4 text-slate-600 text-sm border-b border-slate-100",
};

// ─── 2. DARK NEON ──────────────────────────────────────────────
// Near-black background, electric cyan + violet, glowing cards, Space Grotesk
const darkNeonTheme: ThemeConfig = {
  fontLink: `<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">`,
  extraStyles: `
    .neon-slide * { font-family: 'Space Grotesk', sans-serif; }
    .neon-card { border: 1px solid rgba(6,182,212,0.25); background: rgba(255,255,255,0.04); backdrop-filter: blur(8px); }
    .neon-card:hover { border-color: rgba(6,182,212,0.7); box-shadow: 0 0 18px rgba(6,182,212,0.25); }
    .neon-th { border-bottom: 1px solid rgba(6,182,212,0.3); }
    .neon-tr-even { background: rgba(255,255,255,0.03); }
    .neon-tr-odd  { background: rgba(6,182,212,0.05); }
    .neon-bullet-icon { background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.4); }
    @keyframes neon-pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
    .neon-accent-line { background: linear-gradient(90deg,#06b6d4,#8b5cf6); animation: neon-pulse 3s ease-in-out infinite; }
  `,
  slide:
    "neon-slide bg-[#0d1117] rounded-2xl border border-[#1e2a3a] shadow-2xl p-10 flex flex-col gap-6 min-h-[380px]",
  slideTitle: "text-2xl font-bold tracking-tight text-white",
  accentBar: `<div class="neon-accent-line h-0.5 w-20 rounded-full mt-1 mb-2"></div>`,
  paragraph: "text-slate-300 text-base leading-relaxed",
  bulletList: "flex flex-col gap-2.5 mt-1",
  bulletItem: "flex items-start gap-3 text-slate-300 text-sm leading-snug",
  bulletIcon: `<span class="neon-bullet-icon mt-1 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-cyan-400 text-xs font-bold">›</span>`,
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-5 mt-1",
  grid3: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-1",
  card: "neon-card rounded-xl p-6 flex flex-col gap-3 transition-all duration-200",
  cardTitle: "text-xs font-bold text-cyan-400 uppercase tracking-[0.15em]",
  cardText: "text-slate-400 text-sm leading-relaxed",
  table: "w-full border-collapse text-sm mt-1",
  thead: "",
  th: "neon-th text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-cyan-400",
  trEven: "neon-tr-even",
  trOdd: "neon-tr-odd",
  td: "py-3 px-4 text-slate-400 text-sm border-b border-white/5",
};

// ─── 3. EDITORIAL ──────────────────────────────────────────────
// Newspaper grid, Playfair + DM Mono, ink tones, hairline rules
const editorialTheme: ThemeConfig = {
  fontLink: `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:wght@400;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">`,
  extraStyles: `
    .ed-slide { font-family: 'Source Serif 4', serif; }
    .ed-slide-title { font-family: 'Playfair Display', serif; }
    .ed-mono { font-family: 'DM Mono', monospace; }
    .ed-rule { border-top: 1px solid #1a1a1a; }
    .ed-thick-rule { border-top: 3px solid #1a1a1a; }
    .ed-card { border-left: 3px solid #1a1a1a; }
    .ed-card:hover { border-left-color: #b45309; background:#fffbf5; }
    .ed-th-rule { border-bottom: 2px solid #1a1a1a; }
    .ed-tr-even { background: #fff; }
    .ed-tr-odd  { background: #f9f6f0; }
  `,
  slide:
    "ed-slide bg-[#faf7f2] rounded-none border border-[#1a1a1a] shadow-none p-10 flex flex-col gap-5 min-h-[380px]",
  slideTitle: "ed-slide-title text-3xl font-black text-[#1a1a1a] leading-tight",
  accentBar: `<div class="ed-thick-rule w-full mt-2 mb-1"></div>`,
  paragraph: "text-[#2d2d2d] text-base leading-[1.8] tracking-[0.01em]",
  bulletList: "flex flex-col gap-0 mt-1 border-t border-[#1a1a1a]",
  bulletItem:
    "flex items-start gap-4 text-[#2d2d2d] text-sm leading-snug py-2.5 border-b border-[#e5e0d8]",
  bulletIcon: `<span class="ed-mono flex-shrink-0 text-[#b45309] font-bold text-xs mt-0.5">—</span>`,
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-0 mt-2 border-t border-[#1a1a1a]",
  grid3: "grid grid-cols-1 md:grid-cols-3 gap-0 mt-2 border-t border-[#1a1a1a]",
  card: "ed-card bg-transparent p-5 flex flex-col gap-3 border-b border-r border-[#1a1a1a] transition-colors duration-200",
  cardTitle: "ed-mono text-[10px] font-bold text-[#b45309] uppercase tracking-[0.2em]",
  cardText: "text-[#2d2d2d] text-sm leading-[1.7]",
  table: "w-full border-collapse text-sm mt-2",
  thead: "border-b-2 border-[#1a1a1a]",
  th: "ed-mono ed-th-rule text-left py-3 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b45309]",
  trEven: "ed-tr-even",
  trOdd: "ed-tr-odd",
  td: "py-3 px-4 text-[#2d2d2d] text-sm border-b border-[#e5e0d8]",
};

// ─── 4. GLASSMORPHISM ──────────────────────────────────────────
// Colorful gradient backdrop captured in card glass, Nunito, soft blurs
const glassmorphismTheme: ThemeConfig = {
  fontLink: `<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">`,
  extraStyles: `
    .glass-slide * { font-family: 'Nunito', sans-serif; }
    .glass-slide {
      background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 40%,#ec4899 100%);
    }
    .glass-inner {
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 16px;
    }
    .glass-card {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.35);
      transition: background 0.2s;
    }
    .glass-card:hover { background: rgba(255,255,255,0.25); }
    .glass-bullet-icon { background: rgba(255,255,255,0.25); }
    .glass-tr-even { background: rgba(255,255,255,0.08); }
    .glass-tr-odd  { background: rgba(255,255,255,0.15); }
  `,
  slide: "glass-slide rounded-3xl p-3 shadow-2xl min-h-[380px]",
  slideTitle: "text-2xl font-black text-white drop-shadow-sm tracking-tight",
  accentBar: `<div class="h-0.5 w-14 bg-white/50 rounded-full mt-1 mb-2"></div>`,
  paragraph: "text-white/90 text-base leading-relaxed font-semibold",
  bulletList: "flex flex-col gap-2 mt-1",
  bulletItem: "flex items-start gap-3 text-white/90 text-sm font-semibold leading-snug",
  bulletIcon: `<span class="glass-bullet-icon mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black">✓</span>`,
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-1",
  grid3: "grid grid-cols-1 md:grid-cols-3 gap-3 mt-1",
  card: "glass-card rounded-2xl p-5 flex flex-col gap-3",
  cardTitle: "text-xs font-black text-white uppercase tracking-widest",
  cardText: "text-white/80 text-sm leading-relaxed font-medium",
  table: "w-full border-collapse text-sm mt-1",
  thead: "",
  th: "text-left py-3 px-4 text-xs font-black uppercase tracking-widest text-white/70 border-b border-white/20",
  trEven: "glass-tr-even",
  trOdd: "glass-tr-odd",
  td: "py-3 px-4 text-white/85 text-sm border-b border-white/10 font-medium",
  // wrap children in a glass inner div
};

// ─── 5. BRUTALIST ──────────────────────────────────────────────
// Stark white + black, ultra-thick borders, oversized type, raw energy
const brutalistTheme: ThemeConfig = {
  fontLink: `<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;700&family=IBM+Plex+Sans:wght@400;700&display=swap" rel="stylesheet">`,
  extraStyles: `
    .brut-slide * { font-family: 'IBM Plex Sans', sans-serif; }
    .brut-title { font-family: 'Bebas Neue', cursive; letter-spacing:0.05em; }
    .brut-mono { font-family: 'IBM Plex Mono', monospace; }
    .brut-card {
      border: 3px solid #000;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .brut-card:hover {
      transform: translate(-3px,-3px);
      box-shadow: 6px 6px 0 #000;
    }
    .brut-accent { background: #facc15; }
    .brut-tr-even { background: #fff; }
    .brut-tr-odd  { background: #fef9c3; }
  `,
  slide:
    "brut-slide bg-white border-4 border-black shadow-[8px_8px_0_#000] rounded-none p-10 flex flex-col gap-6 min-h-[380px]",
  slideTitle: "brut-title text-5xl text-black leading-none",
  accentBar: `<div class="brut-accent h-2 w-full mt-0 mb-2"></div>`,
  paragraph: "text-black text-base leading-relaxed font-medium max-w-prose",
  bulletList: "flex flex-col gap-0 mt-1",
  bulletItem: "flex items-start gap-4 text-black text-sm font-bold border-b-2 border-black py-2.5",
  bulletIcon: `<span class="brut-mono flex-shrink-0 bg-black text-white px-1 text-xs font-bold">→</span>`,
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-1",
  grid3: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-1",
  card: "brut-card bg-white p-5 flex flex-col gap-3",
  cardTitle:
    "brut-mono text-[11px] font-bold text-black uppercase tracking-[0.15em] border-b-2 border-black pb-2",
  cardText: "text-black text-sm leading-relaxed",
  table: "w-full border-collapse text-sm mt-1 border-2 border-black",
  thead: "bg-black",
  th: "brut-mono text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-white border-r border-white/20",
  trEven: "brut-tr-even",
  trOdd: "brut-tr-odd",
  td: "py-3 px-4 text-black text-sm border border-black",
};

const THEMES: Record<Theme, ThemeConfig> = {
  corporate: corporateTheme,
  dark_neon: darkNeonTheme,
  editorial: editorialTheme,
  glassmorphism: glassmorphismTheme,
  brutalist: brutalistTheme,
};

// ─── Helpers ──────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Glassmorphism wraps content in an inner frosted panel */
function wrapGlass(inner: string, isGlass: boolean): string {
  if (!isGlass) return inner;
  return `<div class="glass-inner p-8 flex flex-col gap-5 h-full">${inner}</div>`;
}

// ─── Content Renderers ────────────────────────────────────────

function renderParagraph(content: string[], t: ThemeConfig): string {
  return content.map((p) => `<p class="${t.paragraph}">${esc(p)}</p>`).join("\n");
}

function renderBullets(content: string[], t: ThemeConfig): string {
  const items = content
    .map((b) => `<li class="${t.bulletItem}">${t.bulletIcon}<span>${esc(b)}</span></li>`)
    .join("\n");
  return `<ul class="${t.bulletList}">${items}</ul>`;
}

function renderParagraphCards(content: ParagraphCard[], t: ThemeConfig): string {
  const cards = content
    .map(
      (c) => `
      <div class="${t.card}">
        <p class="${t.cardTitle}">${esc(c.title)}</p>
        <p class="${t.cardText}">${esc(c.text)}</p>
      </div>`,
    )
    .join("\n");
  const grid = content.length === 2 ? t.grid2 : t.grid3;
  return `<div class="${grid}">${cards}</div>`;
}

function renderBulletsCards(content: BulletsCard[], t: ThemeConfig): string {
  const cards = content
    .map((c) => {
      const bullets = c.bullets
        .map((b) => `<li class="${t.bulletItem}">${t.bulletIcon}<span>${esc(b)}</span></li>`)
        .join("\n");
      return `
        <div class="${t.card}">
          <p class="${t.cardTitle}">${esc(c.title)}</p>
          <ul class="${t.bulletList}">${bullets}</ul>
        </div>`;
    })
    .join("\n");
  const grid = content.length === 2 ? t.grid2 : t.grid3;
  return `<div class="${grid}">${cards}</div>`;
}

function renderTable(columns: TableColumn[], t: ThemeConfig): string {
  const rowCount = columns[0]?.items?.length ?? 0;
  const headers = columns.map((c) => `<th class="${t.th}">${esc(c.header)}</th>`).join("");

  const rows = Array.from({ length: rowCount }, (_, i) => {
    const rowClass = i % 2 === 0 ? t.trEven : t.trOdd;
    const cells = columns.map((c) => `<td class="${t.td}">${esc(c.items[i] ?? "")}</td>`).join("");
    return `<tr class="${rowClass}">${cells}</tr>`;
  }).join("\n");

  return `
    <div class="overflow-x-auto mt-1 rounded-lg overflow-hidden">
      <table class="${t.table}">
        <thead class="${t.thead}"><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ─── Main Renderer ────────────────────────────────────────────

function renderSlideContent(slide: Slide, t: ThemeConfig): string {
  switch (slide.type) {
    case "paragraph":
      return renderParagraph(slide.content as string[], t);
    case "bullets_points":
      return renderBullets(slide.content as string[], t);
    case "2_paragraph_cards":
    case "3_paragraph_cards":
      return renderParagraphCards(slide.content as ParagraphCard[], t);
    case "2_bullets_point_cards":
    case "3_bullets_point_cards":
      return renderBulletsCards(slide.content as BulletsCard[], t);
    case "table":
      return renderTable(slide.content as TableColumn[], t);
    default:
      return `<p class="text-red-500">Unknown slide type: ${esc((slide as Slide).type)}</p>`;
  }
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Converts structured slide data into polished HTML strings.
 *
 * @param data   - The slide deck data object
 * @param theme  - One of: 'corporate' | 'dark_neon' | 'editorial' | 'glassmorphism' | 'brutalist'
 * @returns      - Array of { title, type, html } objects ready to render
 *
 * @example
 * const slides = generateSlides(data, 'dark_neon');
 * slides.forEach(s => {
 *   document.getElementById('deck').innerHTML += s.html;
 * });
 */
export function generateSlides(data: SlideData, theme: Theme = "corporate"): GeneratedSlide[] {
  const t = THEMES[theme];
  const isGlass = theme === "glassmorphism";

  return data.slides.map((slide): GeneratedSlide => {
    const contentHtml = renderSlideContent(slide, t);
    const titleHtml = `<h2 class="${t.slideTitle}">${esc(slide.title)}</h2>${t.accentBar}`;
    const innerBody = `${titleHtml}${contentHtml}`;
    const body = wrapGlass(innerBody, isGlass);

    const html = `<div class="${t.slide}">${body}</div>`;
    return { title: slide.title, type: slide.type, html };
  });
}

/**
 * Returns a self-contained HTML page string for the entire deck,
 * including Tailwind CDN, Google Fonts, and all slides.
 *
 * @param data  - The slide deck data object
 * @param theme - Visual theme to apply
 */
export function generateSlidesPage(data: SlideData, theme: Theme = "corporate"): string {
  const t = THEMES[theme];
  const slides = generateSlides(data, theme);
  const slidesHtml = slides.map((s) => s.html).join("\n");

  const bgMap: Record<Theme, string> = {
    corporate: "bg-slate-100",
    dark_neon: "bg-[#060a10]",
    editorial: "bg-[#ede8df]",
    glassmorphism: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
    brutalist: "bg-yellow-300",
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(data.title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${t.fontLink}
  <style>${t.extraStyles}</style>
</head>
<body class="${bgMap[theme]} min-h-screen py-12 px-4">
  <div class="max-w-4xl mx-auto flex flex-col gap-8">
    <header class="text-center mb-4">
      <h1 class="${theme === "brutalist" ? "brut-title text-6xl text-black" : theme === "editorial" ? "ed-slide-title text-5xl font-black text-[#1a1a1a]" : "text-3xl font-black text-white"}">${esc(data.title)}</h1>
    </header>
    ${slidesHtml}
  </div>
</body>
</html>`;
}

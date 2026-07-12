export type SourceKind = "pdf" | "url" | "youtube" | "note" | "audio" | "doc" | "csv";

export interface Source {
  id: string;
  kind: SourceKind;
  title: string;
  meta: string;
  excerpt: string;
  tag?: string;
  url?: string;
  markdown?: string;
  /** Page-by-page text content for PDF/DOCX-style previews */
  pdfPages?: string[];
  /** Raw CSV text used for tabular previews */
  csv?: string;
}

export interface Notebook {
  id: string;
  title: string;
  emoji: string;
  description: string;
  sources: number;
  updated: string;
  tags: string[];
  collaborators: { name: string; color: string }[];
  pinned?: boolean;
  gradient: string;
}

export interface Citation {
  id: string;
  sourceId: string;
  sourceTitle: string;
  page?: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

export const notebooks: Notebook[] = [
  {
    id: "nb-neural-arch",
    title: "Neural Architecture Search",
    emoji: "◐",
    description: "Survey of efficient NAS, sparse attention, and scaling laws.",
    sources: 14,
    updated: "2h ago",
    tags: ["AI", "Research", "ML"],
    collaborators: [
      { name: "Ada Lovelace", color: "var(--primary)" },
      { name: "Mira Chen", color: "var(--accent-blue)" },
      { name: "Joon Park", color: "var(--accent-pink)" },
    ],
    pinned: true,
    gradient: "from-primary/30 via-accent-blue/20 to-accent-pink/30",
  },
  {
    id: "nb-climate",
    title: "Climate Adaptation Strategies",
    emoji: "◑",
    description: "City-level resilience playbooks across 12 metros.",
    sources: 28,
    updated: "Yesterday",
    tags: ["Policy", "Climate"],
    collaborators: [
      { name: "Sara Iyer", color: "var(--accent-mint)" },
      { name: "Tom Vega", color: "var(--accent-blue)" },
    ],
    pinned: true,
    gradient: "from-accent-mint/30 via-accent-blue/20 to-primary/20",
  },
  {
    id: "nb-thesis",
    title: "Thesis: Memory & Attention",
    emoji: "✦",
    description: "Working memory models in transformer-based agents.",
    sources: 41,
    updated: "3d ago",
    tags: ["Thesis", "Cognition"],
    collaborators: [{ name: "Ada Lovelace", color: "var(--primary)" }],
    gradient: "from-accent-pink/30 via-primary/20 to-accent-blue/20",
  },
  {
    id: "nb-product",
    title: "Q3 Product Discovery",
    emoji: "◇",
    description: "User interviews, market scans, competitive teardown.",
    sources: 22,
    updated: "5d ago",
    tags: ["Product", "Research"],
    collaborators: [
      { name: "Mira Chen", color: "var(--accent-blue)" },
      { name: "Joon Park", color: "var(--accent-pink)" },
      { name: "Sara Iyer", color: "var(--accent-mint)" },
    ],
    gradient: "from-accent-blue/30 via-primary/20 to-accent-mint/20",
  },
  {
    id: "nb-history",
    title: "History of Cryptography",
    emoji: "❉",
    description: "From Caesar shifts to post-quantum schemes.",
    sources: 18,
    updated: "1w ago",
    tags: ["History", "Math"],
    collaborators: [{ name: "Tom Vega", color: "var(--accent-blue)" }],
    gradient: "from-primary/20 via-accent-pink/20 to-accent-mint/20",
  },
  {
    id: "nb-bio",
    title: "Longevity Biology Reading List",
    emoji: "◈",
    description: "Senescence, autophagy, and pharmacological interventions.",
    sources: 31,
    updated: "2w ago",
    tags: ["Biology", "Health"],
    collaborators: [
      { name: "Sara Iyer", color: "var(--accent-mint)" },
      { name: "Ada Lovelace", color: "var(--primary)" },
    ],
    gradient: "from-accent-mint/30 via-primary/20 to-accent-pink/20",
  },
];

export const conversation: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "Summarize what my sources agree on about long-context attention.",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "Across the 7 sources, the consensus is that **transformer attention is converging on sparse and routed patterns** for long contexts. The Vaswani paper provides the dense baseline; the DeepMind report shows ~38% FLOP reduction with sparse routing; Karpathy's lecture frames why dense attention scales poorly past 32k tokens; and the Dr. Lin interview cautions that benchmark gains overstate real-world retrieval quality.",
    citations: [
      {
        id: "c1",
        sourceId: "src-7",
        sourceTitle: "Attention Is All You Need",
        page: "p. 4",
        snippet: "Scaled dot-product attention computes pairwise similarities across all tokens…",
      },
      {
        id: "c2",
        sourceId: "src-2",
        sourceTitle: "DeepMind — Sparse Attention at Scale",
        snippet: "Sparse routing yields a 38% FLOP reduction with negligible loss in fidelity.",
      },
      {
        id: "c3",
        sourceId: "src-5",
        sourceTitle: "Interview with Dr. Lin",
        page: "12:04",
        snippet: "Needle-in-haystack tests reward memorization, not structured retrieval.",
      },
    ]
  },
];




export function sourceIcon(kind: SourceKind): string {
  switch (kind) {
    case "pdf":
      return "PDF";
    case "url":
      return "WEB";
    case "youtube":
      return "YT";
    case "note":
      return "NOTE";
    case "audio":
      return "AUD";
    case "doc":
      return "DOC";
    case "csv":
      return "CSV";
  }
}

export function sourceAccent(kind: SourceKind): string {
  switch (kind) {
    case "pdf":
      return "text-primary";
    case "url":
      return "text-accent-blue";
    case "youtube":
      return "text-accent-pink";
    case "note":
      return "text-foreground/60";
    case "audio":
      return "text-accent-mint";
    case "doc":
      return "text-accent-blue";
    case "csv":
      return "text-accent-mint";
  }
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

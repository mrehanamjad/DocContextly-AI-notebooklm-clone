// Unified Response Wrappers
export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface APIErrorResponse {
  success: false;
  error_type: string;
  message: string;
  details: any | null;
}

// User / Session Types
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

// Notebook Types
export interface NotebookResponse {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  source_count: number;
  created_at: string;
  updated_at: string;
}

export interface NotebookListResponse {
  notebooks: NotebookResponse[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}

// Source Types
export type SourceStatus = "processing" | "ready" | "error";

export interface UploadSourceData {
  file_name?: string;
  file_type?: string;
  file_size_bytes?: number;
  imagekit_file_id?: string;
  imagekit_url?: string;
  thumbnail_url?: string | null | undefined;
}

export interface WebsiteSourceData {
  url: string;
  title: string;
  content: string;
  origin_topic_query?: string;
}

export interface YoutubeSourceData {
  url: string;
  title: string;
  content: string;
  embed_url: string;
  embed_html: string;
  thumbnail_url: string;
}


export interface NoteSourceData {
  content: string;
}

export interface BaseSourceResponse {
  id: string;
  notebook_id: string;
  user_id: string;
  source_id: string;
  title: string;
  status: SourceStatus;
  error_message?: string | null;
  total_chunks?: number;
  created_at: string;
  updated_at: string;
}

export type SourceResponse =
  | (BaseSourceResponse & { source_type: "upload"; source_data: UploadSourceData })
  | (BaseSourceResponse & { source_type: "website"; source_data: WebsiteSourceData })
  | (BaseSourceResponse & { source_type: "youtube"; source_data: YoutubeSourceData })
  | (BaseSourceResponse & { source_type: "note"; source_data: NoteSourceData });

export type SourceData = UploadSourceData | WebsiteSourceData | YoutubeSourceData | NoteSourceData;

export interface SourceUploadResponse {
  id: string;
  source_id: string;
  title: string;
  source_type: string;
  status: SourceStatus;
}

export interface SourceStatusResponse {
  source_id: string;
  status: SourceStatus;
  error_message?: string | null;
  total_chunks: number;
}

export interface SourceListResponse {
  sources: SourceResponse[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}

// Chat / Conversation Types
export interface ChatSessionResponse {
  id: string;
  notebook_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionListResponse {
  sessions: ChatSessionResponse[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}

export interface Citation {
  id: string;
  sourceId: string;
  sourceTitle: string;
  page?: string;
  snippet: string;
}

export interface BackendCitation {
  file_name: string;
  page_number: number;
  chunk_index: number;
  similarity_score: number;
  source_id: string;
  is_table: boolean;
  chunk_text: string;
}

export interface MessageResponse {
  id: string;
  session_id: string;
  content: string;
  role: "human" | "assistant";
  created_at: string;
  citations?: BackendCitation[];
  used_memory?: boolean;
}

export interface MessageListResponse {
  messages: MessageResponse[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}

export interface AskResponse {
  human_message: MessageResponse;
  assistant_message: MessageResponse;
}

export interface MemoryStatusResponse {
  session_id: string;
  total_messages: number;
  has_summary: boolean;
  summary_preview?: string | null;
}

// Artifact Types
export type ArtifactType =
  | "quiz"
  | "flashcards"
  | "faqs"
  | "study-guide"
  | "summary"
  | "mindmap"
  | "slide_deck"
  | "voice_overview"
  | "report"
  | "datatable";
export type ArtifactStatus = "processing" | "ready" | "error";

export interface ArtifactResponse {
  id: string;
  notebook_id: string;
  user_id: string;
  artifact_type: ArtifactType;
  status: ArtifactStatus;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options_json?: any;
  included_sources?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content_json: any; // Type varies by artifact_type
  // Only populated for voice_overview artifacts (surfaced from content_json.audio
  // by the backend's ArtifactResponse validator).
  audio_url?: string | null;
  audio_duration_seconds?: number | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

// Matches the backend's ArtifactShortResponse — what `GET /artifacts` (the list
// endpoint) actually returns for each item. It intentionally does NOT include
// content_json (only the detail endpoint, GET /artifacts/{id}, returns that).
export interface ArtifactShortResponse {
  id: string;
  notebook_id: string;
  user_id: string;
  artifact_type: ArtifactType;
  status: ArtifactStatus;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options_json?: any;
  created_at: string;
  updated_at: string;
}

export interface ArtifactListResponse {
  artifacts: ArtifactShortResponse[];
  total: number;
  size: number;
  page: number;
  has_more: boolean;
}

// Ingress Requests
export interface UserCreateReq {
  username: string;
  email: string;
  password?: string;
}

export interface UserLoginReq {
  email: string;
  password?: string;
}

export interface NotebookCreate {
  title: string;
  description?: string;
}

export interface NotebookUpdate {
  title?: string;
  description?: string;
}

export interface NoteCreateRequest {
  notebook_id: string;
  title: string;
  content: string;
}

export interface ChatSessionCreate {
  notebook_id: string;
  title?: string;
}

export interface MessageRequest {
  question: string;
  excluded_source_ids?: string[];
}

export interface BaseArtifactRequest {
  prompt?: string;
  excluded_source_ids?: string[];
}

export interface QuizCreateRequest extends BaseArtifactRequest {
  number_of_questions?: number;
  difficulty?: "easy" | "medium" | "hard" | "mix";
}

export interface FlashcardCreateRequest extends BaseArtifactRequest {
  number_of_cards?: number;
}

export interface FAQCreateRequest extends BaseArtifactRequest {
  number_of_faqs?: number;
}

export interface StudyGuideCreateRequest extends BaseArtifactRequest {
  size?: "short" | "medium" | "large";
}

export type SummaryCreateRequest = BaseArtifactRequest;
export type MindMapCreateRequest = BaseArtifactRequest;
export type ReportCreateRequest = BaseArtifactRequest;
export type DataTableCreateRequest = BaseArtifactRequest;

export interface SlideDeckCreateRequest extends BaseArtifactRequest {
  length?: "short" | "medium" | "long";
}

export interface VoiceOverviewCreateRequest extends BaseArtifactRequest {
  length?: "short" | "medium" | "long";
  voice_style?: "default" | "energetic" | "calm";
  host_names?: null;
}

// ------------------------------------------------------------
// Adapter / Mapper Utilities for Frontend Mismatches
// ------------------------------------------------------------

export interface FrontendQuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  sourceTitle: string;
}

export interface FrontendCitation {
  id: string;
  sourceId: string;
  sourceTitle: string;
  page?: string;
  snippet: string;
}

export interface FrontendSlide {
  id: string;
  layout:
    | "title"
    | "section"
    | "bullets"
    | "two-column"
    | "stats"
    | "quote"
    | "timeline"
    | "closing";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  columns?: { heading: string; body: string }[];
  stats?: {
    value: string;
    label: string;
    accent: "primary" | "accent-blue" | "accent-pink" | "accent-mint";
  }[];
  quote?: { text: string; attribution: string };
  steps?: { label: string; detail: string }[];
  sourceTitle?: string;
  notes: string;
}

export interface FrontendSlideDeck {
  id: string;
  title: string;
  subtitle: string;
  audience: string;
  tone: "Academic" | "Executive" | "Casual" | "Technical";
  length: "Short" | "Standard" | "Deep dive";
  slides: FrontendSlide[];
}

export interface FrontendChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: FrontendCitation[];
}

/**
 * Maps Backend QuizQuestion options mapping to Frontend structure
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptBackendQuizQuestionToFrontend(
  q: any,
  index: number,
  difficulty: "easy" | "medium" | "hard" = "medium",
): FrontendQuizQuestion {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const optionsText = Array.isArray(q.options)
    ? q.options.map((o: any) => (typeof o === "object" ? o.text : o))
    : [];

  let answerIndex = 0;
  if (Array.isArray(q.options)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const idx = q.options.findIndex(
      (o: any) =>
        o.id === q.answer || o.text === q.answer || (typeof o === "string" && o === q.answer),
    );
    if (idx !== -1) {
      answerIndex = idx;
    } else {
      const charIndex = ["A", "B", "C", "D", "E"].indexOf(String(q.answer).toUpperCase());
      if (charIndex !== -1 && charIndex < q.options.length) {
        answerIndex = charIndex;
      }
    }
  }

  return {
    id: q.id || `quiz-q-${index}`,
    question: q.question || "",
    options: optionsText,
    answerIndex,
    explanation: q.explanation || "",
    difficulty,
    sourceTitle: "Selected Sources",
  };
}

/**
 * Maps Backend Citation to Frontend Citation model
 */
export function adaptBackendCitationToFrontend(
  c: BackendCitation,
  index: number,
): FrontendCitation {
  return {
    id: `${c.source_id}-cit-${index}-${c.chunk_index}`,
    sourceId: c.source_id,
    sourceTitle: c.file_name || "Document Source",
    page: c.page_number ? `Page ${c.page_number}` : undefined,
    snippet: c.chunk_text || "",
  };
}

/**
 * Maps Backend SlideDeckContent format to Frontend layout renderable shape
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptBackendSlideDeckToFrontend(content: any): FrontendSlideDeck {
  const slides: FrontendSlide[] = [];

  // 1. Cover Title Slide
  slides.push({
    id: "slide-cover",
    layout: "title",
    eyebrow: "AI Generated Presentation",
    title: content.title || "Untitled Presentation",
    subtitle: "Prepared automatically from your study sources",
    notes: "Presentation initialized.",
  });

  // 2. Custom bullets layout for content slides
  if (content.slides && Array.isArray(content.slides)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content.slides.forEach((item: any, idx: number) => {
      slides.push({
        id: `slide-bullet-${idx}`,
        layout: "bullets",
        title: item.title || `Key Point ${idx + 1}`,
        bullets: item.bullets || [],
        notes: item.speaker_notes || "",
      });
    });
  } else {
    // Fallback slide
    slides.push({
      id: "slide-fallback",
      layout: "bullets",
      title: "Content Overview",
      bullets: ["No slides found in the generated response."],
      notes: "",
    });
  }

  // 3. Closing Slide
  slides.push({
    id: "slide-closing",
    layout: "closing",
    title: "Thank You",
    subtitle: "Questions & Discussion",
    notes: "Presentation completed.",
  });

  return {
    id: `deck-${Date.now()}`,
    title: content.title || "Presentation",
    subtitle: "Generated slides",
    audience: "Standard",
    tone: "Technical",
    length: "Standard",
    slides,
  };
}
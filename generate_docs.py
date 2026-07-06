import json

sections = []

# 1. Overview
sections.append("""# 1. Overview

The Artifact API is the core engine for generating structured, AI-powered outputs (Artifacts) from a Notebook's sources. It powers features such as Quizzes, Slide Decks, Audio Overviews, Study Guides, and more.

**Purpose:**
To allow frontend clients to asynchronously request AI synthesis of uploaded documents, and consume highly structured JSON data for rich UI rendering.

**Notebook Workflow:**
1. Users upload or link sources (PDFs, URLs, YouTube videos) to a Notebook.
2. The user selects an Artifact type.
3. The Artifact API processes the request, utilizing RAG (Retrieval-Augmented Generation) against the Notebook's embedded sources.
4. The backend LLM generates a structured JSON payload which is saved to the database.

```mermaid
graph TD
    N[Notebook] --> |Contains| S[Sources]
    S --> |Analyzed by| AI[AI Processing Background Job]
    AI --> |Generates Structured JSON| A[Artifact]
    A --> |Polled & Rendered| F[Frontend Rendering UI]
```
""")

# 2. API Base Information
sections.append("""# 2. API Base Information

- **Base URL:** `/api/v1/notebooks`
- **API Version:** `v1`
- **Authentication:** Required.
- **Format:** JSON.

**Required Headers:**
```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
Accept: application/json
```
""")

# 3. Artifact Lifecycle
sections.append("""# 3. Artifact Lifecycle

Because AI generation can take between 5 to 60 seconds (depending on the LLM and the artifact type), the API uses an asynchronous **polling pattern**.

1. **Create Request:** Client sends a POST request with configuration.
2. **Validation:** Backend validates schema (e.g., max 15 questions for a quiz).
3. **Background Job:** Backend dispatches the LLM task to `BackgroundTasks` and immediately returns `202 Accepted`.
4. **Artifact Generated:** The client receives the Artifact ID with `status: "processing"`.
5. **Polling:** Client polls the GET endpoint every 3 seconds.
6. **Saved & Returned:** Once the background job finishes, the status updates to `ready`, and `content_json` is fully populated.
7. **Displayed in Frontend:** The client renders the JSON into the appropriate interactive UI.

```mermaid
sequenceDiagram
    participant Frontend
    participant API
    participant BackgroundTask
    
    Frontend->>API: POST /artifacts/quiz
    API-->>Frontend: 202 Accepted (Status: processing)
    API->>BackgroundTask: Start LLM Generation
    
    loop Every 3 seconds
        Frontend->>API: GET /artifacts/{id}
        API-->>Frontend: 200 OK (Status: processing)
    end
    
    BackgroundTask->>Database: Save JSON & set Status: ready
    
    Frontend->>API: GET /artifacts/{id}
    API-->>Frontend: 200 OK (Status: ready, with content_json)
    Frontend->>Frontend: Render UI
```
""")

# 4. Endpoint Documentation
sections.append("""# 4. Endpoint Documentation

All endpoints share the common base path:
`POST /api/v1/notebooks/{notebook_id}/artifacts/{type}`

### POST `/{notebook_id}/artifacts/quiz`
- **Method:** POST
- **Purpose:** Generates a multiple-choice quiz.
- **Authentication:** Required (Bearer).
- **Request Parameters:** None
- **Path Parameters:** `notebook_id` (UUID)
- **Body Schema:** `QuizCreateRequest`
- **Validation Rules:** `number_of_questions` (3 to 15).
- **Idempotency:** Generates a new artifact on every request.

### POST `/{notebook_id}/artifacts/slide-deck`
- **Method:** POST
- **Purpose:** Generates a presentation slide deck.
- **Body Schema:** `SlideDeckCreateRequest`
- **Validation Rules:** `number_of_slides` (4 to 16).

### POST `/{notebook_id}/artifacts/audio-overview`
- **Method:** POST
- **Purpose:** Generates a podcast-style audio overview.
- **Body Schema:** `AudioOverviewCreateRequest`
- **Validation Rules:** `length` (short, medium, long).

*(Other generation endpoints follow the exact same pattern: `/flashcards`, `/faqs`, `/study-guide`, `/summary`, `/mindmap`, `/report`, `/datatable`)*

### POST `/{notebook_id}/artifacts/{artifact_id}/retry`
- **Purpose:** Retry an artifact generation if it failed (`status == error`).

### GET `/{notebook_id}/artifacts`
- **Method:** GET
- **Purpose:** List artifacts for a notebook.
- **Query Parameters:**
  - `artifact_type` (optional): Filter by type.
  - `status_filter` (optional): Filter by status (`ready`, `processing`, `error`).
  - `limit` (default: 20, max: 100).
  - `offset` (default: 0).
- **Sorting:** Descending by `created_at` (newest first).

### GET `/{notebook_id}/artifacts/{artifact_id}`
- **Method:** GET
- **Purpose:** Fetch a single artifact (used for polling).

### DELETE `/{notebook_id}/artifacts/{artifact_id}`
- **Method:** DELETE
- **Purpose:** Delete a single artifact (and its associated cloud storage files, e.g., audio).
""")

# 5. Data Models
sections.append("""# 5. Data Models

### Base Artifact (ArtifactShortResponse)
Used in the list view.
| Field | Type | Nullable | Description | Required |
|-------|------|----------|-------------|----------|
| `id` | UUID | No | Artifact UUID | Yes |
| `notebook_id` | UUID | No | Notebook UUID | Yes |
| `user_id` | UUID | No | User UUID | Yes |
| `artifact_type` | Enum | No | Type of artifact | Yes |
| `status` | Enum | No | `processing`, `ready`, `error` | Yes |
| `title` | String | No | Display title | Yes |
| `created_at` | DateTime | No | ISO 8601 | Yes |
| `updated_at` | DateTime | No | ISO 8601 | Yes |

### ArtifactResponse
Inherits from Base Artifact and adds:
| Field | Type | Nullable | Description | Required |
|-------|------|----------|-------------|----------|
| `options_json` | Object | No | Request configuration | Yes |
| `included_sources`| Array[Str] | No | Sources used | Yes |
| `content_json` | Object | No | The generated payload (schema varies by type) | Yes |
| `error_message` | String | Yes | Filled if status is `error` | No |
""")

# 6. Artifact Types
sections.append("""# 6. Artifact Types

| Artifact Type | Description | Endpoint | Output Format | Rendering Strategy | Can Regenerate | Can Delete |
|--------------|-------------|----------|---------------|-------------------|----------------|------------|
| `quiz` | Multiple-choice quiz | `/quiz` | `QuizArtifact` | Interactive Quiz UI | Yes | Yes |
| `flashcards` | Flashcards | `/flashcards` | `FlashcardsArtifact` | Flippable Card UI | Yes | Yes |
| `faq` | FAQs | `/faqs` | `FAQArtifact` | Accordion List | Yes | Yes |
| `study_guide` | Comprehensive guide | `/study-guide` | `StudyGuideArtifact` | Sections with headings | Yes | Yes |
| `summary` | Concise summary | `/summary` | `SummaryArtifact` | Bulleted list | Yes | Yes |
| `mindmap` | Hierarchical map | `/mindmap` | `MindMapArtifact` | Visual tree/graph | Yes | Yes |
| `slide_deck` | Presentation outline | `/slide-deck` | `SlideDeckArtifact` | Carousel/Slides | Yes | Yes |
| `voice_overview` | Podcast audio | `/audio-overview` | `AudioOverviewArtifact` | Audio Player + Script | Yes | Yes |
| `report` | Analytical report | `/report` | `ReportArtifact` | Long-form document | Yes | Yes |
| `datatable` | Structured data | `/datatable` | `DataTableArtifact` | HTML Table | Yes | Yes |

*Note: The API does NOT support streaming (`Supports Streaming: False`). All outputs are returned fully formed when `status == ready`.*
""")

# 7. Request Schemas
sections.append("""# 7. Request Schemas

All creation endpoints accept a JSON body.

### Base Request fields (applies to all):
- `prompt` (string, optional): Custom instructions for generation. Max 2000 chars.
- `excluded_source_ids` (array of strings, optional): Sources to ignore.

### Quiz
```json
{
  "number_of_questions": 5, // 3 to 15
  "difficulty": "mix",      // easy, medium, hard, mix
  "prompt": "Focus on the timeline."
}
```

### Slide Deck
```json
{
  "number_of_slides": 8,    // 4 to 16
  "prompt": "Make it engaging for executives."
}
```

### Audio Overview
```json
{
  "length": "medium",       // short, medium, long
  "voice_style": "default", // default, energetic, calm
  "host_names": ["Alex", "Jordan"] // exactly 2 strings
}
```
""")

# 8. Response Schemas
sections.append("""# 8. Response Schemas

### Pending Response (202 Accepted / Processing)
```json
{
  "success": true,
  "message": "Generation initiated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "processing",
    "artifact_type": "quiz",
    "content_json": {},
    "title": "Generating Quiz...",
    "created_at": "2026-07-01T12:00:00Z",
    "updated_at": "2026-07-01T12:00:00Z"
  }
}
```

### Completed Response (200 OK / Ready) - Example for Quiz
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "ready",
    "artifact_type": "quiz",
    "title": "Generated Quiz",
    "content_json": {
      "title": "React Hooks Mastery",
      "questions": [
        {
          "question": "What does useEffect do?",
          "type": "mcq",
          "options": [
            {"id": "A", "text": "Manages state"},
            {"id": "B", "text": "Handles side effects"}
          ],
          "answer": "B",
          "explanation": "useEffect handles side effects."
        }
      ]
    }
  }
}
```

### Failed Response (200 OK / Error)
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "error",
    "error_message": "LLM timed out during generation.",
    "content_json": {}
  }
}
```
""")

# 9. Error Handling
sections.append("""# 9. Error Handling

| Status Code | Reason | Example JSON | Frontend Behavior |
|-------------|--------|--------------|-------------------|
| `400` | Bad Request | `{"success": false, "error_type": "BAD_REQUEST", "message": "Only failed sources can be retried."}` | Show Toast |
| `401` | Unauthorized | `{"success": false, "error_type": "UNAUTHORIZED"}` | Redirect to Login |
| `404` | Not Found | `{"success": false, "message": "Artifact not found"}` | Show 404 UI |
| `422` | Unprocessable Entity | `{"success": false, "details": [...]}` | Show form validation error |
| `409` | Conflict | `{"success": false, "message": "Resource conflict"}` | Show Toast |
| `500` | Server Error | `{"success": false, "message": "Internal error"}` | Show Toast / Retry |
""")

# 10. State Machine
sections.append("""# 10. State Machine

Artifacts follow a linear state progression. There is no concept of "paused" or "cancelled".

```mermaid
stateDiagram-v2
    [*] --> processing : POST Create
    processing --> ready : Job Success
    processing --> error : Job Failed
    error --> processing : POST Retry
    ready --> [*] : DELETE
    error --> [*] : DELETE
```
""")

# 11. Frontend Integration Guide
sections.append("""# 11. Frontend Integration Guide

This API was built specifically for **TanStack Query (React Query)**.

### Creating Artifacts & Invalidation Strategy
When you successfully POST a new artifact:
1. Extract the `id` from the response.
2. Invalidate the list cache: `queryClient.invalidateQueries({ queryKey: ['artifacts', notebookId] })`.
3. Push the user to the artifact detail route (e.g., `/notebooks/123/artifacts/abc`).

### Polling for Detail View
Use `useQuery` with dynamic `refetchInterval`:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['artifact', notebookId, artifactId],
  queryFn: () => getArtifact(notebookId, artifactId),
  refetchInterval: (query) => {
    const status = query.state.data?.data.status;
    return status === 'processing' ? 3000 : false;
  }
});
```

### Deleting
1. Call DELETE endpoint.
2. `queryClient.invalidateQueries({ queryKey: ['artifacts', notebookId] })`.
3. Redirect user back to the artifacts list.
""")

# 12. UI Recommendations
sections.append("""# 12. UI Recommendations

- **Loading UI (Skeleton):** Since generation takes time, DO NOT show a generic spinner. Show a skeleton UI (shimmer effect) that roughly matches the layout of the artifact being generated. Display a badge saying "AI Generating..." or "Synthesizing Sources...".
- **Error UI:** If `status === 'error'`, show a prominent red banner with the `error_message` and a "Try Again" button that calls the `/retry` endpoint.
- **Empty States:** For the list view, if `total === 0`, show an illustration and a grid of "Suggest Artifacts" buttons.
- **Context Menus:** Each artifact card should have a 3-dot menu with options: "View", "Delete". (Note: Rename is NOT supported by the API natively yet).
""")

# 13. Streaming
sections.append("""# 13. Streaming (Not Supported)

The Artifact API does **not** support streaming (SSE/WebSockets).
- **Reason:** The backend orchestrates complex multi-step generation, formatting JSON validation, and cloud storage uploads (for audio).
- **Fallback:** Polling the GET endpoint is the strictly mandated approach.
""")

# 14. Background Jobs
sections.append("""# 14. Background Jobs

- **Generation:** Handled entirely by the backend via `BackgroundTasks`.
- **Job IDs:** The Artifact UUID acts as the Job ID.
- **Polling Interval:** Recommended 3000ms (3 seconds). Do not poll faster than 2 seconds.
- **Completion Detection:** When `status` transitions to `ready`.
- **Failure Detection:** When `status` transitions to `error`.
- **Cancellation:** Not supported. (If user leaves page, backend still completes the generation).
""")

# 15. Export Support
sections.append("""# 15. Export Support

The API does NOT provide export endpoints.
**Frontend Responsibility:**
- **Markdown/JSON:** The frontend holds the `content_json`. It can easily stringify it or format it.
- **PDF:** Use a client-side library like `html2pdf.js` or `window.print()` targeting a specific print stylesheet.
""")

# 16. Security
sections.append("""# 16. Security

- **Authentication:** Standard JWT Bearer token.
- **Authorization / Ownership:** The backend implicitly verifies that the `notebook_id` belongs to the `current_user`. If it does not, a 404 is returned.
- **Prompt Injection:** The `prompt` field is sanitized by the LLM system prompts, but the frontend should enforce a client-side max length of 2000 characters.
""")

# 17. Performance
sections.append("""# 17. Performance

- **Recommended Polling:** 3 seconds.
- **Pagination:** The GET `/artifacts` endpoint supports `limit` and `offset`. Use Infinite Scroll (via `useInfiniteQuery`) or standard pagination if lists exceed 20 items.
- **Audio Overviews:** For Voice Overview artifacts, the `audio_url` points directly to ImageKit CDN, ensuring fast global delivery. The audio file size can be large (10-30MB), so rely on the browser's native `<audio>` element for streaming playback.
""")

# 18. Complete Frontend Flow
sections.append("""# 18. Complete Frontend Flow

```mermaid
sequenceDiagram
    actor User
    participant ReactUI
    participant ReactQuery
    participant ArtifactAPI
    
    User->>ReactUI: Click "Generate Quiz"
    ReactUI->>ArtifactAPI: POST /notebooks/{id}/artifacts/quiz
    ArtifactAPI-->>ReactUI: 202 Accepted (Artifact ID: 123)
    ReactUI->>ReactQuery: Set Query Cache to 'processing'
    ReactUI->>ReactUI: Route to /artifacts/123
    ReactUI->>User: Display Skeleton UI
    
    loop Every 3s
        ReactQuery->>ArtifactAPI: GET /artifacts/123
        ArtifactAPI-->>ReactQuery: 200 OK (status: processing)
    end
    
    ReactQuery->>ArtifactAPI: GET /artifacts/123
    ArtifactAPI-->>ReactQuery: 200 OK (status: ready)
    ReactQuery-->>ReactUI: Trigger Re-render
    ReactUI->>User: Display Interactive Quiz Component
```
""")

# 19. Complete Examples
sections.append("""# 19. Complete Examples

### Example: Generate Quiz
**Request:**
```http
POST /api/v1/notebooks/abc/artifacts/quiz
Authorization: Bearer xyz
{
  "number_of_questions": 5,
  "difficulty": "medium",
  "prompt": "Test on React Hooks"
}
```
**Response (202):**
```json
{
  "success": true,
  "message": "Quiz artifact generation has been initiated successfully",
  "data": {
    "id": "123",
    "notebook_id": "abc",
    "artifact_type": "quiz",
    "status": "processing",
    "title": "Generating Quiz...",
    "created_at": "2026-07-01T12:00:00Z",
    "updated_at": "2026-07-01T12:00:00Z"
  }
}
```

### Example: Generate Audio Overview
**Request:**
```http
POST /api/v1/notebooks/abc/artifacts/audio-overview
Authorization: Bearer xyz
{
  "length": "medium",
  "voice_style": "default"
}
```

### Example: Fetch Audio Overview (Ready state)
Note that for Voice Overview, the backend injects the audio file metadata directly into `content_json.audio`.
**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "456",
    "status": "ready",
    "artifact_type": "voice_overview",
    "content_json": {
      "title": "Podcast Episode 1",
      "dialogue": [
        {"speaker": "host_1", "text": "Welcome to the show!"}
      ],
      "audio": {
        "audio_url": "https://ik.imagekit.io/your_id/voice_overviews/456.mp3",
        "audio_file_id": "imagekit_file_id_xyz",
        "audio_duration_seconds": 120.5
      }
    }
  }
}
```

### Example: List Artifacts
**Request:** `GET /api/v1/notebooks/abc/artifacts?limit=10`
**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "artifacts": [
      {
         "id": "123",
         "notebook_id": "abc",
         "user_id": "user123",
         "artifact_type": "quiz",
         "status": "ready",
         "title": "React Hooks Quiz",
         "created_at": "2026-07-01T12:00:00Z",
         "updated_at": "2026-07-01T12:00:00Z"
      }
    ]
  }
}
```

### Example: Delete Artifact
**Request:** `DELETE /api/v1/notebooks/abc/artifacts/123`
**Response:** `204 No Content`
""")

# 20. Frontend Best Practices
sections.append("""# 20. Frontend Best Practices

- **TanStack Query is Mandatory:** It provides `refetchInterval` which makes polling trivial. Do not write custom `setInterval` loops.
- **Dynamic Renderers:** Because the `content_json` schema completely changes based on `artifact_type`, you should create a router component:
  ```tsx
  export function ArtifactRenderer({ data }) {
    switch (data.artifact_type) {
      case 'quiz': return <QuizRenderer data={data.content_json} />;
      case 'slide_deck': return <SlideDeckRenderer data={data.content_json} />;
      case 'voice_overview': return <AudioPlayer data={data.content_json} />;
      default: return <GenericRenderer data={data.content_json} />;
    }
  }
  ```
- **Error Boundaries:** Wrap each Renderer in an ErrorBoundary. If the LLM produces slightly malformed JSON that bypasses validation, it shouldn't crash the whole app.
""")

# 21. AI Integration Notes
sections.append("""# 21. AI Integration Notes

**This section is strictly for AI Coding Agents building the frontend.**

1. **Do not read backend code:** This markdown file contains all accurate constraints, schemas, and endpoints required for frontend implementation.
2. **Order of API Calls:** 
   - To create: Send POST to `/notebooks/{id}/artifacts/{type}` with the respective payload.
   - You will immediately receive a 202 processing response.
   - Navigate the user to the artifact view and begin polling `GET /notebooks/{id}/artifacts/{artifact_id}`.
3. **Mandatory Polling Condition:** 
   - You MUST poll every 3000ms.
   - You MUST stop polling exactly when `status === 'ready'` or `status === 'error'`.
4. **Data Shape Warnings:**
   - The list view (`GET /artifacts`) returns `ArtifactShortResponse` which does NOT contain `content_json`. You MUST fetch the artifact by ID to get its content.
   - The audio URL for `voice_overview` is located at `content_json.audio.audio_url`.
5. **Cache Invalidation:**
   - On POST (Create), POST (Retry), and DELETE, you MUST invalidate the TanStack Query key for the artifact list: `queryClient.invalidateQueries(['artifacts', notebookId])`.
6. **Rename Operation:** Renaming an artifact is NOT supported by the API. Do not build a rename feature on the frontend.
7. **Regenerate Operation:** If the user wants to regenerate an artifact, simply issue a new POST request (it will create a new artifact ID). If it failed, use the `/retry` endpoint.
""")

# 22. Appendix
sections.append("""# 22. Appendix

### Enum Definitions
**ArtifactType:**
`quiz`, `flashcards`, `faq`, `study_guide`, `summary`, `mindmap`, `slide_deck`, `voice_overview`, `report`, `datatable`

**ArtifactStatus:**
`processing`, `ready`, `error`

**AudioOverviewVoiceStyle:**
`default`, `energetic`, `calm`

### Common HTTP Status Table
- **200 OK:** Standard success for GET.
- **202 Accepted:** Creation accepted, background job started.
- **204 No Content:** Deletion successful.
- **401 Unauthorized:** Missing or invalid token.
- **404 Not Found:** Entity does not exist or user lacks permission.
- **409 Conflict:** State conflict (e.g., trying to retry a ready artifact).
- **422 Unprocessable Entity:** Schema validation failure.

### Class Diagram Summary
```mermaid
classDiagram
    class ArtifactResponse {
        +UUID id
        +UUID notebook_id
        +ArtifactType artifact_type
        +ArtifactStatus status
        +String title
        +Object options_json
        +Array included_sources
        +Object content_json
        +String error_message
    }
```
""")

with open("ARTIFACT_API.md", "w") as f:
    f.write("\n\n".join(sections))

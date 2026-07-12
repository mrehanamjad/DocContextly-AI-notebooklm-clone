import apiClient from "./client";
import {
  ArtifactResponse,
  ArtifactListResponse,
  QuizCreateRequest,
  FlashcardCreateRequest,
  FAQCreateRequest,
  StudyGuideCreateRequest,
  SummaryCreateRequest,
  MindMapCreateRequest,
  SlideDeckCreateRequest,
  VoiceOverviewCreateRequest,
  ReportCreateRequest,
  DataTableCreateRequest,
} from "./types";

export const artifactsApi = {
  createQuiz(notebookId: string, payload: QuizCreateRequest): Promise<ArtifactResponse> {
    return apiClient.post<ArtifactResponse>(`/notebooks/${notebookId}/artifacts/quiz`, payload);
  },

  createFlashcards(notebookId: string, payload: FlashcardCreateRequest): Promise<ArtifactResponse> {
    return apiClient.post<ArtifactResponse>(
      `/notebooks/${notebookId}/artifacts/flashcards`,
      payload,
    );
  },

  createFAQs(notebookId: string, payload: FAQCreateRequest): Promise<ArtifactResponse> {
    return apiClient.post<ArtifactResponse>(`/notebooks/${notebookId}/artifacts/faqs`, payload);
  },

  createStudyGuide(
    notebookId: string,
    payload: StudyGuideCreateRequest,
  ): Promise<ArtifactResponse> {
    return apiClient.post<ArtifactResponse>(
      `/notebooks/${notebookId}/artifacts/study-guide`,
      payload,
    );
  },

  createSummary(notebookId: string, payload: SummaryCreateRequest): Promise<ArtifactResponse> {
    return apiClient.post<ArtifactResponse>(`/notebooks/${notebookId}/artifacts/summary`, payload);
  },

  createMindMap(notebookId: string, payload: MindMapCreateRequest): Promise<ArtifactResponse> {
    return apiClient.post<ArtifactResponse>(`/notebooks/${notebookId}/artifacts/mindmap`, payload);
  },

  createSlideDeck(notebookId: string, payload: SlideDeckCreateRequest): Promise<ArtifactResponse> {
    return apiClient.post<ArtifactResponse>(
      `/notebooks/${notebookId}/artifacts/slide-deck`,
      payload,
    );
  },

  createVoiceOverview(
    notebookId: string,
    payload: VoiceOverviewCreateRequest,
  ): Promise<ArtifactResponse> {
    return apiClient.post<ArtifactResponse>(
      `/notebooks/${notebookId}/artifacts/audio-overview`,
      payload,
    );
  },

  createReport(notebookId: string, payload: ReportCreateRequest): Promise<ArtifactResponse> {
    return apiClient.post<ArtifactResponse>(`/notebooks/${notebookId}/artifacts/report`, payload);
  },

  createDataTable(notebookId: string, payload: DataTableCreateRequest): Promise<ArtifactResponse> {
    return apiClient.post<ArtifactResponse>(
      `/notebooks/${notebookId}/artifacts/datatable`,
      payload,
    );
  },

  listArtifacts(
    notebookId: string,
    size: number = 20,
    page: number = 1,
    artifactType?: string,
  ): Promise<ArtifactListResponse> {
    let url = `/notebooks/${notebookId}/artifacts?size=${size}&page=${page}`;
    if (artifactType) {
      url += `&artifact_type=${artifactType}`;
    }
    return apiClient.get<ArtifactListResponse>(url);
  },

  getArtifact(notebookId: string, artifactId: string): Promise<ArtifactResponse> {
    console.log("getting artifact for notebook", notebookId, "artifact", artifactId);
    return apiClient.get<ArtifactResponse>(`/notebooks/${notebookId}/artifacts/${artifactId}`);
  },

  retryArtifact(notebookId: string, artifactId: string): Promise<ArtifactResponse> {
    return apiClient.post<ArtifactResponse>(
      `/notebooks/${notebookId}/artifacts/${artifactId}/retry`,
      {},
    );
  },

  deleteArtifact(notebookId: string, artifactId: string): Promise<void> {
    return apiClient.delete<void>(`/notebooks/${notebookId}/artifacts/${artifactId}`);
  },
};
export default artifactsApi;

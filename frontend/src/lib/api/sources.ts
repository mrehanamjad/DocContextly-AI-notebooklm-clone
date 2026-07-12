import apiClient from "./client";
import {
  SourceUploadResponse,
  SourceStatusResponse,
  SourceListResponse,
  NoteCreateRequest,
  SourceResponse,
} from "./types";

export const sourcesApi = {
  uploadFile(notebookId: string, file: File): Promise<SourceUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<SourceUploadResponse>(
      `/sources/upload?notebook_id=${notebookId}`,
      formData,
    );
  },

  crawlWebsites(notebookId: string, urls: string[]): Promise<SourceUploadResponse[]> {
    const query = urls.map((u) => `url=${encodeURIComponent(u)}`).join("&");
    return apiClient.post<SourceUploadResponse[]>(
      `/sources/website?notebook_id=${notebookId}&${query}`,
    );
  },

  importYouTube(notebookId: string, urls: string[]): Promise<SourceUploadResponse[]> {
    const query = urls.map((u) => `url=${encodeURIComponent(u)}`).join("&");
    return apiClient.post<SourceUploadResponse[]>(
      `/sources/youtube?notebook_id=${notebookId}&${query}`,
    );
  },

  crawlTopic(notebookId: string, topic: string,noOfSources:number): Promise<SourceUploadResponse[]> {
    return apiClient.post<SourceUploadResponse[]>(
      `/sources/topic?notebook_id=${notebookId}&topic=${encodeURIComponent(topic)}&no_of_sources=${noOfSources}`,
    );
  },

  createNote(payload: NoteCreateRequest): Promise<SourceUploadResponse> {
    return apiClient.post<SourceUploadResponse>("/sources/note", payload);
  },

  getSource(sourceId: string, notebookId: string, options?: RequestInit): Promise<SourceResponse> {
    return apiClient.get<SourceResponse>(`/sources/${sourceId}?notebook_id=${notebookId}`, options);
  },

  getSourceStatus(sourceId: string, notebookId: string): Promise<SourceStatusResponse> {
    return apiClient.get<SourceStatusResponse>(
      `/sources/${sourceId}/status?notebook_id=${notebookId}`,
    );
  },

  retryIngestSource(sourceId: string, notebookId: string): Promise<SourceStatusResponse> {
    return apiClient.post<SourceStatusResponse>(
      `/sources/${sourceId}/retry?notebook_id=${notebookId}`,
    );
  },

  listSources(
    notebookId: string,
    page: number = 1,
    size: number = 20,
  ): Promise<SourceListResponse> {
    return apiClient.get<SourceListResponse>(
      `/sources/?notebook_id=${notebookId}&page=${page}&size=${size}`,
    );
  },

  deleteSource(sourceId: string, notebookId: string): Promise<any> {
    return apiClient.delete<any>(`/sources/${sourceId}?notebook_id=${notebookId}`);
  },
};
export default sourcesApi;

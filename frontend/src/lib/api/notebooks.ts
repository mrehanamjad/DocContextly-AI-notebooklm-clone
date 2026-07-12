import apiClient from "./client";
import { NotebookCreate, NotebookUpdate, NotebookResponse, NotebookListResponse } from "./types";

export const notebooksApi = {
  createNotebook(payload: NotebookCreate): Promise<NotebookResponse> {
    return apiClient.post<NotebookResponse>("/notebooks/", payload);
  },

  listNotebooks(page: number = 1, size: number = 20): Promise<NotebookListResponse> {
    return apiClient.get<NotebookListResponse>(`/notebooks/?page=${page}&size=${size}`);
  },

  getNotebook(id: string): Promise<NotebookResponse> {
    return apiClient.get<NotebookResponse>(`/notebooks/${id}`);
  },

  updateNotebook(id: string, payload: NotebookUpdate): Promise<NotebookResponse> {
    return apiClient.patch<NotebookResponse>(`/notebooks/${id}`, payload);
  },

  deleteNotebook(id: string): Promise<void> {
    return apiClient.delete<void>(`/notebooks/${id}`);
  },
};
export default notebooksApi;

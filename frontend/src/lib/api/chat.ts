import apiClient from "./client";
import {
  ChatSessionCreate,
  ChatSessionResponse,
  ChatSessionListResponse,
  MessageListResponse,
  MessageRequest,
  AskResponse,
  MemoryStatusResponse,
} from "./types";

export const chatApi = {
  createSession(payload: ChatSessionCreate): Promise<ChatSessionResponse> {
    return apiClient.post<ChatSessionResponse>("/chat/sessions", payload);
  },

  listSessions(
    notebookId: string,
    page: number = 1,
    size: number = 20,
  ): Promise<ChatSessionListResponse> {
    return apiClient.get<ChatSessionListResponse>(
      `/chat/sessions?notebook_id=${notebookId}&page=${page}&size=${size}`,
    );
  },

  deleteSession(sessionId: string): Promise<void> {
    return apiClient.delete<void>(`/chat/sessions/${sessionId}`);
  },

  listMessages(
    sessionId: string,
    page: number = 1,
    size: number = 50,
  ): Promise<MessageListResponse> {
    return apiClient.get<MessageListResponse>(
      `/chat/sessions/${sessionId}/messages?page=${page}&size=${size}`,
    );
  },

  sendMessage(sessionId: string, payload: MessageRequest): Promise<AskResponse> {
    return apiClient.post<AskResponse>(`/chat/sessions/${sessionId}/messages`, payload);
  },

  clearMemory(sessionId: string): Promise<any> {
    return apiClient.put<any>(`/chat/sessions/${sessionId}/clear-memory`);
  },

  getMemoryStatus(sessionId: string): Promise<MemoryStatusResponse> {
    return apiClient.get<MemoryStatusResponse>(`/chat/sessions/${sessionId}/memory-status`);
  },
};
export default chatApi;

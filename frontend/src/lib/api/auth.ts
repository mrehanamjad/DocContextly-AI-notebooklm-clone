import apiClient from "./client";
import { UserCreateReq, UserLoginReq, UserResponse, TokenResponse } from "./types";

export const authApi = {
  register(payload: UserCreateReq): Promise<UserResponse> {
    return apiClient.post<UserResponse>("/users/register", payload);
  },

  login(payload: UserLoginReq): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>("/users/login", payload);
  },

  getCurrentUser(): Promise<UserResponse> {
    return apiClient.get<UserResponse>("/users/me");
  },
};
export default authApi;

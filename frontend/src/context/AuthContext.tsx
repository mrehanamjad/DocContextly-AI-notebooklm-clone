"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserResponse } from "../lib/api/types";
import { authApi } from "../lib/api/auth";
import { APIError } from "../lib/api/client";
import { toast } from "sonner";

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (username: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load user profile on mount if token exists
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("accessToken");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Failed to load user session", err);
        // Clear stale session
        localStorage.removeItem("accessToken");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Handle route guards / client-side protection
  useEffect(() => {
    if (isLoading) return;

    const isAppRoute = pathname?.startsWith("/app");
    const isAuthRoute = pathname === "/login" || pathname === "/register";

    if (isAppRoute && !user) {
      router.push("/login");
    } else if ((isAuthRoute || pathname === "/") && user) {
      router.push("/app");
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password?: string) => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem("accessToken", response.access_token);
      setToken(response.access_token);

      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);

      router.push("/app");
    } catch (err) {
      const errMsg = err instanceof APIError ? err.message : "Invalid login credentials";
      setError(errMsg);
      toast.error(errMsg);
      throw err;
    }
  };

  const register = async (username: string, email: string, password?: string) => {
    setError(null);
    try {
      // 1. Register the user
      await authApi.register({ username, email, password });

      // 2. Automatically log them in
      await login(email, password);
    } catch (err) {
      const errMsg = err instanceof APIError ? err.message : "Registration failed";
      setError(errMsg);
      toast.error(errMsg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
    router.push("/login");
    toast.success("Logged out successfully");
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

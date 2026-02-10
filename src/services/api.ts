/**
 * API Service - Backend communication
 */

import { Prompt, ViralChat, User, ApiResponse } from "@/types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://dev-api-test.x1.stage.hostnmeet.com/api";

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "An error occurred",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // ============ AUTH ============

  async loginWithGoogle(
    idToken: string,
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  }

  async guestLogin(): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request("/auth/guest", {
      method: "POST",
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request("/auth/profile");
  }

  // ============ PROMPTS ============

  async getPrompts(params: {
    page?: number;
    limit?: number;
    type?: "image" | "video" | "all";
    platform?: string;
    aiTool?: string;
    sort?: "viral" | "recent" | "trending";
  }): Promise<ApiResponse<{ prompts: Prompt[]; total: number; page: number }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    return this.request(`/prompts?${searchParams.toString()}`);
  }

  async getPromptById(id: string): Promise<ApiResponse<Prompt>> {
    return this.request(`/prompts/${id}`);
  }

  async getTrendingPrompts(limit = 10): Promise<ApiResponse<Prompt[]>> {
    return this.request(`/prompts/trending?limit=${limit}`);
  }

  async searchPrompts(
    query: string,
    page = 1,
  ): Promise<ApiResponse<{ prompts: Prompt[]; total: number }>> {
    return this.request(
      `/prompts/search?q=${encodeURIComponent(query)}&page=${page}`,
    );
  }

  // ============ VIRAL CHAT ============

  async getViralChats(params: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<ApiResponse<{ chats: ViralChat[]; total: number }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    return this.request(`/viral-chats?${searchParams.toString()}`);
  }

  async getTrendingViralChats(limit = 5): Promise<ApiResponse<ViralChat[]>> {
    return this.request(`/viral-chats/trending?limit=${limit}`);
  }

  // ============ USER INTERACTIONS ============

  async savePrompt(promptId: string): Promise<ApiResponse<void>> {
    return this.request(`/prompts/${promptId}/save`, {
      method: "POST",
    });
  }

  async unsavePrompt(promptId: string): Promise<ApiResponse<void>> {
    return this.request(`/prompts/${promptId}/unsave`, {
      method: "DELETE",
    });
  }

  async reactToPrompt(
    promptId: string,
    reaction: string,
  ): Promise<ApiResponse<void>> {
    return this.request(`/prompts/${promptId}/react`, {
      method: "POST",
      body: JSON.stringify({ reaction }),
    });
  }

  async submitFeedback(
    promptId: string,
    feedback: {
      usefulness: number;
      viralPotential: number;
      quality: number;
      comment?: string;
    },
  ): Promise<ApiResponse<void>> {
    return this.request(`/prompts/${promptId}/feedback`, {
      method: "POST",
      body: JSON.stringify(feedback),
    });
  }

  async getSavedPrompts(
    page = 1,
  ): Promise<ApiResponse<{ prompts: Prompt[]; total: number }>> {
    return this.request(`/user/saved?page=${page}`);
  }

  // ============ NOTIFICATIONS ============

  async getNotifications(
    page = 1,
  ): Promise<ApiResponse<{ notifications: any[]; unread: number }>> {
    return this.request(`/notifications?page=${page}`);
  }

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    return this.request(`/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  async registerPushToken(
    token: string,
    platform: "ios" | "android",
  ): Promise<ApiResponse<void>> {
    return this.request("/notifications/register", {
      method: "POST",
      body: JSON.stringify({ token, platform }),
    });
  }

  // ============ ANALYTICS ============

  async trackEvent(
    event: string,
    properties?: Record<string, any>,
  ): Promise<void> {
    // Fire and forget - don't await
    this.request("/analytics/track", {
      method: "POST",
      body: JSON.stringify({
        event,
        properties,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }

  async getChartData(
    type: "platform" | "aiTool" | "category",
    period: "day" | "week" | "month",
  ): Promise<ApiResponse<any>> {
    return this.request(`/analytics/charts/${type}?period=${period}`);
  }
}

export const apiService = new ApiService();
export default apiService;

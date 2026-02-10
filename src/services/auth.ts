/**
 * Authentication Service - Google OAuth & Guest Login
 */

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { apiService } from "./api";
import { User } from "@/types";

// Required for web browser redirect
WebBrowser.maybeCompleteAuthSession();

const SECURE_STORE_KEYS = {
  AUTH_TOKEN: "viral_prompt_auth_token",
  USER_DATA: "viral_prompt_user_data",
  REFRESH_TOKEN: "viral_prompt_refresh_token",
};

// Google OAuth client IDs - these should be from your Google Cloud Console
const GOOGLE_CLIENT_IDS = {
  expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;

  // ============ INITIALIZATION ============

  async initialize(): Promise<AuthState> {
    try {
      // Try to restore session from secure storage
      const [token, userData] = await Promise.all([
        SecureStore.getItemAsync(SECURE_STORE_KEYS.AUTH_TOKEN),
        SecureStore.getItemAsync(SECURE_STORE_KEYS.USER_DATA),
      ]);

      if (token && userData) {
        this.authToken = token;
        this.currentUser = JSON.parse(userData);
        apiService.setToken(token);

        // Validate token with backend
        const profileResult = await apiService.getProfile();
        if (profileResult.success && profileResult.data) {
          this.currentUser = profileResult.data;
          await this.saveUserData(this.currentUser);

          return {
            user: this.currentUser,
            token: this.authToken,
            isAuthenticated: true,
            isLoading: false,
          };
        } else {
          // Token invalid, clear storage
          await this.clearStorage();
        }
      }

      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    } catch (error) {
      console.error("Auth initialization error:", error);
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }
  }

  // ============ GOOGLE SIGN IN ============

  useGoogleAuth() {
    return Google.useAuthRequest({
      clientId: GOOGLE_CLIENT_IDS.expoClientId,
      iosClientId: GOOGLE_CLIENT_IDS.iosClientId,
      androidClientId: GOOGLE_CLIENT_IDS.androidClientId,
      webClientId: GOOGLE_CLIENT_IDS.webClientId,
      scopes: ["profile", "email"],
    });
  }

  async signInWithGoogle(
    idToken: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const result = await apiService.loginWithGoogle(idToken);

      if (result.success && result.data) {
        const { user, token } = result.data;

        this.currentUser = user;
        this.authToken = token;
        apiService.setToken(token);

        await this.saveSession(token, user);

        return { success: true, user };
      }

      return { success: false, error: result.error || "Login failed" };
    } catch (error) {
      console.error("Google sign-in error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  }

  // ============ GUEST LOGIN ============

  async signInAsGuest(): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      const result = await apiService.guestLogin();

      if (result.success && result.data) {
        const { user, token } = result.data;

        this.currentUser = user;
        this.authToken = token;
        apiService.setToken(token);

        await this.saveSession(token, user);

        return { success: true, user };
      }

      // Fallback: Create local guest user without backend
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        displayName: "Guest User",
        email: "",
        photoUrl: "",
        isGuest: true,
        createdAt: new Date().toISOString(),
        preferredTheme: "dark",
        notificationsEnabled: false,
        savedPrompts: [],
        reactions: [],
        generations: [],
        copies: [],
        lastLoginAt: "",
      };

      this.currentUser = guestUser;
      await this.saveUserData(guestUser);

      return { success: true, user: guestUser };
    } catch (error) {
      console.error("Guest login error:", error);

      // Offline fallback
      const offlineGuest: User = {
        id: `offline_guest_${Date.now()}`,
        displayName: "Guest User",
        email: "",
        photoUrl: "",
        isGuest: true,
        createdAt: new Date().toISOString(),
        preferredTheme: "dark",
        notificationsEnabled: false,
        savedPrompts: [],
        reactions: [],
        generations: [],
        copies: [],
        lastLoginAt: "",
      };

      this.currentUser = offlineGuest;
      await this.saveUserData(offlineGuest);

      return { success: true, user: offlineGuest };
    }
  }

  // ============ SIGN OUT ============

  async signOut(): Promise<void> {
    try {
      // Notify backend
      if (this.authToken) {
        await apiService.logout();
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Always clear local state
      this.currentUser = null;
      this.authToken = null;
      apiService.setToken(null);
      await this.clearStorage();
    }
  }

  // ============ SESSION MANAGEMENT ============

  private async saveSession(token: string, user: User): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(SECURE_STORE_KEYS.AUTH_TOKEN, token),
      SecureStore.setItemAsync(
        SECURE_STORE_KEYS.USER_DATA,
        JSON.stringify(user),
      ),
    ]);
  }

  private async saveUserData(user: User): Promise<void> {
    await SecureStore.setItemAsync(
      SECURE_STORE_KEYS.USER_DATA,
      JSON.stringify(user),
    );
  }

  private async clearStorage(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_STORE_KEYS.AUTH_TOKEN),
      SecureStore.deleteItemAsync(SECURE_STORE_KEYS.USER_DATA),
      SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN),
    ]);
  }

  // ============ GETTERS ============

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  isGuest(): boolean {
    return this.currentUser?.isGuest ?? false;
  }

  // ============ USER UPDATES ============

  async updateUserPreferences(
    preferences: Partial<Pick<User, "preferredTheme" | "notificationsEnabled">>,
  ): Promise<void> {
    if (!this.currentUser) return;

    this.currentUser = {
      ...this.currentUser,
      ...preferences,
    };

    await this.saveUserData(this.currentUser);
  }

  async convertGuestToUser(
    idToken: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    // Convert guest account to full Google account
    if (!this.currentUser?.isGuest) {
      return { success: false, error: "Not a guest user" };
    }

    return this.signInWithGoogle(idToken);
  }
}

export const authService = new AuthService();
export default authService;

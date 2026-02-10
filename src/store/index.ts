/**
 * Zustand Store - Global State Management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Prompt,
  ViralChat,
  Chart,
  AppNotification,
  SyncStatus,
  ReactionType,
  PromptFilters,
} from '@/types';

interface AppStore {
  // ========== User State ==========
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  
  // User Actions
  setUser: (user: User | null) => void;
  loginAsGuest: () => void;
  logout: () => void;
  updateUserPreferences: (prefs: Partial<User>) => void;
  
  // ========== Theme State ==========
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  
  // ========== Prompts State ==========
  prompts: Prompt[];
  filteredPrompts: Prompt[];
  currentFilters: PromptFilters;
  
  // Prompt Actions
  setPrompts: (prompts: Prompt[]) => void;
  addPrompts: (prompts: Prompt[]) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  setFilters: (filters: PromptFilters) => void;
  clearFilters: () => void;
  
  // ========== User Interactions ==========
  savedPromptIds: string[];
  userReactions: Record<string, ReactionType[]>;
  userCopies: string[];
  userGenerations: string[];
  
  // Interaction Actions
  savePrompt: (promptId: string) => void;
  unsavePrompt: (promptId: string) => void;
  addReaction: (promptId: string, reaction: ReactionType) => void;
  removeReaction: (promptId: string, reaction: ReactionType) => void;
  recordCopy: (promptId: string) => void;
  recordGeneration: (promptId: string) => void;
  
  // ========== Viral Chats State ==========
  viralChats: ViralChat[];
  setViralChats: (chats: ViralChat[]) => void;
  
  // ========== Charts State ==========
  charts: Chart[];
  setCharts: (charts: Chart[]) => void;
  
  // ========== Notifications State ==========
  notifications: AppNotification[];
  unreadCount: number;
  
  // Notification Actions
  setNotifications: (notifications: AppNotification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  
  // ========== Sync State ==========
  syncStatus: SyncStatus;
  isOnline: boolean;
  
  // Sync Actions
  setSyncStatus: (status: Partial<SyncStatus>) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  
  // ========== UI State ==========
  isLoading: boolean;
  error: string | null;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // ========== App Lifecycle ==========
  isFirstLaunch: boolean;
  setFirstLaunch: (isFirst: boolean) => void;
  resetStore: () => void;
}

const initialSyncStatus: SyncStatus = {
  lastSyncAt: null,
  isOnline: true,
  pendingChanges: 0,
  cacheSize: 0,
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isGuest: false,
  theme: 'dark' as const,
  prompts: [],
  filteredPrompts: [],
  currentFilters: {},
  savedPromptIds: [],
  userReactions: {},
  userCopies: [],
  userGenerations: [],
  viralChats: [],
  charts: [],
  notifications: [],
  unreadCount: 0,
  syncStatus: initialSyncStatus,
  isOnline: true,
  isLoading: false,
  error: null,
  isFirstLaunch: true,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // ========== User Actions ==========
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isGuest: user?.isGuest ?? false,
        }),
      
      loginAsGuest: () => {
        const guestUser: User = {
          id: `guest_${Date.now()}`,
          isGuest: true,
          preferredTheme: 'dark',
          notificationsEnabled: false,
          savedPrompts: [],
          reactions: [],
          generations: [],
          copies: [],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        set({
          user: guestUser,
          isAuthenticated: true,
          isGuest: true,
        });
      },
      
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isGuest: false,
          savedPromptIds: [],
          userReactions: {},
          userCopies: [],
          userGenerations: [],
        }),
      
      updateUserPreferences: (prefs) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...prefs } : null,
        })),
      
      // ========== Theme Actions ==========
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      
      // ========== Prompts Actions ==========
      setPrompts: (prompts) =>
        set({ prompts, filteredPrompts: prompts }),
      
      addPrompts: (newPrompts) =>
        set((state) => {
          const existingIds = new Set(state.prompts.map((p) => p.id));
          const uniqueNew = newPrompts.filter((p) => !existingIds.has(p.id));
          const all = [...state.prompts, ...uniqueNew];
          return { prompts: all, filteredPrompts: all };
        }),
      
      updatePrompt: (id, updates) =>
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          filteredPrompts: state.filteredPrompts.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      
      setFilters: (filters) =>
        set((state) => {
          const filtered = state.prompts.filter((prompt) => {
            if (filters.type && prompt.type !== filters.type) return false;
            if (
              filters.platforms?.length &&
              !prompt.platforms.some((p) => filters.platforms?.includes(p))
            )
              return false;
            if (
              filters.aiTools?.length &&
              !prompt.aiTools.some((t) => filters.aiTools?.includes(t))
            )
              return false;
            if (
              filters.minTrendScore &&
              prompt.trendScore < filters.minTrendScore
            )
              return false;
            return true;
          });
          return { filteredPrompts: filtered, currentFilters: filters };
        }),
      
      clearFilters: () =>
        set((state) => ({
          filteredPrompts: state.prompts,
          currentFilters: {},
        })),
      
      // ========== Interaction Actions ==========
      savePrompt: (promptId) =>
        set((state) => ({
          savedPromptIds: [...new Set([...state.savedPromptIds, promptId])],
        })),
      
      unsavePrompt: (promptId) =>
        set((state) => ({
          savedPromptIds: state.savedPromptIds.filter((id) => id !== promptId),
        })),
      
      addReaction: (promptId, reaction) =>
        set((state) => {
          const current = state.userReactions[promptId] || [];
          if (current.includes(reaction)) return state;
          return {
            userReactions: {
              ...state.userReactions,
              [promptId]: [...current, reaction],
            },
          };
        }),
      
      removeReaction: (promptId, reaction) =>
        set((state) => ({
          userReactions: {
            ...state.userReactions,
            [promptId]: (state.userReactions[promptId] || []).filter(
              (r) => r !== reaction
            ),
          },
        })),
      
      recordCopy: (promptId) =>
        set((state) => ({
          userCopies: [...new Set([...state.userCopies, promptId])],
        })),
      
      recordGeneration: (promptId) =>
        set((state) => ({
          userGenerations: [...state.userGenerations, promptId],
        })),
      
      // ========== Viral Chats Actions ==========
      setViralChats: (chats) => set({ viralChats: chats }),
      
      // ========== Charts Actions ==========
      setCharts: (charts) => set({ charts }),
      
      // ========== Notifications Actions ==========
      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        }),
      
      markAsRead: (id) =>
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        }),
      
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      
      clearNotifications: () =>
        set({ notifications: [], unreadCount: 0 }),
      
      // ========== Sync Actions ==========
      setSyncStatus: (status) =>
        set((state) => ({
          syncStatus: { ...state.syncStatus, ...status },
        })),
      
      setOnlineStatus: (isOnline) =>
        set((state) => ({
          isOnline,
          syncStatus: { ...state.syncStatus, isOnline },
        })),
      
      // ========== UI Actions ==========
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // ========== App Lifecycle ==========
      setFirstLaunch: (isFirstLaunch) => set({ isFirstLaunch }),
      resetStore: () => set(initialState),
    }),
    {
      name: 'viral-prompt-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        theme: state.theme,
        savedPromptIds: state.savedPromptIds,
        userReactions: state.userReactions,
        userCopies: state.userCopies,
        userGenerations: state.userGenerations,
        isFirstLaunch: state.isFirstLaunch,
        syncStatus: state.syncStatus,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useUser = () => useAppStore((state) => state.user);
export const useTheme = () => useAppStore((state) => state.theme);
export const usePrompts = () => useAppStore((state) => state.filteredPrompts);
export const useSavedPrompts = () =>
  useAppStore((state) =>
    state.prompts.filter((p) => state.savedPromptIds.includes(p.id))
  );
export const useIsOnline = () => useAppStore((state) => state.isOnline);
export const useUnreadCount = () => useAppStore((state) => state.unreadCount);

/**
 * Custom hooks for API data fetching with offline caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '@/services/api';
import { databaseService } from '@/services/database';
import { useAppStore } from '@/store';
import type { Prompt, ViralChat } from '@/types';

const db = databaseService;

// ============ Generic fetch hook ============

interface UseFetchOptions {
  /** Skip initial fetch */
  skip?: boolean;
  /** Refetch interval in ms */
  pollInterval?: number;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============ Prompts Hook ============

interface UsePromptsParams {
  page?: number;
  limit?: number;
  type?: 'image' | 'video' | 'all';
  platform?: string;
  sort?: 'viral' | 'recent' | 'trending';
}

export function usePrompts(params: UsePromptsParams = {}): UseFetchResult<Prompt[]> & {
  total: number;
  loadMore: () => void;
  hasMore: boolean;
} {
  const [data, setData] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(params.page || 1);
  const [hasMore, setHasMore] = useState(true);
  const isOnline = useAppStore((state) => state.isOnline);
  const setPrompts = useAppStore((state) => state.setPrompts);

  const fetchPrompts = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        const response = await apiService.getPrompts({
          page,
          limit: params.limit || 20,
          type: params.type,
          platform: params.platform,
          sort: params.sort || 'trending',
        });

        if (response.success && response.data) {
          const prompts = response.data.prompts || [];
          if (append) {
            setData((prev) => [...prev, ...prompts]);
          } else {
            setData(prompts);
          }
          setTotal(response.data.total || prompts.length);
          setHasMore(prompts.length >= (params.limit || 20));

          // Cache to SQLite for offline
          try {
            await db.cachePrompts(prompts);
          } catch {
            // Ignore cache errors
          }

          // Update store
          if (!append) {
            setPrompts(prompts);
          }
        } else {
          throw new Error(response.error || 'Failed to fetch prompts');
        }
      } else {
        // Offline: load from cache
        try {
          const cachedPrompts = await db.getCachedPrompts({ limit: params.limit || 20, offset: 0 });
          setData(cachedPrompts);
          setTotal(cachedPrompts.length);
          setHasMore(false);
        } catch {
          setData([]);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);

      // Try offline cache as fallback
      try {
        const cachedPrompts = await db.getCachedPrompts({ limit: params.limit || 20, offset: 0 });
        if (cachedPrompts.length > 0) {
          setData(cachedPrompts);
          setError(null);
        }
      } catch {
        // No cache available
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, params.type, params.platform, params.sort, params.limit]);

  const refetch = useCallback(async () => {
    setCurrentPage(1);
    await fetchPrompts(1, false);
  }, [fetchPrompts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPrompts(nextPage, true);
    }
  }, [loading, hasMore, currentPage, fetchPrompts]);

  useEffect(() => {
    fetchPrompts(1, false);
  }, []);

  return { data, loading, error, refetch, total, loadMore, hasMore };
}

// ============ Single Prompt Hook ============

export function usePromptById(promptId: string): UseFetchResult<Prompt> {
  const [data, setData] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useAppStore((state) => state.isOnline);

  const fetchPrompt = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        const response = await apiService.getPromptById(promptId);
        if (response.success && response.data) {
          setData(response.data);
          // Cache
          try {
            await db.cachePrompts([response.data]);
          } catch {}
        } else {
          throw new Error(response.error || 'Prompt not found');
        }
      } else {
        // Try cache
        try {
          const cached = await db.getPromptById(promptId);
          if (cached) {
            setData(cached);
          } else {
            throw new Error('Not available offline');
          }
        } catch {
          setError('This prompt is not available offline');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);

      // Fallback to cache
      try {
        const cached = await db.getPromptById(promptId);
        if (cached) {
          setData(cached);
          setError(null);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [promptId, isOnline]);

  const refetch = useCallback(async () => {
    await fetchPrompt();
  }, [fetchPrompt]);

  useEffect(() => {
    fetchPrompt();
  }, [promptId]);

  return { data, loading, error, refetch };
}

// ============ Trending Prompts Hook ============

export function useTrendingPrompts(limit = 10): UseFetchResult<Prompt[]> {
  const [data, setData] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useAppStore((state) => state.isOnline);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        const response = await apiService.getTrendingPrompts(limit);
        if (response.success && response.data) {
          const prompts = Array.isArray(response.data) ? response.data : [];
          setData(prompts);

          // Cache
          for (const prompt of prompts) {
            try {
              await db.cachePrompts([prompt]);
            } catch {}
          }
        } else {
          throw new Error(response.error || 'Failed to fetch trending');
        }
      } else {
        try {
          const cached = await db.getCachedPrompts({ limit, offset: 0 });
          setData(cached);
        } catch {
          setData([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      try {
        const cached = await db.getCachedPrompts({ limit, offset: 0 });
        if (cached.length > 0) {
          setData(cached);
          setError(null);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [isOnline, limit]);

  const refetch = useCallback(async () => {
    await fetchTrending();
  }, [fetchTrending]);

  useEffect(() => {
    fetchTrending();
  }, []);

  return { data, loading, error, refetch };
}

// ============ Viral Chats Hook ============

interface UseViralChatsParams {
  page?: number;
  limit?: number;
  category?: string;
}

export function useViralChats(params: UseViralChatsParams = {}): UseFetchResult<ViralChat[]> {
  const [data, setData] = useState<ViralChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useAppStore((state) => state.isOnline);
  const setViralChats = useAppStore((state) => state.setViralChats);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        const response = await apiService.getViralChats({
          page: params.page || 1,
          limit: params.limit || 20,
          category: params.category,
        });

        if (response.success && response.data) {
          const chats = response.data.chats || [];
          setData(chats);
          setViralChats(chats);

          // Cache
          try {
            await db.cacheViralChats(chats);
          } catch {}
        } else {
          throw new Error(response.error || 'Failed to fetch viral chats');
        }
      } else {
        try {
          const cached = await db.getCachedViralChats(params.category);
          setData(cached);
        } catch {
          setData([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      try {
        const cached = await db.getCachedViralChats(params.category);
        if (cached.length > 0) {
          setData(cached);
          setError(null);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [isOnline, params.category, params.limit]);

  const refetch = useCallback(async () => {
    await fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    fetchChats();
  }, []);

  return { data, loading, error, refetch };
}

// ============ Search Hook ============

export function useSearch() {
  const [results, setResults] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const search = useCallback(async (query: string, page = 1): Promise<Prompt[]> => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.searchPrompts(query, page);
      if (response.success && response.data) {
        const prompts = response.data.prompts || [];
        if (page === 1) {
          setResults(prompts);
        } else {
          setResults((prev) => [...prev, ...prompts]);
        }
        setTotal(response.data.total || prompts.length);
        return prompts;
      } else {
        throw new Error(response.error || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setTotal(0);
    setError(null);
  }, []);

  return { results, loading, error, total, search, clear };
}

// ============ Saved Prompts Hook ============

export function useSavedPrompts(): UseFetchResult<Prompt[]> {
  const [data, setData] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useAppStore((state) => state.isOnline);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        const response = await apiService.getSavedPrompts();
        if (response.success && response.data) {
          setData(response.data.prompts || []);
        } else {
          throw new Error(response.error || 'Failed to fetch saved prompts');
        }
      } else {
        try {
          const cached = await db.getSavedPrompts();
          setData(cached);
        } catch {
          setData([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      try {
        const cached = await db.getSavedPrompts();
        if (cached.length > 0) {
          setData(cached);
          setError(null);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  const refetch = useCallback(async () => {
    await fetchSaved();
  }, [fetchSaved]);

  useEffect(() => {
    fetchSaved();
  }, []);

  return { data, loading, error, refetch };
}

export default {
  usePrompts,
  usePromptById,
  useTrendingPrompts,
  useViralChats,
  useSearch,
  useSavedPrompts,
};

/**
 * Admin API Service
 */

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface DashboardStats {
  totals: {
    prompts: number;
    viralChats: number;
    users: number;
  };
  today: {
    prompts: number;
    users: number;
  };
  topPlatforms: Array<{ name: string; count: number }>;
  topAiTools: Array<{ name: string; count: number }>;
}

export interface Prompt {
  id: string;
  promptText: string;
  previewUrl?: string;
  type: 'image' | 'video';
  platform: string;
  aiTool: string;
  viralScore: number;
  likes: number;
  shares: number;
  saves: number;
  comments: number;
  tags: string[];
  trending: boolean;
  createdAt: string;
}

export interface ViralChat {
  id: string;
  title: string;
  promptText: string;
  previewUrl?: string;
  category: string;
  views: number;
  copies: number;
  likes: number;
  isTrending: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  displayName: string;
  email?: string;
  isGuest: boolean;
  isAdmin: boolean;
  savedCount: number;
  createdAt: string;
  lastLoginAt: string;
}

export const adminApi = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/admin-login', { email, password });
    return res.data;
  },
  
  // Dashboard
  getDashboard: async (): Promise<DashboardStats> => {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },
  
  // Prompts
  getPrompts: async (page = 1, limit = 20) => {
    const res = await api.get(`/admin/prompts?page=${page}&limit=${limit}`);
    return res.data.data;
  },
  
  createPrompt: async (data: Partial<Prompt>) => {
    const res = await api.post('/admin/prompts', data);
    return res.data.data;
  },
  
  updatePrompt: async (id: string, data: Partial<Prompt>) => {
    const res = await api.put(`/admin/prompts/${id}`, data);
    return res.data.data;
  },
  
  deletePrompt: async (id: string) => {
    const res = await api.delete(`/admin/prompts/${id}`);
    return res.data;
  },
  
  bulkImportPrompts: async (prompts: Partial<Prompt>[]) => {
    const res = await api.post('/admin/prompts/bulk', { prompts });
    return res.data;
  },
  
  // Viral Chats
  getViralChats: async (page = 1, limit = 20) => {
    const res = await api.get(`/admin/viral-chats?page=${page}&limit=${limit}`);
    return res.data.data;
  },
  
  createViralChat: async (data: Partial<ViralChat>) => {
    const res = await api.post('/admin/viral-chats', data);
    return res.data.data;
  },
  
  updateViralChat: async (id: string, data: Partial<ViralChat>) => {
    const res = await api.put(`/admin/viral-chats/${id}`, data);
    return res.data.data;
  },
  
  deleteViralChat: async (id: string) => {
    const res = await api.delete(`/admin/viral-chats/${id}`);
    return res.data;
  },
  
  // Users
  getUsers: async (page = 1, limit = 20) => {
    const res = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return res.data.data;
  },
  
  toggleAdmin: async (id: string, isAdmin: boolean) => {
    const res = await api.put(`/admin/users/${id}/admin`, { isAdmin });
    return res.data;
  },
  
  // Notifications
  broadcast: async (title: string, message: string) => {
    const res = await api.post('/admin/notifications/broadcast', { title, message });
    return res.data;
  },
  
  // Analytics
  getChartData: async (type: string, period: string) => {
    const res = await api.get(`/analytics/charts/${type}?period=${period}`);
    return res.data.data;
  },
};

export default adminApi;

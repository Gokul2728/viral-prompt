/**
 * Type Definitions for Viral Prompt App
 */

// Prompt Types
export type PromptType = "image" | "video";

export type AITool =
  | "gemini"
  | "midjourney"
  | "stable-diffusion"
  | "runway"
  | "pika"
  | "luma"
  | "sora"
  | "veo"
  | "dall-e";

export type Platform =
  | "youtube"
  | "reddit"
  | "twitter"
  | "pinterest"
  | "instagram"
  | "lexica"
  | "krea"
  | "prompthero"
  | "civitai"
  | "nano-banana";

export type ReactionType = "like" | "fire" | "wow";

export interface Prompt {
  id: string;
  text: string;
  type: PromptType;
  previewUrl: string;
  previewType: "image" | "video";
  thumbnailUrl?: string;

  // Metadata
  platforms: Platform[];
  aiTools: AITool[];
  tags: string[];
  style?: string;
  emotion?: string;

  // Engagement
  trendScore: number;
  likes: number;
  fires: number;
  wows: number;
  copies: number;
  generates: number;

  // Tracking
  createdAt: string;
  updatedAt: string;
  firstSeenAt: string;
  crossPlatformCount: number;
  creatorCount: number;
  engagementVelocity: number;

  // Cluster info
  clusterId?: string;
  isApproved: boolean;
}

export interface ViralChat {
  id: string;
  title: string;
  description: string;
  example: string;
  category: "roast" | "transform" | "describe" | "game" | "fun";
  previewUrl?: string;

  // Engagement
  uses: number;
  likes: number;
  fires: number;
  wows: number;
  copies: number;

  // Tracking
  createdAt: string;
  isViral: boolean;
  trendScore: number;
}

export interface UserReaction {
  promptId: string;
  reaction: ReactionType;
  timestamp: string;
}

export interface UserGeneration {
  promptId: string;
  timestamp: string;
  tool: AITool;
}

// User Types
export interface User {
  id: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  isGuest: boolean;

  // Preferences
  preferredTheme: "dark" | "light" | "system";
  notificationsEnabled: boolean;

  // Stats
  savedPrompts: string[];
  reactions: UserReaction[];
  generations: UserGeneration[];
  copies: string[];

  // Timestamps
  createdAt: string;
  lastLoginAt: string;
  lastSyncAt?: string;
}

// Chart Types
export type ChartPeriod = "weekly" | "monthly" | "all-time";
export type ChartCategory =
  | "most-liked"
  | "most-copied"
  | "most-generated"
  | "trending";

export interface ChartEntry {
  rank: number;
  prompt: Prompt;
  change: number; // Position change from previous period
  previousRank?: number;
}

export interface Chart {
  id: string;
  period: ChartPeriod;
  category: ChartCategory;
  promptType?: PromptType;
  entries: ChartEntry[];
  generatedAt: string;
}

// Filter Types
export interface FilterChip {
  id: string;
  label: string;
  isActive?: boolean;
  icon?: string;
}

export interface PromptFilters {
  type?: PromptType;
  platforms?: Platform[];
  aiTools?: AITool[];
  styles?: string[];
  emotions?: string[];
  minTrendScore?: number;
  period?: "day" | "week" | "month";
}

// Feedback Types
export interface FeedbackResponse {
  promptId: string;
  userId: string;
  usefulness: number; // 1-5
  viralPotential: number; // 1-5
  quality: number; // 1-5
  wouldUseAgain: boolean;
  comment?: string;
  createdAt: string;
}

// Notification Types
export type NotificationType =
  | "new-viral"
  | "chart-entry"
  | "saved-prompt-activity"
  | "weekly-digest";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// Sync Types
export interface SyncStatus {
  lastSyncAt: string | null;
  isOnline: boolean;
  pendingChanges: number;
  cacheSize: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}

// Navigation Types - canonical definitions in @/navigation/types
// Import from '@/navigation/types' directly for RootStackParamList & MainTabParamList

// Store Types
export interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;

  // Theme
  theme: "dark" | "light";

  // Data
  prompts: Prompt[];
  viralChats: ViralChat[];
  charts: Chart[];
  notifications: AppNotification[];

  // Sync
  syncStatus: SyncStatus;

  // UI State
  isLoading: boolean;
  error: string | null;
}

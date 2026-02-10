/**
 * SQLite Database Service - Offline storage
 * Uses expo-sqlite SDK 52+ synchronous API
 */

import * as SQLite from 'expo-sqlite';
import { Prompt, ViralChat } from '@/types';

const DB_NAME = 'viral_prompt.db';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = SQLite.openDatabaseSync(DB_NAME);
      this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Prompts table - aligned with frontend Prompt type
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS prompts (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        type TEXT NOT NULL,
        preview_url TEXT,
        preview_type TEXT,
        thumbnail_url TEXT,
        platforms TEXT,
        ai_tools TEXT,
        tags TEXT,
        style TEXT,
        emotion TEXT,
        trend_score INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        fires INTEGER DEFAULT 0,
        wows INTEGER DEFAULT 0,
        copies INTEGER DEFAULT 0,
        generates INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        first_seen_at TEXT,
        cross_platform_count INTEGER DEFAULT 0,
        creator_count INTEGER DEFAULT 0,
        engagement_velocity REAL DEFAULT 0,
        cluster_id TEXT,
        is_approved INTEGER DEFAULT 0,
        cached_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Saved prompts table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS saved_prompts (
        id TEXT PRIMARY KEY,
        prompt_id TEXT NOT NULL,
        saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_offline INTEGER DEFAULT 0,
        FOREIGN KEY (prompt_id) REFERENCES prompts(id)
      )
    `);

    // Viral chats table - aligned with frontend ViralChat type
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS viral_chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        example TEXT NOT NULL,
        category TEXT NOT NULL,
        preview_url TEXT,
        uses INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        fires INTEGER DEFAULT 0,
        wows INTEGER DEFAULT 0,
        copies INTEGER DEFAULT 0,
        created_at TEXT,
        is_viral INTEGER DEFAULT 0,
        trend_score INTEGER DEFAULT 0,
        cached_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User preferences table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS user_prefs (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reactions table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS reactions (
        id TEXT PRIMARY KEY,
        prompt_id TEXT NOT NULL,
        reaction_type TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      )
    `);

    // Create indexes for performance
    this.db.execSync('CREATE INDEX IF NOT EXISTS idx_prompts_trend_score ON prompts(trend_score DESC)');
    this.db.execSync('CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(type)');
    this.db.execSync('CREATE INDEX IF NOT EXISTS idx_saved_prompts_saved_at ON saved_prompts(saved_at DESC)');
  }

  // ============ PROMPTS ============

  async cachePrompts(prompts: Prompt[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const statement = this.db.prepareSync(`
      INSERT OR REPLACE INTO prompts (
        id, text, type, preview_url, preview_type, thumbnail_url,
        platforms, ai_tools, tags, style, emotion,
        trend_score, likes, fires, wows, copies, generates,
        created_at, updated_at, first_seen_at,
        cross_platform_count, creator_count, engagement_velocity,
        cluster_id, is_approved, cached_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    try {
      for (const prompt of prompts) {
        statement.executeSync([
          prompt.id,
          prompt.text,
          prompt.type,
          prompt.previewUrl || null,
          prompt.previewType || 'image',
          prompt.thumbnailUrl || null,
          JSON.stringify(prompt.platforms || []),
          JSON.stringify(prompt.aiTools || []),
          JSON.stringify(prompt.tags || []),
          prompt.style || null,
          prompt.emotion || null,
          prompt.trendScore || 0,
          prompt.likes || 0,
          prompt.fires || 0,
          prompt.wows || 0,
          prompt.copies || 0,
          prompt.generates || 0,
          prompt.createdAt || new Date().toISOString(),
          prompt.updatedAt || new Date().toISOString(),
          prompt.firstSeenAt || new Date().toISOString(),
          prompt.crossPlatformCount || 0,
          prompt.creatorCount || 0,
          prompt.engagementVelocity || 0,
          prompt.clusterId || null,
          prompt.isApproved ? 1 : 0,
        ]);
      }
    } finally {
      statement.finalizeSync();
    }
  }

  async getCachedPrompts(options: {
    limit?: number;
    offset?: number;
    type?: string;
    sortBy?: 'trend_score' | 'cached_at';
  } = {}): Promise<Prompt[]> {
    if (!this.db) throw new Error('Database not initialized');

    const { limit = 20, offset = 0, type, sortBy = 'trend_score' } = options;

    let query = 'SELECT * FROM prompts WHERE 1=1';
    const params: (string | number)[] = [];

    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ` ORDER BY ${sortBy} DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = this.db.getAllSync(query, params);
    return this.mapPromptsFromDB(rows as Record<string, unknown>[]);
  }

  async getPromptById(id: string): Promise<Prompt | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = this.db.getFirstSync('SELECT * FROM prompts WHERE id = ?', [id]);
    if (!row) return null;
    return this.mapPromptFromDB(row as Record<string, unknown>);
  }

  async searchPrompts(searchQuery: string): Promise<Prompt[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = this.db.getAllSync(
      `SELECT * FROM prompts 
       WHERE text LIKE ? OR tags LIKE ? OR style LIKE ?
       ORDER BY trend_score DESC LIMIT 50`,
      [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
    );

    return this.mapPromptsFromDB(rows as Record<string, unknown>[]);
  }

  private mapPromptFromDB(row: Record<string, unknown>): Prompt {
    return {
      id: row.id as string,
      text: row.text as string,
      type: row.type as 'image' | 'video',
      previewUrl: row.preview_url as string,
      previewType: (row.preview_type as 'image' | 'video') || 'image',
      thumbnailUrl: row.thumbnail_url as string | undefined,
      platforms: JSON.parse((row.platforms as string) || '[]'),
      aiTools: JSON.parse((row.ai_tools as string) || '[]'),
      tags: JSON.parse((row.tags as string) || '[]'),
      style: row.style as string | undefined,
      emotion: row.emotion as string | undefined,
      trendScore: (row.trend_score as number) || 0,
      likes: (row.likes as number) || 0,
      fires: (row.fires as number) || 0,
      wows: (row.wows as number) || 0,
      copies: (row.copies as number) || 0,
      generates: (row.generates as number) || 0,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      firstSeenAt: row.first_seen_at as string,
      crossPlatformCount: (row.cross_platform_count as number) || 0,
      creatorCount: (row.creator_count as number) || 0,
      engagementVelocity: (row.engagement_velocity as number) || 0,
      clusterId: row.cluster_id as string | undefined,
      isApproved: row.is_approved === 1,
    };
  }

  private mapPromptsFromDB(rows: Record<string, unknown>[]): Prompt[] {
    return rows.map((row) => this.mapPromptFromDB(row));
  }

  // ============ SAVED PROMPTS ============

  async savePrompt(promptId: string, offline = false): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.runSync(
      `INSERT OR REPLACE INTO saved_prompts (id, prompt_id, is_offline, saved_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [`saved_${promptId}`, promptId, offline ? 1 : 0]
    );
  }

  async unsavePrompt(promptId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.runSync('DELETE FROM saved_prompts WHERE prompt_id = ?', [promptId]);
  }

  async getSavedPrompts(): Promise<Prompt[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = this.db.getAllSync(`
      SELECT p.*, sp.saved_at, sp.is_offline
      FROM prompts p
      INNER JOIN saved_prompts sp ON p.id = sp.prompt_id
      ORDER BY sp.saved_at DESC
    `);

    return this.mapPromptsFromDB(rows as Record<string, unknown>[]);
  }

  async isPromptSaved(promptId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const row = this.db.getFirstSync(
      'SELECT 1 FROM saved_prompts WHERE prompt_id = ?',
      [promptId]
    );
    return !!row;
  }

  // ============ VIRAL CHATS ============

  async cacheViralChats(chats: ViralChat[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const statement = this.db.prepareSync(`
      INSERT OR REPLACE INTO viral_chats (
        id, title, description, example, category, preview_url,
        uses, likes, fires, wows, copies,
        created_at, is_viral, trend_score, cached_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    try {
      for (const chat of chats) {
        statement.executeSync([
          chat.id,
          chat.title,
          chat.description,
          chat.example,
          chat.category,
          chat.previewUrl || null,
          chat.uses || 0,
          chat.likes || 0,
          chat.fires || 0,
          chat.wows || 0,
          chat.copies || 0,
          chat.createdAt || new Date().toISOString(),
          chat.isViral ? 1 : 0,
          chat.trendScore || 0,
        ]);
      }
    } finally {
      statement.finalizeSync();
    }
  }

  async getCachedViralChats(category?: string): Promise<ViralChat[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM viral_chats';
    const params: string[] = [];

    if (category && category !== 'all') {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY uses DESC';

    const rows = this.db.getAllSync(query, params);
    return this.mapViralChatsFromDB(rows as Record<string, unknown>[]);
  }

  async getViralChatById(id: string): Promise<ViralChat | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = this.db.getFirstSync('SELECT * FROM viral_chats WHERE id = ?', [id]);
    if (!row) return null;

    const chats = this.mapViralChatsFromDB([row as Record<string, unknown>]);
    return chats[0] || null;
  }

  private mapViralChatsFromDB(rows: Record<string, unknown>[]): ViralChat[] {
    return rows.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      example: row.example as string,
      category: row.category as 'roast' | 'transform' | 'describe' | 'game' | 'fun',
      previewUrl: row.preview_url as string | undefined,
      uses: (row.uses as number) || 0,
      likes: (row.likes as number) || 0,
      fires: (row.fires as number) || 0,
      wows: (row.wows as number) || 0,
      copies: (row.copies as number) || 0,
      createdAt: row.created_at as string,
      isViral: row.is_viral === 1,
      trendScore: (row.trend_score as number) || 0,
    }));
  }

  // ============ REACTIONS ============

  async addReaction(promptId: string, reactionType: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `${promptId}_${reactionType}_${Date.now()}`;
    this.db.runSync(
      `INSERT INTO reactions (id, prompt_id, reaction_type, synced)
       VALUES (?, ?, ?, 0)`,
      [id, promptId, reactionType]
    );
  }

  async getUnsyncedReactions(): Promise<Array<{ promptId: string; reactionType: string }>> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = this.db.getAllSync(
      'SELECT prompt_id, reaction_type FROM reactions WHERE synced = 0'
    );

    return (rows as Array<{ prompt_id: string; reaction_type: string }>).map((r) => ({
      promptId: r.prompt_id,
      reactionType: r.reaction_type,
    }));
  }

  async markReactionsSynced(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.runSync('UPDATE reactions SET synced = 1 WHERE synced = 0');
  }

  // ============ USER PREFERENCES ============

  async setPreference(key: string, value: unknown): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.runSync(
      `INSERT OR REPLACE INTO user_prefs (key, value, updated_at)
       VALUES (?, ?, datetime('now'))`,
      [key, JSON.stringify(value)]
    );
  }

  async getPreference<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    const row = this.db.getFirstSync(
      'SELECT value FROM user_prefs WHERE key = ?',
      [key]
    ) as { value: string } | null;

    if (!row) return defaultValue;
    return JSON.parse(row.value);
  }

  async getAllPreferences(): Promise<Record<string, unknown>> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = this.db.getAllSync('SELECT key, value FROM user_prefs') as Array<{ key: string; value: string }>;

    const prefs: Record<string, unknown> = {};
    for (const row of rows) {
      prefs[row.key] = JSON.parse(row.value);
    }
    return prefs;
  }

  // ============ CACHE MANAGEMENT ============

  async getCacheStats(): Promise<{ promptCount: number; savedCount: number; chatCount: number; sizeKB: number }> {
    if (!this.db) throw new Error('Database not initialized');

    const promptResult = this.db.getFirstSync('SELECT COUNT(*) as count FROM prompts') as { count: number };
    const savedResult = this.db.getFirstSync('SELECT COUNT(*) as count FROM saved_prompts') as { count: number };
    const chatResult = this.db.getFirstSync('SELECT COUNT(*) as count FROM viral_chats') as { count: number };

    const promptCount = promptResult?.count || 0;
    const savedCount = savedResult?.count || 0;
    const chatCount = chatResult?.count || 0;
    const sizeKB = (promptCount * 2) + (savedCount * 0.5) + (chatCount * 1);

    return { promptCount, savedCount, chatCount, sizeKB };
  }

  async clearCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.runSync('DELETE FROM prompts WHERE id NOT IN (SELECT prompt_id FROM saved_prompts WHERE is_offline = 1)');
    this.db.runSync('DELETE FROM viral_chats');
    this.db.runSync('DELETE FROM reactions WHERE synced = 1');
  }

  async clearOldCache(daysOld = 7): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.runSync(
      `DELETE FROM prompts 
       WHERE cached_at < datetime('now', ? || ' days')
       AND id NOT IN (SELECT prompt_id FROM saved_prompts)`,
      [`-${daysOld}`]
    );
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.runSync('DELETE FROM reactions');
    this.db.runSync('DELETE FROM saved_prompts');
    this.db.runSync('DELETE FROM prompts');
    this.db.runSync('DELETE FROM viral_chats');
    this.db.runSync('DELETE FROM user_prefs');
  }
}

export const databaseService = new DatabaseService();
export default databaseService;

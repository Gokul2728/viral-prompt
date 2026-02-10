/**
 * Prompt Directory Scrapers
 * Fetches trending prompts from Lexica, CivitAI, and PromptHero
 */

import axios from "axios";
import { chromium, Browser, Page } from "playwright";

export interface PromptEntry {
  id: string;
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  model?: string;
  likes: number;
  source: "lexica" | "civitai" | "prompthero";
  createdAt?: string;
  author?: string;
  tags: string[];
}

// User agent for requests
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

/**
 * Fetch prompts from Lexica API
 */
export async function fetchLexicaPrompts(
  query: string = "",
  limit: number = 50,
): Promise<PromptEntry[]> {
  const results: PromptEntry[] = [];

  try {
    // Lexica has a public search API
    const response = await axios.get("https://lexica.art/api/v1/search", {
      params: {
        q: query || "trending",
      },
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    const images = response.data.images || [];

    for (const image of images.slice(0, limit)) {
      results.push({
        id:
          image.id ||
          `lexica_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prompt: image.prompt || "",
        negativePrompt: image.negativePrompt,
        imageUrl: image.src || image.srcSmall,
        thumbnailUrl: image.srcSmall,
        model: image.model,
        likes: 0, // Lexica doesn't expose likes in API
        source: "lexica",
        tags: extractTagsFromPrompt(image.prompt || ""),
      });
    }
  } catch (error) {
    console.error("Error fetching Lexica prompts:", error);
  }

  return results;
}

/**
 * Fetch prompts from CivitAI API
 */
export async function fetchCivitAIImages(
  limit: number = 50,
  sort: "Most Reactions" | "Newest" | "Random" = "Most Reactions",
  period: "Day" | "Week" | "Month" | "Year" | "AllTime" = "Week",
): Promise<PromptEntry[]> {
  const results: PromptEntry[] = [];

  try {
    const response = await axios.get("https://civitai.com/api/v1/images", {
      params: {
        limit,
        sort,
        period,
        nsfw: false,
      },
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    const items = response.data.items || [];

    for (const item of items) {
      if (!item.meta?.prompt) continue;

      results.push({
        id:
          item.id?.toString() ||
          `civitai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prompt: item.meta.prompt,
        negativePrompt: item.meta.negativePrompt,
        imageUrl: item.url,
        thumbnailUrl: item.url,
        model: item.meta.Model || item.meta.model,
        likes: item.stats?.likeCount || 0,
        source: "civitai",
        createdAt: item.createdAt,
        author: item.username,
        tags: extractTagsFromPrompt(item.meta.prompt),
      });
    }
  } catch (error) {
    console.error("Error fetching CivitAI images:", error);
  }

  return results;
}

/**
 * Fetch trending prompts from PromptHero using web scraping
 */
export async function fetchPromptHeroPrompts(
  limit: number = 50,
): Promise<PromptEntry[]> {
  const results: PromptEntry[] = [];
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      userAgent: USER_AGENT,
    });

    // Navigate to trending page
    await page.goto("https://prompthero.com/models/midjourney", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    // Scroll to load more content
    for (let i = 0; i < 3; i++) {
      await page.evaluate("window.scrollBy(0, window.innerHeight)");
      await page.waitForTimeout(1500);
    }

    // Extract prompt cards
    const cards = await page.$$('.prompt-card, [class*="PromptCard"]');

    for (const card of cards.slice(0, limit)) {
      try {
        const promptText = await card
          .$eval(
            '.prompt-text, [class*="prompt"]',
            (el) => el.textContent?.trim() || "",
          )
          .catch(() => "");

        const imageUrl = await card
          .$eval("img", (el) => el.getAttribute("src") || "")
          .catch(() => "");

        const likesText = await card
          .$eval(
            '[class*="likes"], [class*="heart"]',
            (el) => el.textContent?.trim() || "0",
          )
          .catch(() => "0");

        if (promptText && imageUrl) {
          results.push({
            id: `prompthero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            prompt: promptText,
            imageUrl,
            thumbnailUrl: imageUrl,
            likes: parseInt(likesText.replace(/[^0-9]/g, "")) || 0,
            source: "prompthero",
            tags: extractTagsFromPrompt(promptText),
          });
        }
      } catch (error) {
        // Skip failed cards
      }
    }
  } catch (error) {
    console.error("Error fetching PromptHero prompts:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return results;
}

/**
 * Extract tags/keywords from prompt text
 */
function extractTagsFromPrompt(prompt: string): string[] {
  const tags = new Set<string>();
  const lower = prompt.toLowerCase();

  // Style tags
  const styles = [
    "cinematic",
    "anime",
    "realistic",
    "photorealistic",
    "fantasy",
    "cyberpunk",
    "steampunk",
    "surreal",
    "3d render",
    "digital art",
    "oil painting",
    "watercolor",
    "concept art",
    "illustration",
  ];
  for (const style of styles) {
    if (lower.includes(style)) tags.add(style);
  }

  // Quality tags
  const qualities = [
    "8k",
    "4k",
    "hdr",
    "highly detailed",
    "masterpiece",
    "best quality",
    "ultra realistic",
    "sharp focus",
  ];
  for (const quality of qualities) {
    if (lower.includes(quality)) tags.add(quality);
  }

  // Emotion tags
  const emotions = [
    "dark",
    "moody",
    "peaceful",
    "dramatic",
    "ethereal",
    "mysterious",
    "nostalgic",
    "melancholic",
  ];
  for (const emotion of emotions) {
    if (lower.includes(emotion)) tags.add(emotion);
  }

  return [...tags];
}

/**
 * Fetch prompts from all sources
 */
export async function fetchAllPromptSources(
  limit: number = 30,
): Promise<PromptEntry[]> {
  const [lexica, civitai, prompthero] = await Promise.all([
    fetchLexicaPrompts("", limit),
    fetchCivitAIImages(limit, "Most Reactions", "Week"),
    fetchPromptHeroPrompts(limit),
  ]);

  return [...lexica, ...civitai, ...prompthero];
}

/**
 * Calculate engagement velocity for prompt entry
 */
export function calculateEngagementVelocity(entry: PromptEntry): number {
  // Base score on likes and recency
  let score = Math.log10(entry.likes + 1) * 10;

  // Boost for recent entries
  if (entry.createdAt) {
    const ageInDays =
      (Date.now() - new Date(entry.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    if (ageInDays < 7) {
      score *= 1 + (7 - ageInDays) / 7;
    }
  }

  return Math.min(100, score);
}

export default {
  fetchLexicaPrompts,
  fetchCivitAIImages,
  fetchPromptHeroPrompts,
  fetchAllPromptSources,
  calculateEngagementVelocity,
};

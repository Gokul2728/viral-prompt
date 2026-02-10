/**
 * X (Twitter) Scraper
 * Light scraping for public posts - no login required
 * Uses Playwright for browser automation
 */

import { chromium, Browser, Page } from 'playwright';

export interface XPost {
  id: string;
  text: string;
  authorUsername: string;
  authorDisplayName?: string;
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  createdAt?: string;
  mediaUrls: string[];
  hashtags: string[];
  url: string;
}

// AI-related search terms
const AI_SEARCH_TERMS = [
  'ai art',
  'midjourney',
  'stable diffusion',
  'ai generated',
  'text to video',
  'ai video',
  'dalle',
  'sora ai',
  'runway gen',
  'pika labs',
];

// Random delays to avoid detection
function randomDelay(min: number = 2000, max: number = 5000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// User agents rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
];

/**
 * Initialize browser with anti-detection measures
 */
async function initBrowser(): Promise<Browser> {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
    ],
  });
  return browser;
}

/**
 * Setup page with random user agent
 */
async function setupPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({
    userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
  });
  
  const page = await context.newPage();
  
  // Block unnecessary resources
  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  return page;
}

/**
 * Fetch trending posts from X search
 */
export async function fetchXTrends(
  keyword: string,
  maxPosts: number = 20
): Promise<XPost[]> {
  let browser: Browser | null = null;
  const posts: XPost[] = [];

  try {
    browser = await initBrowser();
    const page = await setupPage(browser);

    // Navigate to search
    const searchUrl = `https://x.com/search?q=${encodeURIComponent(keyword)}&f=live`;
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    await randomDelay(3000, 6000);

    // Scroll to load more content
    for (let i = 0; i < 3; i++) {
      await page.evaluate('window.scrollBy(0, window.innerHeight)');
      await randomDelay(2000, 4000);
    }

    // Extract post data
    const postElements = await page.$$('article[data-testid="tweet"]');
    
    for (const element of postElements.slice(0, maxPosts)) {
      try {
        const textElement = await element.$('[data-testid="tweetText"]');
        const text = textElement ? await textElement.textContent() : '';

        const linkElement = await element.$('a[href*="/status/"]');
        const url = linkElement ? await linkElement.getAttribute('href') : '';
        const id = url ? url.split('/status/')[1]?.split('?')[0] : '';

        // Extract metrics (best effort)
        const metricsText = await element.evaluate(el => el.textContent || '');
        
        // Extract hashtags from text
        const hashtags: string[] = [];
        const hashtagMatches = text?.match(/#\w+/g) || [];
        hashtags.push(...hashtagMatches.map(h => h.toLowerCase()));

        // Extract media URLs
        const mediaUrls: string[] = [];
        const imgElements = await element.$$('img[src*="pbs.twimg.com/media"]');
        for (const img of imgElements) {
          const src = await img.getAttribute('src');
          if (src) mediaUrls.push(src);
        }

        posts.push({
          id: id || `x_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: text || '',
          authorUsername: '', // Would need additional parsing
          likes: 0, // Metrics parsing is unreliable
          retweets: 0,
          replies: 0,
          views: 0,
          mediaUrls,
          hashtags,
          url: url ? `https://x.com${url}` : '',
        });
      } catch (error) {
        console.error('Error parsing X post:', error);
      }
    }
  } catch (error) {
    console.error('Error fetching X trends:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return posts;
}

/**
 * Fetch posts from multiple AI-related searches
 */
export async function fetchAITrends(maxPostsPerQuery: number = 10): Promise<XPost[]> {
  const allPosts: XPost[] = [];

  for (const term of AI_SEARCH_TERMS) {
    try {
      const posts = await fetchXTrends(term, maxPostsPerQuery);
      allPosts.push(...posts);
      
      // Wait between searches to avoid rate limiting
      await randomDelay(5000, 10000);
    } catch (error) {
      console.error(`Error fetching X trends for "${term}":`, error);
    }
  }

  // Remove duplicates
  const uniquePosts = Array.from(
    new Map(allPosts.map(p => [p.id, p])).values()
  );

  return uniquePosts;
}

/**
 * Extract prompt signals from X post text
 */
export function extractSignalsFromPost(post: XPost): {
  subjects: string[];
  styles: string[];
  emotions: string[];
  aiTools: string[];
} {
  const text = post.text.toLowerCase();
  
  const subjects: string[] = [];
  const styles: string[] = [];
  const emotions: string[] = [];
  const aiTools: string[] = [];

  // AI tools
  const toolPatterns = [
    /midjourney/i, /stable diffusion/i, /dall-e/i, /dalle/i,
    /runway/i, /pika/i, /sora/i, /luma/i, /kling/i
  ];
  for (const pattern of toolPatterns) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) aiTools.push(match[0]);
    }
  }

  // Styles
  const styleKeywords = [
    'cinematic', 'anime', 'realistic', 'photorealistic', 'cyberpunk',
    'fantasy', 'surreal', '3d render', 'digital art'
  ];
  for (const style of styleKeywords) {
    if (text.includes(style)) styles.push(style);
  }

  // Emotions
  const emotionKeywords = [
    'sad', 'happy', 'dark', 'moody', 'peaceful', 'dramatic'
  ];
  for (const emotion of emotionKeywords) {
    if (text.includes(emotion)) emotions.push(emotion);
  }

  return { subjects, styles, emotions, aiTools };
}

/**
 * Calculate engagement velocity for X post
 * Note: Metrics may not be accurate due to scraping limitations
 */
export function calculateEngagementVelocity(post: XPost): number {
  // Since we can't reliably get metrics or timestamps, return a default
  // This should be upgraded when using official API
  return post.mediaUrls.length > 0 ? 25 : 10;
}

export default {
  fetchXTrends,
  fetchAITrends,
  extractSignalsFromPost,
  calculateEngagementVelocity,
};

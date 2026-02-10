/**
 * Reddit Scraper
 * Fetches trending AI-related posts from Reddit (no auth required for public data)
 */

import axios from 'axios';

export interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  url: string;
  author: string;
  score: number;
  upvoteRatio: number;
  numComments: number;
  createdUtc: number;
  isVideo: boolean;
  isImage: boolean;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink: string;
}

// AI-related subreddits
const AI_SUBREDDITS = [
  'aiArt',
  'StableDiffusion',
  'midjourney',
  'AIVideo',
  'comfyui',
  'dalle2',
  'DefocusAI',
  'singularity',
  'artificial',
  'generativeAI',
  'LocalLLaMA',
  'FluxAI',
  'RunwayML',
  'Sora',
];

// User agent for Reddit API
const USER_AGENT = 'viral-prompt-scraper/1.0';

/**
 * Fetch top posts from AI subreddits
 */
export async function fetchRedditPosts(
  timeframe: 'hour' | 'day' | 'week' | 'month' = 'week',
  limit: number = 25
): Promise<RedditPost[]> {
  const results: RedditPost[] = [];

  for (const subreddit of AI_SUBREDDITS) {
    try {
      const response = await axios.get(
        `https://www.reddit.com/r/${subreddit}/top.json`,
        {
          params: {
            t: timeframe,
            limit: Math.ceil(limit / AI_SUBREDDITS.length),
            raw_json: 1,
          },
          headers: {
            'User-Agent': USER_AGENT,
          },
        }
      );

      const posts = response.data.data.children.map((child: any) => {
        const post = child.data;
        
        // Determine media type and URL
        let isVideo = false;
        let isImage = false;
        let mediaUrl: string | undefined;
        let thumbnailUrl: string | undefined;

        // Check for video
        if (post.is_video && post.media?.reddit_video?.fallback_url) {
          isVideo = true;
          mediaUrl = post.media.reddit_video.fallback_url;
        }
        // Check for image
        else if (post.post_hint === 'image' || 
                 post.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          isImage = true;
          mediaUrl = post.url;
        }
        // Check for gallery
        else if (post.is_gallery && post.media_metadata) {
          isImage = true;
          const firstImage = Object.values(post.media_metadata)[0] as any;
          mediaUrl = firstImage?.s?.u?.replace(/&amp;/g, '&');
        }

        // Get thumbnail
        if (post.thumbnail && !post.thumbnail.startsWith('self') && 
            post.thumbnail !== 'default' && post.thumbnail !== 'nsfw') {
          thumbnailUrl = post.thumbnail;
        }

        return {
          id: post.id,
          subreddit: post.subreddit,
          title: post.title,
          selftext: post.selftext || '',
          url: post.url,
          author: post.author,
          score: post.score,
          upvoteRatio: post.upvote_ratio,
          numComments: post.num_comments,
          createdUtc: post.created_utc,
          isVideo,
          isImage,
          mediaUrl,
          thumbnailUrl,
          permalink: `https://reddit.com${post.permalink}`,
        };
      });

      results.push(...posts);

      // Rate limiting - Reddit recommends max 60 requests per minute
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching from r/${subreddit}:`, error);
    }
  }

  // Remove duplicates and sort by score
  const uniqueResults = Array.from(
    new Map(results.map(p => [p.id, p])).values()
  );
  
  uniqueResults.sort((a, b) => b.score - a.score);

  return uniqueResults;
}

/**
 * Fetch posts from a specific subreddit
 */
export async function fetchSubredditPosts(
  subreddit: string,
  sort: 'hot' | 'new' | 'top' | 'rising' = 'top',
  timeframe: 'hour' | 'day' | 'week' | 'month' = 'week',
  limit: number = 50
): Promise<RedditPost[]> {
  try {
    const params: Record<string, any> = {
      limit,
      raw_json: 1,
    };

    if (sort === 'top') {
      params.t = timeframe;
    }

    const response = await axios.get(
      `https://www.reddit.com/r/${subreddit}/${sort}.json`,
      {
        params,
        headers: {
          'User-Agent': USER_AGENT,
        },
      }
    );

    return response.data.data.children.map((child: any) => {
      const post = child.data;
      
      let isVideo = false;
      let isImage = false;
      let mediaUrl: string | undefined;
      let thumbnailUrl: string | undefined;

      if (post.is_video && post.media?.reddit_video?.fallback_url) {
        isVideo = true;
        mediaUrl = post.media.reddit_video.fallback_url;
      } else if (post.post_hint === 'image' || 
                 post.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        isImage = true;
        mediaUrl = post.url;
      } else if (post.is_gallery && post.media_metadata) {
        isImage = true;
        const firstImage = Object.values(post.media_metadata)[0] as any;
        mediaUrl = firstImage?.s?.u?.replace(/&amp;/g, '&');
      }

      if (post.thumbnail && !post.thumbnail.startsWith('self') && 
          post.thumbnail !== 'default' && post.thumbnail !== 'nsfw') {
        thumbnailUrl = post.thumbnail;
      }

      return {
        id: post.id,
        subreddit: post.subreddit,
        title: post.title,
        selftext: post.selftext || '',
        url: post.url,
        author: post.author,
        score: post.score,
        upvoteRatio: post.upvote_ratio,
        numComments: post.num_comments,
        createdUtc: post.created_utc,
        isVideo,
        isImage,
        mediaUrl,
        thumbnailUrl,
        permalink: `https://reddit.com${post.permalink}`,
      };
    });
  } catch (error) {
    console.error(`Error fetching from r/${subreddit}:`, error);
    return [];
  }
}

/**
 * Search Reddit for specific terms
 */
export async function searchReddit(
  query: string,
  sort: 'relevance' | 'hot' | 'top' | 'new' | 'comments' = 'top',
  timeframe: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'week',
  limit: number = 50
): Promise<RedditPost[]> {
  try {
    const response = await axios.get(
      'https://www.reddit.com/search.json',
      {
        params: {
          q: query,
          sort,
          t: timeframe,
          limit,
          raw_json: 1,
        },
        headers: {
          'User-Agent': USER_AGENT,
        },
      }
    );

    return response.data.data.children.map((child: any) => {
      const post = child.data;
      
      let isVideo = false;
      let isImage = false;
      let mediaUrl: string | undefined;
      let thumbnailUrl: string | undefined;

      if (post.is_video && post.media?.reddit_video?.fallback_url) {
        isVideo = true;
        mediaUrl = post.media.reddit_video.fallback_url;
      } else if (post.post_hint === 'image' || 
                 post.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        isImage = true;
        mediaUrl = post.url;
      }

      if (post.thumbnail && !post.thumbnail.startsWith('self') && 
          post.thumbnail !== 'default') {
        thumbnailUrl = post.thumbnail;
      }

      return {
        id: post.id,
        subreddit: post.subreddit,
        title: post.title,
        selftext: post.selftext || '',
        url: post.url,
        author: post.author,
        score: post.score,
        upvoteRatio: post.upvote_ratio,
        numComments: post.num_comments,
        createdUtc: post.created_utc,
        isVideo,
        isImage,
        mediaUrl,
        thumbnailUrl,
        permalink: `https://reddit.com${post.permalink}`,
      };
    });
  } catch (error) {
    console.error('Error searching Reddit:', error);
    return [];
  }
}

/**
 * Calculate engagement velocity for a Reddit post
 */
export function calculateEngagementVelocity(post: RedditPost): number {
  const ageInHours = (Date.now() / 1000 - post.createdUtc) / 3600;
  
  if (ageInHours < 1) return 0;

  const engagements = post.score + (post.numComments * 5);
  const velocity = engagements / ageInHours;

  // Normalize to 0-100 scale
  return Math.min(100, Math.log10(velocity + 1) * 25);
}

export default {
  fetchRedditPosts,
  fetchSubredditPosts,
  searchReddit,
  calculateEngagementVelocity,
};

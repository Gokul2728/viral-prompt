/**
 * YouTube Scraper
 * Fetches trending AI-related videos using YouTube Data API
 */

import axios from 'axios';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  tags: string[];
}

// AI-related search queries
const AI_SEARCH_QUERIES = [
  'ai video generation',
  'ai art',
  'midjourney',
  'stable diffusion',
  'runway gen',
  'pika labs',
  'sora ai',
  'ai animation',
  'ai shorts',
  'text to video ai',
  'dall-e',
  'ai generated',
];

/**
 * Fetch trending AI videos from YouTube
 */
export async function fetchTrendingVideos(
  apiKey: string,
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  const results: YouTubeVideo[] = [];

  for (const query of AI_SEARCH_QUERIES) {
    try {
      // Search for videos
      const searchResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          key: apiKey,
          q: query,
          part: 'snippet',
          type: 'video',
          maxResults: Math.ceil(maxResults / AI_SEARCH_QUERIES.length),
          order: 'viewCount',
          publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          relevanceLanguage: 'en',
          videoDefinition: 'high',
        },
      });

      const videoIds = searchResponse.data.items
        .map((item: any) => item.id.videoId)
        .filter(Boolean)
        .join(',');

      if (!videoIds) continue;

      // Get video details
      const detailsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: {
          key: apiKey,
          id: videoIds,
          part: 'snippet,statistics,contentDetails',
        },
      });

      for (const video of detailsResponse.data.items) {
        results.push({
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          thumbnailUrl: video.snippet.thumbnails?.high?.url || 
                        video.snippet.thumbnails?.default?.url,
          viewCount: parseInt(video.statistics?.viewCount || '0'),
          likeCount: parseInt(video.statistics?.likeCount || '0'),
          commentCount: parseInt(video.statistics?.commentCount || '0'),
          duration: video.contentDetails?.duration || '',
          tags: video.snippet.tags || [],
        });
      }

      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error fetching YouTube videos for query "${query}":`, error);
    }
  }

  // Remove duplicates
  const uniqueResults = Array.from(
    new Map(results.map(v => [v.id, v])).values()
  );

  return uniqueResults;
}

/**
 * Fetch YouTube Shorts specifically
 */
export async function fetchTrendingShorts(
  apiKey: string,
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  const results: YouTubeVideo[] = [];

  for (const query of AI_SEARCH_QUERIES) {
    try {
      const searchResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          key: apiKey,
          q: `${query} #shorts`,
          part: 'snippet',
          type: 'video',
          videoDuration: 'short',
          maxResults: Math.ceil(maxResults / AI_SEARCH_QUERIES.length),
          order: 'viewCount',
          publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      const videoIds = searchResponse.data.items
        .map((item: any) => item.id.videoId)
        .filter(Boolean)
        .join(',');

      if (!videoIds) continue;

      const detailsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: {
          key: apiKey,
          id: videoIds,
          part: 'snippet,statistics,contentDetails',
        },
      });

      for (const video of detailsResponse.data.items) {
        results.push({
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          thumbnailUrl: video.snippet.thumbnails?.high?.url || 
                        video.snippet.thumbnails?.default?.url,
          viewCount: parseInt(video.statistics?.viewCount || '0'),
          likeCount: parseInt(video.statistics?.likeCount || '0'),
          commentCount: parseInt(video.statistics?.commentCount || '0'),
          duration: video.contentDetails?.duration || '',
          tags: video.snippet.tags || [],
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error fetching YouTube Shorts for query "${query}":`, error);
    }
  }

  const uniqueResults = Array.from(
    new Map(results.map(v => [v.id, v])).values()
  );

  return uniqueResults;
}

/**
 * Get video comments for additional context
 */
export async function getVideoComments(
  apiKey: string,
  videoId: string,
  maxResults: number = 10
): Promise<string[]> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/commentThreads`, {
      params: {
        key: apiKey,
        videoId,
        part: 'snippet',
        maxResults,
        order: 'relevance',
      },
    });

    return response.data.items.map(
      (item: any) => item.snippet.topLevelComment.snippet.textOriginal
    );
  } catch (error) {
    console.error('Error fetching video comments:', error);
    return [];
  }
}

/**
 * Calculate engagement velocity for a video
 */
export function calculateEngagementVelocity(video: YouTubeVideo): number {
  const publishedDate = new Date(video.publishedAt);
  const ageInHours = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
  
  if (ageInHours < 1) return 0;

  const engagements = video.viewCount + (video.likeCount * 5) + (video.commentCount * 10);
  const velocity = engagements / ageInHours;

  // Normalize to 0-100 scale
  return Math.min(100, Math.log10(velocity + 1) * 20);
}

export default {
  fetchTrendingVideos,
  fetchTrendingShorts,
  getVideoComments,
  calculateEngagementVelocity,
};

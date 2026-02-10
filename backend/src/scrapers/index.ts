/**
 * Scrapers Index
 * Barrel export for all scraper modules
 */

export { 
  fetchTrendingVideos, 
  fetchTrendingShorts, 
  getVideoComments,
  calculateEngagementVelocity as calculateYouTubeVelocity,
  YouTubeVideo 
} from './youtube';

export { 
  fetchRedditPosts, 
  fetchSubredditPosts, 
  searchReddit,
  calculateEngagementVelocity as calculateRedditVelocity,
  RedditPost 
} from './reddit';

export { 
  fetchXTrends, 
  fetchAITrends,
  extractSignalsFromPost,
  calculateEngagementVelocity as calculateXVelocity,
  XPost 
} from './x';

export { 
  fetchLexicaPrompts, 
  fetchCivitAIImages, 
  fetchPromptHeroPrompts,
  fetchAllPromptSources,
  calculateEngagementVelocity as calculatePromptVelocity,
  PromptEntry 
} from './promptDirectories';

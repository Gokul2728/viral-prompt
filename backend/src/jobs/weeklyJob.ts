/**
 * Weekly Content Processing Job
 * Fetches content, extracts features, clusters posts, and generates prompts
 */

import cron from 'node-cron';
import { Post, IPost } from '../models/Post';
import { Cluster } from '../models/Cluster';
import { Prompt } from '../models/Prompt';
import { Notification } from '../models/Notification';
import { 
  fetchTrendingVideos, 
  fetchTrendingShorts,
  fetchRedditPosts,
  YouTubeVideo,
  RedditPost,
  calculateYouTubeVelocity,
  calculateRedditVelocity,
} from '../scrapers';
import { extractSignals, TextSignals } from '../services/signalExtractor';
import { clusterPosts, ClusterResult } from '../services/clustering';
import { generatePrompt, generateClusterName } from '../services/promptBuilder';

// Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const ENABLE_VISION_API = process.env.ENABLE_VISION_API === 'true';
const MIN_TREND_SCORE = 40;
const MAX_POSTS_PER_SOURCE = 50;

/**
 * Convert YouTube video to Post document
 */
function youtubeToPost(video: YouTubeVideo, signals: TextSignals): Partial<IPost> {
  return {
    platform: 'youtube',
    sourceId: video.id,
    sourceUrl: `https://youtube.com/watch?v=${video.id}`,
    mediaType: 'video',
    mediaUrl: `https://youtube.com/watch?v=${video.id}`,
    thumbnailUrl: video.thumbnailUrl,
    caption: video.description,
    title: video.title,
    hashtags: video.tags || [],
    visualFeatures: {
      subjects: signals.subjects,
      emotion: signals.emotion,
      style: signals.style,
      motion: signals.motion,
      environment: signals.environment,
    },
    textSignals: signals,
    engagementVelocity: calculateYouTubeVelocity(video),
    likes: video.likeCount,
    views: video.viewCount,
    comments: video.commentCount,
    shares: 0,
    creatorId: video.channelId,
    creatorUsername: video.channelTitle,
    publishedAt: new Date(video.publishedAt),
    scrapedAt: new Date(),
  };
}

/**
 * Convert Reddit post to Post document
 */
function redditToPost(post: RedditPost, signals: TextSignals): Partial<IPost> {
  return {
    platform: 'reddit',
    sourceId: post.id,
    sourceUrl: post.permalink,
    mediaType: post.isVideo ? 'video' : 'image',
    mediaUrl: post.mediaUrl,
    thumbnailUrl: post.thumbnailUrl,
    caption: post.selftext,
    title: post.title,
    hashtags: [],
    visualFeatures: {
      subjects: signals.subjects,
      emotion: signals.emotion,
      style: signals.style,
      motion: signals.motion,
      environment: signals.environment,
    },
    textSignals: signals,
    engagementVelocity: calculateRedditVelocity(post),
    likes: post.score,
    views: 0,
    comments: post.numComments,
    shares: 0,
    creatorId: post.author,
    creatorUsername: post.author,
    publishedAt: new Date(post.createdUtc * 1000),
    scrapedAt: new Date(),
  };
}

/**
 * Save or update posts in database
 */
async function savePosts(posts: Partial<IPost>[]): Promise<IPost[]> {
  const savedPosts: IPost[] = [];

  for (const postData of posts) {
    try {
      // Upsert based on platform + sourceId
      const result = await Post.findOneAndUpdate(
        { platform: postData.platform, sourceId: postData.sourceId },
        { $set: postData },
        { upsert: true, new: true }
      );
      savedPosts.push(result);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  }

  return savedPosts;
}

/**
 * Save clusters to database
 */
async function saveClusters(clusters: ClusterResult[]): Promise<void> {
  for (const clusterResult of clusters) {
    try {
      // Only save clusters with trend score above threshold
      if (clusterResult.trendScore < MIN_TREND_SCORE) continue;

      // Generate prompt and name
      const generatedPrompt = generatePrompt(clusterResult.visualFeatures, clusterResult.mediaType);
      const name = generateClusterName(clusterResult.visualFeatures);

      // Create or update cluster
      const cluster = await Cluster.create({
        mediaType: clusterResult.mediaType,
        name,
        posts: clusterResult.posts.map(p => p._id),
        representativePostId: clusterResult.posts[0]?._id,
        visualFeatures: clusterResult.visualFeatures,
        metrics: clusterResult.metrics,
        trendScore: clusterResult.trendScore,
        status: clusterResult.status,
        generatedPrompt: generatedPrompt.enhancedVersion,
        platforms: clusterResult.platforms,
      });

      // Update posts with cluster ID
      await Post.updateMany(
        { _id: { $in: clusterResult.posts.map(p => p._id) } },
        { $set: { clusterId: cluster._id, processed: true } }
      );

      console.log(`Created cluster: ${name} (Score: ${clusterResult.trendScore}, Status: ${clusterResult.status})`);
    } catch (error) {
      console.error('Error saving cluster:', error);
    }
  }
}

/**
 * Main job: Fetch, process, and cluster content
 */
export async function runWeeklyJob(): Promise<{
  postsProcessed: number;
  clustersCreated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  const allPosts: Partial<IPost>[] = [];

  console.log('🚀 Starting weekly content processing job...');

  // 1. Fetch YouTube content
  if (YOUTUBE_API_KEY) {
    try {
      console.log('📺 Fetching YouTube videos...');
      const [videos, shorts] = await Promise.all([
        fetchTrendingVideos(YOUTUBE_API_KEY, MAX_POSTS_PER_SOURCE),
        fetchTrendingShorts(YOUTUBE_API_KEY, MAX_POSTS_PER_SOURCE),
      ]);

      for (const video of [...videos, ...shorts]) {
        const signals = extractSignals(`${video.title} ${video.description}`);
        allPosts.push(youtubeToPost(video, signals));
      }

      console.log(`✅ Fetched ${videos.length + shorts.length} YouTube videos`);
    } catch (error) {
      const message = `YouTube fetch error: ${error}`;
      console.error(message);
      errors.push(message);
    }
  }

  // 2. Fetch Reddit content
  try {
    console.log('📱 Fetching Reddit posts...');
    const redditPosts = await fetchRedditPosts('week', MAX_POSTS_PER_SOURCE);
    
    // Filter for posts with media
    const mediaPosts = redditPosts.filter(p => p.isImage || p.isVideo);
    
    for (const post of mediaPosts) {
      const signals = extractSignals(`${post.title} ${post.selftext}`);
      allPosts.push(redditToPost(post, signals));
    }

    console.log(`✅ Fetched ${mediaPosts.length} Reddit posts`);
  } catch (error) {
    const message = `Reddit fetch error: ${error}`;
    console.error(message);
    errors.push(message);
  }

  // 3. Save posts to database
  console.log('💾 Saving posts to database...');
  const savedPosts = await savePosts(allPosts);
  console.log(`✅ Saved ${savedPosts.length} posts`);

  // 4. Get all unprocessed posts for clustering
  const unprocessedPosts = await Post.find({ processed: false }).lean() as unknown as IPost[];
  console.log(`📊 Found ${unprocessedPosts.length} posts to cluster`);

  // 5. Run clustering
  console.log('🔬 Running clustering algorithm...');
  const clusters = clusterPosts(unprocessedPosts);
  console.log(`✅ Created ${clusters.length} clusters`);

  // 6. Save clusters
  await saveClusters(clusters);

  // 7. Log summary
  const summary = {
    postsProcessed: savedPosts.length,
    clustersCreated: clusters.filter(c => c.trendScore >= MIN_TREND_SCORE).length,
    errors,
  };

  console.log('📈 Weekly job completed:', summary);
  return summary;
}

/**
 * Send notifications for viral clusters
 */
export async function sendViralNotifications(): Promise<number> {
  const viralClusters = await Cluster.find({
    status: 'viral',
    notificationSent: false,
    isApproved: true,
  });

  let sent = 0;

  for (const cluster of viralClusters) {
    try {
      await Notification.create({
        type: 'new_viral',
        title: '🔥 New Viral Trend Detected!',
        body: cluster.name || 'A new viral prompt trend is emerging',
        data: {
          clusterId: cluster._id,
          trendScore: cluster.trendScore,
          mediaType: cluster.mediaType,
        },
        global: true,
      });

      cluster.notificationSent = true;
      cluster.notificationSentAt = new Date();
      await cluster.save();

      sent++;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  return sent;
}

/**
 * Publish approved clusters as prompts
 */
export async function publishApprovedClusters(): Promise<number> {
  const approvedClusters = await Cluster.find({
    isApproved: true,
    publishedAsPromptId: { $exists: false },
  }).populate('representativePostId');

  let published = 0;

  for (const cluster of approvedClusters) {
    try {
      const representativePost = cluster.representativePostId as unknown as IPost;

      const prompt = await Prompt.create({
        text: cluster.generatedPrompt,
        type: cluster.mediaType,
        previewUrl: representativePost?.thumbnailUrl || representativePost?.mediaUrl,
        previewType: cluster.mediaType,
        platforms: cluster.platforms,
        aiTools: [], // Will be determined by user feedback
        tags: [
          ...cluster.visualFeatures.subjects.slice(0, 5),
          ...cluster.visualFeatures.style.slice(0, 3),
        ],
        style: cluster.visualFeatures.style[0],
        emotion: cluster.visualFeatures.emotion[0],
        trendScore: cluster.trendScore,
        firstSeenAt: cluster.createdAt,
        crossPlatformCount: cluster.metrics.platformCount,
        creatorCount: cluster.metrics.creatorCount,
        engagementVelocity: cluster.metrics.avgEngagementVelocity,
        clusterId: cluster._id.toString(),
        isApproved: true,
      });

      cluster.publishedAsPromptId = prompt._id;
      await cluster.save();

      published++;
    } catch (error) {
      console.error('Error publishing cluster:', error);
    }
  }

  return published;
}

/**
 * Schedule weekly job (runs every Sunday at midnight)
 */
export function scheduleWeeklyJob(): void {
  // Run every Sunday at 00:00
  cron.schedule('0 0 * * 0', async () => {
    console.log('⏰ Starting scheduled weekly job...');
    try {
      await runWeeklyJob();
      await publishApprovedClusters();
      await sendViralNotifications();
    } catch (error) {
      console.error('Weekly job failed:', error);
    }
  });

  console.log('📅 Weekly job scheduled for Sundays at midnight');
}

/**
 * Schedule daily viral check (runs every day at 6 AM)
 */
export function scheduleDailyViralCheck(): void {
  cron.schedule('0 6 * * *', async () => {
    console.log('⏰ Running daily viral check...');
    try {
      const sent = await sendViralNotifications();
      console.log(`📬 Sent ${sent} viral notifications`);
    } catch (error) {
      console.error('Daily viral check failed:', error);
    }
  });

  console.log('📅 Daily viral check scheduled for 6 AM');
}

export default {
  runWeeklyJob,
  sendViralNotifications,
  publishApprovedClusters,
  scheduleWeeklyJob,
  scheduleDailyViralCheck,
};

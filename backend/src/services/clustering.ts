/**
 * Clustering Service
 * Groups similar posts into clusters using weighted similarity scoring
 */

import { IPost, IVisualFeatures } from '../models/Post';
import { IClusterMetrics, IClusterVisualFeatures } from '../models/Cluster';
import natural from 'natural';
const TfIdf = natural.TfIdf;

// Similarity threshold for clustering
const SIMILARITY_THRESHOLD = 0.72;

// Weights for different similarity signals
const WEIGHTS = {
  visual: 0.6,
  caption: 0.4,
  visualSubjects: 0.4,
  visualEmotion: 0.2,
  visualStyle: 0.2,
  visualMotion: 0.1,
  visualEnvironment: 0.1,
};

export interface ProcessedPost {
  _id: string;
  mediaType: 'image' | 'video';
  caption: string;
  visualFeatures: IVisualFeatures;
  engagementVelocity: number;
  platform: string;
  creatorId: string;
  likes: number;
  views: number;
}

export interface ClusterResult {
  id: string;
  mediaType: 'image' | 'video';
  posts: ProcessedPost[];
  metrics: IClusterMetrics;
  trendScore: number;
  status: 'emerging' | 'trending' | 'viral' | 'stable' | 'declining';
  visualFeatures: IClusterVisualFeatures;
  platforms: string[];
}

/**
 * Normalize array values (lowercase, trim, unique)
 */
function normalizeArray(arr: string[] = []): string[] {
  return [...new Set(arr.map(v => v.toLowerCase().trim()))];
}

/**
 * Prepare a post for clustering
 */
export function preparePost(post: IPost): ProcessedPost {
  return {
    _id: post._id.toString(),
    mediaType: post.mediaType,
    caption: post.caption || '',
    visualFeatures: {
      subjects: normalizeArray(post.visualFeatures?.subjects),
      emotion: normalizeArray(post.visualFeatures?.emotion),
      style: normalizeArray(post.visualFeatures?.style),
      motion: normalizeArray(post.visualFeatures?.motion),
      environment: normalizeArray(post.visualFeatures?.environment),
    },
    engagementVelocity: post.engagementVelocity || 0,
    platform: post.platform,
    creatorId: post.creatorId,
    likes: post.likes || 0,
    views: post.views || 0,
  };
}

/**
 * Jaccard similarity for arrays
 */
export function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x));
  const union = new Set([...a, ...b]);
  
  return intersection.length / union.size;
}

/**
 * Visual similarity score between two posts
 */
export function visualSimilarity(
  vf1: IVisualFeatures,
  vf2: IVisualFeatures
): number {
  return (
    jaccard(vf1.subjects, vf2.subjects) * WEIGHTS.visualSubjects +
    jaccard(vf1.emotion, vf2.emotion) * WEIGHTS.visualEmotion +
    jaccard(vf1.style, vf2.style) * WEIGHTS.visualStyle +
    jaccard(vf1.motion, vf2.motion) * WEIGHTS.visualMotion +
    jaccard(vf1.environment, vf2.environment) * WEIGHTS.visualEnvironment
  );
}

/**
 * Caption similarity using TF-IDF
 */
export function captionSimilarity(c1: string, c2: string): number {
  if (!c1.trim() || !c2.trim()) return 0;

  try {
    const tfidf = new TfIdf();
    tfidf.addDocument(c1);
    tfidf.addDocument(c2);

    let score = 0;
    tfidf.tfidfs(c2, (_, measure) => {
      score += measure;
    });

    // Normalize to 0-1 range
    return Math.min(score / 10, 1);
  } catch (error) {
    console.error('Caption similarity error:', error);
    return 0;
  }
}

/**
 * Total similarity score between two posts
 */
export function totalSimilarity(postA: ProcessedPost, postB: ProcessedPost): number {
  const visual = visualSimilarity(postA.visualFeatures, postB.visualFeatures);
  const caption = captionSimilarity(postA.caption, postB.caption);

  return (
    visual * WEIGHTS.visual +
    caption * WEIGHTS.caption
  );
}

/**
 * Compute metrics for a cluster
 */
export function computeClusterMetrics(posts: ProcessedPost[]): IClusterMetrics {
  const creators = new Set<string>();
  const platforms = new Set<string>();

  let velocitySum = 0;
  let likesSum = 0;
  let viewsSum = 0;

  for (const post of posts) {
    creators.add(post.creatorId);
    platforms.add(post.platform);
    velocitySum += post.engagementVelocity;
    likesSum += post.likes;
    viewsSum += post.views;
  }

  return {
    creatorCount: creators.size,
    platformCount: platforms.size,
    avgEngagementVelocity: velocitySum / posts.length,
    totalPosts: posts.length,
    totalLikes: likesSum,
    totalViews: viewsSum,
  };
}

/**
 * Calculate trend score from metrics
 */
export function calculateTrendScore(metrics: IClusterMetrics): number {
  // Weighted scoring
  const velocityScore = Math.min(metrics.avgEngagementVelocity / 10, 100) * 0.4;
  const creatorScore = Math.min(metrics.creatorCount * 10, 100) * 0.3;
  const platformScore = Math.min(metrics.platformCount * 25, 100) * 0.2;
  const postsScore = Math.min(metrics.totalPosts * 5, 100) * 0.1;

  return Math.round(velocityScore + creatorScore + platformScore + postsScore);
}

/**
 * Classify trend status based on score
 */
export function classifyTrend(score: number): 'emerging' | 'trending' | 'viral' | 'stable' | 'declining' {
  if (score > 90) return 'viral';
  if (score > 70) return 'trending';
  if (score > 40) return 'emerging';
  return 'stable';
}

/**
 * Aggregate visual features from posts
 */
export function aggregateVisualFeatures(posts: ProcessedPost[]): IClusterVisualFeatures {
  const subjects = new Map<string, number>();
  const emotion = new Map<string, number>();
  const style = new Map<string, number>();
  const motion = new Map<string, number>();
  const environment = new Map<string, number>();

  // Count occurrences
  for (const post of posts) {
    post.visualFeatures.subjects.forEach(s => subjects.set(s, (subjects.get(s) || 0) + 1));
    post.visualFeatures.emotion.forEach(e => emotion.set(e, (emotion.get(e) || 0) + 1));
    post.visualFeatures.style.forEach(s => style.set(s, (style.get(s) || 0) + 1));
    post.visualFeatures.motion.forEach(m => motion.set(m, (motion.get(m) || 0) + 1));
    post.visualFeatures.environment.forEach(e => environment.set(e, (environment.get(e) || 0) + 1));
  }

  // Sort by count and pick top items
  const sortByCount = (map: Map<string, number>, limit: number) => 
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key]) => key);

  return {
    subjects: sortByCount(subjects, 10),
    emotion: sortByCount(emotion, 5),
    style: sortByCount(style, 10),
    motion: sortByCount(motion, 5),
    environment: sortByCount(environment, 10),
  };
}

/**
 * Main clustering function
 * Uses incremental clustering algorithm
 */
export function clusterPosts(
  posts: IPost[],
  threshold: number = SIMILARITY_THRESHOLD
): ClusterResult[] {
  const clusters: ClusterResult[] = [];
  const preparedPosts = posts.map(preparePost);

  for (const post of preparedPosts) {
    let assigned = false;

    for (const cluster of clusters) {
      // Only cluster same media types together
      if (cluster.mediaType !== post.mediaType) continue;

      // Compare with representative post (first post in cluster)
      const representative = cluster.posts[0];
      const similarity = totalSimilarity(post, representative);

      if (similarity >= threshold) {
        cluster.posts.push(post);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      // Create new cluster
      clusters.push({
        id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mediaType: post.mediaType,
        posts: [post],
        metrics: {
          creatorCount: 1,
          platformCount: 1,
          avgEngagementVelocity: post.engagementVelocity,
          totalPosts: 1,
          totalLikes: post.likes,
          totalViews: post.views,
        },
        trendScore: 0,
        status: 'emerging',
        visualFeatures: post.visualFeatures,
        platforms: [post.platform],
      });
    }
  }

  // Compute final metrics and scores for each cluster
  for (const cluster of clusters) {
    cluster.metrics = computeClusterMetrics(cluster.posts);
    cluster.trendScore = calculateTrendScore(cluster.metrics);
    cluster.status = classifyTrend(cluster.trendScore);
    cluster.visualFeatures = aggregateVisualFeatures(cluster.posts);
    cluster.platforms = [...new Set(cluster.posts.map(p => p.platform))];
  }

  // Sort by trend score
  clusters.sort((a, b) => b.trendScore - a.trendScore);

  return clusters;
}

/**
 * Re-cluster existing posts with updated threshold
 */
export function reclusterPosts(
  posts: IPost[],
  threshold: number = SIMILARITY_THRESHOLD
): ClusterResult[] {
  return clusterPosts(posts, threshold);
}

/**
 * Add a post to existing clusters or create new cluster
 */
export function addToCluster(
  post: IPost,
  existingClusters: ClusterResult[],
  threshold: number = SIMILARITY_THRESHOLD
): { clusterId: string; isNew: boolean } {
  const preparedPost = preparePost(post);

  for (const cluster of existingClusters) {
    if (cluster.mediaType !== preparedPost.mediaType) continue;

    const representative = cluster.posts[0];
    const similarity = totalSimilarity(preparedPost, representative);

    if (similarity >= threshold) {
      cluster.posts.push(preparedPost);
      // Update metrics
      cluster.metrics = computeClusterMetrics(cluster.posts);
      cluster.trendScore = calculateTrendScore(cluster.metrics);
      cluster.status = classifyTrend(cluster.trendScore);
      
      return { clusterId: cluster.id, isNew: false };
    }
  }

  // Create new cluster
  const newCluster: ClusterResult = {
    id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    mediaType: preparedPost.mediaType,
    posts: [preparedPost],
    metrics: computeClusterMetrics([preparedPost]),
    trendScore: 0,
    status: 'emerging',
    visualFeatures: preparedPost.visualFeatures,
    platforms: [preparedPost.platform],
  };
  
  newCluster.trendScore = calculateTrendScore(newCluster.metrics);
  newCluster.status = classifyTrend(newCluster.trendScore);
  
  existingClusters.push(newCluster);
  
  return { clusterId: newCluster.id, isNew: true };
}

export default {
  preparePost,
  jaccard,
  visualSimilarity,
  captionSimilarity,
  totalSimilarity,
  computeClusterMetrics,
  calculateTrendScore,
  classifyTrend,
  aggregateVisualFeatures,
  clusterPosts,
  reclusterPosts,
  addToCluster,
};

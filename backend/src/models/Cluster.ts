/**
 * Cluster Model - MongoDB Schema
 * Represents a cluster of similar posts grouped into a prompt trend
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IClusterMetrics {
  creatorCount: number;
  platformCount: number;
  avgEngagementVelocity: number;
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
}

export interface IClusterVisualFeatures {
  subjects: string[];
  emotion: string[];
  style: string[];
  motion: string[];
  environment: string[];
}

export interface ICluster extends Document {
  // Cluster info
  mediaType: 'image' | 'video';
  name?: string; // Auto-generated or admin-assigned name
  
  // Posts in cluster
  posts: mongoose.Types.ObjectId[];
  representativePostId?: mongoose.Types.ObjectId;
  
  // Aggregated visual features
  visualFeatures: IClusterVisualFeatures;
  
  // Metrics
  metrics: IClusterMetrics;
  
  // Trend scoring
  trendScore: number;
  status: 'emerging' | 'trending' | 'viral' | 'stable' | 'declining';
  
  // Generated prompt
  generatedPrompt: string;
  
  // Platforms present in cluster
  platforms: string[];
  
  // Admin moderation
  isApproved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  isRejected: boolean;
  rejectionReason?: string;
  
  // Notification tracking
  notificationSent: boolean;
  notificationSentAt?: Date;
  
  // Publishing
  publishedAsPromptId?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const ClusterMetricsSchema = new Schema<IClusterMetrics>({
  creatorCount: { type: Number, default: 0 },
  platformCount: { type: Number, default: 0 },
  avgEngagementVelocity: { type: Number, default: 0 },
  totalPosts: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
}, { _id: false });

const ClusterVisualFeaturesSchema = new Schema<IClusterVisualFeatures>({
  subjects: [{ type: String }],
  emotion: [{ type: String }],
  style: [{ type: String }],
  motion: [{ type: String }],
  environment: [{ type: String }],
}, { _id: false });

const ClusterSchema = new Schema<ICluster>(
  {
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      required: true,
      index: true,
    },
    name: {
      type: String,
    },
    posts: [{
      type: Schema.Types.ObjectId,
      ref: 'Post',
    }],
    representativePostId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    visualFeatures: {
      type: ClusterVisualFeaturesSchema,
      default: () => ({
        subjects: [],
        emotion: [],
        style: [],
        motion: [],
        environment: [],
      }),
    },
    metrics: {
      type: ClusterMetricsSchema,
      default: () => ({
        creatorCount: 0,
        platformCount: 0,
        avgEngagementVelocity: 0,
        totalPosts: 0,
        totalLikes: 0,
        totalViews: 0,
      }),
    },
    trendScore: {
      type: Number,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ['emerging', 'trending', 'viral', 'stable', 'declining'],
      default: 'emerging',
      index: true,
    },
    generatedPrompt: {
      type: String,
      required: true,
    },
    platforms: [{
      type: String,
    }],
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: {
      type: Date,
    },
    publishedAsPromptId: {
      type: Schema.Types.ObjectId,
      ref: 'Prompt',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ClusterSchema.index({ trendScore: -1, status: 1 });
ClusterSchema.index({ isApproved: 1, trendScore: -1 });
ClusterSchema.index({ status: 1, createdAt: -1 });
ClusterSchema.index({ mediaType: 1, status: 1, trendScore: -1 });

export const Cluster = mongoose.model<ICluster>('Cluster', ClusterSchema);
export default Cluster;

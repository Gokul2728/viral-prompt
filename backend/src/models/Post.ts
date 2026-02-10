/**
 * Post Model - MongoDB Schema
 * Represents raw scraped content from various platforms
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IVisualFeatures {
  subjects: string[];
  emotion: string[];
  style: string[];
  motion: string[];
  environment: string[];
}

export interface IPost extends Document {
  // Source info
  platform: 'youtube' | 'reddit' | 'twitter' | 'instagram' | 'lexica' | 'civitai' | 'prompthero' | 'pinterest';
  sourceId: string; // Original ID from platform
  sourceUrl: string;
  
  // Content
  mediaType: 'image' | 'video';
  mediaUrl?: string;
  thumbnailUrl?: string;
  caption: string;
  title?: string;
  hashtags: string[];
  
  // Visual features (extracted by vision API)
  visualFeatures: IVisualFeatures;
  
  // Extracted signals from text
  textSignals: {
    style: string[];
    emotion: string[];
    motion: string[];
    quality: string[];
    subjects: string[];
  };
  
  // Engagement metrics
  engagementVelocity: number;
  likes: number;
  views: number;
  comments: number;
  shares: number;
  
  // Creator info
  creatorId: string;
  creatorUsername?: string;
  
  // Processing status
  processed: boolean;
  visionProcessed: boolean;
  clusterId?: mongoose.Types.ObjectId;
  
  // Timestamps
  publishedAt: Date;
  scrapedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VisualFeaturesSchema = new Schema<IVisualFeatures>({
  subjects: [{ type: String }],
  emotion: [{ type: String }],
  style: [{ type: String }],
  motion: [{ type: String }],
  environment: [{ type: String }],
}, { _id: false });

const PostSchema = new Schema<IPost>(
  {
    platform: {
      type: String,
      enum: ['youtube', 'reddit', 'twitter', 'instagram', 'lexica', 'civitai', 'prompthero', 'pinterest'],
      required: true,
      index: true,
    },
    sourceId: {
      type: String,
      required: true,
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      required: true,
      index: true,
    },
    mediaUrl: {
      type: String,
    },
    thumbnailUrl: {
      type: String,
    },
    caption: {
      type: String,
      default: '',
    },
    title: {
      type: String,
    },
    hashtags: [{
      type: String,
    }],
    visualFeatures: {
      type: VisualFeaturesSchema,
      default: () => ({
        subjects: [],
        emotion: [],
        style: [],
        motion: [],
        environment: [],
      }),
    },
    textSignals: {
      type: Schema.Types.Mixed,
      default: () => ({
        style: [],
        emotion: [],
        motion: [],
        quality: [],
        subjects: [],
      }),
    },
    engagementVelocity: {
      type: Number,
      default: 0,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    creatorId: {
      type: String,
      required: true,
    },
    creatorUsername: {
      type: String,
    },
    processed: {
      type: Boolean,
      default: false,
      index: true,
    },
    visionProcessed: {
      type: Boolean,
      default: false,
      index: true,
    },
    clusterId: {
      type: Schema.Types.ObjectId,
      ref: 'Cluster',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
PostSchema.index({ platform: 1, sourceId: 1 }, { unique: true });
PostSchema.index({ processed: 1, visionProcessed: 1 });
PostSchema.index({ engagementVelocity: -1, scrapedAt: -1 });
PostSchema.index({ mediaType: 1, processed: 1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);
export default Post;

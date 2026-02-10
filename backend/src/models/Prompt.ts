/**
 * Prompt Model - MongoDB Schema
 * Aligned with frontend Prompt type
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IPrompt extends Document {
  text: string;
  type: 'image' | 'video';
  previewUrl?: string;
  previewType: 'image' | 'video';
  thumbnailUrl?: string;

  // Metadata
  platforms: string[];
  aiTools: string[];
  tags: string[];
  style?: string;
  emotion?: string;

  // Engagement
  trendScore: number;
  likes: number;
  fires: number;
  wows: number;
  copies: number;
  generates: number;

  // Tracking
  firstSeenAt: Date;
  crossPlatformCount: number;
  creatorCount: number;
  engagementVelocity: number;

  // Cluster info
  clusterId?: string;
  isApproved: boolean;

  // Source info
  sourceUrl?: string;
  metadata?: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

const PromptSchema = new Schema<IPrompt>(
  {
    text: {
      type: String,
      required: true,
      index: 'text',
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
      index: true,
    },
    previewUrl: {
      type: String,
    },
    previewType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    thumbnailUrl: {
      type: String,
    },
    platforms: [{
      type: String,
      index: true,
    }],
    aiTools: [{
      type: String,
      index: true,
    }],
    tags: [{
      type: String,
      index: true,
    }],
    style: {
      type: String,
    },
    emotion: {
      type: String,
    },
    trendScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    fires: {
      type: Number,
      default: 0,
    },
    wows: {
      type: Number,
      default: 0,
    },
    copies: {
      type: Number,
      default: 0,
    },
    generates: {
      type: Number,
      default: 0,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    crossPlatformCount: {
      type: Number,
      default: 0,
    },
    creatorCount: {
      type: Number,
      default: 0,
    },
    engagementVelocity: {
      type: Number,
      default: 0,
    },
    clusterId: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    sourceUrl: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
PromptSchema.index({ trendScore: -1, firstSeenAt: -1 });
PromptSchema.index({ platforms: 1, trendScore: -1 });
PromptSchema.index({ aiTools: 1, trendScore: -1 });
PromptSchema.index({ isApproved: 1, trendScore: -1 });

export const Prompt = mongoose.model<IPrompt>('Prompt', PromptSchema);
export default Prompt;

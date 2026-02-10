/**
 * ViralChat Model - MongoDB Schema
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IViralChat extends Document {
  title: string;
  promptText: string;
  previewUrl?: string;
  category: string;
  views: number;
  copies: number;
  likes: number;
  isTrending: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ViralChatSchema = new Schema<IViralChat>(
  {
    title: {
      type: String,
      required: true,
    },
    promptText: {
      type: String,
      required: true,
    },
    previewUrl: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    copies: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ViralChatSchema.index({ views: -1 });
ViralChatSchema.index({ category: 1, views: -1 });
ViralChatSchema.index({ isTrending: 1, views: -1 });

export const ViralChat = mongoose.model<IViralChat>('ViralChat', ViralChatSchema);
export default ViralChat;

/**
 * User Model - MongoDB Schema
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email?: string;
  googleId?: string;
  displayName: string;
  photoUrl?: string;
  isGuest: boolean;
  isAdmin: boolean;
  savedPrompts: mongoose.Types.ObjectId[];
  reactions: Array<{
    promptId: mongoose.Types.ObjectId;
    type: string;
    createdAt: Date;
  }>;
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
    offlineMode: boolean;
  };
  pushTokens: Array<{
    token: string;
    platform: 'ios' | 'android';
    createdAt: Date;
  }>;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    savedPrompts: [{
      type: Schema.Types.ObjectId,
      ref: 'Prompt',
    }],
    reactions: [{
      promptId: {
        type: Schema.Types.ObjectId,
        ref: 'Prompt',
      },
      type: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    preferences: {
      theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      offlineMode: {
        type: Boolean,
        default: false,
      },
    },
    pushTokens: [{
      token: String,
      platform: {
        type: String,
        enum: ['ios', 'android'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ isAdmin: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;

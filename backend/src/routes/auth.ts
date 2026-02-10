/**
 * Auth Routes
 */

import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'default-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign({ userId }, jwtSecret, { expiresIn } as jwt.SignOptions);
};

/**
 * POST /api/auth/google
 * Sign in with Google OAuth
 */
router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      throw new AppError('ID token required', 400);
    }
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new AppError('Invalid Google token', 401);
    }
    
    const { sub: googleId, email, name, picture } = payload;
    
    // Find or create user
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Check if email exists (might be converting from guest)
      user = await User.findOne({ email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.isGuest = false;
        user.photoUrl = picture;
      } else {
        // Create new user
        user = new User({
          googleId,
          email,
          displayName: name || 'User',
          photoUrl: picture,
          isGuest: false,
        });
      }
    }
    
    user.lastLoginAt = new Date();
    await user.save();
    
    const token = generateToken(user._id.toString());
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          displayName: user.displayName,
          email: user.email,
          photoUrl: user.photoUrl,
          isGuest: user.isGuest,
          preferences: user.preferences,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/guest
 * Sign in as guest
 */
router.post('/guest', async (req, res, next) => {
  try {
    const guestId = uuidv4();
    
    const user = new User({
      displayName: 'Guest User',
      isGuest: true,
      preferences: {
        theme: 'dark',
        notifications: false,
        offlineMode: true,
      },
    });
    
    await user.save();
    
    const token = generateToken(user._id.toString());
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          displayName: user.displayName,
          email: null,
          photoUrl: null,
          isGuest: true,
          preferences: user.preferences,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Sign out (invalidate token on client)
 */
router.post('/logout', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    // Could implement token blacklisting here if needed
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = req.user!;
    
    res.json({
      success: true,
      data: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        photoUrl: user.photoUrl,
        isGuest: user.isGuest,
        preferences: user.preferences,
        createdAt: user.createdAt,
        savedCount: user.savedPrompts.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

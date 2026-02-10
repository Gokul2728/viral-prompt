/**
 * User Routes
 */

import { Router, Response } from 'express';
import { User, Prompt } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/user/saved
 * Get user's saved prompts
 */
router.get('/saved', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const user = await User.findById(req.userId)
      .populate({
        path: 'savedPrompts',
        options: {
          skip,
          limit,
          sort: { dateDiscovered: -1 },
        },
      })
      .lean();
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    const total = await User.aggregate([
      { $match: { _id: user._id } },
      { $project: { savedCount: { $size: '$savedPrompts' } } },
    ]);
    
    res.json({
      success: true,
      data: {
        prompts: (user.savedPrompts as any[]).map((p) => ({
          ...p,
          id: p._id,
          isSaved: true,
        })),
        total: total[0]?.savedCount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
router.put('/preferences', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { theme, notifications, offlineMode } = req.body;
    
    const updateData: any = {};
    
    if (theme !== undefined) {
      updateData['preferences.theme'] = theme;
    }
    
    if (notifications !== undefined) {
      updateData['preferences.notifications'] = notifications;
    }
    
    if (offlineMode !== undefined) {
      updateData['preferences.offlineMode'] = offlineMode;
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true }
    );
    
    res.json({
      success: true,
      data: {
        preferences: user?.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/user/stats
 * Get user statistics
 */
router.get('/stats', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await User.findById(req.userId).lean();
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.json({
      success: true,
      data: {
        savedCount: user.savedPrompts.length,
        reactionsCount: user.reactions.length,
        joinedAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/user/account
 * Delete user account
 */
router.delete('/account', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await User.findByIdAndDelete(req.userId);
    
    res.json({
      success: true,
      message: 'Account deleted',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

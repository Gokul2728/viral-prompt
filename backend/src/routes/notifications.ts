/**
 * Notifications Routes
 */

import { Router, Response } from 'express';
import { Notification, User } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const [notifications, unread] = await Promise.all([
      Notification.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId: req.userId, read: false }),
    ]);
    
    res.json({
      success: true,
      data: {
        notifications: notifications.map((n) => ({
          ...n,
          id: n._id,
          timestamp: n.createdAt,
        })),
        unread,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    
    res.json({
      success: true,
      message: 'Marked as read',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/register
 * Register push notification token
 */
router.post('/register', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { token, platform } = req.body;
    
    if (!token || !platform) {
      throw new AppError('Token and platform required', 400);
    }
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Remove existing token for this platform
    user.pushTokens = user.pushTokens.filter(
      (t) => t.token !== token && t.platform !== platform
    );
    
    // Add new token
    user.pushTokens.push({
      token,
      platform,
      createdAt: new Date(),
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Push token registered',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    
    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

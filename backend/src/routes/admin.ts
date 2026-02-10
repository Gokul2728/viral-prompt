/**
 * Admin Routes
 */

import { Router, Response } from 'express';
import { Prompt, ViralChat, User, Notification } from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Get admin dashboard stats
 */
router.get('/dashboard', async (req: AuthRequest, res: Response, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalPrompts,
      totalViralChats,
      totalUsers,
      promptsToday,
      usersToday,
      topPlatforms,
      topAiTools,
    ] = await Promise.all([
      Prompt.countDocuments(),
      ViralChat.countDocuments(),
      User.countDocuments(),
      Prompt.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: today } }),
      Prompt.aggregate([
        { $group: { _id: '$platform', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Prompt.aggregate([
        { $group: { _id: '$aiTool', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);
    
    res.json({
      success: true,
      data: {
        totals: {
          prompts: totalPrompts,
          viralChats: totalViralChats,
          users: totalUsers,
        },
        today: {
          prompts: promptsToday,
          users: usersToday,
        },
        topPlatforms: topPlatforms.map((p) => ({
          name: p._id,
          count: p.count,
        })),
        topAiTools: topAiTools.map((t) => ({
          name: t._id,
          count: t.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/prompts
 * Get all prompts (admin view with pagination)
 */
router.get('/prompts', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    
    const [prompts, total] = await Promise.all([
      Prompt.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Prompt.countDocuments(),
    ]);
    
    res.json({
      success: true,
      data: {
        prompts: prompts.map((p) => ({ ...p, id: p._id })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/prompts
 * Create a new prompt
 */
router.post('/prompts', async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      promptText,
      previewUrl,
      type,
      platform,
      aiTool,
      viralScore,
      tags,
      trending,
      sourceUrl,
    } = req.body;
    
    const prompt = new Prompt({
      promptText,
      previewUrl,
      type,
      platform,
      aiTool,
      viralScore: viralScore || 0,
      tags: tags || [],
      trending: trending || false,
      sourceUrl,
      dateDiscovered: new Date(),
    });
    
    await prompt.save();
    
    res.status(201).json({
      success: true,
      data: { ...prompt.toObject(), id: prompt._id },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/prompts/:id
 * Update a prompt
 */
router.put('/prompts/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!prompt) {
      throw new AppError('Prompt not found', 404);
    }
    
    res.json({
      success: true,
      data: { ...prompt.toObject(), id: prompt._id },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/prompts/:id
 * Delete a prompt
 */
router.delete('/prompts/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const prompt = await Prompt.findByIdAndDelete(req.params.id);
    
    if (!prompt) {
      throw new AppError('Prompt not found', 404);
    }
    
    // Remove from all users' saved lists
    await User.updateMany(
      { savedPrompts: prompt._id },
      { $pull: { savedPrompts: prompt._id } }
    );
    
    res.json({
      success: true,
      message: 'Prompt deleted',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/prompts/bulk
 * Bulk import prompts
 */
router.post('/prompts/bulk', async (req: AuthRequest, res: Response, next) => {
  try {
    const { prompts } = req.body;
    
    if (!Array.isArray(prompts) || prompts.length === 0) {
      throw new AppError('Prompts array required', 400);
    }
    
    const result = await Prompt.insertMany(
      prompts.map((p: Record<string, unknown>) => ({
        ...p,
        firstSeenAt: p.firstSeenAt || new Date(),
      })),
      { ordered: false }
    );
    
    res.status(201).json({
      success: true,
      message: `${result.length} prompts imported`,
      count: result.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/viral-chats
 * Get all viral chats
 */
router.get('/viral-chats', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    
    const [chats, total] = await Promise.all([
      ViralChat.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ViralChat.countDocuments(),
    ]);
    
    res.json({
      success: true,
      data: {
        chats: chats.map((c) => ({ ...c, id: c._id })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/viral-chats
 * Create a viral chat
 */
router.post('/viral-chats', async (req: AuthRequest, res: Response, next) => {
  try {
    const chat = new ViralChat({
      ...req.body,
      createdBy: req.userId,
    });
    
    await chat.save();
    
    res.status(201).json({
      success: true,
      data: { ...chat.toObject(), id: chat._id },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/viral-chats/:id
 * Update a viral chat
 */
router.put('/viral-chats/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const chat = await ViralChat.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!chat) {
      throw new AppError('Viral chat not found', 404);
    }
    
    res.json({
      success: true,
      data: { ...chat.toObject(), id: chat._id },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/viral-chats/:id
 * Delete a viral chat
 */
router.delete('/viral-chats/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const chat = await ViralChat.findByIdAndDelete(req.params.id);
    
    if (!chat) {
      throw new AppError('Viral chat not found', 404);
    }
    
    res.json({
      success: true,
      message: 'Viral chat deleted',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find()
        .select('-pushTokens')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);
    
    res.json({
      success: true,
      data: {
        users: users.map((u) => ({
          id: u._id,
          displayName: u.displayName,
          email: u.email,
          isGuest: u.isGuest,
          isAdmin: u.isAdmin,
          savedCount: u.savedPrompts.length,
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/users/:id/admin
 * Toggle admin status
 */
router.put('/users/:id/admin', async (req: AuthRequest, res: Response, next) => {
  try {
    const { isAdmin } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin },
      { new: true }
    );
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.json({
      success: true,
      message: `User ${isAdmin ? 'promoted to' : 'removed from'} admin`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/notifications/broadcast
 * Send notification to all users
 */
router.post('/notifications/broadcast', async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, message, type = 'system' } = req.body;
    
    if (!title || !message) {
      throw new AppError('Title and message required', 400);
    }
    
    // Get all user IDs
    const users = await User.find().select('_id').lean();
    
    // Create notifications for all users
    const notifications = users.map((u) => ({
      userId: u._id,
      type,
      title,
      message,
      read: false,
    }));
    
    await Notification.insertMany(notifications);
    
    res.json({
      success: true,
      message: `Notification sent to ${users.length} users`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

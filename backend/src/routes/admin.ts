/**
 * Admin Routes
 */

import { Router, Response } from 'express';
import { Prompt, ViralChat, User, Notification, Cluster, Post } from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { runWeeklyJob, publishApprovedClusters, sendViralNotifications } from '../jobs';

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

// ========================================
// CLUSTER MANAGEMENT ROUTES
// ========================================

/**
 * GET /api/admin/clusters
 * Get all clusters with admin details
 */
router.get('/clusters', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const { status, approved } = req.query;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (approved !== undefined) query.isApproved = approved === 'true';

    const [clusters, total] = await Promise.all([
      Cluster.find(query)
        .sort({ trendScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Cluster.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        clusters: clusters.map(c => ({ ...c, id: c._id })),
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
 * GET /api/admin/clusters/pending
 * Get clusters pending approval
 */
router.get('/clusters/pending', async (req: AuthRequest, res: Response, next) => {
  try {
    const clusters = await Cluster.find({
      isApproved: false,
      isRejected: false,
    })
      .sort({ trendScore: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: clusters.map(c => ({ ...c, id: c._id })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/clusters/:id/approve
 * Approve a cluster
 */
router.put('/clusters/:id/approve', async (req: AuthRequest, res: Response, next) => {
  try {
    const cluster = await Cluster.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        approvedBy: req.userId,
        approvedAt: new Date(),
        isRejected: false,
        rejectionReason: null,
      },
      { new: true }
    );

    if (!cluster) {
      throw new AppError('Cluster not found', 404);
    }

    res.json({
      success: true,
      data: { ...cluster.toObject(), id: cluster._id },
      message: 'Cluster approved',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/clusters/:id/reject
 * Reject a cluster
 */
router.put('/clusters/:id/reject', async (req: AuthRequest, res: Response, next) => {
  try {
    const { reason } = req.body;

    const cluster = await Cluster.findByIdAndUpdate(
      req.params.id,
      {
        isRejected: true,
        rejectionReason: reason || 'No reason provided',
        isApproved: false,
      },
      { new: true }
    );

    if (!cluster) {
      throw new AppError('Cluster not found', 404);
    }

    res.json({
      success: true,
      data: { ...cluster.toObject(), id: cluster._id },
      message: 'Cluster rejected',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/clusters/:id
 * Update cluster details
 */
router.put('/clusters/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, generatedPrompt, status } = req.body;
    const updates: Record<string, unknown> = {};
    
    if (name) updates.name = name;
    if (generatedPrompt) updates.generatedPrompt = generatedPrompt;
    if (status) updates.status = status;

    const cluster = await Cluster.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!cluster) {
      throw new AppError('Cluster not found', 404);
    }

    res.json({
      success: true,
      data: { ...cluster.toObject(), id: cluster._id },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/clusters/:id
 * Delete a cluster
 */
router.delete('/clusters/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const cluster = await Cluster.findByIdAndDelete(req.params.id);

    if (!cluster) {
      throw new AppError('Cluster not found', 404);
    }

    // Unset clusterId from associated posts
    await Post.updateMany(
      { clusterId: cluster._id },
      { $unset: { clusterId: 1 }, $set: { processed: false } }
    );

    res.json({
      success: true,
      message: 'Cluster deleted',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/clusters/:id/publish
 * Publish cluster as a prompt
 */
router.post('/clusters/:id/publish', async (req: AuthRequest, res: Response, next) => {
  try {
    const cluster = await Cluster.findById(req.params.id).populate('representativePostId');

    if (!cluster) {
      throw new AppError('Cluster not found', 404);
    }

    if (!cluster.isApproved) {
      throw new AppError('Cluster must be approved before publishing', 400);
    }

    if (cluster.publishedAsPromptId) {
      throw new AppError('Cluster already published', 400);
    }

    const representativePost = cluster.representativePostId as unknown as typeof Post.prototype;

    const prompt = await Prompt.create({
      text: cluster.generatedPrompt,
      type: cluster.mediaType,
      previewUrl: representativePost?.thumbnailUrl || representativePost?.mediaUrl,
      previewType: cluster.mediaType,
      platforms: cluster.platforms,
      aiTools: [],
      tags: [
        ...cluster.visualFeatures.subjects.slice(0, 5),
        ...cluster.visualFeatures.style.slice(0, 3),
      ],
      style: cluster.visualFeatures.style[0],
      emotion: cluster.visualFeatures.emotion[0],
      trendScore: cluster.trendScore,
      firstSeenAt: cluster.createdAt,
      crossPlatformCount: cluster.metrics.platformCount,
      creatorCount: cluster.metrics.creatorCount,
      engagementVelocity: cluster.metrics.avgEngagementVelocity,
      clusterId: cluster._id.toString(),
      isApproved: true,
    });

    cluster.publishedAsPromptId = prompt._id;
    await cluster.save();

    res.json({
      success: true,
      data: { ...prompt.toObject(), id: prompt._id },
      message: 'Cluster published as prompt',
    });
  } catch (error) {
    next(error);
  }
});

// ========================================
// POSTS MANAGEMENT ROUTES
// ========================================

/**
 * GET /api/admin/posts
 * Get all scraped posts
 */
router.get('/posts', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const { platform, processed } = req.query;

    const query: Record<string, unknown> = {};
    if (platform) query.platform = platform;
    if (processed !== undefined) query.processed = processed === 'true';

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ scrapedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        posts: posts.map(p => ({ ...p, id: p._id })),
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
 * DELETE /api/admin/posts/:id
 * Delete a post
 */
router.delete('/posts/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Remove from cluster if assigned
    if (post.clusterId) {
      await Cluster.findByIdAndUpdate(
        post.clusterId,
        { $pull: { posts: post._id } }
      );
    }

    res.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    next(error);
  }
});

// ========================================
// JOB MANAGEMENT ROUTES
// ========================================

/**
 * POST /api/admin/jobs/weekly
 * Manually trigger weekly job
 */
router.post('/jobs/weekly', async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await runWeeklyJob();

    res.json({
      success: true,
      data: result,
      message: 'Weekly job completed',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/jobs/publish
 * Publish all approved clusters
 */
router.post('/jobs/publish', async (req: AuthRequest, res: Response, next) => {
  try {
    const published = await publishApprovedClusters();

    res.json({
      success: true,
      data: { published },
      message: `${published} clusters published`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/jobs/notify
 * Send viral notifications
 */
router.post('/jobs/notify', async (req: AuthRequest, res: Response, next) => {
  try {
    const sent = await sendViralNotifications();

    res.json({
      success: true,
      data: { sent },
      message: `${sent} notifications sent`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

/**
 * Prompts Routes
 */

import { Router, Response } from 'express';
import { Prompt, User, Notification } from '../models';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/prompts
 * Get paginated list of prompts
 */
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      page = '1',
      limit = '20',
      type,
      platform,
      aiTool,
      sort = 'viral',
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    const query: Record<string, unknown> = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (platform) {
      query.platforms = platform;
    }
    
    if (aiTool) {
      query.aiTools = aiTool;
    }
    
    // Build sort
    const sortQuery: { [key: string]: 1 | -1 } = {};
    switch (sort) {
      case 'viral':
        sortQuery.trendScore = -1;
        sortQuery.firstSeenAt = -1;
        break;
      case 'recent':
        sortQuery.firstSeenAt = -1;
        break;
      case 'trending':
        sortQuery.trendScore = -1;
        sortQuery.isApproved = -1;
        break;
      default:
        sortQuery.trendScore = -1;
    }
    
    const [prompts, total] = await Promise.all([
      Prompt.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Prompt.countDocuments(query),
    ]);
    
    // Check if user has saved these prompts
    let savedIds: string[] = [];
    if (req.user) {
      savedIds = req.user.savedPrompts.map((id) => id.toString());
    }
    
    const promptsWithSaved = prompts.map((p) => ({
      ...p,
      id: p._id,
      isSaved: savedIds.includes(p._id.toString()),
    }));
    
    res.json({
      success: true,
      data: {
        prompts: promptsWithSaved,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/prompts/trending
 * Get trending prompts
 */
router.get('/trending', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);
    
    const prompts = await Prompt.find({ isApproved: true })
      .sort({ trendScore: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      data: prompts.map((p) => ({ ...p, id: p._id })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/prompts/search
 * Search prompts
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q, page = '1' } = req.query;
    
    if (!q) {
      throw new AppError('Search query required', 400);
    }
    
    const pageNum = parseInt(page as string);
    const limit = 20;
    const skip = (pageNum - 1) * limit;
    
    const [prompts, total] = await Promise.all([
      Prompt.find({
        $text: { $search: q as string },
      })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean(),
      Prompt.countDocuments({
        $text: { $search: q as string },
      }),
    ]);
    
    res.json({
      success: true,
      data: {
        prompts: prompts.map((p) => ({ ...p, id: p._id })),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/prompts/:id
 * Get single prompt by ID
 */
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const prompt = await Prompt.findById(req.params.id).lean();
    
    if (!prompt) {
      throw new AppError('Prompt not found', 404);
    }
    
    const isSaved = req.user
      ? req.user.savedPrompts.some((id) => id.toString() === prompt._id.toString())
      : false;
    
    res.json({
      success: true,
      data: {
        ...prompt,
        id: prompt._id,
        isSaved,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/prompts/:id/save
 * Save a prompt
 */
router.post('/:id/save', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = req.user!;
    const promptId = req.params.id;
    
    const prompt = await Prompt.findById(promptId);
    
    if (!prompt) {
      throw new AppError('Prompt not found', 404);
    }
    
    // Check if already saved
    if (user.savedPrompts.includes(prompt._id)) {
      return res.json({
        success: true,
        message: 'Already saved',
      });
    }
    
    // Add to saved
    user.savedPrompts.push(prompt._id);
    await user.save();
    
    // Increment copies count (using copies as save counter in the aligned schema)
    prompt.copies += 1;
    await prompt.save();
    
    res.json({
      success: true,
      message: 'Prompt saved',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/prompts/:id/unsave
 * Unsave a prompt
 */
router.delete('/:id/unsave', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = req.user!;
    const promptId = req.params.id;
    
    // Remove from saved
    user.savedPrompts = user.savedPrompts.filter(
      (id) => id.toString() !== promptId
    );
    await user.save();
    
    // Decrement saves count
    await Prompt.findByIdAndUpdate(promptId, { $inc: { saves: -1 } });
    
    res.json({
      success: true,
      message: 'Prompt unsaved',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/prompts/:id/react
 * React to a prompt
 */
router.post('/:id/react', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = req.user!;
    const promptId = req.params.id;
    const { reaction } = req.body;
    
    if (!reaction) {
      throw new AppError('Reaction type required', 400);
    }
    
    const prompt = await Prompt.findById(promptId);
    
    if (!prompt) {
      throw new AppError('Prompt not found', 404);
    }
    
    // Add reaction
    user.reactions.push({
      promptId: prompt._id,
      type: reaction,
      createdAt: new Date(),
    });
    await user.save();
    
    // Increment likes count
    prompt.likes += 1;
    await prompt.save();
    
    res.json({
      success: true,
      message: 'Reaction added',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/prompts/:id/feedback
 * Submit feedback for a prompt (optional auth - guests can submit too)
 */
router.post('/:id/feedback', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { usefulness, viralPotential, quality, comment } = req.body;
    
    // Store feedback (could create a separate Feedback model)
    console.log('Feedback received:', {
      promptId: req.params.id,
      userId: req.userId || 'anonymous',
      usefulness,
      viralPotential,
      quality,
      comment,
    });
    
    res.json({
      success: true,
      message: 'Feedback submitted',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

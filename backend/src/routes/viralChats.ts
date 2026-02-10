/**
 * Viral Chats Routes
 */

import { Router } from 'express';
import { ViralChat } from '../models';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/viral-chats
 * Get paginated list of viral chats
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const skip = (pageNum - 1) * limitNum;
    
    const query: any = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const [chats, total] = await Promise.all([
      ViralChat.find(query)
        .sort({ views: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ViralChat.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      data: {
        chats: chats.map((c) => ({ ...c, id: c._id })),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/viral-chats/trending
 * Get trending viral chats
 */
router.get('/trending', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 10);
    
    const chats = await ViralChat.find({ isTrending: true })
      .sort({ views: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      data: chats.map((c) => ({ ...c, id: c._id })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/viral-chats/:id
 * Get single viral chat
 */
router.get('/:id', async (req, res, next) => {
  try {
    const chat = await ViralChat.findById(req.params.id).lean();
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Viral chat not found',
      });
    }
    
    // Increment views
    await ViralChat.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    
    res.json({
      success: true,
      data: { ...chat, id: chat._id },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/viral-chats/:id/copy
 * Track when user copies a viral chat prompt
 */
router.post('/:id/copy', async (req, res, next) => {
  try {
    await ViralChat.findByIdAndUpdate(req.params.id, { $inc: { copies: 1 } });
    
    res.json({
      success: true,
      message: 'Copy tracked',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/viral-chats/:id/like
 * Like a viral chat
 */
router.post('/:id/like', async (req, res, next) => {
  try {
    await ViralChat.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
    
    res.json({
      success: true,
      message: 'Like added',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

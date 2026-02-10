/**
 * Analytics Routes
 */

import { Router } from 'express';
import { Prompt, User, ViralChat } from '../models';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/analytics/track
 * Track analytics event
 */
router.post('/track', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { event, properties, timestamp } = req.body;
    
    // Log event (could send to analytics service)
    console.log('Analytics event:', {
      event,
      properties,
      timestamp,
      userId: req.userId || 'anonymous',
    });
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/charts/:type
 * Get chart data
 */
router.get('/charts/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const period = (req.query.period as string) || 'week';
    
    let data: any[] = [];
    
    switch (type) {
      case 'platform':
        data = await Prompt.aggregate([
          {
            $group: {
              _id: '$platform',
              count: { $sum: 1 },
              avgViralScore: { $avg: '$viralScore' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]);
        data = data.map((d) => ({
          name: d._id,
          value: d.count,
          avgScore: Math.round(d.avgViralScore),
        }));
        break;
        
      case 'aiTool':
        data = await Prompt.aggregate([
          {
            $group: {
              _id: '$aiTool',
              count: { $sum: 1 },
              avgViralScore: { $avg: '$viralScore' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]);
        data = data.map((d) => ({
          name: d._id,
          value: d.count,
          avgScore: Math.round(d.avgViralScore),
        }));
        break;
        
      case 'category':
        data = await ViralChat.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalViews: { $sum: '$views' },
            },
          },
          { $sort: { totalViews: -1 } },
          { $limit: 10 },
        ]);
        data = data.map((d) => ({
          name: d._id,
          value: d.count,
          views: d.totalViews,
        }));
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid chart type',
        });
    }
    
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/stats
 * Get overall statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalPrompts,
      totalViralChats,
      totalUsers,
      trendingCount,
    ] = await Promise.all([
      Prompt.countDocuments(),
      ViralChat.countDocuments(),
      User.countDocuments(),
      Prompt.countDocuments({ trending: true }),
    ]);
    
    res.json({
      success: true,
      data: {
        totalPrompts,
        totalViralChats,
        totalUsers,
        trendingCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

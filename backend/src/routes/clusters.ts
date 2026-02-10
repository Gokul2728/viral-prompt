/**
 * Clusters Routes
 * API endpoints for cluster management and trend discovery
 */

import { Router, Response } from 'express';
import { Cluster, Post } from '../models';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/clusters
 * Get paginated list of clusters
 */
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      mediaType,
      sort = 'trendScore',
      approved,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (mediaType) {
      query.mediaType = mediaType;
    }

    // For public API, only show approved clusters
    if (approved === 'true') {
      query.isApproved = true;
    }

    // Build sort
    const sortQuery: { [key: string]: 1 | -1 } = {};
    switch (sort) {
      case 'trendScore':
        sortQuery.trendScore = -1;
        break;
      case 'recent':
        sortQuery.createdAt = -1;
        break;
      case 'posts':
        sortQuery['metrics.totalPosts'] = -1;
        break;
      default:
        sortQuery.trendScore = -1;
    }

    const [clusters, total] = await Promise.all([
      Cluster.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Cluster.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        clusters: clusters.map(c => ({
          ...c,
          id: c._id,
        })),
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
 * GET /api/clusters/trending
 * Get trending clusters (approved only)
 */
router.get('/trending', async (req, res, next) => {
  try {
    const { mediaType, limit = '10' } = req.query;
    const limitNum = Math.min(parseInt(limit as string), 20);

    const query: Record<string, unknown> = {
      isApproved: true,
      status: { $in: ['trending', 'viral'] },
    };

    if (mediaType) {
      query.mediaType = mediaType;
    }

    const clusters = await Cluster.find(query)
      .sort({ trendScore: -1 })
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: clusters.map(c => ({
        ...c,
        id: c._id,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/clusters/viral
 * Get viral clusters
 */
router.get('/viral', async (req, res, next) => {
  try {
    const { mediaType, limit = '10' } = req.query;
    const limitNum = Math.min(parseInt(limit as string), 20);

    const query: Record<string, unknown> = {
      isApproved: true,
      status: 'viral',
    };

    if (mediaType) {
      query.mediaType = mediaType;
    }

    const clusters = await Cluster.find(query)
      .sort({ trendScore: -1 })
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: clusters.map(c => ({
        ...c,
        id: c._id,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/clusters/emerging
 * Get emerging trends
 */
router.get('/emerging', async (req, res, next) => {
  try {
    const { mediaType, limit = '10' } = req.query;
    const limitNum = Math.min(parseInt(limit as string), 20);

    const query: Record<string, unknown> = {
      isApproved: true,
      status: 'emerging',
    };

    if (mediaType) {
      query.mediaType = mediaType;
    }

    const clusters = await Cluster.find(query)
      .sort({ trendScore: -1, createdAt: -1 })
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: clusters.map(c => ({
        ...c,
        id: c._id,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/clusters/:id
 * Get single cluster with posts
 */
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const cluster = await Cluster.findById(req.params.id)
      .populate('posts')
      .lean();

    if (!cluster) {
      throw new AppError('Cluster not found', 404);
    }

    res.json({
      success: true,
      data: {
        ...cluster,
        id: cluster._id,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/clusters/:id/posts
 * Get posts in a cluster
 */
router.get('/:id/posts', async (req, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const skip = (pageNum - 1) * limitNum;

    const cluster = await Cluster.findById(req.params.id);
    if (!cluster) {
      throw new AppError('Cluster not found', 404);
    }

    const [posts, total] = await Promise.all([
      Post.find({ _id: { $in: cluster.posts } })
        .sort({ engagementVelocity: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments({ _id: { $in: cluster.posts } }),
    ]);

    res.json({
      success: true,
      data: {
        posts: posts.map(p => ({
          ...p,
          id: p._id,
        })),
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
 * GET /api/clusters/stats/overview
 * Get cluster statistics
 */
router.get('/stats/overview', async (req, res, next) => {
  try {
    const [
      totalClusters,
      viralClusters,
      trendingClusters,
      emergingClusters,
      imageClusters,
      videoClusters,
      platformDistribution,
    ] = await Promise.all([
      Cluster.countDocuments(),
      Cluster.countDocuments({ status: 'viral' }),
      Cluster.countDocuments({ status: 'trending' }),
      Cluster.countDocuments({ status: 'emerging' }),
      Cluster.countDocuments({ mediaType: 'image' }),
      Cluster.countDocuments({ mediaType: 'video' }),
      Cluster.aggregate([
        { $unwind: '$platforms' },
        { $group: { _id: '$platforms', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          clusters: totalClusters,
          viral: viralClusters,
          trending: trendingClusters,
          emerging: emergingClusters,
        },
        byMediaType: {
          image: imageClusters,
          video: videoClusters,
        },
        platformDistribution: platformDistribution.map(p => ({
          platform: p._id,
          count: p.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

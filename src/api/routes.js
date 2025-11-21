import express from 'express';
import logger from '../utils/logger.js';
import postingService from '../services/posting.js';
import facebookService from '../services/facebook.js';
import postingQueue from '../queues/posting.js';
import auditService from '../services/audit.js';
import config from '../config/index.js';

const router = express.Router();

// Middleware for JSON parsing
router.use(express.json({ limit: '10mb' }));

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    dryRun: config.isDryRun(),
  });
});

/**
 * Discover pages
 */
router.get('/pages', async (req, res) => {
  try {
    const result = await facebookService.discoverPages();
    if (result.success) {
      // Redact access tokens from response
      const safePages = result.pages.map(page => ({
        pageId: page.pageId,
        pageName: page.pageName,
        permissions: page.permissions,
        tasks: page.tasks,
      }));
      res.json({ success: true, pages: safePages });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    logger.error('Failed to discover pages', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Schedule a post
 */
router.post('/posts', async (req, res) => {
  try {
    const request = {
      ...req.body,
      requestId: req.body.requestId || `req-${Date.now()}`,
    };

    // Validate required fields
    if (!request.pageId) {
      return res.status(400).json({
        success: false,
        error: 'pageId is required',
      });
    }

    // Get page access token (in production, retrieve from secure storage)
    // For now, we'll need it in the request or discover it
    if (!request.pageAccessToken) {
      const pagesResult = await facebookService.discoverPages();
      const page = pagesResult.pages?.find(p => p.pageId === request.pageId);
      if (page) {
        request.pageAccessToken = page.pageAccessToken;
      } else {
        return res.status(400).json({
          success: false,
          error: 'pageId not found or pageAccessToken required',
        });
      }
    }

    const result = await postingService.processPostRequest(request);
    
    if (result.status === 'failed') {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Failed to schedule post', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get job status
 */
router.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await postingQueue.getJobStatus(jobId);
    res.json(status);
  } catch (error) {
    logger.error('Failed to get job status', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Cancel a scheduled post
 */
router.delete('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await postingQueue.cancelPost(jobId);
    res.json(result);
  } catch (error) {
    logger.error('Failed to cancel job', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get queue statistics
 */
router.get('/queue/stats', async (req, res) => {
  try {
    const stats = await postingQueue.getQueueStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get queue stats', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Query audit logs
 */
router.get('/audit', async (req, res) => {
  try {
    const filters = {
      ...(req.query.requestId && { requestId: req.query.requestId }),
      ...(req.query.pageId && { pageId: req.query.pageId }),
      ...(req.query.type && { type: req.query.type }),
    };

    const logs = await auditService.queryLogs(filters);
    res.json({
      success: true,
      count: logs.length,
      logs: logs.slice(0, 100), // Limit to 100 most recent
    });
  } catch (error) {
    logger.error('Failed to query audit logs', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Dry-run test endpoint
 */
router.post('/posts/dry-run', async (req, res) => {
  try {
    const originalDryRun = config.isDryRun();
    // Force dry-run mode for this request
    process.env.DRY_RUN = 'true';

    const request = {
      ...req.body,
      requestId: req.body.requestId || `dry-run-${Date.now()}`,
    };

    const result = await postingService.processPostRequest(request);
    
    // Restore original setting
    process.env.DRY_RUN = originalDryRun ? 'true' : 'false';

    res.json({
      ...result,
      dryRun: true,
    });
  } catch (error) {
    logger.error('Dry-run failed', error);
    res.status(500).json({
      success: false,
      error: error.message,
      dryRun: true,
    });
  }
});

export default router;


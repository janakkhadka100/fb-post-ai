import { Worker } from 'bullmq';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import facebookService from '../services/facebook.js';
import openaiService from '../services/openai.js';
import mediaService from '../services/media.js';
import auditService from '../services/audit.js';

/**
 * Posting worker - processes scheduled posts
 */
class PostingWorker {
  constructor(queueName = 'posting') {
    this.queueName = queueName;
    this.worker = null;
  }

  start() {
    const redisConfig = config.getRedisConfig();
    
    this.worker = new Worker(
      this.queueName,
      async (job) => {
        return await this.processJob(job);
      },
      {
        connection: redisConfig,
        concurrency: 5,
        removeOnComplete: {
          count: 1000,
          age: 24 * 3600, // 24 hours
        },
        removeOnFail: {
          count: 5000,
        },
      }
    );

    this.worker.on('completed', (job) => {
      logger.info('Post job completed', { 
        jobId: job.id,
        requestId: job.data.requestId 
      });
    });

    this.worker.on('failed', (job, err) => {
      logger.error('Post job failed', err, {
        jobId: job?.id,
        requestId: job?.data?.requestId,
        attempts: job?.attemptsMade,
      });
    });

    logger.info('Posting worker started', { queueName: this.queueName });
  }

  async processJob(job) {
    const {
      requestId,
      pageId,
      pageAccessToken,
      variantId,
      content,
      postType,
      mediaUrl,
      mediaPath,
      altText,
      options = {},
    } = job.data;

    logger.info('Processing post job', {
      jobId: job.id,
      requestId,
      pageId,
      postType,
    });

    try {
      // Final moderation check before posting
      const moderation = await openaiService.moderateContent(content);
      if (!moderation.safe) {
        const error = new Error('Content failed final moderation check');
        await auditService.logError(requestId, error, {
          variantId,
          moderationResult: moderation,
        });
        throw error;
      }

      // Refresh page token if needed
      const tokenRefresh = await facebookService.refreshPageToken(
        pageId,
        pageAccessToken
      );
      const finalToken = tokenRefresh.success ? tokenRefresh.token : pageAccessToken;

      let result;

      if (postType === 'text') {
        result = await facebookService.postText(
          pageId,
          finalToken,
          content,
          options
        );
      } else if (postType === 'photo' || postType === 'image') {
        if (mediaPath) {
          // Upload from local file
          const buffer = await mediaService.getMediaBuffer(mediaPath);
          if (!buffer) {
            throw new Error('Failed to read media file');
          }
          result = await facebookService.postPhotoMultipart(
            pageId,
            finalToken,
            buffer,
            content,
            { ...options, alt_text: altText }
          );
        } else if (mediaUrl) {
          // Upload from URL
          result = await facebookService.postPhoto(
            pageId,
            finalToken,
            mediaUrl,
            content,
            { ...options, alt_text: altText }
          );
        } else {
          throw new Error('No media provided for photo post');
        }
      } else {
        throw new Error(`Unsupported post type: ${postType}`);
      }

      if (result.success) {
        await auditService.logPostExecution(requestId, pageId, {
          ...result,
          variantId,
        });

        return {
          success: true,
          requestId,
          pageId,
          variantId,
          postId: result.postId || result.data?.id,
          dryRun: result.dryRun || false,
        };
      } else {
        throw new Error(result.error || 'Posting failed');
      }
    } catch (error) {
      await auditService.logError(requestId, error, {
        pageId,
        variantId,
        jobId: job.id,
      });

      // Check if it's a rate limit error
      if (error.response?.status === 429 || error.code === 4) {
        const retryAfter = error.response?.headers?.['retry-after'] || 
                          error.retryAfter || 
                          60;
        throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
      }

      throw error;
    }
  }

  async stop() {
    if (this.worker) {
      await this.worker.close();
      logger.info('Posting worker stopped');
    }
  }
}

export default PostingWorker;


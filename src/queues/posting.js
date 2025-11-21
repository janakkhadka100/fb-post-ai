import { Queue } from 'bullmq';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Posting queue manager
 */
class PostingQueue {
  constructor() {
    const redisConfig = config.getRedisConfig();
    this.queue = new Queue('posting', {
      connection: redisConfig,
    });
  }

  /**
   * Schedule a post job
   */
  async schedulePost(jobData) {
    const {
      requestId,
      publishTime,
      pageId,
      pageAccessToken,
      variantId,
      content,
      postType,
      mediaUrl,
      mediaPath,
      altText,
      options = {},
    } = jobData;

    const publishDate = publishTime ? new Date(publishTime) : new Date();
    const delay = Math.max(0, publishDate.getTime() - Date.now());

    logger.info('Scheduling post job', {
      requestId,
      pageId,
      publishTime: publishDate.toISOString(),
      delayMs: delay,
    });

    const job = await this.queue.add(
      'post',
      {
        requestId,
        pageId,
        pageAccessToken,
        variantId,
        content,
        postType,
        mediaUrl,
        mediaPath,
        altText,
        options,
      },
      {
        jobId: `post-${requestId}-${variantId}`,
        delay,
        attempts: config.getMaxRetries(),
        backoff: {
          type: 'exponential',
          delay: config.getRetryDelay(),
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    return {
      success: true,
      jobId: job.id,
      requestId,
      scheduledFor: publishDate.toISOString(),
    };
  }

  /**
   * Cancel a scheduled post
   */
  async cancelPost(jobId) {
    try {
      const job = await this.queue.getJob(jobId);
      if (job) {
        await job.remove();
        logger.info('Post job cancelled', { jobId });
        return { success: true, jobId };
      }
      return { success: false, error: 'Job not found' };
    } catch (error) {
      logger.error('Failed to cancel post job', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId) {
    try {
      const job = await this.queue.getJob(jobId);
      if (!job) {
        return { success: false, error: 'Job not found' };
      }

      const state = await job.getState();
      const progress = job.progress;
      const returnValue = job.returnvalue;

      return {
        success: true,
        jobId,
        state,
        progress,
        result: returnValue,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
      };
    } catch (error) {
      logger.error('Failed to get job status', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get queue stats
   */
  async getQueueStats() {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.queue.getWaitingCount(),
        this.queue.getActiveCount(),
        this.queue.getCompletedCount(),
        this.queue.getFailedCount(),
        this.queue.getDelayedCount(),
      ]);

      return {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed,
      };
    } catch (error) {
      logger.error('Failed to get queue stats', error);
      return { error: error.message };
    }
  }
}

export default new PostingQueue();


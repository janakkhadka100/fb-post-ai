import logger from '../utils/logger.js';
import openaiService from './openai.js';
import mediaService from './media.js';
import auditService from './audit.js';
import postingQueue from '../queues/posting.js';
import config from '../config/index.js';

/**
 * Main posting orchestration service
 */
class PostingService {
  /**
   * Process a post request end-to-end
   */
  async processPostRequest(request) {
    const requestId = request.requestId || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('Processing post request', {
      requestId,
      pageId: request.pageId,
      postType: request.postType,
    });

    await auditService.logPostRequest({ ...request, requestId });

    try {
      // Step 1: Generate content variants
      const generationResult = await openaiService.generateContentVariants({
        language: request.locale || 'en',
        targetAudience: request.targetAudience,
        tone: request.tone || 'professional',
        keyMessages: request.keyMessages || [],
        hashtags: request.hashtags !== false,
        cta: request.cta,
        characterLimit: request.characterLimit || 2200,
        postType: request.postType || 'text',
        mediaDescription: request.mediaDescription,
      });

      if (!generationResult.success) {
        throw new Error(`Content generation failed: ${generationResult.error}`);
      }

      await auditService.logContentGeneration(requestId, generationResult);

      // Step 2: Moderate all variants
      const moderationResult = await openaiService.moderateVariants(
        generationResult.variants
      );

      await auditService.logModeration(
        requestId,
        'all',
        moderationResult
      );

      if (!moderationResult.allSafe) {
        logger.warn('Some variants failed moderation', {
          requestId,
          safeCount: moderationResult.safeVariants.length,
        });
      }

      if (moderationResult.safeVariants.length === 0) {
        throw new Error('All content variants failed moderation');
      }

      // Step 3: Handle media if needed
      let mediaPath = null;
      let mediaUrl = request.mediaUrl;

      if (request.postType !== 'text' && request.mediaUrl && !request.mediaPath) {
        const downloadResult = await mediaService.downloadMedia(request.mediaUrl);
        if (downloadResult.success) {
          mediaPath = downloadResult.filepath;
        } else {
          logger.warn('Failed to download media, using URL directly', {
            requestId,
            error: downloadResult.error,
          });
        }
      } else if (request.mediaPath) {
        mediaPath = request.mediaPath;
      }

      // Step 4: Handle approval
      if (request.approvalMode === 'manual') {
        // Store for manual approval (simplified - in production, use a proper approval system)
        logger.info('Post requires manual approval', { requestId });
        return {
          success: true,
          requestId,
          status: 'pending_approval',
          variants: moderationResult.safeVariants.map(v => ({
            id: v.id,
            content: v.content,
            type: v.type,
          })),
          moderationSummary: {
            total: generationResult.variants.length,
            safe: moderationResult.safeVariants.length,
            flagged: generationResult.variants.length - moderationResult.safeVariants.length,
          },
        };
      }

      // Step 5: Schedule posts (use primary variant by default, or allow selection)
      const selectedVariant = moderationResult.safeVariants[0];
      const publishTime = request.publishTime || new Date().toISOString();

      const scheduleResult = await postingQueue.schedulePost({
        requestId,
        publishTime,
        pageId: request.pageId,
        pageAccessToken: request.pageAccessToken,
        variantId: selectedVariant.id,
        content: selectedVariant.content,
        postType: request.postType || 'text',
        mediaUrl,
        mediaPath,
        altText: generationResult.altText,
        options: request.options || {},
      });

      if (!scheduleResult.success) {
        throw new Error(`Failed to schedule post: ${scheduleResult.error}`);
      }

      // Step 6: Return summary
      const summary = {
        status: 'scheduled',
        requestId,
        jobId: scheduleResult.jobId,
        pageId: request.pageId,
        variantIds: moderationResult.safeVariants.map(v => v.id),
        selectedVariantId: selectedVariant.id,
        moderationSummary: {
          total: generationResult.variants.length,
          safe: moderationResult.safeVariants.length,
          flagged: generationResult.safeVariants.length - moderationResult.safeVariants.length,
          categories: moderationResult.results
            .filter(r => !r.safe)
            .flatMap(r => r.categories || []),
        },
        scheduledFor: scheduleResult.scheduledFor,
        dryRun: config.isDryRun(),
        errors: [],
      };

      logger.info('Post request processed successfully', {
        requestId,
        jobId: scheduleResult.jobId,
      });

      return summary;
    } catch (error) {
      logger.error('Post request processing failed', error, { requestId });
      await auditService.logError(requestId, error);

      return {
        status: 'failed',
        requestId,
        errors: [error.message],
      };
    }
  }

  /**
   * Approve a pending post (for manual approval mode)
   */
  async approvePost(requestId, variantId, publishTime = null) {
    // In a full implementation, this would retrieve the stored request
    // and schedule it. For now, this is a placeholder.
    logger.info('Post approved', { requestId, variantId });
    return {
      success: true,
      requestId,
      variantId,
      message: 'Approval system not fully implemented - use auto mode',
    };
  }
}

export default new PostingService();


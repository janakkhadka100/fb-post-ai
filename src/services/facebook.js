import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Facebook Graph API service
 */
class FacebookService {
  constructor() {
    this.apiVersion = config.getFacebookApiVersion();
    this.baseUrl = `https://graph.facebook.com/v${this.apiVersion}`;
    this.appId = config.getFacebookAppId();
    this.appSecret = config.getFacebookAppSecret();
    this.userAccessToken = config.getFacebookAccessToken();
  }

  /**
   * Make authenticated request to Graph API
   */
  async request(method, endpoint, params = {}, accessToken = null) {
    const token = accessToken || this.userAccessToken;
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestParams = {
      ...params,
      access_token: token,
    };

    try {
      const config = method.toLowerCase() === 'get' 
        ? { params: requestParams }
        : { data: requestParams };

      const response = await axios[method.toLowerCase()](url, config);
      return { success: true, data: response.data };
    } catch (error) {
      const errorData = error.response?.data?.error || {};
      logger.error('Facebook API request failed', error, {
        endpoint,
        method,
        errorCode: errorData.code,
        errorMessage: errorData.message,
        errorType: errorData.type,
      });

      return {
        success: false,
        error: errorData.message || error.message,
        code: errorData.code,
        type: errorData.type,
        status: error.response?.status,
        retryAfter: error.response?.headers?.['retry-after'],
      };
    }
  }

  /**
   * Discover pages the token can manage
   */
  async discoverPages() {
    logger.info('Discovering Facebook pages');
    
    const result = await this.request('GET', '/me/accounts', {
      fields: 'id,name,access_token,perms,tasks',
    });

    if (!result.success) {
      logger.error('Failed to discover pages', null, { error: result.error });
      return { success: false, pages: [], error: result.error };
    }

    const pages = (result.data?.data || []).map(page => ({
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token, // Store in-memory only
      permissions: page.perms || [],
      tasks: page.tasks || [],
    }));

    logger.info(`Discovered ${pages.length} pages`, {
      pageCount: pages.length,
      pageNames: pages.map(p => p.pageName)
    });

    return { success: true, pages };
  }

  /**
   * Post text-only message to a page
   */
  async postText(pageId, pageAccessToken, message, options = {}) {
    logger.info('Posting text to Facebook page', { pageId, messageLength: message.length });
    
    if (config.isDryRun()) {
      logger.info('DRY RUN: Would post text', { pageId, messagePreview: message.substring(0, 100) });
      return {
        success: true,
        postId: 'dry-run-post-id',
        dryRun: true,
      };
    }

    const params = {
      message,
      ...options,
    };

    return await this.request('POST', `/${pageId}/feed`, params, pageAccessToken);
  }

  /**
   * Upload and post a photo
   */
  async postPhoto(pageId, pageAccessToken, photoUrl, caption = '', options = {}) {
    logger.info('Posting photo to Facebook page', { pageId, photoUrl: '[REDACTED]' });
    
    if (config.isDryRun()) {
      logger.info('DRY RUN: Would post photo', { pageId, captionPreview: caption.substring(0, 100) });
      return {
        success: true,
        postId: 'dry-run-photo-id',
        photoId: 'dry-run-photo-id',
        dryRun: true,
      };
    }

    const params = {
      url: photoUrl,
      caption,
      published: true,
      ...options,
    };

    return await this.request('POST', `/${pageId}/photos`, params, pageAccessToken);
  }

  /**
   * Upload photo as multipart (for local files)
   */
  async postPhotoMultipart(pageId, pageAccessToken, photoBuffer, caption = '', options = {}) {
    logger.info('Posting photo (multipart) to Facebook page', { pageId });
    
    if (config.isDryRun()) {
      logger.info('DRY RUN: Would post photo (multipart)', { pageId });
      return {
        success: true,
        postId: 'dry-run-photo-id',
        photoId: 'dry-run-photo-id',
        dryRun: true,
      };
    }

    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('source', photoBuffer, { filename: 'photo.jpg' });
    form.append('caption', caption);
    form.append('published', 'true');
    
    Object.entries(options).forEach(([key, value]) => {
      form.append(key, value);
    });

    try {
      const url = `${this.baseUrl}/${pageId}/photos?access_token=${pageAccessToken}`;
      const response = await axios.post(url, form, {
        headers: form.getHeaders(),
      });

      return { success: true, data: response.data };
    } catch (error) {
      logger.error('Failed to post photo (multipart)', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Post to a group (if permitted)
   */
  async postToGroup(groupId, groupAccessToken, message, options = {}) {
    logger.info('Posting to Facebook group', { groupId });
    
    if (config.isDryRun()) {
      logger.info('DRY RUN: Would post to group', { groupId });
      return {
        success: true,
        postId: 'dry-run-group-post-id',
        dryRun: true,
      };
    }

    const params = {
      message,
      ...options,
    };

    return await this.request('POST', `/${groupId}/feed`, params, groupAccessToken);
  }

  /**
   * Refresh page access token if needed
   */
  async refreshPageToken(pageId, currentToken) {
    logger.info('Refreshing page access token', { pageId });
    
    // Facebook page tokens are long-lived, but we can verify and refresh if needed
    const result = await this.request('GET', '/debug_token', {
      input_token: currentToken,
    }, `${this.appId}|${this.appSecret}`);

    if (result.success && result.data?.data?.is_valid) {
      return { success: true, token: currentToken, expiresAt: result.data.data.expires_at };
    }

    // If token is invalid, we'd need to re-authenticate
    logger.warn('Page token appears invalid, re-authentication may be required', { pageId });
    return { success: false, error: 'Token invalid, re-authentication required' };
  }
}

export default new FacebookService();


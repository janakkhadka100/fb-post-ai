import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { OpenAI } from 'openai';

/**
 * Startup validation service
 */
class ValidationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.getOpenAIKey(),
    });
  }

  /**
   * Validate all required environment variables
   */
  validateEnvVars() {
    logger.info('Validating environment variables');
    try {
      config.validate();
      logger.info('Environment variables validated successfully');
      return { valid: true };
    } catch (error) {
      logger.error('Environment validation failed', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Test OpenAI API connection
   */
  async validateOpenAI() {
    logger.info('Validating OpenAI API connection');
    try {
      const response = await this.openai.models.list();
      logger.info('OpenAI API connection validated successfully');
      return { valid: true, modelCount: response.data?.length || 0 };
    } catch (error) {
      logger.error('OpenAI validation failed', error);
      return { 
        valid: false, 
        error: error.message,
        status: error.status || 'unknown'
      };
    }
  }

  /**
   * Validate Facebook access token and check scopes
   */
  async validateFacebookToken() {
    logger.info('Validating Facebook access token');
    const appId = config.getFacebookAppId();
    const appSecret = config.getFacebookAppSecret();
    const accessToken = config.getFacebookAccessToken();
    const apiVersion = config.getFacebookApiVersion();

    try {
      // Debug token endpoint
      const debugUrl = `https://graph.facebook.com/v${apiVersion}/debug_token`;
      const debugParams = {
        input_token: accessToken,
        access_token: `${appId}|${appSecret}`,
      };

      const debugResponse = await axios.get(debugUrl, { params: debugParams });
      const tokenData = debugResponse.data?.data;

      if (!tokenData || !tokenData.is_valid) {
        logger.error('Facebook token is invalid', null, { 
          error: tokenData?.error?.message || 'Token validation failed' 
        });
        return { 
          valid: false, 
          error: tokenData?.error?.message || 'Token is invalid',
          scopes: []
        };
      }

      const scopes = tokenData.scopes || [];
      const requiredScopes = [
        'pages_manage_posts',
        'pages_read_engagement',
        'pages_manage_metadata',
      ];

      const missingScopes = requiredScopes.filter(
        scope => !scopes.includes(scope)
      );

      if (missingScopes.length > 0) {
        logger.warn('Facebook token missing some recommended scopes', {
          missing: missingScopes,
          current: scopes
        });
      }

      logger.info('Facebook token validated successfully', {
        appId: tokenData.app_id,
        userId: tokenData.user_id,
        expiresAt: tokenData.expires_at,
        scopeCount: scopes.length
      });

      return {
        valid: true,
        appId: tokenData.app_id,
        userId: tokenData.user_id,
        expiresAt: tokenData.expires_at,
        scopes,
        missingScopes,
      };
    } catch (error) {
      logger.error('Facebook token validation failed', error, {
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      return {
        valid: false,
        error: error.response?.data?.error?.message || error.message,
        status: error.response?.status,
      };
    }
  }

  /**
   * Run all startup validations
   */
  async runStartupChecks() {
    logger.info('Running startup validation checks');
    
    const results = {
      env: this.validateEnvVars(),
      openai: null,
      facebook: null,
      healthy: false,
    };

    if (!results.env.valid) {
      logger.error('Startup checks failed: environment variables invalid');
      return results;
    }

    results.openai = await this.validateOpenAI();
    if (!results.openai.valid) {
      logger.error('Startup checks failed: OpenAI validation failed');
      return results;
    }

    results.facebook = await this.validateFacebookToken();
    if (!results.facebook.valid) {
      logger.error('Startup checks failed: Facebook token validation failed');
      return results;
    }

    results.healthy = true;
    logger.info('All startup checks passed successfully');
    
    return results;
  }
}

export default new ValidationService();


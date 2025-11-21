import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Secure configuration manager
 * NEVER logs or exposes sensitive values
 */
class Config {
  constructor() {
    this.requiredVars = [
      'OPENAI_API_KEY',
      'FACEBOOK_APP_ID',
      'FACEBOOK_APP_SECRET',
      'FACEBOOK_ACCESS_TOKEN',
    ];
    
    this.validate();
  }

  validate() {
    const missing = this.requiredVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }

  getRequired(key) {
    const value = this.get(key);
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  // Secure getters that never expose values in logs
  getOpenAIKey() {
    return this.getRequired('OPENAI_API_KEY');
  }

  getFacebookAppId() {
    return this.getRequired('FACEBOOK_APP_ID');
  }

  getFacebookAppSecret() {
    return this.getRequired('FACEBOOK_APP_SECRET');
  }

  getFacebookAccessToken() {
    return this.getRequired('FACEBOOK_ACCESS_TOKEN');
  }

  getStorageConnection() {
    return this.get('STORAGE_CONNECTION', 'file://./storage');
  }

  getRedisConfig() {
    return {
      host: this.get('REDIS_HOST', 'localhost'),
      port: parseInt(this.get('REDIS_PORT', '6379'), 10),
      password: this.get('REDIS_PASSWORD', ''),
    };
  }

  getDatabaseUrl() {
    return this.get('DATABASE_URL', 'postgresql://localhost:5432/fbpostai');
  }

  getFacebookApiVersion() {
    return this.get('FACEBOOK_API_VERSION', '21.0');
  }

  getMaxRetries() {
    return parseInt(this.get('MAX_RETRIES', '3'), 10);
  }

  getRetryDelay() {
    return parseInt(this.get('RETRY_DELAY_MS', '1000'), 10);
  }

  isDryRun() {
    return this.get('DRY_RUN', 'false').toLowerCase() === 'true';
  }

  getPort() {
    return parseInt(this.get('PORT', '3000'), 10);
  }

  // Helper to check if a value exists without exposing it
  has(key) {
    return !!this.get(key);
  }
}

export default new Config();


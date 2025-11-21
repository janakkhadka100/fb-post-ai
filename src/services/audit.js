import logger from '../utils/logger.js';
import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Audit logging service with token redaction
 */
class AuditService {
  constructor() {
    this.logDir = join(__dirname, '../../logs/audit');
    this.ensureLogDir();
  }

  async ensureLogDir() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create audit log directory', error);
    }
  }

  /**
   * Redact sensitive information from audit entries
   */
  redactSensitive(data) {
    const redacted = { ...data };
    const sensitiveKeys = [
      'token',
      'accessToken',
      'apiKey',
      'secret',
      'password',
      'pageAccessToken',
      'openaiApiKey',
      'facebookAccessToken',
    ];

    for (const key of Object.keys(redacted)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = this.redactSensitive(redacted[key]);
      } else if (typeof redacted[key] === 'string') {
        // Redact tokens in strings
        redacted[key] = redacted[key].replace(
          /(sk-|EAA|EAAB|EAF)[a-zA-Z0-9_\-\.]+/g,
          '[REDACTED]'
        );
      }
    }

    return redacted;
  }

  /**
   * Log audit entry
   */
  async log(entry) {
    const timestamp = new Date().toISOString();
    const redactedEntry = this.redactSensitive({
      ...entry,
      timestamp,
    });

    const logLine = JSON.stringify(redactedEntry) + '\n';
    const logFile = join(this.logDir, `audit-${new Date().toISOString().split('T')[0]}.log`);

    try {
      await fs.appendFile(logFile, logLine);
      logger.debug('Audit entry logged', { requestId: entry.requestId });
    } catch (error) {
      logger.error('Failed to write audit log', error);
    }
  }

  /**
   * Log post request
   */
  async logPostRequest(request) {
    await this.log({
      type: 'post_request',
      requestId: request.requestId || `req-${Date.now()}`,
      pageId: request.pageId,
      campaignId: request.campaignId,
      postType: request.postType,
      approvalMode: request.approvalMode,
      status: 'pending',
    });
  }

  /**
   * Log content generation
   */
  async logContentGeneration(requestId, result) {
    await this.log({
      type: 'content_generation',
      requestId,
      variantCount: result.variants?.length || 0,
      model: result.metadata?.model,
      completionId: result.metadata?.completionId,
      status: result.success ? 'success' : 'failed',
      error: result.error,
    });
  }

  /**
   * Log moderation result
   */
  async logModeration(requestId, variantId, result) {
    await this.log({
      type: 'moderation',
      requestId,
      variantId,
      flagged: result.flagged,
      hasHighRisk: result.hasHighRisk,
      categories: result.categories,
      safe: result.safe,
      status: result.safe ? 'passed' : 'failed',
    });
  }

  /**
   * Log post execution
   */
  async logPostExecution(requestId, pageId, result) {
    await this.log({
      type: 'post_execution',
      requestId,
      pageId,
      postId: result.postId,
      variantId: result.variantId,
      status: result.success ? 'success' : 'failed',
      error: result.error,
      dryRun: result.dryRun || false,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log error
   */
  async logError(requestId, error, context = {}) {
    await this.log({
      type: 'error',
      requestId,
      error: error.message,
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Query audit logs (simple file-based search)
   */
  async queryLogs(filters = {}) {
    try {
      const files = await fs.readdir(this.logDir);
      const logFiles = files.filter(f => f.startsWith('audit-') && f.endsWith('.log'));
      
      const results = [];
      for (const file of logFiles) {
        const content = await fs.readFile(join(this.logDir, file), 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());
        
        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            let matches = true;
            
            for (const [key, value] of Object.entries(filters)) {
              if (entry[key] !== value) {
                matches = false;
                break;
              }
            }
            
            if (matches) {
              results.push(entry);
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
      
      return results.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
    } catch (error) {
      logger.error('Failed to query audit logs', error);
      return [];
    }
  }
}

export default new AuditService();


import winston from 'winston';

/**
 * Secure logger that redacts sensitive information
 */
class SecureLogger {
  constructor() {
    this.sensitivePatterns = [
      /(?:api[_-]?key|access[_-]?token|secret|password|token)\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]+)/gi,
      /(?:sk-|EAA|EAAB|EAF)[a-zA-Z0-9_\-\.]+/g,
      /Bearer\s+[a-zA-Z0-9_\-\.]+/gi,
    ];

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const redactedMessage = this.redact(message);
          const redactedMeta = this.redactObject(meta);
          return JSON.stringify({
            timestamp,
            level,
            message: redactedMessage,
            ...redactedMeta,
          });
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }

  redact(text) {
    if (typeof text !== 'string') return text;
    
    let redacted = text;
    this.sensitivePatterns.forEach(pattern => {
      redacted = redacted.replace(pattern, (match, ...args) => {
        if (args[0] && args[0].length > 10) {
          return match.replace(args[0], '[REDACTED]');
        }
        return '[REDACTED]';
      });
    });
    
    return redacted;
  }

  redactObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const redacted = { ...obj };
    const sensitiveKeys = ['token', 'key', 'secret', 'password', 'accessToken', 'apiKey'];
    
    for (const key of Object.keys(redacted)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = this.redactObject(redacted[key]);
      } else if (typeof redacted[key] === 'string') {
        redacted[key] = this.redact(redacted[key]);
      }
    }
    
    return redacted;
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = error ? { error: error.message, stack: error.stack } : {};
    this.logger.error(message, { ...errorMeta, ...meta });
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }
}

export default new SecureLogger();


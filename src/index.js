import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import logger from './utils/logger.js';
import validationService from './services/validation.js';
import PostingWorker from './workers/posting.js';
import routes from './api/routes.js';

/**
 * Main application entry point
 */
class Application {
  constructor() {
    this.app = express();
    this.server = null;
    this.worker = null;
    this.healthy = false;
  }

  async initialize() {
    logger.info('Initializing Facebook Post AI Agent');

    // Run startup validation
    const validationResults = await validationService.runStartupChecks();
    
    if (!validationResults.healthy) {
      logger.error('Startup validation failed - application will not start');
      logger.error('Validation results:', {
        env: validationResults.env,
        openai: validationResults.openai,
        facebook: validationResults.facebook,
      });
      process.exit(1);
    }

    this.healthy = true;
    logger.info('Startup validation passed');

    // Setup CORS - Allow all origins in development, specific in production
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',')
      : ['http://localhost:5173', 'https://*.vercel.app'];
    
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list or matches pattern
        const isAllowed = allowedOrigins.some(allowed => {
          if (allowed.includes('*')) {
            const pattern = allowed.replace('*', '.*');
            return new RegExp(pattern).test(origin);
          }
          return allowed === origin;
        });
        
        if (isAllowed || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Setup Express routes
    this.app.use('/api', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Facebook Post AI Agent',
        version: '1.0.0',
        status: this.healthy ? 'healthy' : 'unhealthy',
        dryRun: config.isDryRun(),
        endpoints: {
          health: '/api/health',
          pages: '/api/pages',
          posts: '/api/posts',
          jobs: '/api/jobs/:jobId',
          queue: '/api/queue/stats',
          audit: '/api/audit',
        },
      });
    });

    // Error handling middleware
    this.app.use((err, req, res, next) => {
      logger.error('Express error', err);
      res.status(500).json({
        success: false,
        error: err.message,
      });
    });

    // Start posting worker
    this.worker = new PostingWorker();
    this.worker.start();

    logger.info('Application initialized successfully');
  }

  async start() {
    await this.initialize();

    const port = config.getPort();
    this.server = this.app.listen(port, () => {
      logger.info(`Server started on port ${port}`, {
        port,
        dryRun: config.isDryRun(),
        environment: config.get('NODE_ENV', 'development'),
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  async shutdown() {
    logger.info('Shutting down application');
    
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
    }

    if (this.worker) {
      await this.worker.stop();
    }

    logger.info('Application shut down complete');
    process.exit(0);
  }
}

// Start the application
const app = new Application();
app.start().catch((error) => {
  logger.error('Failed to start application', error);
  process.exit(1);
});


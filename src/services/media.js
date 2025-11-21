import axios from 'axios';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Media handling service
 */
class MediaService {
  constructor() {
    this.storagePath = this.getStoragePath();
    this.ensureStorageDir();
  }

  getStoragePath() {
    const storageConn = config.getStorageConnection();
    
    if (storageConn.startsWith('file://')) {
      return storageConn.replace('file://', '');
    }
    
    // Default to local storage
    return join(__dirname, '../../storage');
  }

  async ensureStorageDir() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      await fs.mkdir(join(this.storagePath, 'media'), { recursive: true });
      await fs.mkdir(join(this.storagePath, 'uploads'), { recursive: true });
    } catch (error) {
      logger.error('Failed to create storage directories', error);
    }
  }

  /**
   * Download media from URL and store locally
   */
  async downloadMedia(url, filename = null) {
    logger.info('Downloading media', { url: '[REDACTED]' });
    
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });

      const ext = filename?.split('.').pop() || 
                  url.split('.').pop()?.split('?')[0] || 
                  'jpg';
      const finalFilename = filename || `media-${Date.now()}.${ext}`;
      const filepath = join(this.storagePath, 'media', finalFilename);

      const writer = require('fs').createWriteStream(filepath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          logger.info('Media downloaded successfully', { filename: finalFilename });
          resolve({
            success: true,
            filepath,
            filename: finalFilename,
            size: writer.bytesWritten,
          });
        });
        writer.on('error', reject);
      });
    } catch (error) {
      logger.error('Failed to download media', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload file from local path
   */
  async uploadFile(filepath, destination = null) {
    try {
      const stats = await fs.stat(filepath);
      const filename = destination || filepath.split('/').pop();
      const destPath = join(this.storagePath, 'uploads', filename);

      await fs.copyFile(filepath, destPath);

      logger.info('File uploaded to storage', { filename });
      return {
        success: true,
        filepath: destPath,
        filename,
        size: stats.size,
      };
    } catch (error) {
      logger.error('Failed to upload file', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get media buffer for upload
   */
  async getMediaBuffer(filepath) {
    try {
      return await fs.readFile(filepath);
    } catch (error) {
      logger.error('Failed to read media file', error);
      return null;
    }
  }

  /**
   * Validate image file
   */
  async validateImage(filepath) {
    try {
      const buffer = await this.getMediaBuffer(filepath);
      // Basic validation - check file signature
      const signatures = {
        jpeg: [0xFF, 0xD8, 0xFF],
        png: [0x89, 0x50, 0x4E, 0x47],
        gif: [0x47, 0x49, 0x46, 0x38],
      };

      for (const [format, sig] of Object.entries(signatures)) {
        if (sig.every((byte, i) => buffer[i] === byte)) {
          return { valid: true, format };
        }
      }

      return { valid: false, error: 'Unsupported image format' };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Clean up old media files (optional maintenance)
   */
  async cleanupOldMedia(maxAgeDays = 30) {
    try {
      const mediaDir = join(this.storagePath, 'media');
      const files = await fs.readdir(mediaDir);
      const now = Date.now();
      const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

      let deleted = 0;
      for (const file of files) {
        const filepath = join(mediaDir, file);
        const stats = await fs.stat(filepath);
        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filepath);
          deleted++;
        }
      }

      logger.info('Media cleanup completed', { deleted });
      return { success: true, deleted };
    } catch (error) {
      logger.error('Media cleanup failed', error);
      return { success: false, error: error.message };
    }
  }
}

export default new MediaService();


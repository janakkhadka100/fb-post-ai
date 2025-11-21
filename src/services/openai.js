import { OpenAI } from 'openai';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * OpenAI content generation and moderation service
 */
class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.getOpenAIKey(),
    });
    this.defaultModel = 'gpt-4o-mini';
  }

  /**
   * Generate 3 content variants for a post
   */
  async generateContentVariants(params) {
    const {
      language = 'en',
      targetAudience,
      tone = 'professional',
      keyMessages = [],
      hashtags = true,
      cta,
      characterLimit = 2200, // Facebook post limit
      postType = 'text',
      mediaDescription = '',
    } = params;

    logger.info('Generating content variants', {
      language,
      tone,
      keyMessageCount: keyMessages.length,
      postType
    });

    const prompt = this.buildPrompt({
      language,
      targetAudience,
      tone,
      keyMessages,
      hashtags,
      cta,
      characterLimit,
      postType,
      mediaDescription,
    });

    try {
      const completion = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media content creator specializing in Facebook posts. Generate engaging, platform-appropriate content that follows best practices.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: Math.min(characterLimit, 2000),
      });

      const rawContent = completion.choices[0]?.message?.content || '';
      const variants = this.parseVariants(rawContent);

      // Generate alt-text if media is involved
      let altText = '';
      if (postType !== 'text' && mediaDescription) {
        altText = await this.generateAltText(mediaDescription, language);
      }

      const metadata = {
        model: this.defaultModel,
        completionId: completion.id,
        prompt: this.redactPrompt(prompt), // Store redacted version
        timestamp: new Date().toISOString(),
        usage: completion.usage,
      };

      logger.info('Content variants generated successfully', {
        variantCount: variants.length,
        completionId: completion.id
      });

      return {
        success: true,
        variants: variants.map((variant, index) => ({
          id: `variant-${Date.now()}-${index}`,
          type: index === 0 ? 'primary' : index === 1 ? 'short' : 'alternative',
          content: variant,
          metadata,
        })),
        altText,
        metadata,
      };
    } catch (error) {
      logger.error('Failed to generate content variants', error);
      return {
        success: false,
        error: error.message,
        variants: [],
      };
    }
  }

  /**
   * Build structured prompt for content generation
   */
  buildPrompt(params) {
    const {
      language,
      targetAudience,
      tone,
      keyMessages,
      hashtags,
      cta,
      characterLimit,
      postType,
      mediaDescription,
    } = params;

    const languageNames = {
      en: 'English',
      hi: 'Hindi',
      ne: 'Nepali',
    };

    let prompt = `Generate 3 Facebook post variants in ${languageNames[language] || language}:\n\n`;
    
    if (targetAudience) {
      prompt += `Target Audience: ${targetAudience}\n`;
    }
    
    prompt += `Tone: ${tone}\n`;
    prompt += `Character Limit: ${characterLimit} characters per variant\n`;
    prompt += `Post Type: ${postType}\n\n`;

    if (mediaDescription) {
      prompt += `Media Description: ${mediaDescription}\n\n`;
    }

    if (keyMessages.length > 0) {
      prompt += `Key Messages to Include:\n`;
      keyMessages.forEach((msg, i) => {
        prompt += `${i + 1}. ${msg}\n`;
      });
      prompt += '\n';
    }

    if (hashtags) {
      prompt += `Include 3-5 relevant hashtags per variant.\n`;
    }

    if (cta) {
      prompt += `Call-to-Action: ${cta}\n\n`;
    }

    prompt += `Requirements:\n`;
    prompt += `1. Primary variant: Full-length engaging post (up to ${characterLimit} chars)\n`;
    prompt += `2. Short variant: Condensed version (100-200 chars) for previews\n`;
    prompt += `3. Alternative variant: Different angle/style (up to ${characterLimit} chars)\n\n`;
    prompt += `Format your response as:\n`;
    prompt += `VARIANT_1: [content]\n`;
    prompt += `VARIANT_2: [content]\n`;
    prompt += `VARIANT_3: [content]\n`;

    return prompt;
  }

  /**
   * Parse variants from OpenAI response
   */
  parseVariants(content) {
    const variants = [];
    const lines = content.split('\n');
    
    let currentVariant = '';
    for (const line of lines) {
      if (line.match(/^VARIANT_[123]:/i)) {
        if (currentVariant) {
          variants.push(currentVariant.trim());
        }
        currentVariant = line.replace(/^VARIANT_[123]:\s*/i, '');
      } else if (currentVariant || variants.length > 0) {
        currentVariant += (currentVariant ? '\n' : '') + line;
      }
    }
    
    if (currentVariant) {
      variants.push(currentVariant.trim());
    }

    // Fallback: if parsing fails, split by paragraphs or return as single variant
    if (variants.length === 0) {
      const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
      if (paragraphs.length >= 3) {
        return paragraphs.slice(0, 3);
      } else if (paragraphs.length > 0) {
        return [paragraphs[0], paragraphs[0]?.substring(0, 200), paragraphs[0]];
      }
      return [content];
    }

    return variants.slice(0, 3);
  }

  /**
   * Generate alt-text for images
   */
  async generateAltText(mediaDescription, language = 'en') {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are an accessibility expert. Generate concise, descriptive alt-text for images that helps visually impaired users understand the content.',
          },
          {
            role: 'user',
            content: `Generate alt-text (max 100 characters) for this image: ${mediaDescription}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      logger.error('Failed to generate alt-text', error);
      return '';
    }
  }

  /**
   * Moderate content using OpenAI Moderation API
   */
  async moderateContent(content) {
    logger.info('Running content moderation', { contentLength: content.length });
    
    try {
      const moderation = await this.client.moderations.create({
        input: content,
      });

      const result = moderation.results[0];
      const flagged = result.flagged;
      const categories = result.categories;
      const categoryScores = result.category_scores;

      // High-risk categories that should block posting
      const highRiskCategories = [
        'hate',
        'hate/threatening',
        'harassment',
        'harassment/threatening',
        'self-harm',
        'sexual',
        'sexual/minors',
        'violence',
        'violence/graphic',
      ];

      const flaggedCategories = Object.entries(categories)
        .filter(([_, flagged]) => flagged)
        .map(([category, _]) => category);

      const hasHighRisk = flaggedCategories.some(cat => 
        highRiskCategories.some(hr => cat.includes(hr))
      );

      const moderationResult = {
        flagged,
        hasHighRisk,
        categories: flaggedCategories,
        scores: Object.fromEntries(
          Object.entries(categoryScores)
            .filter(([cat, _]) => categories[cat])
            .map(([cat, score]) => [cat, Math.round(score * 100) / 100])
        ),
        safe: !flagged && !hasHighRisk,
      };

      if (!moderationResult.safe) {
        logger.warn('Content failed moderation', {
          flaggedCategories,
          hasHighRisk
        });
      } else {
        logger.info('Content passed moderation');
      }

      return {
        success: true,
        ...moderationResult,
      };
    } catch (error) {
      logger.error('Moderation API call failed', error);
      // Fail open - if moderation fails, we'll still check manually
      return {
        success: false,
        error: error.message,
        safe: false, // Fail closed for safety
      };
    }
  }

  /**
   * Moderate all variants
   */
  async moderateVariants(variants) {
    const results = [];
    
    for (const variant of variants) {
      const moderation = await this.moderateContent(variant.content);
      results.push({
        variantId: variant.id,
        ...moderation,
      });
    }

    const allSafe = results.every(r => r.safe);
    const safeVariants = variants.filter((v, i) => results[i].safe);

    return {
      allSafe,
      safeVariants,
      results,
    };
  }

  /**
   * Redact sensitive info from prompt before storing
   */
  redactPrompt(prompt) {
    // Remove any potential API keys or tokens that might have been included
    return prompt.replace(/(sk-|EAA|EAAB|EAF)[a-zA-Z0-9_\-\.]+/g, '[REDACTED]');
  }
}

export default new OpenAIService();


import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import URLHandler from './url-handler.js';
import UserAgentManager from './user-agent.js';
import FetchErrorHandler from './error-handler.js';
import MarkdownConverter from '../utils/markdown-converter.js';

class AdvancedFetcher {
  /**
   * Fetch content with advanced handling and markdown conversion
   * @param {string} url - URL to fetch
   * @param {Object} options - Fetch configuration options
   * @returns {Promise<Object>} Fetch result with metadata
   */
  static async fetch(url, options = {}) {
    const fetchId = uuidv4();
    const startTime = Date.now();
    const urlVariations = URLHandler.generateUrlVariations(url);

    const defaultOptions = {
      timeout: 10000,
      retries: 3,
      convertToMarkdown: true,
      headers: {
        'User-Agent': UserAgentManager.selectRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    };

    const mergedOptions = { ...defaultOptions, ...options };

    for (const currentUrl of urlVariations) {
      try {
        const response = await fetch(currentUrl, {
          ...mergedOptions,
          headers: mergedOptions.headers
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || '';
        let content = await response.text();

        // Intelligent content conversion
        if (mergedOptions.convertToMarkdown && contentType.includes('text/html')) {
          content = MarkdownConverter.convert(content);
        }

        return {
          fetchId,
          url: currentUrl,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          contentType,
          content,
          duration: Date.now() - startTime
        };
      } catch (error) {
        const errorResult = await FetchErrorHandler.handleFetchError(error, currentUrl, mergedOptions.retries);
        
        if (errorResult === null) continue; // Retry
        return errorResult;
      }
    }

    return {
      fetchId,
      error: true,
      message: 'All URL variations failed',
      urls: urlVariations,
      duration: Date.now() - startTime
    };
  }
}

export default AdvancedFetcher;
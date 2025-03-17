import AdvancedFetcher from './core/fetcher.js';
import URLHandler from './core/url-handler.js';
import MarkdownConverter from './utils/markdown-converter.js';

class FetchMCP {
  /**
   * Primary interface for advanced web content retrieval
   * @param {string} url - URL to fetch
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} Fetched and processed content
   */
  static async fetch(url, options = {}) {
    return AdvancedFetcher.fetch(url, options);
  }

  /**
   * Utility method for URL normalization
   * @param {string} url - URL to normalize
   * @returns {string} Normalized URL
   */
  static normalizeUrl(url) {
    return URLHandler.normalizeUrl(url);
  }

  /**
   * Direct markdown conversion utility
   * @param {string} htmlContent - HTML content to convert
   * @param {Object} options - Conversion options
   * @returns {string} Converted markdown
   */
  static convertToMarkdown(htmlContent, options = {}) {
    return MarkdownConverter.convert(htmlContent, options);
  }

  /**
   * Get package version
   * @returns {string} Current package version
   */
  static getVersion() {
    return '0.1.0';
  }
}

export default FetchMCP;
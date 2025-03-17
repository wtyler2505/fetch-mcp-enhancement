import { URL } from 'url';
import dns from 'dns';
import { promisify } from 'util';

const dnsResolve = promisify(dns.resolve);

class AdvancedURLHandler {
  /**
   * Comprehensive URL normalization
   * @param {string} url - URL to normalize
   * @returns {string} Normalized URL
   */
  static normalizeUrl(url) {
    try {
      const parsedUrl = new URL(url);
      
      // Lowercase the hostname
      parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
      
      // Remove default ports
      if ((parsedUrl.protocol === 'http:' && parsedUrl.port === '80') ||
          (parsedUrl.protocol === 'https:' && parsedUrl.port === '443')) {
        parsedUrl.port = '';
      }
      
      // Remove trailing slash unless it's the root path
      if (parsedUrl.pathname !== '/') {
        parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');
      }
      
      // Remove empty query parameters
      const params = new URLSearchParams(parsedUrl.search);
      for (const [key, value] of params.entries()) {
        if (value === '') params.delete(key);
      }
      parsedUrl.search = params.toString() ? `?${params.toString()}` : '';
      
      return parsedUrl.toString();
    } catch (error) {
      return url;  // Return original if parsing fails
    }
  }

  /**
   * Generate alternative URL variations
   * @param {string} url - Original URL
   * @returns {Promise<string[]>} Array of URL variations
   */
  static async generateUrlVariations(url) {
    const variations = [
      url,
      this.normalizeUrl(url),
      url.replace(/^https?:\/\//, 'https://'),
      url.replace(/^https?:\/\//, 'http://'),
      url.replace(/www\./, '')
    ];

    // Attempt DNS variations
    try {
      const parsedUrl = new URL(url);
      const altHostnames = await this.#getDnsAlternatives(parsedUrl.hostname);
      
      altHostnames.forEach(hostname => {
        const altUrl = new URL(url);
        altUrl.hostname = hostname;
        variations.push(altUrl.toString());
      });
    } catch {
      // Silently handle DNS resolution failures
    }

    // Remove duplicates while preserving order
    return [...new Set(variations)];
  }

  /**
   * Advanced DNS alternative hostname generation
   * @private
   * @param {string} hostname - Original hostname
   * @returns {Promise<string[]>} Alternative hostnames
   */
  static async #getDnsAlternatives(hostname) {
    const alternatives = [];

    try {
      // Check CNAME records
      const cnames = await dnsResolve(hostname, 'CNAME');
      alternatives.push(...cnames);
    } catch {}

    try {
      // Additional domain variations
      const domainParts = hostname.split('.');
      if (domainParts.length > 2) {
        const subdomainVariations = [
          domainParts.slice(1).join('.'),  // Remove subdomain
          `www.${domainParts.slice(1).join('.')}`,  // Add www
        ];
        alternatives.push(...subdomainVariations);
      }
    } catch {}

    return alternatives;
  }

  /**
   * Validate URL structure and safety
   * @param {string} url - URL to validate
   * @returns {boolean} Whether URL is valid and safe
   */
  static validateUrl(url) {
    try {
      const parsedUrl = new URL(url);
      
      // Protocol restrictions
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        return false;
      }
      
      // Block certain suspicious TLDs or patterns
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq'];
      if (suspiciousTlds.some(tld => url.endsWith(tld))) {
        return false;
      }
      
      // Length restrictions
      if (url.length > 2048) return false;
      
      return true;
    } catch {
      return false;
    }
  }
}

export default AdvancedURLHandler;
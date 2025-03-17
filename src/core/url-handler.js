import { URL } from 'url';

class URLHandler {
  static normalizeUrl(url) {
    try {
      const parsedUrl = new URL(url);
      const normalizedUrl = parsedUrl.protocol + '//' + parsedUrl.hostname + parsedUrl.pathname;
      
      // Remove trailing slashes
      return normalizedUrl.replace(/\/+$/, '');
    } catch (error) {
      console.error('URL normalization failed:', error);
      return url;
    }
  }

  static generateUrlVariations(url) {
    const normalized = this.normalizeUrl(url);
    return [
      normalized,
      normalized.replace('/wiki/', ''),
      normalized.replace('en.wikipedia.org', 'wikipedia.org')
    ];
  }
}

export default URLHandler;
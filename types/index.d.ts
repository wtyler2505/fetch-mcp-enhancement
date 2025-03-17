/**
 * Advanced Fetch MCP Type Definitions
 * Comprehensive type system for robust type checking and intellisense
 */

declare module '@modelcontextprotocol/fetch-mcp' {
  /**
   * Configuration options for fetch operations
   */
  export interface FetchOptions {
    /**
     * Request timeout in milliseconds
     * @default 10000
     */
    timeout?: number;

    /**
     * Number of retry attempts for failed requests
     * @default 3
     */
    retries?: number;

    /**
     * Enable automatic markdown conversion
     * @default true
     */
    convertToMarkdown?: boolean;

    /**
     * Custom headers for the request
     */
    headers?: Record<string, string>;

    /**
     * Security and performance configuration
     */
    securityOptions?: {
      /**
       * Allowed domains for fetch operations
       */
      allowedDomains?: string[];

      /**
       * Blocked domains to prevent fetching
       */
      blockedDomains?: string[];

      /**
       * Rate limit requests per minute
       * @default 60
       */
      rateLimitPerMinute?: number;
    };
  }

  /**
   * Comprehensive fetch result structure
   */
  export interface FetchResult {
    /**
     * Unique identifier for the fetch operation
     */
    fetchId: string;

    /**
     * HTTP status code of the response
     */
    status: number;

    /**
     * Response headers
     */
    headers: Record<string, string>;

    /**
     * Fetched content, potentially converted to markdown
     */
    content: string;

    /**
     * Fetch operation duration in milliseconds
     */
    duration: number;

    /**
     * Timestamp of the fetch operation
     */
    timestamp: string;
  }

  /**
   * Enhanced Error with comprehensive context
   */
  export interface FetchError extends Error {
    /**
     * Target URL of the failed fetch
     */
    url: string;

    /**
     * Unique fetch operation identifier
     */
    fetchId: string;

    /**
     * Timestamp of the error
     */
    timestamp: string;

    /**
     * Original error object
     */
    originalError?: Error;
  }

  /**
   * Primary Fetch MCP class with comprehensive web content retrieval capabilities
   */
  export class FetchMCP {
    /**
     * Fetch content from a URL with advanced configuration
     * @param url Target URL to fetch
     * @param options Optional fetch configuration
     * @returns Promise resolving to fetch result
     */
    static fetch(url: string, options?: FetchOptions): Promise<FetchResult>;

    /**
     * Normalize and clean URLs
     * @param url URL to normalize
     * @returns Normalized URL string
     */
    static normalizeUrl(url: string): string;

    /**
     * Convert HTML content to markdown
     * @param htmlContent HTML content to convert
     * @param options Optional conversion options
     * @returns Converted markdown string
     */
    static convertToMarkdown(
      htmlContent: string, 
      options?: { 
        headingStyle?: 'atx' | 'setext', 
        codeBlockStyle?: 'fenced' | 'indented' 
      }
    ): string;

    /**
     * Generate alternative URL variations for resilient fetching
     * @param url Original URL
     * @returns Promise resolving to URL variations
     */
    static generateUrlVariations(url: string): Promise<string[]>;
  }

  export default FetchMCP;
}

import FetchMCP from '../../src/index.js';
import nock from 'nock';
import fs from 'fs';
import path from 'path';

/**
 * Comprehensive Integration Test Suite for Fetch MCP
 * Systematically validates end-to-end functionality across diverse scenarios
 */
describe('Fetch MCP - Advanced Integration Test Suite', () => {
  // Predefined test configuration parameters
  const TEST_CONFIGURATION = {
    TIMEOUT_MS: 10000,
    MAX_RETRIES: 3,
    TEST_URLS: [
      'https://httpbin.org/get',
      'https://example.com',
      'https://jsonplaceholder.typicode.com/posts/1'
    ],
    COMPLEX_HTML_SCENARIOS: [
      {
        name: 'Standard Webpage',
        url: 'https://test-site.com/article',
        expectedMarkdownStructure: ['# ', '## ', '- ']
      },
      {
        name: 'Complex Document',
        url: 'https://docs.example.org/technical-guide',
        expectedMarkdownStructure: ['# ', '## ', '### ', '`', '```']
      }
    ]
  };

  beforeEach(() => {
    // Reset nock to ensure clean mocking environment
    nock.cleanAll();
  });

  /**
   * Comprehensive Fetch Scenarios Test Block
   * Validates core fetch mechanism across multiple dimensions
   */
  describe('Core Fetch Mechanism', () => {
    test.each(TEST_CONFIGURATION.TEST_URLS)(
      'Successfully fetch content from %s with robust error handling',
      async (testUrl) => {
        // Systematic mock setup with comprehensive response simulation
        const mockResponse = {
          data: { message: 'Test Response' },
          headers: { 'content-type': 'application/json' }
        };

        nock(new URL(testUrl).origin)
          .get(new URL(testUrl).pathname)
          .times(TEST_CONFIGURATION.MAX_RETRIES)
          .reply(200, mockResponse);

        const fetchResult = await FetchMCP.fetch(testUrl);

        // Rigorous result validation
        expect(fetchResult).toMatchObject({
          status: 200,
          content: expect.any(String),
          headers: expect.any(Object),
          duration: expect.any(Number)
        });
      }
    );

    test('Handle network errors with intelligent retry mechanism', async () => {
      const testUrl = 'https://resilience-test.com';

      // Simulate intermittent network failures
      nock(testUrl)
        .get('/')
        .times(2)
        .replyWithError('Connection Timeout');

      nock(testUrl)
        .get('/')
        .reply(200, { success: true });

      const fetchResult = await FetchMCP.fetch(testUrl, {
        retries: TEST_CONFIGURATION.MAX_RETRIES
      });

      expect(fetchResult).toMatchObject({
        status: 200,
        content: expect.any(String)
      });
    });
  });

  /**
   * Advanced Markdown Conversion Test Block
   * Validates markdown conversion across complex document structures
   */
  describe('Markdown Conversion Scenario', () => {
    test.each(TEST_CONFIGURATION.COMPLEX_HTML_SCENARIOS)(
      'Convert $name to markdown with structural integrity',
      async ({ url, expectedMarkdownStructure }) => {
        const complexHtml = `
          <html>
            <head><title>Complex Document</title></head>
            <body>
              <h1>Main Title</h1>
              <h2>Section Header</h2>
              <p>Paragraph with <strong>bold</strong> text</p>
              <code>function example() {}</code>
              <pre><code class="language-javascript">
                const test = true;
              </code></pre>
            </body>
          </html>
        `;

        nock(new URL(url).origin)
          .get(new URL(url).pathname)
          .reply(200, complexHtml, {
            'Content-Type': 'text/html; charset=UTF-8'
          });

        const fetchResult = await FetchMCP.fetch(url, {
          convertToMarkdown: true
        });

        // Systematic markdown structure validation
        expectedMarkdownStructure.forEach(structure => {
          expect(fetchResult.content).toContain(structure);
        });

        // Additional granular checks
        expect(fetchResult.content).toMatch(/^# /);  // Title check
        expect(fetchResult.content).toMatch(/\*\*bold\*\*/);  // Bold formatting
        expect(fetchResult.content).toMatch(/`function example\(\) {}`/);  // Inline code
        expect(fetchResult.content).toMatch(/```javascript\nconst test = true;\n```/);  // Code block
      }
    );
  });

  /**
   * Security and Validation Test Block
   * Validates URL security, sanitization, and access control mechanisms
   */
  describe('Security and Validation', () => {
    test('Reject potentially malicious URLs', async () => {
      const maliciousUrls = [
        'http://extremely-suspicious.tk',
        'https://localhost:8080',
        'ftp://invalid-protocol.com'
      ];

      for (const url of maliciousUrls) {
        await expect(FetchMCP.fetch(url)).rejects.toThrow();
      }
    });

    test('Enforce URL length and complexity restrictions', async () => {
      const excessivelyLongUrl = `https://example.com/${'a'.repeat(3000)}`;
      
      await expect(FetchMCP.fetch(excessivelyLongUrl)).rejects.toThrow();
    });
  });

  /**
   * Performance and Reliability Test Block
   * Validates system performance under various load conditions
   */
  describe('Performance and Reliability', () => {
    test('Handle concurrent fetch requests', async () => {
      const concurrentUrls = TEST_CONFIGURATION.TEST_URLS.slice(0, 3);
      
      nock(/.+/)
        .persist()
        .get(/.*/)
        .reply(200, { success: true });

      const fetchPromises = concurrentUrls.map(url => 
        FetchMCP.fetch(url, { timeout: TEST_CONFIGURATION.TIMEOUT_MS })
      );

      const results = await Promise.all(fetchPromises);

      expect(results).toHaveLength(concurrentUrls.length);
      results.forEach(result => {
        expect(result).toMatchObject({
          status: 200,
          content: expect.any(String),
          duration: expect.any(Number)
        });
      });
    });
  });
});

import FetchMCP from '../../src/index.js';
import { performance } from 'perf_hooks';

describe('Performance Benchmarks', () => {
  const testUrls = [
    'https://httpbin.org/get',
    'https://example.com',
    'https://jsonplaceholder.typicode.com/posts/1'
  ];

  const PERFORMANCE_THRESHOLDS = {
    MAX_FETCH_TIME_MS: 2000,  // Maximum acceptable fetch time
    MAX_MEMORY_MB: 50,        // Maximum memory consumption
    MIN_SUCCESS_RATE: 0.9     // Minimum successful fetch rate
  };

  test('URL Fetch Performance', async () => {
    const results = await Promise.all(
      testUrls.map(async (url) => {
        const startTime = performance.now();
        const startMemory = process.memoryUsage().heapUsed;

        const result = await FetchMCP.fetch(url);

        const endTime = performance.now();
        const endMemory = process.memoryUsage().heapUsed;

        return {
          url,
          fetchTime: endTime - startTime,
          memoryUsed: (endMemory - startMemory) / 1024 / 1024,
          success: result.status === 200
        };
      })
    );

    const successfulFetches = results.filter(r => r.success);
    const successRate = successfulFetches.length / results.length;

    const performanceReport = {
      successRate,
      averageFetchTime: results.reduce((sum, r) => sum + r.fetchTime, 0) / results.length,
      maxFetchTime: Math.max(...results.map(r => r.fetchTime)),
      averageMemoryUsed: results.reduce((sum, r) => sum + r.memoryUsed, 0) / results.length
    };

    console.log('Performance Report:', performanceReport);

    expect(successRate).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.MIN_SUCCESS_RATE);
    results.forEach(result => {
      expect(result.fetchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_FETCH_TIME_MS);
      expect(result.memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_MEMORY_MB);
    });
  });

  test('Markdown Conversion Performance', () => {
    const largeHtmlContent = `
      <html>
        <body>
          ${Array(1000).fill('<p>Test Paragraph</p>').join('\n')}
        </body>
      </html>
    `;

    const startTime = performance.now();
    const markdown = FetchMCP.convertToMarkdown(largeHtmlContent);
    const endTime = performance.now();

    const conversionTime = endTime - startTime;
    const memoryUsed = (process.memoryUsage().heapUsed) / 1024 / 1024;

    console.log('Markdown Conversion Performance:', {
      conversionTime,
      memoryUsed,
      markdownLength: markdown.length
    });

    expect(conversionTime).toBeLessThan(100); // 100ms conversion time
    expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_MEMORY_MB);
  });
});

import FetchMCP from '../../src/index.js';
import nock from 'nock';

describe('AdvancedFetcher', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  test('successful fetch with markdown conversion', async () => {
    const mockHtml = `
      <html>
        <body>
          <h1>Test Page</h1>
          <p>This is a test paragraph.</p>
        </body>
      </html>
    `;

    nock('https://example.com')
      .get('/')
      .reply(200, mockHtml, {
        'Content-Type': 'text/html; charset=UTF-8'
      });

    const result = await FetchMCP.fetch('https://example.com');

    expect(result).toMatchObject({
      status: 200,
      contentType: expect.stringContaining('text/html'),
      content: expect.stringContaining('# Test Page')
    });
  });

  test('fetch with URL variation', async () => {
    nock('https://example.com')
      .get('/')
      .replyWithError('Connection failed');

    nock('https://www.example.com')
      .get('/')
      .reply(200, 'Success', {
        'Content-Type': 'text/plain'
      });

    const result = await FetchMCP.fetch('https://example.com');

    expect(result).toMatchObject({
      status: 200,
      content: 'Success'
    });
  });

  test('markdown conversion utility', () => {
    const htmlContent = `
      <div>
        <h2>Test Heading</h2>
        <p>Paragraph with <strong>bold</strong> text.</p>
      </div>
    `;

    const markdown = FetchMCP.convertToMarkdown(htmlContent);

    expect(markdown).toContain('## Test Heading');
    expect(markdown).toContain('**bold**');
  });
});

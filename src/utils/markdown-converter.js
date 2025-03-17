import TurndownService from 'turndown';
import cheerio from 'cheerio';

class MarkdownConverter {
  /**
   * Advanced HTML to Markdown conversion with intelligent parsing
   * @param {string} htmlContent - Raw HTML content to convert
   * @param {Object} options - Conversion options
   * @returns {string} Converted markdown content
   */
  static convert(htmlContent, options = {}) {
    const defaultOptions = {
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '_',
      strongDelimiter: '**'
    };

    const mergedOptions = { ...defaultOptions, ...options };
    const turndownService = new TurndownService(mergedOptions);

    // Enhanced parsing rules
    this.#addEnhancedRules(turndownService);

    // Pre-process HTML for better conversion
    const processedHtml = this.#preprocessHtml(htmlContent);

    try {
      return turndownService.turndown(processedHtml);
    } catch (error) {
      console.error('Markdown conversion error:', error);
      return `[Conversion Error] Unable to convert content\n\nOriginal HTML:\n\`\`\`html\n${htmlContent}\n\`\`\``;
    }
  }

  /**
   * Preprocess HTML to improve conversion quality
   * @private
   * @param {string} htmlContent - Raw HTML content
   * @returns {string} Preprocessed HTML
   */
  static #preprocessHtml(htmlContent) {
    const $ = cheerio.load(htmlContent);

    // Remove script and style tags
    $('script, style').remove();

    // Clean up class and id attributes to reduce noise
    $('[class], [id]').removeAttr('class').removeAttr('id');

    // Enhance image markdown generation
    $('img').each((i, elem) => {
      const $elem = $(elem);
      const alt = $elem.attr('alt') || 'Image';
      const src = $elem.attr('src');
      $elem.replaceWith(`![${alt}](${src})`);
    });

    return $.html();
  }

  /**
   * Add sophisticated parsing rules for enhanced markdown generation
   * @private
   * @param {TurndownService} turndownService - Turndown service instance
   */
  static #addEnhancedRules(turndownService) {
    // Custom rule: Handle code blocks more robustly
    turndownService.addRule('fencedCodeBlock', {
      filter: ['pre', 'code'],
      replacement: (content, node) => {
        const language = node.getAttribute('class')?.match(/language-(\w+)/)?.[1] || '';
        return `\`\`\`${language}\n${content.trim()}\n\`\`\``;
      }
    });

    // Rule for handling tables
    turndownService.addRule('table', {
      filter: ['table'],
      replacement: (content, node) => {
        const $ = cheerio.load(node);
        const headers = $('thead tr th').map((i, el) => $(el).text().trim()).get();
        const alignments = headers.map(() => ':---:');
        
        const headerRow = `| ${headers.join(' | ')} |`;
        const alignmentRow = `| ${alignments.join(' | ')} |`;
        
        const bodyRows = $('tbody tr').map((i, row) => {
          const cells = $(row).find('td').map((j, cell) => $(cell).text().trim()).get();
          return `| ${cells.join(' | ')} |`;
        }).get();

        return [headerRow, alignmentRow, ...bodyRows].join('\n');
      }
    });
  }
}

export default MarkdownConverter;
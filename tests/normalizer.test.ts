import { describe, it, expect } from 'vitest';
import { normalizeHtml } from '../src/normalizer.js';

describe('normalizeHtml', () => {
  describe('script removal', () => {
    it('removes script tags and content', () => {
      const html = '<div><script>alert("xss")</script>content</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
      expect(result).toContain('content');
    });

    it('removes noscript tags', () => {
      const html = '<div><noscript>JavaScript required</noscript>content</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('noscript');
      expect(result).not.toContain('JavaScript required');
    });

    it('removes inline scripts', () => {
      const html = '<div><script type="text/javascript">var x = 1;</script>test</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('var x');
    });
  });

  describe('style removal', () => {
    it('removes style tags and content', () => {
      const html = '<style>.red { color: red; }</style><div>content</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('style');
      expect(result).not.toContain('.red');
      expect(result).not.toContain('color');
    });

    it('removes stylesheet links', () => {
      const html = '<link rel="stylesheet" href="style.css"><div>content</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('stylesheet');
      expect(result).not.toContain('style.css');
    });
  });

  describe('timestamp removal', () => {
    it('removes ISO 8601 timestamps', () => {
      const html = '<div>Updated: 2024-01-15T14:30:00Z</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('2024-01-15');
      expect(result).not.toContain('14:30:00');
    });

    it('removes US date format', () => {
      const html = '<div>Date: 01/15/2024</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('01/15/2024');
    });

    it('removes time patterns', () => {
      const html = '<div>Time: 2:30 PM</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('2:30');
    });

    it('removes Unix timestamps', () => {
      const html = '<div data-ts="1705329000">content</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('1705329000');
    });

    it('removes relative time patterns', () => {
      const html = '<div>Updated: 5 minutes ago</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('minutes ago');
    });
  });

  describe('dynamic attribute removal', () => {
    it('removes Vue scoped style IDs', () => {
      const html = '<div id="data-v-abc123">content</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('data-v-abc123');
    });

    it('removes hash-suffixed IDs', () => {
      const html = '<div id="component-abc123def456">content</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('abc123def456');
    });

    it('removes Angular ng- IDs', () => {
      const html = '<div id="ng-app-123">content</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('ng-app-123');
    });
  });

  describe('whitespace normalization', () => {
    it('collapses multiple spaces', () => {
      const html = '<div>content    with    spaces</div>';
      const result = normalizeHtml(html);
      expect(result).not.toMatch(/  /);
    });

    it('removes whitespace between tags', () => {
      const html = '<div>   <span>   content   </span>   </div>';
      const result = normalizeHtml(html);
      expect(result).toContain('<div><span>');
      expect(result).toContain('</span></div>');
    });

    it('trims leading and trailing whitespace', () => {
      const html = '   <div>content</div>   ';
      const result = normalizeHtml(html);
      expect(result).not.toMatch(/^\s/);
      expect(result).not.toMatch(/\s$/);
    });
  });

  describe('tracking element removal', () => {
    it('removes CSRF tokens', () => {
      const html = '<meta name="csrf-token" content="abc123"><div>content</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('csrf-token');
    });

    it('removes hidden token inputs', () => {
      const html = '<form><input name="_token" value="secret"><button>Submit</button></form>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('_token');
    });

    it('removes data-analytics attributes', () => {
      const html = '<button data-analytics="click-btn">Click</button>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('data-analytics');
    });

    it('removes data-tracking attributes', () => {
      const html = '<div data-tracking="page-view">content</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('data-tracking');
    });
  });

  describe('HTML comment removal', () => {
    it('removes HTML comments', () => {
      const html = '<div><!-- This is a comment -->content</div>';
      const result = normalizeHtml(html);
      expect(result).not.toContain('<!--');
      expect(result).not.toContain('comment');
    });

    it('removes multiline comments', () => {
      const html = `<div>
        <!--
          Multiline
          comment
        -->
        content
      </div>`;
      const result = normalizeHtml(html);
      expect(result).not.toContain('Multiline');
    });
  });

  describe('content preservation', () => {
    it('preserves semantic content', () => {
      const html = '<article><h1>Title</h1><p>Paragraph content.</p></article>';
      const result = normalizeHtml(html);
      expect(result).toContain('Title');
      expect(result).toContain('Paragraph content');
    });

    it('preserves links', () => {
      const html = '<a href="https://example.com">Link text</a>';
      const result = normalizeHtml(html);
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('Link text');
    });

    it('preserves images', () => {
      const html = '<img src="image.jpg" alt="Description">';
      const result = normalizeHtml(html);
      expect(result).toContain('src="image.jpg"');
      expect(result).toContain('alt="Description"');
    });
  });
});

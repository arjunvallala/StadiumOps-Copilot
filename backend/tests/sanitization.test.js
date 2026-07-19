import { describe, it, expect } from 'vitest';
import { sanitizeText, validateLength } from '../src/logic/sanitization.js';

describe('Sanitization & Validation Logic', () => {
  describe('sanitizeText', () => {
    it('should strip simple HTML tags', () => {
      const input = '<script>alert("XSS")</script>Hello <p>World</p>';
      const expected = 'alert("XSS")Hello World';
      expect(sanitizeText(input)).toBe(expected);
    });

    it('should strip complex nested HTML tags and attributes', () => {
      const input = '<div class="alert" data-test="123"><span onclick="hack(\'test\')">Warning</span></div>';
      const expected = 'Warning';
      expect(sanitizeText(input)).toBe(expected);
    });

    it('should strip broken or unclosed HTML tags safely', () => {
      const input = 'Incident report <iframe src="http://evil.com"';
      expect(sanitizeText(input)).not.toContain('<iframe');
    });

    it('should trim surrounding whitespace', () => {
      const input = '   Incident at Gate A   ';
      expect(sanitizeText(input)).toBe('Incident at Gate A');
    });

    it('should handle non-string values gracefully', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText(123)).toBe('');
      expect(sanitizeText({})).toBe('');
    });
  });

  describe('validateLength', () => {
    it('should return true for string within bounds', () => {
      expect(validateLength('Short text', 50)).toBe(true);
    });

    it('should validate exact boundary length values', () => {
      const exact500 = 'A'.repeat(500);
      const exact501 = 'A'.repeat(501);
      
      expect(validateLength(exact500, 500)).toBe(true);
      expect(validateLength(exact501, 500)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validateLength('', 50)).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(validateLength(null, 50)).toBe(false);
      expect(validateLength(undefined, 50)).toBe(false);
      expect(validateLength(100, 50)).toBe(false);
    });
  });
});

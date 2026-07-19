import { describe, it, expect } from 'vitest';
import { sanitizeText, validateLength } from '../src/logic/sanitization.js';

describe('Sanitization & Validation Logic', () => {
  describe('sanitizeText', () => {
    it('should strip simple HTML tags', () => {
      const input = '<script>alert("XSS")</script>Hello <p>World</p>';
      const expected = 'alert("XSS")Hello World';
      expect(sanitizeText(input)).toBe(expected);
    });

    it('should strip complex nested HTML tags', () => {
      const input = '<div class="alert"><span onclick="hack()">Warning</span></div>';
      const expected = 'Warning';
      expect(sanitizeText(input)).toBe(expected);
    });

    it('should trim surrounding whitespace', () => {
      const input = '   Incident at Gate A   ';
      expect(sanitizeText(input)).toBe('Incident at Gate A');
    });

    it('should handle non-string values gracefully', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText(123)).toBe('');
    });
  });

  describe('validateLength', () => {
    it('should return true for string within bounds', () => {
      expect(validateLength('Short text', 50)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(validateLength('', 50)).toBe(false);
    });

    it('should return false for string exceeding maximum length', () => {
      expect(validateLength('A very long string that goes on and on', 10)).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(validateLength(null, 50)).toBe(false);
      expect(validateLength(undefined, 50)).toBe(false);
    });
  });
});

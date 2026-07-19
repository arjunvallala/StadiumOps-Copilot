/**
 * Sanitizes input text by removing HTML tags and trimming whitespace.
 * Helps prevent XSS and injection attacks.
 * @param {string} text 
 * @returns {string}
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') {
    return '';
  }
  // Simple regex to strip HTML tags
  return text.replace(/<\/?[^>]+(>|$)/g, '').trim();
}

/**
 * Validates text length against a maximum limit.
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {boolean}
 */
export function validateLength(text, maxLength) {
  if (typeof text !== 'string') {
    return false;
  }
  return text.length > 0 && text.length <= maxLength;
}

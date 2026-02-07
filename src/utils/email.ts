/**
 * Email Utility Functions
 * Provides consistent email normalization across the application
 */

/**
 * Normalize email address to lowercase and trim whitespace
 * Ensures case-insensitive email operations throughout the application
 * 
 * @param email - The email address to normalize
 * @returns Normalized email address (lowercase, trimmed)
 * 
 * @example
 * normalizeEmail('John@Example.COM  ') // returns 'john@example.com'
 */
export function normalizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Validate and normalize email address
 * 
 * @param email - The email address to validate and normalize
 * @returns Normalized email if valid, null otherwise
 */
export function validateAndNormalizeEmail(email: string): string | null {
  if (!email) return null;
  
  const normalized = normalizeEmail(email);
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(normalized) ? normalized : null;
}

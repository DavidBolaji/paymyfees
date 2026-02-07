/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per time window
 */

import { RateLimitError } from '@/src/types/errors';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limit store
 * In production, use Redis for distributed rate limiting
 */
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Get client identifier from request
 */
function getClientIdentifier(req: Request): string {
  try {
    // Try to get IP from headers
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    
    if (forwarded && typeof forwarded === 'string') {
      const firstIp = forwarded.split(',')[0];
      return firstIp ? firstIp.trim() : 'unknown';
    }
    
    if (realIp) {
      return realIp;
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error getting client identifier:', error);
    return 'unknown';
  }
}

/**
 * Safely read an environment variable with a numeric fallback
 */
function getEnvNumber(key: string, fallback: number): number {
  try {
    const value = process.env[key];
    if (value) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Rate limiter middleware
 */
export function rateLimiter(options?: {
  windowMs?: number;
  maxRequests?: number;
}): (req: Request) => Promise<void> {
  const windowMs = options?.windowMs || getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000);
  const maxRequests = options?.maxRequests || getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100);

  return async (req: Request): Promise<void> => {
    const clientId = getClientIdentifier(req);
    const now = Date.now();
    const key = `${clientId}:${Math.floor(now / windowMs)}`;

    let store = rateLimitStore.get(key);

    if (!store) {
      store = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, store);
    }

    store.count++;

    if (store.count > maxRequests) {
      const retryAfter = Math.ceil((store.resetTime - now) / 1000);
      throw new RateLimitError(retryAfter);
    }
  };
}

/**
 * Strict rate limiter for sensitive endpoints
 */
export const strictRateLimiter = rateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 5,
});

/**
 * Standard rate limiter for general endpoints
 */
export const standardRateLimiter = rateLimiter({
  windowMs: 900000, // 15 minutes
  maxRequests: 100,
});

/**
 * Lenient rate limiter for public endpoints
 */
export const lenientRateLimiter = rateLimiter({
  windowMs: 900000, // 15 minutes
  maxRequests: 200,
});

/**
 * Token Refresh API Route
 * POST /api/auth/refresh
 */

import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const authController = new AuthController();

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply rate limiting
  await lenientRateLimiter(req);

  // Delegate to controller
  return await authController.refreshToken(req);
});

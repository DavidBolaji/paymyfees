/**
 * User Login API Route
 * POST /api/auth/login
 */

import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { strictRateLimiter } from '@/src/middleware/rateLimiter';

const authController = new AuthController();

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply strict rate limiting for login attempts
  await strictRateLimiter(req);

  // Delegate to controller
  return await authController.login(req);
});

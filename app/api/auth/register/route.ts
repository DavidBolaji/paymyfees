/**
 * User Registration API Route
 * POST /api/auth/register
 */

import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const authController = new AuthController();

/**
 * POST /api/auth/register
 * Register a new user account
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply rate limiting
  await lenientRateLimiter(req);

  // Delegate to controller
  return await authController.register(req);
});

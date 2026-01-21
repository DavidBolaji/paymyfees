/**
 * Password Reset Request API Route
 * POST /api/auth/reset-password
 */

import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { strictRateLimiter } from '@/src/middleware/rateLimiter';

const authController = new AuthController();

/**
 * POST /api/auth/reset-password
 * Request a password reset link
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply strict rate limiting for password reset requests
  await strictRateLimiter(req);

  // Delegate to controller
  return await authController.requestPasswordReset(req);
});
/**
 * Password Reset Confirmation API Route
 * POST /api/auth/reset-password/confirm
 */

import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { strictRateLimiter } from '@/src/middleware/rateLimiter';

const authController = new AuthController();

/**
 * POST /api/auth/reset-password/confirm
 * Confirm password reset with token and set new password
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply strict rate limiting for password reset confirmation
  await strictRateLimiter(req);

  // Delegate to controller
  return await authController.confirmPasswordReset(req);
});
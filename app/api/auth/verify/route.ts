/**
 * Email Verification API Route
 * POST /api/auth/verify
 */

import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const authController = new AuthController();

/**
 * POST /api/auth/verify
 * Verify user email with token or OTP
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply rate limiting
  await lenientRateLimiter(req);

  // Delegate to controller
  return await authController.verifyEmail(req);
});
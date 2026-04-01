/**
 * Email Verification API Route
 * POST /api/auth/verify
 */

import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
// import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const authController = new AuthController();

/**
 * POST /api/auth/verify
 * Verify user email with token or OTP
 */
export const POST = asyncHandler(async (req: Request) => {
  // await lenientRateLimiter(req);
  console.log('Received email verification request');
  return await authController.verifyEmail(req);
});

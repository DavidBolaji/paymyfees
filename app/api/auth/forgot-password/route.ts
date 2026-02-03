/**
 * Forgot Password API Route
 * POST /api/auth/forgot-password
 */

import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { strictRateLimiter } from '@/src/middleware/rateLimiter';

const authController = new AuthController();

export const POST = asyncHandler(async (req: Request) => {
  console.log("hello")
  // Apply strict rate limiting for login attempts
  await strictRateLimiter(req);

  // Delegate to controller
  return await authController.requestPasswordReset(req);
});
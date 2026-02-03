/**
 * Reset Password API Route
 * POST /api/auth/reset-password
 */
import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { strictRateLimiter } from '@/src/middleware/rateLimiter';

const authController = new AuthController();


export const POST = asyncHandler(async (req: Request) => {
  // Apply strict rate limiting for login attempts
  await strictRateLimiter(req);

  // Delegate to controller
  return await authController.resetPasswordConfirm(req);
});
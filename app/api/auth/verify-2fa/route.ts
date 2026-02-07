/**
 * 2FA Verification API Route
 * POST /api/auth/verify-2fa - Verify 2FA code during login
 */

import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const authController = new AuthController();

/**
 * POST /api/auth/verify-2fa
 * Verify 2FA code and complete login
 */
export const POST = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);
  return await authController.verify2FALogin(req);
});

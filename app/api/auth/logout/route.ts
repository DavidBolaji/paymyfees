/**
 * User Logout API Route
 * POST /api/auth/logout
 */

import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { requireAuth } from '@/src/middleware/auth';

const authController = new AuthController();

/**
 * POST /api/auth/logout
 * Logout user (client-side token invalidation)
 */
export const POST = asyncHandler(async (req: Request) => {
  // Verify authentication
  await requireAuth(req);

  // Delegate to controller
  return await authController.logout(req);
});

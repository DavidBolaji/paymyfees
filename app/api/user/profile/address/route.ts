/**
 * User Profile Address API Routes
 * PUT /api/user/profile/address - Update address information
 */

import { UserController } from "@/src/controllers/UserController";
import { authMiddleware } from "@/src/middleware/authMiddleware";
import { asyncHandler } from "@/src/middleware/errorHandler";
import { lenientRateLimiter } from "@/src/middleware/rateLimiter";

const userController = new UserController();

/**
 * PUT /api/user/profile/address
 * Update address information
 */
export const PUT = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);

  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  return await userController.updateProfileAddress(req, authResult.userId!);
});

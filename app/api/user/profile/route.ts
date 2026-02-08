/**
 * User Profile API Routes
 * GET /api/user/profile
 * PUT /api/user/profile
 */

import { UserController } from '@/src/controllers/UserController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';


const userController = new UserController();

/**
 * GET /api/user/profile
 * Get the current user's profile
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for profile access
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delegate to controller
  const response = await userController.getProfile(req, authResult.userId!);
  
  // Add cache control headers to prevent stale data
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
});

/**
 * PUT /api/user/profile
 * Update the current user's profile
 */
export const PUT = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for profile updates
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delegate to controller
  return await userController.updateProfile(req, authResult.userId!);
});
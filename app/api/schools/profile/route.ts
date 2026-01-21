/**
 * School Profile API Route
 * GET /api/schools/profile
 */

import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolController = new SchoolController();

/**
 * GET /api/schools/profile
 * Get school profile
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
  return await schoolController.getSchoolProfile(req, authResult.userId!);
});
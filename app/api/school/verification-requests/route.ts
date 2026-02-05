/**
 * School Verification Requests API Route
 * GET /api/school/verification-requests
 */

import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolController = new SchoolController();

/**
 * GET /api/school/verification-requests
 * Get verification requests for a school
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for verification requests
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delegate to controller
  return await schoolController.getVerificationRequests(req, authResult.userId!, undefined as any);
});
/**
 * School Verification Status API Route
 * GET /api/school-verification/status
 */

import { SchoolVerificationController } from '@/src/controllers/SchoolVerificationController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolVerificationController = new SchoolVerificationController();

/**
 * GET /api/school-verification/status
 * Get status of school verification for the current user
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for verification status
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delegate to controller
  return await schoolVerificationController.getVerificationStatus(req, authResult.userId!);
});
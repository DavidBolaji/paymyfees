/**
 * School Verification API Route
 * POST /api/school-verification
 */

import { SchoolVerificationController } from '@/src/controllers/SchoolVerificationController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolVerificationController = new SchoolVerificationController();

/**
 * POST /api/school-verification
 * Submit a school verification request
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for verification requests
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delegate to controller
  return await schoolVerificationController.submitVerificationRequest(req, authResult.userId!);
});
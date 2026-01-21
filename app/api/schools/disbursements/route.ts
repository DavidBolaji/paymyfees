/**
 * School Disbursements API Route
 * GET /api/schools/disbursements
 */

import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolController = new SchoolController();

/**
 * GET /api/schools/disbursements
 * Get disbursements for a school
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for disbursements
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delegate to controller
  return await schoolController.getDisbursements(req, authResult.userId!);
});
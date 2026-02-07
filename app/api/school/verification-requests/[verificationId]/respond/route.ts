/**
 * Respond to Verification Request API Route
 * POST /api/school/verification-requests/:verificationId/respond
 */

import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolController = new SchoolController();

/**
 * POST /api/school/verification-requests/:verificationId/respond
 * Respond to a verification request
 */
export const POST = asyncHandler(async (req: Request, context?: { params: Promise<{ verificationId: string }> }) => {
  // Apply lenient rate limiting for verification responses
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { verificationId } = await context!.params;

  // Delegate to controller
  return await schoolController.respondToVerificationRequest(req, authResult.userId!, { verificationId });
});
/**
 * Timeline API Route
 * GET /api/timeline?loanId=xxx OR GET /api/timeline (gets active loan)
 */

import { TimelineController } from '@/src/controllers/TimelineController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const timelineController = new TimelineController();

/**
 * GET /api/timeline
 * Get timeline data for user's active loan or specific loan
 * Query params: loanId (optional) - if not provided, gets the most recent active loan
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Get loanId from query params (optional)
  const { searchParams } = new URL(req.url);
  const loanId = searchParams.get('loanId') || undefined;

  // Delegate to controller
  return await timelineController.getTimeline(
    req,
    {
      id: authResult.userId!,
      email: '',
      role: authResult.role as UserRole
    },
    loanId
  );
});
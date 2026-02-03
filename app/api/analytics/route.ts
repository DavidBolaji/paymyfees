/**
 * Analytics API Route
 * GET /api/analytics
 */

import { AnalyticsController } from '@/src/controllers/AnalyticsController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const analyticsController = new AnalyticsController();

/**
 * GET /api/analytics
 * Get analytics data for the current user
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for analytics
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Delegate to controller
  return await analyticsController.getUserAnalytics(req, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole,
  });
});
/**
 * Dashboard Analytics API Route
 * GET /api/dashboard/analytics
 */

import { NextResponse } from 'next/server';
import { DashboardController } from '@/src/controllers/DashboardController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';


const dashboardController = new DashboardController();

/**
 * GET /api/dashboard/analytics
 * Get analytics data for the dashboard
 */
export const GET = asyncHandler(async (req: Request): Promise<NextResponse<unknown>> => {
  // Apply lenient rate limiting for analytics data
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response || NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }

  // Delegate to controller
  const response = await dashboardController.getAnalytics(req, authResult.userId);
  return response;
});
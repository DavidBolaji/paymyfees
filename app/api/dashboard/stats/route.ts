/**
 * Dashboard Stats API Route
 * GET /api/dashboard/stats
 */

import { NextResponse } from 'next/server';
import { DashboardController } from '@/src/controllers/DashboardController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';


const dashboardController = new DashboardController();

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for the current user
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for dashboard stats
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
  return await dashboardController.getStats(req, authResult.userId);
});
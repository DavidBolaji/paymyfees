/**
 * Admin Disbursement Processing API Route
 * POST /api/admin/disbursements/process
 */

import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { adminAuthMiddleware, authMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const adminController = new AdminController();

/**
 * POST /api/admin/disbursements/process
 * Process loan disbursements
 */
export const POST = asyncHandler(async (req: Request, context?: unknown): Promise<NextResponse> => {
  // Apply lenient rate limiting for admin operations
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
  }

  // Verify admin privileges
  const adminResult = await adminAuthMiddleware(req);
  if (!adminResult.success) {
    return adminResult.response || NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
  }

  // Delegate to controller
  return await adminController.processDisbursement(req);
});
/**
 * Admin Loans API Route
 * GET /api/admin/loans
 */

import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { adminAuthMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const adminController = new AdminController();

export const GET = asyncHandler(async (req: Request): Promise<NextResponse> => {
  await lenientRateLimiter(req);

  const authResult = await adminAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
  }

  return await adminController.getLoans(req);
});

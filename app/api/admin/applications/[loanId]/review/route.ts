/**
 * Admin Application Review API Route
 * POST /api/admin/applications/:loanId/review
 */

import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';

const adminController = new AdminController();

/**
 * POST /api/admin/applications/:loanId/review
 * Review a loan application
 */
export const POST = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ loanId: string }> }
): Promise<any> => {
  await lenientRateLimiter(req);

  const params = await context?.params;

  if (!params || !params.loanId) {
    return NextResponse.json({ success: false, error: 'Loan ID is required' }, { status: 400 });
  }

  const { loanId } = params;

  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
  }

  const adminResult = await adminMiddleware(req, authResult.userId);
  if (!adminResult.success) {
    return adminResult.response || NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
  }

  return await adminController.updateLoanStatus(req, loanId, authResult.userId!);
});
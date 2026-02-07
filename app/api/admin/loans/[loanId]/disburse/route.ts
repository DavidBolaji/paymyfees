/**
 * Admin Disburse Loan API Route
 * POST /api/admin/loans/:loanId/disburse
 */

import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { adminAuthMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const adminController = new AdminController();

export const POST = asyncHandler(async (req: Request, context?: { params: Promise<{ loanId: string }> }): Promise<NextResponse> => {
  await lenientRateLimiter(req);

  const authResult = await adminAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
  }

  const { loanId } = await context!.params;
  return await adminController.disburseLoan(req, loanId, authResult.userId!);
});

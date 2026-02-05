/**
 * Admin Disburse Loan API Route
 * POST /api/admin/loans/:loanId/disburse
 */

import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { adminAuthMiddleware } from '@/src/middleware/authMiddleware';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const adminController = new AdminController();

export async function POST(req: Request, { params }: { params: Promise<{ loanId: string }> }): Promise<NextResponse> {
  try {
    await lenientRateLimiter(req);

    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
    }

    const { loanId } = await params;
    return await adminController.disburseLoan(req, loanId, authResult.userId!);
  } catch (error) {
    console.error('Error in POST /api/admin/loans/:loanId/disburse:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

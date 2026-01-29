/**
 * Admin Application Review API Route
 * POST /api/admin/applications/:loanId/review
 */

import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';

const adminController = new AdminController();

/**
 * POST /api/admin/applications/:loanId/review
 * Review a loan application
 */
export async function POST(req: Request, context: { params: { loanId: string } }): Promise<NextResponse> {
  // Apply lenient rate limiting for admin operations
  await lenientRateLimiter(req);

  // Ensure context and params exist
  if (!context || !context.params || !context.params.loanId) {
    return NextResponse.json({ success: false, error: 'Loan ID is required' }, { status: 400 });
  }

  const { loanId } = context.params;

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
  }

  // Verify admin privileges
  const adminResult = await adminMiddleware(req, authResult.userId);
  if (!adminResult.success) {
    return adminResult.response || NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
  }

  // Delegate to controller
  return await adminController.reviewLoanApplication(req, loanId);
};
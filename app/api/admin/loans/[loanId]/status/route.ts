
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { errorHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { NextResponse } from 'next/server';

const controller = new AdminController();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ loanId: string }> }
) {
  try {
    // Apply lenient rate limiting
    await lenientRateLimiter(req);

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

    const { loanId } = await params;
    return await controller.updateLoanStatus(req, loanId, authResult.userId as any);
  } catch (error) {
    return errorHandler(error);
  }
}

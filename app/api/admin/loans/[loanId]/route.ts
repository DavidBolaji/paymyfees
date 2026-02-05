import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const controller = new AdminController();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ loanId: string }> }
): Promise<NextResponse> {
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
  return await controller.getLoanDetails(req, loanId);
}

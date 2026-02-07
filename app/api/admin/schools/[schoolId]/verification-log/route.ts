/**
 * POST /api/admin/schools/:schoolId/verification-log
 * Add a verification log entry for a school
 */
import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { adminAuthMiddleware, authMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const controller = new AdminController();

export const POST = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ schoolId: string }> }
): Promise<NextResponse> => {
  await lenientRateLimiter(req);
  
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
  }

  const adminResult = await adminAuthMiddleware(req);
    if (!adminResult.success) {
      return adminResult.response || NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
    }
  
  const { schoolId } = await context!.params;
  return await controller.addVerificationLog(req, schoolId, authResult.userId as any);
});

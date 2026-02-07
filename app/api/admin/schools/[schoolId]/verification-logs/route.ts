
import { container } from '@/src/di/container';
import { AdminController } from '@/src/controllers/AdminController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { NextResponse } from 'next/server';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';


const controller = container.resolve<AdminController>('AdminController');

/**
 * GET /api/admin/schools/:schoolId/verification-logs
 * Get verification logs for a school
 */
export const GET = asyncHandler(async (req:Request, context: any) => {
  await lenientRateLimiter(req);
  
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
  }
  
  const { schoolId } = await context!.params;
  return await controller.getVerificationLogs(req, schoolId);
});

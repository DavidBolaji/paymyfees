import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const controller = new AdminController();

/**
 * PATCH /api/admin/support/:ticketId/status
 * Update support ticket status
 */
export const PATCH = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ ticketId: string }> }
): Promise<NextResponse> => {
  await lenientRateLimiter(req);

  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
  }

  const adminResult = await adminMiddleware(req, authResult.userId);
  if (!adminResult.success) {
    return adminResult.response || NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
  }

  const { ticketId } = await context!.params;
  return await controller.updateTicketStatus(req, ticketId, authResult.userId!);
});

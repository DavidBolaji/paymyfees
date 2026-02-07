import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const controller = new AdminController();

/**
 * POST /api/admin/support/:ticketId/respond
 * Respond to a support ticket
 */
export const POST = asyncHandler(async (
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
  return await controller.respondToTicket(req, ticketId, authResult.userId!);
});

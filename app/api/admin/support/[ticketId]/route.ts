import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const controller = new AdminController();

/**
 * GET /api/admin/support/:ticketId
 * Get support ticket details
 */
export const GET = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ ticketId: string }> }
): Promise<NextResponse> => {
  await lenientRateLimiter(req);
  const user = await authMiddleware(req);
  await adminMiddleware(user as any);
  const { ticketId } = await context!.params;
  return await controller.getTicketDetails(req, ticketId);
});

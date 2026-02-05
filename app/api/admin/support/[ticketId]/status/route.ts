import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const controller = new AdminController();

/**
 * PATCH /api/admin/support/:ticketId/status
 * Update support ticket status
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
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

  const { ticketId } = await params;
  return await controller.updateTicketStatus(req, ticketId, authResult.userId!);
}

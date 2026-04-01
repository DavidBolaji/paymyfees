import { SupportController } from '@/src/controllers/SupportController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const supportController = new SupportController();

/**
 * GET /api/support/tickets/[ticketId]
 * Get a single support ticket (with messages) for the authenticated user
 */
export const GET = asyncHandler(async (req: Request, context?: { params: Promise<{ ticketId: string }> }) => {
  await lenientRateLimiter(req);

  const authResult = await authMiddleware(req);
  if (!authResult.success) return authResult.response;

  const { ticketId } = await context!.params;
  return await supportController.getTicketById(req, authResult.userId!, ticketId);
});

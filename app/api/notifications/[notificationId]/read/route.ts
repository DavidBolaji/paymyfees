/**
 * Mark Notification as Read API Route
 * PUT /api/notifications/:notificationId/read
 */

import { NotificationController } from '@/src/controllers/NotificationController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';


const notificationController = new NotificationController();

/**
 * PUT /api/notifications/:notificationId/read
 * Mark a specific notification as read
 */
export const PUT = asyncHandler(async (req: Request, { params }: { params: Promise<{ notificationId: string }> }) => {
  // Apply lenient rate limiting for notification updates
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { notificationId } = await params;

  // Delegate to controller
  return await notificationController.markNotificationAsRead(req, notificationId, authResult.userId);
});
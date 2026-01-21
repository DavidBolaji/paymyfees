/**
 * Mark All Notifications as Read API Route
 * PUT /api/notifications/read-all
 */

import { NotificationController } from '@/src/controllers/NotificationController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';


const notificationController = new NotificationController();

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the current user
 */
export const PUT = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for notification updates
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delegate to controller
  return await notificationController.markAllNotificationsAsRead(req, authResult.userId);
});
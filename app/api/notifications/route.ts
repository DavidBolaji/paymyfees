/**
 * Notifications API Route
 * GET /api/notifications
 */

import { NotificationController } from '@/src/controllers/NotificationController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const notificationController = new NotificationController();

/**
 * GET /api/notifications
 * Get notifications for the current user
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for notifications
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delegate to controller
  return await notificationController.getNotifications(req, authResult.userId);
});
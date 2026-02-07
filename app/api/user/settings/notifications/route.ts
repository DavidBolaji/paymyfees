import { UserController } from '@/src/controllers/UserController';
import { requireAuth } from '@/src/middleware/auth';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const controller = new UserController();

/**
 * Get notification settings
 * GET /api/user/settings/notifications
 */
export const GET = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);
  const user = await requireAuth(req);
  return await controller.getNotificationSettings(req, user.id);
});

/**
 * Update notification settings
 * PUT /api/user/settings/notifications
 */
export const PUT = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);
  const user = await requireAuth(req);
  return await controller.updateNotificationSettings(req, user.id);
});

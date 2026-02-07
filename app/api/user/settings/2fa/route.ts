
import { UserController } from '@/src/controllers/UserController';
import { requireAuth } from '@/src/middleware/auth';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const controller = new UserController();

/**
 * Handle 2FA settings
 * POST /api/user/settings/2fa
 */
export const POST = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);
  const user = await requireAuth(req);
  return await controller.handle2FA(req, user.id);
});

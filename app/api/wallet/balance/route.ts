/**
 * Wallet Balance API Route
 * GET /api/wallet/balance
 */

import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { parentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const walletController = new WalletController();

/**
 * GET /api/wallet/balance
 * Get wallet balance for the current user
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for wallet balance
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await parentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Delegate to controller
  return await walletController.getBalance(req, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
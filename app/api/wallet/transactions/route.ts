/**
 * Wallet Transactions API Route
 * GET /api/wallet/transactions
 */

import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const walletController = new WalletController();

/**
 * GET /api/wallet/transactions
 * Get wallet transactions for the current user
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for wallet transactions
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Delegate to controller
  return await walletController.getWalletTransactions(req, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
/**
 * Wallet Balance API Route
 * GET /api/wallet/balance
 */


import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import {studentAuthMiddleware } from '@/src/middleware/authMiddleware';
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
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Get wallet balance from controller with all required data
  // The controller now fetches real data from the database
  return await walletController.getBalance(req, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
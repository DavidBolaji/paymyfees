/**
 * Wallet Chart API Route
 * GET /api/wallet/chart
 */

import { NextResponse } from 'next/server';
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const walletController = new WalletController();

/**
 * GET /api/wallet/chart
 * Get wallet chart data for the current user
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for wallet chart data
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Delegate to controller
  return await walletController.getWalletChartData(req, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
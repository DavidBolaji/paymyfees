/**
 * Wallet Funding API Route
 * POST /api/wallet/fund
 */

import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const walletController = new WalletController();

/**
 * POST /api/wallet/fund
 * Initiate wallet funding
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for wallet funding
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Delegate to controller
  return await walletController.initializePayment(req, { id: authResult.userId!, email: '', role: 'PARENT' as any });
});

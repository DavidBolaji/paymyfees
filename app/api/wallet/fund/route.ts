/**
 * Wallet Funding Route
 * POST /api/wallet/fund
 *
 * With Embedly, wallet funding is via bank transfer to the user's dedicated
 * virtual account number. There is no checkout URL to redirect to.
 * This endpoint returns the user's virtual account details for display.
 */

import { NextResponse } from 'next/server';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { WalletService } from '@/src/services/WalletService';

const walletService = new WalletService();

/**
 * GET /api/wallet/fund
 * Returns virtual account details for bank transfer funding
 */
export const GET = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);

  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const walletDetails = await walletService.getWalletDetails(authResult.userId!);

  return NextResponse.json({
    success: true,
    data: {
      fundingMethod: 'BANK_TRANSFER',
      virtualAccountNumber: walletDetails.virtualAccountNumber,
      virtualAccountBank: walletDetails.virtualAccountBank,
      accountName: 'PayMyFees',
      instructions: walletDetails.virtualAccountNumber
        ? `Transfer any amount to account ${walletDetails.virtualAccountNumber} at ${walletDetails.virtualAccountBank}. Your wallet will be credited automatically within seconds.`
        : 'Virtual account setup is pending. Please contact support.',
    },
    metadata: { timestamp: new Date().toISOString() },
  });
});

/**
 * POST /api/wallet/fund — kept for backward compat, redirects to GET response
 */
export const POST = GET;


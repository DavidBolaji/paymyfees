/**
 * Wallet Payment Verification API Route
 * GET /api/wallet/verify/:reference
 */

import { NextResponse } from 'next/server';
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { parentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const walletController = new WalletController();

/**
 * GET /api/wallet/verify/:reference
 * Verify a payment reference
 */
export const GET = asyncHandler(async (req: Request, context?: { params: { reference: string } }) => {
  // Apply lenient rate limiting for payment verification
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await parentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Ensure context and params exist
  if (!context || !context.params || !context.params.reference) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing reference parameter',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }

  // Delegate to controller
  return await walletController.verifyPayment(req, context.params.reference, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
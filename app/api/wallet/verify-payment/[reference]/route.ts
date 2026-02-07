/**
 * Verify Payment API Route
 * GET /api/wallet/verify-payment/[reference]
 */
import { NextResponse } from 'next/server';
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const walletController = new WalletController();

export const GET = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ reference: string }> }
): Promise<NextResponse> => {
  await lenientRateLimiter(req);

  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const params = await context!.params;
  const reference = params.reference;

  return await walletController.verifyPayment(req, reference, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
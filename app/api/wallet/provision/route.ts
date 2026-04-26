/**
 * Wallet Provision API Route
 * POST /api/wallet/provision
 *
 * Re-triggers Embedly customer + virtual account creation for the authenticated user.
 * Idempotent: safe to call multiple times — only creates what is missing.
 * Useful when registration-time provisioning failed silently.
 */

import { NextResponse } from 'next/server';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { AuthService } from '@/src/services/AuthService';
import { prisma } from '@/src/database/prisma';

const authService = new AuthService();

export const POST = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);

  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const userId = authResult.userId!;

  // Fetch minimal user data needed for Embedly provisioning
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, phone: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Not found', message: 'User not found' },
      { status: 404 }
    );
  }

  // Run provisioning — this is idempotent (skips steps already done)
  await authService.provisionEmbedly({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
  });

  // Return updated wallet details
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { balance: true, currency: true, virtualAccountNumber: true, virtualAccountBank: true } as any,
  });

  return NextResponse.json({
    success: true,
    message: 'Wallet provisioning complete',
    data: {
      balance: Number((wallet as any)?.balance ?? 0),
      currency: (wallet as any)?.currency ?? 'NGN',
      virtualAccountNumber: (wallet as any)?.virtualAccountNumber ?? null,
      virtualAccountBank: (wallet as any)?.virtualAccountBank ?? null,
    },
    metadata: { timestamp: new Date().toISOString() },
  });
});

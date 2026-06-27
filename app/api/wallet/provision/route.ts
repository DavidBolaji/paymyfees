/**
 * Wallet Provision API Route
 * POST /api/wallet/provision
 *
 * Re-triggers Embedly customer + virtual account creation for the authenticated user.
 * Idempotent: safe to call multiple times — only creates what is missing.
 * Never returns 5xx — provisioning failures are logged server-side and the caller
 * receives the current wallet state (virtualAccountNumber may still be null if
 * Embedly is temporarily unreachable).
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
    select: { id: true, email: true, fullName: true, firstName: true, lastName: true, middleName: true, phone: true, dob: true, address: true, city: true } as any,
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Not found', message: 'User not found' },
      { status: 404 }
    );
  }

  const fullName: string = (user as any).fullName as string;
  const nameParts = fullName.trim().split(/\s+/);

  // Run provisioning — fully idempotent and graceful.
  await authService.provisionEmbedly({
    id: (user as any).id,
    email: (user as any).email,
    firstName: (user as any).firstName || nameParts[0] || 'User',
    lastName: (user as any).lastName || nameParts.slice(1).join(' ') || nameParts[0] || 'User',
    middleName: (user as any).middleName ?? undefined,
    phone: (user as any).phone,
    dob: (user as any).dob ? new Date((user as any).dob).toISOString().split('T')[0] : undefined,
    address: (user as any).address ?? undefined,
    city: (user as any).city ?? undefined,
  }).catch((err) => {
    // Belt-and-suspenders: catch any unexpected error so the route always returns 200
    console.error({ msg: 'provisionEmbedly unexpected error in provision route', userId, error: String(err) });
  });

  // Return the latest wallet state regardless of provisioning outcome
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: {
      balance: true,
      currency: true,
      virtualAccountNumber: true,
      virtualAccountBank: true,
      embedlyWalletId: true,
    } as any,
  });

  const virtualAccountNumber = (wallet as any)?.virtualAccountNumber ?? null;

  return NextResponse.json({
    success: true,
    message: virtualAccountNumber
      ? 'Wallet provisioning complete'
      : 'Wallet created — virtual account setup is still pending',
    data: {
      balance: Number((wallet as any)?.balance ?? 0),
      currency: (wallet as any)?.currency ?? 'NGN',
      virtualAccountNumber,
      virtualAccountBank: (wallet as any)?.virtualAccountBank ?? null,
      provisioned: !!virtualAccountNumber,
    },
    metadata: { timestamp: new Date().toISOString() },
  });
});

/**
 * Payment Receipt API Route
 * GET /api/payments/:paymentId/receipt
 */

import { NextResponse } from 'next/server';
import { PaymentController } from '@/src/controllers/PaymentController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { parentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const paymentController = new PaymentController();

/**
 * GET /api/payments/:paymentId/receipt
 * Get receipt for a payment
 */
export const GET = asyncHandler(async (req: Request, context?: { params: Promise<{ paymentId: string }> }) => {
  // Apply lenient rate limiting for receipt generation
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await parentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Ensure context and params exist
  if (!context || !context.params) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing payment ID parameter',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }

  // Await params (Next.js 15 requirement)
  const params = await context.params;

  if (!params.paymentId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing payment ID parameter',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }

  // Delegate to controller
  return await paymentController.getReceipt(req, params.paymentId, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
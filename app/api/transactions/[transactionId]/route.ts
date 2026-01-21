/**
 * Transaction Details API Route
 * GET /api/transactions/:transactionId
 */

import { NextResponse } from 'next/server';
import { TransactionController } from '@/src/controllers/TransactionController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { parentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const transactionController = new TransactionController();

/**
 * GET /api/transactions/:transactionId
 * Get transaction details by ID
 */
export const GET = asyncHandler(async (req: Request, context?: { params: { transactionId: string } }) => {
  // Apply lenient rate limiting for transaction details
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await parentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Ensure context and params exist
  if (!context || !context.params || !context.params.transactionId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing transaction ID parameter',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }

  // Delegate to controller
  return await transactionController.getTransactionById(req, context.params.transactionId, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
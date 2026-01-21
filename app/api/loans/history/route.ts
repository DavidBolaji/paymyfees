/**
 * Loan History API Route
 * GET /api/loans/history
 */

import { NextResponse } from 'next/server';
import { LoanController } from '@/src/controllers/LoanController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { parentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const loanController = new LoanController();

/**
 * GET /api/loans/history
 * Get loan history for the current user
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for loan history
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await parentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Delegate to controller
  return await loanController.getLoanHistory(req, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
/**
 * Loan Application API Route
 * POST /api/loans/apply
 */

import { NextResponse } from 'next/server';
import { LoanController } from '@/src/controllers/LoanController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { standardRateLimiter } from '@/src/middleware/rateLimiter';
import { parentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const loanController = new LoanController();

/**
 * POST /api/loans/apply
 * Apply for a new loan
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply standard rate limiting for loan applications
  await standardRateLimiter(req);

  // Authenticate user
  const authResult = await parentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Delegate to controller
  return await loanController.applyForLoan(req, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
/**
 * Loan Details API Route
 * GET /api/loans/[loanId]/details
 */

import { NextResponse } from 'next/server';
import { LoanController } from '@/src/controllers/LoanController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import {  studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const loanController = new LoanController();

/**
 * GET /api/loans/[loanId]/details
 * Get detailed loan information including installments, documents, and disbursement
 */
export const GET = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ loanId: string }> | { loanId: string } }
) => {
  // Apply lenient rate limiting
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Ensure context and params exist
  if (!context || !context.params) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing loan ID parameter',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }

  // Handle both Promise and direct params
  const params = context.params instanceof Promise ? await context.params : context.params;

  if (!params.loanId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing loan ID parameter',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }

  // Delegate to controller
  return await loanController.getDetailedLoanById(req, params.loanId, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole,
  });
});
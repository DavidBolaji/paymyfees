/**
 * Create this file at: app/api/loans/[loanId]/payment-plan/route.ts
 * 
 * Payment Plan API Route (Dynamic)
 * GET /api/loans/:loanId/payment-plan - Get specific loan payment plan
 */

import { NextResponse } from 'next/server';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import {  studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { LoanController } from '@/src/controllers/LoanController';
import { UserRole } from '@prisma/client';

const loanController = new LoanController();

/**
 * GET /api/loans/:loanId/payment-plan
 * Get payment plan for specific loan
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
  return await loanController.getPaymentPlanById(req, params.loanId, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole,
  });
});
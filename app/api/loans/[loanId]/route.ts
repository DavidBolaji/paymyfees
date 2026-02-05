/**
 * Loan Details API Route
 * GET /api/loans/:loanId
 */

import { NextResponse } from 'next/server';
import { LoanController } from '../../../../src/controllers/LoanController';
import { asyncHandler } from '../../../../src/middleware/errorHandler';
import { lenientRateLimiter } from '../../../../src/middleware/rateLimiter';
import { parentAuthMiddleware } from '../../../../src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const loanController = new LoanController();

/**
 * GET /api/loans/:loanId
 * Get loan details by ID
 */
export const GET = asyncHandler(async (req: Request, context?: { params: Promise<{ loanId: string }> }) => {
  // Apply lenient rate limiting for loan details
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
        error: 'Missing loan ID parameter',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }

  // Await params (Next.js 15 requirement)
  const params = await context.params;

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
  return await loanController.getLoanById(req, params.loanId, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
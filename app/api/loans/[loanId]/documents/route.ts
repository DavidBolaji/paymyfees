/**
 * Loan Documents API Route
 * POST /api/loans/:loanId/documents
 */

import { NextResponse } from 'next/server';
import { LoanController } from '@/src/controllers/LoanController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { standardRateLimiter } from '@/src/middleware/rateLimiter';
import { parentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const loanController = new LoanController();

/**
 * POST /api/loans/:loanId/documents
 * Upload documents for a loan
 */
export const POST = asyncHandler(async (req: Request, context?: { params: Promise<{ loanId: string }> }) => {
  // Apply standard rate limiting for document uploads
  await standardRateLimiter(req);

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
  return await loanController.uploadDocuments(req, params.loanId, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
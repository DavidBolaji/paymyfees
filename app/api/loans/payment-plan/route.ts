/**
 * Create this file at: app/api/loans/payment-plan/route.ts
 * 
 * Payment Plan API Route
 * GET /api/loans/payment-plan - Get active loan payment plan
 */

import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import {  studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { LoanController } from '@/src/controllers/LoanController';
import { UserRole } from '@prisma/client';


const loanController = new LoanController();

/**
 * GET /api/loans/payment-plan
 * Get payment plan for user's active loan
 */

export const GET = asyncHandler(async (
  req: Request,
) => {
  // Apply lenient rate limiting
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Delegate to controller
  return await loanController.getActivePaymentPlan(req,  {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole,
  });
});


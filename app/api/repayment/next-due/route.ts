/**
 * Get Next Due Installment API Route (FIXED)
 * GET /api/repayment/next-due
 */
import { RepaymentController } from '@/src/controllers/RepaymentController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const repaymentController = new RepaymentController();

export const GET = asyncHandler(async (req: Request) => {
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  return await repaymentController.getNextDueInstallment(req, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole,
  });
});
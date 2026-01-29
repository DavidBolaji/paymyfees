/**
 * Make Repayment API Route
 * POST /api/repayment/pay
 */
import { RepaymentController } from '@/src/controllers/RepaymentController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const repaymentController = new RepaymentController();

export const POST = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);

  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  return await repaymentController.makeRepayment(req, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole,
  });
});
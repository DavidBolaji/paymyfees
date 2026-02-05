/**
 * Make Payment API Route
 * POST /api/payments/make
 */

import { PaymentController } from '@/src/controllers/PaymentController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { standardRateLimiter } from '@/src/middleware/rateLimiter';
import { parentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const paymentController = new PaymentController();

/**
 * POST /api/payments/make
 * Make a payment for a loan
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply standard rate limiting for payments
  await standardRateLimiter(req);

  // Authenticate user
  const authResult = await parentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Delegate to controller
  return await paymentController.makePayment(req, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
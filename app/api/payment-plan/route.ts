/**
 * Payment Plan API Route
 * GET /api/payment-plan
 */

import { PaymentController } from '@/src/controllers/PaymentController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const paymentController = new PaymentController();

/**
 * GET /api/payment-plan
 * Get payment plan for the current user
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for payment plan
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delegate to controller
  return await paymentController.getPaymentPlan(req, authResult.userId!);
});
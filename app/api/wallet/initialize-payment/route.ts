/**
 * Initialize Payment API Route
 * POST /api/wallet/initialize-payment
 */
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const walletController = new WalletController();

/**
 * POST /api/wallet/initialize-payment
 * Initialize payment with Paystack
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Delegate to controller
  return await walletController.initializePayment(req, {
    id: authResult.userId!,
    email: '',
    role: UserRole.PARENT
  });
});

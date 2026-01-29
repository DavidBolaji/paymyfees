/**
 * Transactions API Route
 * GET /api/transactions
 */
import { TransactionController } from '@/src/controllers/TransactionController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const transactionController = new TransactionController();

/**
 * GET /api/transactions
 * Get transactions for the current user
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for transactions
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Delegate to controller
  return await transactionController.getTransactions(req, {
    id: authResult.userId!,
    email: '',
    role: authResult.role as UserRole
  });
});
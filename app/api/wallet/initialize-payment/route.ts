/**
 * Initialize Payment API Route
 * POST /api/wallet/initialize-payment
 */
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const walletController = new WalletController();

/**
 * POST /api/wallet/initialize-payment
 * Initialize payment with Paystack
 */
export async function POST(
    req: Request,
    context: { params: { reference: string } }
) {
    return asyncHandler(async (req: Request) => {
        // Apply lenient rate limiting
        await lenientRateLimiter(req);

        // Authenticate user
        const authResult = await studentAuthMiddleware(req);
        if (!authResult.success) {
            return authResult.response!;
        }

        // Delegate to controller
        return await walletController.initializePayment(req, {
            id: authResult.userId!,
            email: '',
            role: authResult.role as UserRole
        });
    })(req, context);
}
;


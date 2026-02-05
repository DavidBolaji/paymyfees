/**
 * Verify Payment API Route
 * GET /api/wallet/verify-payment/[reference]
 */
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const walletController = new WalletController();

export async function GET(
    req: Request,
   context: { params: Promise<{ reference: string }> }
) {
    return asyncHandler(async (req: Request) => {
        await lenientRateLimiter(req);

        // Authenticate user
        const authResult = await studentAuthMiddleware(req);
        if (!authResult.success) {
            return authResult.response!;
        }

        const params = await context.params;
        const reference = params.reference;

        return await walletController.verifyPayment(req, reference, {
            id: authResult.userId!,
            email: '',
            role: authResult.role as UserRole
        })
    })(req, context);
}
/**
 * Verify Payment API Route
 * GET /api/wallet/verify-payment/[reference]
 */
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { UserRole } from '@prisma/client';
import { NextRequest } from 'next/server';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const walletController = new WalletController();

/**
 * GET /api/wallet/verify-payment/:reference
 * Verify payment and fund wallet
 */

export async function GET(
    req: Request,
   context: { params: { reference: string } }
) {
    return asyncHandler(async (req: Request) => {
        await lenientRateLimiter(req);

        // Authenticate user
        const authResult = await studentAuthMiddleware(req);
        if (!authResult.success) {
            return authResult.response!;
        }

        const reference = context.params.reference;

        return await walletController.verifyPayment(req, reference, {
            id: authResult.userId!,
            email: '',
            role: authResult.role as UserRole
        })
    })(req, context);
}
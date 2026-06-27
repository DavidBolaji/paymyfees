/**
 * Embedly Webhook API Route
 * POST /api/wallet/webhook
 *
 * Receives webhook events from Embedly:
 *   - inflow          → user's virtual account received a bank transfer → credit wallet
 *   - payout.success  → loan repayment transfer confirmed → mark installment PAID
 *   - payout.failed   → loan repayment transfer failed → rollback wallet debit
 *
 * NOT protected by JWT — signature verified via HMAC-SHA256 (EMBEDLY_WEBHOOK_SECRET).
 */
import { NextResponse } from 'next/server';
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';

const walletController = new WalletController();

export const POST = asyncHandler(async (req: Request): Promise<NextResponse> => {
  return await walletController.handleWebhook(req);
});
/**
 * Paystack Webhook API Route
 * POST /api/wallet/webhook
 * 
 * This endpoint receives webhook notifications from Paystack
 * about payment status changes
 */
import { NextResponse } from 'next/server';
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';

const walletController = new WalletController();

/**
 * POST /api/wallet/webhook
 * Handle Paystack webhook notifications
 * 
 * Note: This endpoint should NOT be protected by authentication
 * as it's called by Paystack's servers
 */
export const POST = asyncHandler(async (req: Request): Promise<NextResponse> => {
  return await walletController.handleWebhook(req);
});
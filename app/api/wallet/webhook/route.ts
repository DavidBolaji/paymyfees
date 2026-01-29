/**
 * Paystack Webhook API Route
 * POST /api/wallet/webhook
 * 
 * This endpoint receives webhook notifications from Paystack
 * about payment status changes
 */
import { WalletController } from '@/src/controllers/WalletController';
import { NextResponse } from 'next/server';

const walletController = new WalletController();

/**
 * POST /api/wallet/webhook
 * Handle Paystack webhook notifications
 * 
 * Note: This endpoint should NOT be protected by authentication
 * as it's called by Paystack's servers
 */
export async function POST(req: Request) {
  try {
    return await walletController.handleWebhook(req);
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
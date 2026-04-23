/**
 * Initialize Payment — REMOVED
 * Checkout-based wallet funding replaced by Embedly virtual account bank transfers.
 * Use GET /api/wallet/fund to retrieve virtual account details.
 */
import { NextResponse } from 'next/server';

export const POST = async () =>
  NextResponse.json(
    {
      success: false,
      error:
        'This endpoint has been removed. Fund your wallet via bank transfer to your dedicated virtual account. See GET /api/wallet/fund for account details.',
    },
    { status: 410 }
  );

/**
 * Verify Payment — REMOVED
 * Payment verification is now handled automatically via Embedly webhooks.
 */
import { NextResponse } from 'next/server';

export const GET = async () =>
  NextResponse.json(
    {
      success: false,
      error: 'This endpoint has been removed. Wallet funding is confirmed automatically via Embedly webhook.',
    },
    { status: 410 }
  );

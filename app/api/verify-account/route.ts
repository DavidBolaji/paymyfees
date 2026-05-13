/**
 * GET /api/verify-account?account_number=...&bank_code=...
 * Resolves a Nigerian bank account via Paystack and returns the account name.
 * API key stays server-side.
 */

import { NextResponse } from 'next/server';
import { asyncHandler } from '@/src/middleware/errorHandler';

export const GET = asyncHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const accountNumber = searchParams.get('account_number');
  const bankCode = searchParams.get('bank_code');

  if (!accountNumber || !bankCode) {
    return NextResponse.json(
      { success: false, message: 'account_number and bank_code are required' },
      { status: 400 }
    );
  }

  if (!/^\d{10}$/.test(accountNumber)) {
    return NextResponse.json(
      { success: false, message: 'Account number must be exactly 10 digits' },
      { status: 400 }
    );
  }

  const paystackKey = process.env.PAYSTACK_SECRET;
  if (!paystackKey) {
    return NextResponse.json(
      { success: false, message: 'Payment service not configured' },
      { status: 500 }
    );
  }

  const url = `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${paystackKey}` },
  });

  const json = await res.json();

  if (!res.ok || !json.status) {
    return NextResponse.json(
      { success: false, message: json.message ?? 'Could not resolve account' },
      { status: 422 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      accountName: json.data.account_name as string,
      accountNumber: json.data.account_number as string,
    },
  });
});

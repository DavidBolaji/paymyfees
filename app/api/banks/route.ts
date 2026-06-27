/**
 * GET /api/banks
 * Proxies the Paystack bank list endpoint so the API key stays server-side.
 * Returns an array of { name, code } objects suitable for a select input.
 */

import { NextResponse } from 'next/server';

export const GET = async () => {
  const paystackKey = process.env.PAYSTACK_SECRET;

  if (!paystackKey) {
    console.error('[/api/banks] PAYSTACK_SECRET env var is not set');
    return NextResponse.json(
      { success: false, message: 'Payment service is not configured. Please contact support.' },
      { status: 500 }
    );
  }

  let res: Response;
  try {
    res = await fetch('https://api.paystack.co/bank?country=nigeria&perPage=200&use_cursor=false', {
      headers: { Authorization: `Bearer ${paystackKey}` },
      // no Next.js cache — bank list is fetched fresh but cached at the edge via Cache-Control
    });
  } catch (err) {
    console.error('[/api/banks] Failed to reach Paystack:', err);
    return NextResponse.json(
      { success: false, message: 'Could not reach the bank list service. Please try again.' },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[/api/banks] Paystack returned non-OK:', res.status, body);
    return NextResponse.json(
      { success: false, message: `Bank list service returned an error (${res.status}).` },
      { status: 502 }
    );
  }

  let json: any;
  try {
    json = await res.json();
  } catch (err) {
    console.error('[/api/banks] Failed to parse Paystack response:', err);
    return NextResponse.json(
      { success: false, message: 'Invalid response from bank list service.' },
      { status: 502 }
    );
  }

  if (!json.status || !Array.isArray(json.data)) {
    console.error('[/api/banks] Unexpected Paystack response shape:', JSON.stringify(json).slice(0, 200));
    return NextResponse.json(
      { success: false, message: 'Unexpected response format from bank list service.' },
      { status: 502 }
    );
  }

  const banks: { name: string; code: string }[] = json.data.map((b: any) => ({
    name: b.name as string,
    code: b.code as string,
  }));

  return NextResponse.json(
    { success: true, data: banks },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600' } }
  );
};

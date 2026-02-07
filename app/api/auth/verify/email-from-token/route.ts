/**
 * Get Email from Verification Token API Route
 * POST /api/auth/verify/email-from-token
 * Returns the email associated with a verification token (for resend functionality)
 */

import { NextResponse } from 'next/server';
import { getUserEmailByToken } from '@/src/utils/verification';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

/**
 * POST /api/auth/verify/email-from-token
 * Get email address from verification token
 */
export const POST = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);

  const body = await req.json();
  const { token, mode } = body;

  if (!token || !mode) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required fields",
        message: "Token and mode are required",
      },
      { status: 400 }
    );
  }

  if (mode !== 'link' && mode !== 'otp') {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid mode",
        message: "Mode must be either 'link' or 'otp'",
      },
      { status: 400 }
    );
  }

  const email = await getUserEmailByToken(token, mode);

  if (!email) {
    return NextResponse.json(
      {
        success: false,
        error: "token_not_found",
        message: "Verification token not found or invalid",
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: { email },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 200 }
  );
});

/**
 * Email Verification API Route
 * POST /api/auth/verify
 */

import { AuthController } from '@/src/controllers/AuthController';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const authController = new AuthController();

/**
 * POST /api/auth/verify
 * Verify user email with token or OTP
 */
export async function POST(req: Request) {
  console.log("ishere")
  try {
    await lenientRateLimiter(req);
    return await authController.verifyEmail(req);
  } catch (error) {
    console.error("Verify route crashed:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "server_error",
        message: "Internal server error during verification",
      }),
      { status: 500 }
    );
  }
};

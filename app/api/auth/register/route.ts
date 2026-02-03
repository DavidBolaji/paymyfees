/**
 * User Registration API Route
 * POST /api/auth/register
 */

import { NextResponse } from 'next/server';
import { AuthController } from '@/src/controllers/AuthController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { logger } from '@/src/utils/logger';

const authController = new AuthController();

/**
 * POST /api/auth/register
 * Register a new user account
 */
export const POST = asyncHandler(async (req: Request) => {
  console.log('Registration endpoint called');
  
  // Apply rate limiting
  await lenientRateLimiter(req);
  console.log('Rate limiting check passed');

  // Delegate to controller
  return await authController.register(req);
});

/**
 * GET /api/auth/register
 * Returns registration requirements and options
 */
export const GET = asyncHandler(async () => {
  return NextResponse.json({
    success: true,
    data: {
      requirements: {
        password: {
          minLength: 8,
          requiresUppercase: true,
          requiresSpecialChar: true,
        },
        verificationModes: ['otp', 'link'],
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
    },
  }, { status: 200 });
});

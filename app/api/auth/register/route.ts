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
  try {
    console.log('Registration endpoint called');
    
    // Apply rate limiting
    try {
      await lenientRateLimiter(req);
      console.log('Rate limiting check passed');
    } catch (error) {
      console.warn({msg:'Rate limiting failed:', error});
      return NextResponse.json({
        success: false,
        error: 'rate_limit_exceeded',
        message: 'Too many requests, please try again later',
      }, { status: 429 });
    }

    // Delegate to controller
    return await authController.register(req);
  } catch (error) {
    console.error({msg:'Unhandled error in registration endpoint:', error});
    return NextResponse.json({
      success: false,
      error: 'server_error',
      message: 'An unexpected error occurred',
    }, { status: 500 });
  }
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

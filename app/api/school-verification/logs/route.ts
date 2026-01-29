/**
 * Verification Logs API Route
 * GET /api/school-verification/logs
 */
import { NextResponse } from 'next/server';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { SchoolVerificationService } from '@/src/services/SchoolVerificationService';
import { prisma } from '@/src/lib/prisma';
import { ApiResponse } from '@/src/types';

const verificationService = new SchoolVerificationService();

/**
 * GET /api/school-verification/logs
 * Get verification logs for the school
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    // Get school profile to get schoolId
    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { userId: authResult.userId! },
    });

    if (!schoolProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'School profile not found',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    // Get limit from query params
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const logs = await verificationService.getVerificationLogs(schoolProfile.id, limit);

    const response: ApiResponse = {
      success: true,
      data: logs,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error({
      msg: 'Error getting verification logs',
      userId: authResult.userId,
      error: (error as Error).message,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching verification logs',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
});
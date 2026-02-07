/**
 * Support Messages API Routes
 * GET /api/schools/support-messages
 * Get all support messages for the authenticated user's schools
 */
import { NextResponse } from 'next/server';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { prisma } from '@/src/lib/prisma';
import { ApiResponse } from '@/src/types';

/**
 * GET /api/schools/support-messages
 * Get support messages for all schools owned by the authenticated user
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
    // Get all schools for this user
    const schools = await prisma.schoolProfile.findMany({
      where: {
        userId: authResult.userId,
      },
      select: {
        id: true,
      },
    });

    const schoolIds = schools.map((s) => s.id);

    // Optional: pagination
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const [messages, unreadCount] = await Promise.all([
      prisma.schoolSupportMessage.findMany({
        where: { schoolId: { in: schoolIds } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),

      prisma.schoolSupportMessage.count({
        where: {
          schoolId: { in: schoolIds },
          isRead: false,
        },
      }),
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        messages,
        unreadCount,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error({
      msg: 'Error getting support messages',
      userId: authResult.userId,
      error: (error as Error).message,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching support messages',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
});

import { NextResponse } from 'next/server';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { prisma } from '@/src/lib/prisma';
import { ApiResponse } from '@/src/types';

/**
 * GET /api/schools/[schoolId]/support-messages
 * Get support messages for a school
 */
export const GET = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ schoolId: string }> }
) => {
  // Apply lenient rate limiting
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const params = await context!.params;
  const { schoolId } = params;

  // Ensure this school belongs to the user
  const school = await prisma.schoolProfile.findFirst({
    where: {
      id: schoolId,
      userId: authResult.userId!,
    },
  });

  if (!school) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'You do not have access to this school',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 403 }
    );
  }

  try {
    // Optional: pagination
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const [messages, unreadCount] = await Promise.all([
      prisma.schoolSupportMessage.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),

      prisma.schoolSupportMessage.count({
        where: {
          schoolId,
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
      schoolId,
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

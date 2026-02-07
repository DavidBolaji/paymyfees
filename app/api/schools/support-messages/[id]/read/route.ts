import { NextResponse } from 'next/server';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { prisma } from '@/src/lib/prisma';
import { ApiResponse } from '@/src/types';
import { asyncHandler } from '@/src/middleware/errorHandler';


/**
 * PUT /api/schools/support-messages/[id]/read
 * Mark a support message as read
 */
export const PUT = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ id: string }> }
) => {
  await lenientRateLimiter(req);

  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const params = await context!.params;
  const { id } = params;

  // Find the message and verify it belongs to one of the user's schools
  const message = await prisma.schoolSupportMessage.findFirst({
    where: {
      id,
      schoolId: {
        in: await prisma.schoolProfile.findMany({
          where: { userId: authResult.userId },
          select: { id: true },
        }).then(schools => schools.map(s => s.id)),
      },
    },
  });

  if (!message) {
    return NextResponse.json(
      {
        success: false,
        error: 'Not Found',
        message: 'Support message not found or you do not have access',
        metadata: { timestamp: new Date().toISOString() },
      },
      { status: 404 }
    );
  }

  const updated = await prisma.schoolSupportMessage.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  const response: ApiResponse = {
    success: true,
    data: updated,
    metadata: { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status: 200 });
});

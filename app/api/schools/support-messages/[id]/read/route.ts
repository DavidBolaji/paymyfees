import { NextResponse } from 'next/server';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { prisma } from '@/src/lib/prisma';
import { ApiResponse } from '@/src/types';
import { asyncHandler } from '@/src/middleware/errorHandler';


/**
 * PUT /api/schools/[schoolId]/support-messages/[id]/read
 * Mark a support message as read
 */
export const PUT = asyncHandler(async (
  req: Request,
  context: { params: { schoolId: string; id: string } }
) => {
  await lenientRateLimiter(req);

  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { schoolId, id } = await context.params;

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
        metadata: { timestamp: new Date().toISOString() },
      },
      { status: 403 }
    );
  }

  const message = await prisma.schoolSupportMessage.findFirst({
    where: {
      id,
      schoolId,
    },
  });

  if (!message) {
    return NextResponse.json(
      {
        success: false,
        error: 'Not Found',
        message: 'Support message not found',
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

import { NextResponse } from 'next/server';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { prisma } from '@/src/lib/prisma';
import { ApiResponse } from '@/src/types';

export const GET = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ schoolId: string }> }
) => {
  await lenientRateLimiter(req);

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
        metadata: { timestamp: new Date().toISOString() },
      },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '10');

  // Fetch school profile verification logs
  const logs = await prisma.schoolProfileVerificationLog.findMany({
    where: { schoolId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      verification: {
        select: {
          id: true,
          status: true,
          submittedAt: true,
          reviewedAt: true,
          reviewedBy: true,
          notes: true,
        },
      },
    },
  });

  // Format the logs for display
  const formattedLogs = logs.map(log => ({
    id: log.id,
    date: log.createdAt,
    activity: log.activity,
    details: log.details || '-',
    status: log.status,
    performedBy: log.performedBy,
    verification: log.verification,
  }));

  const response: ApiResponse = {
    success: true,
    data: formattedLogs,
    metadata: { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status: 200 });
});

// app/api/schools/[schoolId]/verification-requests/route.ts
/**
 * School Verification Requests API Route
 * GET /api/schools/:schoolId/verification-requests
 */
import { NextResponse } from 'next/server';
import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolController = new SchoolController();

export const GET = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ schoolId: string }> }
): Promise<NextResponse> => {
  await lenientRateLimiter(req);
  
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }
  
  const params = await context!.params;
  return await schoolController.getVerificationRequests(req, authResult.userId!, params);
});

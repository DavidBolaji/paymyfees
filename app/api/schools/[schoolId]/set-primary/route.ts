// app/api/schools/[schoolId]/set-primary/route.ts
/**
 * Set Primary School API Route
 * PUT /api/schools/:schoolId/set-primary - Set school as primary
 */
import { NextResponse } from 'next/server';
import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolController = new SchoolController();

export const PUT = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ schoolId: string }> }
): Promise<NextResponse> => {
  await lenientRateLimiter(req);
  
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }
  
  const params = await context!.params;
  return await schoolController.setPrimarySchool(req, authResult.userId!, params);
});

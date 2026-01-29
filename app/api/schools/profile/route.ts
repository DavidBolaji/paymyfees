/**
 * School Profile API Route
 * GET /api/schools/profile?schoolId=xxx (optional)
 * PUT /api/schools/profile (legacy - updates primary school)
 */
import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { NextResponse } from 'next/server';

const schoolController = new SchoolController();

export const GET = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);
  
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }
  
  return await schoolController.getSchoolProfile(req, authResult.userId!);
});

export const PUT = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);
  
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }
  
  // For backwards compatibility, update primary school
  // Get primary school first
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get('schoolId');
  
  if (!schoolId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation Error',
        message: 'schoolId query parameter is required',
      },
      { status: 400 }
    );
  }
  
  return await schoolController.updateSchoolProfile(req, authResult.userId!, { schoolId });
});

// app/api/schools/primary/route.ts
/**
 * Primary School API Route
 * GET /api/schools/primary - Get primary school
 */
import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolController = new SchoolController();

export const GET = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);
  
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }
  
  return await schoolController.getPrimarySchool(req, authResult.userId!);
});

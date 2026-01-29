/**
 * Update School Profile API Route
 * PUT /api/schools/:schoolId/profile - Update specific school
 */
import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolController = new SchoolController();

export async function PUT(
  req: Request,
  context: { params: { schoolId: string } }
) {
  return asyncHandler(async (req: Request) => {
    await lenientRateLimiter(req);
    
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return authResult.response;
    }
    
    return await schoolController.updateSchoolProfile(req, authResult.userId!, context.params);
  })(req, context);
}

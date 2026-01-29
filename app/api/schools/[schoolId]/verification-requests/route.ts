

// app/api/schools/[schoolId]/verification-requests/route.ts
/**
 * School Verification Requests API Route
 * GET /api/schools/:schoolId/verification-requests
 */
import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolController = new SchoolController();

export async function GET(
  req: Request,
  context: { params: { schoolId: string } }
) {
  return asyncHandler(async (req: Request) => {
    await lenientRateLimiter(req);
    
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return authResult.response;
    }
    
    return await schoolController.getVerificationRequests(req, authResult.userId!, context.params);
  })(req, context);
}

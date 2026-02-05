/**
 * School Disbursements API Route
 * GET /api/schools/:schoolId/disbursements
 */
import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolController = new SchoolController();

export async function GET(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  return asyncHandler(async (req: Request) => {
    await lenientRateLimiter(req);
    
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return authResult.response;
    }
    
    const params = await context.params;
    return await schoolController.getDisbursements(req, authResult.userId!, params);
  })(req, context);
}
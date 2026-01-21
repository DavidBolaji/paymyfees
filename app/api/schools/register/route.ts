/**
 * School Registration API Route
 * POST /api/schools/register
 */

import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { strictRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';

const schoolController = new SchoolController();

/**
 * POST /api/schools/register
 * Register a new school
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply strict rate limiting for school registration
  await strictRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delegate to controller
  return await schoolController.registerSchool(req, authResult.userId!);
});
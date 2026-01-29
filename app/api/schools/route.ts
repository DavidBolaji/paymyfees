/**
 * Schools API Route
 * GET /api/schools - Get all verified schools (public)
 */
import { SchoolController } from '@/src/controllers/SchoolController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const schoolController = new SchoolController();

export const GET = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);
  return await schoolController.getAllSchools(req);
});



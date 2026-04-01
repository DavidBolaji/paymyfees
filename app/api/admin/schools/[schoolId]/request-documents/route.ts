import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { adminAuthMiddleware, authMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const adminController = new AdminController();

export const POST = asyncHandler(async (req: Request, context?: { params: Promise<{ schoolId: string }> }): Promise<NextResponse> => {
  await lenientRateLimiter(req);
  const authResult = await authMiddleware(req);
  if (!authResult.success) return authResult.response!;
  const adminResult = await adminAuthMiddleware(req);
  if (!adminResult.success) return adminResult.response!;
  const { schoolId } = await context!.params;
  return await adminController.requestAdditionalDocuments(req, schoolId, authResult.userId);
});

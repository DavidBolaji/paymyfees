import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware, teacherAdminAuthMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const adminController = new AdminController();

export const GET = asyncHandler(async (req: Request): Promise<NextResponse> => {
  await lenientRateLimiter(req);
  const authResult = await authMiddleware(req);
  if (!authResult.success) return authResult.response!;
  const roleResult = await teacherAdminAuthMiddleware(req);
  if (!roleResult.success) return roleResult.response!;
  return await adminController.getTeacherUsers(req);
});

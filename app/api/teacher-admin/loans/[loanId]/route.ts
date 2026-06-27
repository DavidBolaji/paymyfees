import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware, teacherAdminAuthMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';

const controller = new AdminController();

export const GET = asyncHandler(async (
  req: Request,
  context?: { params: Promise<{ loanId: string }> }
): Promise<NextResponse> => {
  const authResult = await authMiddleware(req);
  if (!authResult.success) return authResult.response!;
  const roleResult = await teacherAdminAuthMiddleware(req);
  if (!roleResult.success) return roleResult.response!;
  const { loanId } = await context!.params;
  return await controller.getLoanDetails(req, loanId);
});

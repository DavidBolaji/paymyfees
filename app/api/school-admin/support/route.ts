import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware, schoolAdminAuthMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';

const controller = new AdminController();

export const GET = asyncHandler(async (req: Request): Promise<NextResponse> => {
  const authResult = await authMiddleware(req);
  if (!authResult.success) return authResult.response!;
  const roleResult = await schoolAdminAuthMiddleware(req);
  if (!roleResult.success) return roleResult.response!;
  return await controller.getSupportTickets(req);
});

import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const controller = new AdminController();

export const GET = asyncHandler(async (req: Request): Promise<NextResponse> => {
  await lenientRateLimiter(req);
  const user = await authMiddleware(req);
  await adminMiddleware(user as any);
  
  return await controller.getSchools(req);
});

export const POST = asyncHandler(async (req: Request): Promise<NextResponse> => {
  await lenientRateLimiter(req);
  const user = await authMiddleware(req);
  await adminMiddleware(user as any);
  
  return await controller.addSchool(req, user.userId as any);
});

import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { errorHandler } from '@/src/middleware/errorHandler';

const controller = new AdminController();

export async function POST(
  req: Request,
  { params }: { params: { schoolId: string } }
) {
  try {
    const user = await authMiddleware(req);
    await adminMiddleware(user);
    
    return await controller.approveSchool(req, params.schoolId, user.id);
  } catch (error) {
    return errorHandler(error);
  }
}

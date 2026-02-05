
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { errorHandler } from '@/src/middleware/errorHandler';
import { NextResponse } from 'next/server';

const controller = new AdminController();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
    }

    // Verify admin privileges
    const adminResult = await adminMiddleware(req, authResult.userId);
    if (!adminResult.success) {
      return adminResult.response || NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
    }


    const { schoolId } = await params;
    return await controller.approveSchool(req, schoolId, authResult.userId as any);
  } catch (error) {
    return errorHandler(error);
  }
}

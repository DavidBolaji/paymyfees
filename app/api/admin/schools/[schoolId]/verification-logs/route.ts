
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { errorHandler } from '@/src/middleware/errorHandler';

const controller = new AdminController();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const user = await authMiddleware(req);
    await adminMiddleware(user as any);
    
    const { schoolId } = await params;
    return await controller.getVerificationLogs(req, schoolId);
  } catch (error) {
    return errorHandler(error);
  }
}

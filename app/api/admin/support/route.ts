
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { errorHandler } from '@/src/middleware/errorHandler';

const controller = new AdminController();

export async function GET(req: Request) {
  try {
    const user = await authMiddleware(req);
    await adminMiddleware(user as any);
    
    return await controller.getSupportTickets(req);
  } catch (error) {
    return errorHandler(error);
  }
}

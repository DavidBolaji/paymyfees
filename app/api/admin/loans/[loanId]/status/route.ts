import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { errorHandler } from '@/src/middleware/errorHandler';

const controller = new AdminController();

export async function PATCH(
  req: Request,
  { params }: { params: { loanId: string } }
) {
  try {
    const user = await authMiddleware(req);
    await adminMiddleware(user);
    
    return await controller.updateLoanStatus(req, params.loanId, user.id);
  } catch (error) {
    return errorHandler(error);
  }
}

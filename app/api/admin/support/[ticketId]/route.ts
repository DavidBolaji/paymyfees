import { NextResponse } from 'next/server';
import { SupportController } from '@/src/controllers/SupportController';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { adminMiddleware } from '@/src/middleware/adminMiddleware';
import { errorHandler } from '@/src/middleware/errorHandler';

const controller = new SupportController();

export async function GET(
  req: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const user = await authMiddleware(req);
    await adminMiddleware(user);
    
    return await controller.getTicketDetails(req, params.ticketId);
  } catch (error) {
    return errorHandler(error);
  }
}

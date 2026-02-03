/**
 * Admin Loans API Route
 * GET /api/admin/loans
 */

import { NextResponse } from 'next/server';
import { AdminController } from '@/src/controllers/AdminController';
import { adminAuthMiddleware } from '@/src/middleware/authMiddleware';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const adminController = new AdminController();

export async function GET(req: Request): Promise<NextResponse> {
  try {
    await lenientRateLimiter(req);

    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
    }

    return await adminController.getLoans(req);
  } catch (error) {
    console.error('Error in GET /api/admin/loans:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

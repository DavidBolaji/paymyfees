import { SupportController } from '@/src/controllers/SupportController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

const supportController = new SupportController();

/**
 * GET /api/support/tickets
 * Get support tickets for the current user
 */
export const GET = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for tickets
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Delegate to controller
  return await supportController.getTickets(req, authResult.userId!);
});

/**
 * POST /api/support/tickets
 * Create a new support ticket
 */
export const POST = asyncHandler(async (req: Request) => {
  // Apply lenient rate limiting for ticket creation
  await lenientRateLimiter(req);

  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Check if user role is available
  if (!authResult.role) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'User role not found',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 401 }
    );
  }

  // Delegate to controller
  return await supportController.createTicket(
    req,
    authResult.userId!,
    authResult.role as UserRole
  );
});
/**
 * Add Card API Route
 * POST /api/payment-methods/add-card - Initialize card addition flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { PaymentMethodController } from '@/src/controllers/PaymentMethodController';
import { requireAuth } from '@/src/middleware/auth';
import { errorHandler } from '@/src/middleware/errorHandler';
import { rateLimiter } from '@/src/middleware/rateLimiter';

const controller = new PaymentMethodController();

/**
 * POST /api/payment-methods/add-card
 * Initialize card addition with Paystack tokenization
 */
export async function POST(req: NextRequest) {
  try {
    await rateLimiter(req);
    const user = await requireAuth(req);
    return await controller.initializeCardAddition(req, user);
  } catch (error) {
    return errorHandler(error);
  }
}

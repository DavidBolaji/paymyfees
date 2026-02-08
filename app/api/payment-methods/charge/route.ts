/**
 * Charge Saved Card API Route
 * POST /api/payment-methods/charge - Charge a saved payment method
 */

import { NextRequest, NextResponse } from 'next/server';
import { PaymentMethodController } from '@/src/controllers/PaymentMethodController';
import { requireAuth } from '@/src/middleware/auth';
import { errorHandler } from '@/src/middleware/errorHandler';
import { rateLimiter } from '@/src/middleware/rateLimiter';

const controller = new PaymentMethodController();

/**
 * POST /api/payment-methods/charge
 * Charge a saved payment method to fund wallet
 */
export async function POST(req: NextRequest) {
  try {
    await rateLimiter(req);
    const user = await requireAuth(req);
    return await controller.chargeSavedCard(req, user);
  } catch (error) {
    return errorHandler(error);
  }
}

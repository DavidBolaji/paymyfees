/**
 * Payment Methods API Routes
 * GET /api/payment-methods - Get all payment methods
 */

import { NextRequest, NextResponse } from 'next/server';
import { PaymentMethodController } from '@/src/controllers/PaymentMethodController';
import { requireAuth } from '@/src/middleware/auth';
import { errorHandler } from '@/src/middleware/errorHandler';

const controller = new PaymentMethodController();

/**
 * GET /api/payment-methods
 * Get all saved payment methods for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    return await controller.getPaymentMethods(req, user);
  } catch (error) {
    return errorHandler(error);
  }
}

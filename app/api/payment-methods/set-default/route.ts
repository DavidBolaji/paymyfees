/**
 * Set Default Payment Method API Route
 * POST /api/payment-methods/set-default - Set a payment method as default
 */

import { NextRequest, NextResponse } from 'next/server';
import { PaymentMethodController } from '@/src/controllers/PaymentMethodController';
import { requireAuth } from '@/src/middleware/auth';
import { errorHandler } from '@/src/middleware/errorHandler';

const controller = new PaymentMethodController();

/**
 * POST /api/payment-methods/set-default
 * Set a payment method as the default
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    return await controller.setDefaultPaymentMethod(req, user);
  } catch (error) {
    return errorHandler(error);
  }
}

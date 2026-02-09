/**
 * Payment Method by ID API Routes
 * GET /api/payment-methods/:id - Get a specific payment method
 * DELETE /api/payment-methods/:id - Delete a payment method
 */

import { NextRequest } from 'next/server';
import { PaymentMethodController } from '@/src/controllers/PaymentMethodController';
import { requireAuth } from '@/src/middleware/auth';
import { errorHandler } from '@/src/middleware/errorHandler';

const controller = new PaymentMethodController();

/**
 * GET /api/payment-methods/:id
 * Get a specific payment method
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;
    return await controller.getPaymentMethodById(req, id, user);
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * DELETE /api/payment-methods/:id
 * Delete a payment method
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;
    return await controller.deletePaymentMethod(req, id, user);
  } catch (error) {
    return errorHandler(error);
  }
}

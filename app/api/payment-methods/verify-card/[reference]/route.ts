/**
 * Verify Card Addition API Route (Embedly)
 * GET /api/payment-methods/verify-card/:reference
 *
 * Called after the user completes card entry on the Embedly hosted form.
 * Verifies tokenization was successful and saves the card token as a PaymentMethod.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/middleware/auth';
import { errorHandler } from '@/src/middleware/errorHandler';
import { EmbedlyCardsService } from '@/src/services/EmbedlyCardsService';
import { PaymentMethodService } from '@/src/services/PaymentMethodService';
import { ApiResponse } from '@/src/types';

const embedlyCardsService = new EmbedlyCardsService();
const paymentMethodService = new PaymentMethodService();

/**
 * GET /api/payment-methods/verify-card/:reference
 * Verify Embedly card tokenization and save payment method
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ reference: string }> }
) {
  try {
    const user = await requireAuth(req);
    const params = await context.params;
    const reference = params.reference;

    console.log({ msg: 'Verifying card tokenization', reference, userId: user.id });

    // Verify tokenization with Embedly
    const cardDetails = await embedlyCardsService.verifyCardTokenization(reference);

    if (!cardDetails || !cardDetails.cardToken) {
      const response: ApiResponse = {
        success: false,
        error: 'Card tokenization failed. Please try again or use a different card.',
        message: 'Card tokenization failed',
        metadata: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Save payment method using the Embedly card token as the authorization code
    const paymentMethod = await paymentMethodService.savePaymentMethodFromTransaction(
      user.id,
      cardDetails.cardToken,
      {
        cardType: cardDetails.cardType,
        last4: cardDetails.last4,
        expMonth: cardDetails.expMonth,
        expYear: cardDetails.expYear,
        bank: cardDetails.bank,
        brand: cardDetails.brand,
      }
    );

    console.log({ msg: 'Card saved successfully', paymentMethodId: paymentMethod.id });

    const response: ApiResponse = {
      success: true,
      data: {
        paymentMethod: {
          id: paymentMethod.id,
          cardType: paymentMethod.cardType,
          last4: paymentMethod.last4,
          brand: paymentMethod.brand,
        },
        message: 'Card added successfully!',
      },
      metadata: { timestamp: new Date().toISOString() },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in verify-card endpoint:', error);
    return errorHandler(error);
  }
}

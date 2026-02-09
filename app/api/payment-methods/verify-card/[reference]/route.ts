/**
 * Verify Card Addition API Route
 * GET /api/payment-methods/verify-card/:reference
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/middleware/auth';
import { errorHandler } from '@/src/middleware/errorHandler';
import { PaystackService } from '@/src/services/PaystackService';
import { PaymentMethodService } from '@/src/services/PaymentMethodService';
import { WalletService } from '@/src/services/WalletService';
import { ApiResponse } from '@/src/types';

const paystackService = new PaystackService();
const paymentMethodService = new PaymentMethodService();
const walletService = new WalletService();

/**
 * GET /api/payment-methods/verify-card/:reference
 * Verify card addition and save payment method
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ reference: string }> }
) {
  try {
    const user = await requireAuth(req);
    const params = await context.params;
    const reference = params.reference;

    console.log({ msg: 'Verifying card addition', reference, userId: user.id });

    // Verify payment with Paystack
    const verificationResult = await paystackService.verifyPayment(reference);

    console.log({ msg: 'Payment verification result', success: verificationResult.success });

    if (!verificationResult.success) {
      const response: ApiResponse = {
        success: false,
        error: 'Card verification failed',
        message: 'Payment verification failed',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get full transaction details to access authorization
    const transactionDetails = await getTransactionDetails(reference);

    console.log({ 
      msg: 'Transaction details retrieved', 
      hasAuthorization: !!transactionDetails.authorization,
      authorizationCode: transactionDetails.authorization?.authorization_code ? 'present' : 'missing'
    });

    // Check if authorization exists
    if (!transactionDetails.authorization || !transactionDetails.authorization.authorization_code) {
      console.error({ 
        msg: 'No authorization code in transaction', 
        reference,
        transactionStatus: transactionDetails.status,
        channel: transactionDetails.channel 
      });

      // Still fund the wallet even if card tokenization failed
      await walletService.verifyAndFundWallet(reference, user.id);

      // Check if we're in test mode
      const isTestMode = process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_');

      const response: ApiResponse = {
        success: false,
        error: isTestMode 
          ? 'Card tokenization failed in test mode. Please use a valid Paystack test card (e.g., 4084084084084081 for Visa). Your wallet has been credited with ₦50.'
          : 'Card tokenization failed. Please try again or contact support. Your wallet has been credited with ₦50.',
        message: 'Card tokenization failed',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Save payment method
    const paymentMethod = await paymentMethodService.savePaymentMethodFromTransaction(
      user.id,
      transactionDetails.authorization.authorization_code,
      {
        cardType: transactionDetails.authorization.card_type,
        last4: transactionDetails.authorization.last4,
        expMonth: transactionDetails.authorization.exp_month,
        expYear: transactionDetails.authorization.exp_year,
        bank: transactionDetails.authorization.bank,
        brand: transactionDetails.authorization.brand,
      }
    );

    console.log({ msg: 'Payment method saved', paymentMethodId: paymentMethod.id });

    // Also fund the wallet with the verification amount
    await walletService.verifyAndFundWallet(reference, user.id);

    console.log({ msg: 'Wallet funded successfully' });

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
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in verify-card endpoint:', error);
    return errorHandler(error);
  }
}

/**
 * Get full transaction details from Paystack
 */
async function getTransactionDetails(reference: string): Promise<any> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY || '';
  const url = `https://api.paystack.co/transaction/verify/${reference}`;

  console.log({ msg: 'Fetching transaction details from Paystack', reference });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error({ msg: 'Failed to get transaction details', status: response.status, error: errorText });
    throw new Error('Failed to get transaction details');
  }

  const data = await response.json();
  
  console.log({ 
    msg: 'Transaction details from Paystack', 
    status: data.status,
    hasData: !!data.data,
    hasAuthorization: !!data.data?.authorization,
    authCode: data.data?.authorization?.authorization_code ? 'present' : 'missing',
    channel: data.data?.channel,
    cardType: data.data?.authorization?.card_type
  });
  
  return data.data;
}

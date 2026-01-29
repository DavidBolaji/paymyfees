/**
 * Paystack Service (FIXED - Correct fetch syntax)
 * Handles payment initialization and verification with Paystack API
 */

import { PaymentError } from '@/src/types/errors';

/**
 * Paystack API Response Types
 */
interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
      risk_action: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
  };
}

/**
 * Payment Initialization Input
 */
export interface InitializePaymentInput {
  email: string;
  amount: number; // Amount in kobo (1 NGN = 100 kobo)
  reference: string;
  currency?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  channels?: string[];
}

/**
 * Payment Initialization Result
 */
export interface PaymentInitializationResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

/**
 * Payment Verification Result
 */
export interface PaymentVerificationResult {
  success: boolean;
  reference: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'abandoned';
  paidAt?: Date;
  channel?: string;
  gatewayResponse: string;
  customerEmail: string;
}

/**
 * Paystack Service Interface
 */
export interface IPaystackService {
  initializePayment(input: InitializePaymentInput): Promise<PaymentInitializationResult>;
  verifyPayment(reference: string): Promise<PaymentVerificationResult>;
}

/**
 * Paystack Service Implementation
 */
export class PaystackService implements IPaystackService {
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.baseUrl = 'https://api.paystack.co';

    if (!this.secretKey) {
      console.warn('⚠️  PAYSTACK_SECRET_KEY is not set in environment variables');
    } else {
      console.log('✅ PaystackService initialized with secret key');
    }
  }

  /**
   * Initialize payment with Paystack
   * Creates a payment session and returns authorization URL
   */
  async initializePayment(input: InitializePaymentInput): Promise<PaymentInitializationResult> {
    console.log({ msg: 'Initializing Paystack payment', reference: input.reference });

    // Validate secret key
    if (!this.secretKey) {
      throw new PaymentError(
        'Paystack secret key is not configured. Please check your environment variables.',
        input.reference
      );
    }

    const url = `${this.baseUrl}/transaction/initialize`;
    const payload = {
      email: input.email,
      amount: input.amount, // Amount in kobo
      reference: input.reference,
      currency: input.currency || 'NGN',
      callback_url: input.callbackUrl,
      metadata: input.metadata,
      channels: input.channels || ['card', 'bank', 'ussd', 'bank_transfer'],
    };

    console.log('Paystack request:', {
      url,
      reference: input.reference,
      amount: input.amount,
      email: input.email,
      currency: payload.currency,
    });

    try {
      // FIXED: Correct fetch syntax with parentheses
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Paystack response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Paystack initialization failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        
        throw new PaymentError(
          `Payment initialization failed: ${errorData.message || response.statusText}`,
          input.reference
        );
      }

      const data: PaystackInitializeResponse = await response.json();

      if (!data.status) {
        throw new PaymentError(
          `Payment initialization failed: ${data.message}`,
          input.reference
        );
      }

      console.log({ 
        msg: 'Paystack payment initialized successfully', 
        reference: data.data.reference,
        authorizationUrl: data.data.authorization_url,
      });

      return {
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference: data.data.reference,
      };
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }

      // Network or other errors
      console.error('Error initializing Paystack payment:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        reference: input.reference,
        cause: error instanceof Error && 'cause' in error ? error.cause : undefined,
      });

      // Check if it's a network error
      if (error instanceof Error) {
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
          throw new PaymentError(
            'Unable to connect to payment provider. Please check your internet connection and try again.',
            input.reference
          );
        }
        
        if (error.message.includes('timeout')) {
          throw new PaymentError(
            'Payment initialization timed out. Please try again.',
            input.reference
          );
        }
      }

      throw new PaymentError(
        'Failed to initialize payment. Please try again.',
        input.reference
      );
    }
  }

  /**
   * Verify payment with Paystack
   * Confirms payment status and retrieves transaction details
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    console.log({ msg: 'Verifying Paystack payment', reference });

    // Validate secret key
    if (!this.secretKey) {
      throw new PaymentError(
        'Paystack secret key is not configured. Please check your environment variables.',
        reference
      );
    }

    const url = `${this.baseUrl}/transaction/verify/${reference}`;

    try {
      // FIXED: Correct fetch syntax with parentheses
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Paystack verification failed:', errorData);
        throw new PaymentError(
          `Payment verification failed: ${errorData.message || response.statusText}`,
          reference
        );
      }

      const data: PaystackVerifyResponse = await response.json();

      if (!data.status) {
        throw new PaymentError(
          `Payment verification failed: ${data.message}`,
          reference
        );
      }

      const transaction = data.data;
      const isSuccessful = transaction.status === 'success';

      console.log({ 
        msg: 'Paystack payment verification completed', 
        reference, 
        status: transaction.status,
        amount: transaction.amount 
      });

      return {
        success: isSuccessful,
        reference: transaction.reference,
        amount: transaction.amount / 100, // Convert from kobo to naira
        currency: transaction.currency,
        status: transaction.status,
        paidAt: transaction.paid_at ? new Date(transaction.paid_at) : undefined,
        channel: transaction.channel,
        gatewayResponse: transaction.gateway_response,
        customerEmail: transaction.customer.email,
      };
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }

      console.error('Error verifying Paystack payment:', error);
      
      // Check if it's a network error
      if (error instanceof Error && 
          (error.message.includes('fetch failed') || 
           error.message.includes('ECONNREFUSED') ||
           error.message.includes('timeout'))) {
        throw new PaymentError(
          'Unable to verify payment. Please check your internet connection.',
          reference
        );
      }

      throw new PaymentError(
        'Failed to verify payment. Please try again.',
        reference
      );
    }
  }

  /**
   * Get supported payment channels
   */
  getSupportedChannels(): string[] {
    return ['card', 'bank', 'ussd', 'bank_transfer'];
  }

  /**
   * Convert amount to kobo (Paystack's smallest currency unit)
   */
  static toKobo(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert amount from kobo to naira
   */
  static fromKobo(amount: number): number {
    return amount / 100;
  }
}
/**
 * Payment Method Service
 * Business logic for managing saved payment methods with Paystack
 */

import {
  PaymentMethodRepository,
  IPaymentMethodRepository,
  PaymentMethodDTO,
  CreatePaymentMethodInput,
} from '@/src/repositories/PaymentMethodRepository';
import { PaystackService, IPaystackService } from '@/src/services/PaystackService';
import { ValidationError, NotFoundError, PaymentError } from '@/src/types/errors';
import { executeWalletOperation } from '@/src/database/prisma';
import { TransactionType, TransactionStatus } from '@prisma/client';

/**
 * Charge Saved Card Input
 */
export interface ChargeSavedCardInput {
  userId: string;
  paymentMethodId: string;
  amount: number;
  userEmail: string;
  currency?: string;
  note?: string;
}

/**
 * Add Card Input
 */
export interface AddCardInput {
  userId: string;
  userEmail: string;
  amount?: number; // Small amount for verification (e.g., 50 NGN)
}

/**
 * Payment Method Service Interface
 */
export interface IPaymentMethodService {
  getUserPaymentMethods(userId: string): Promise<PaymentMethodDTO[]>;
  getPaymentMethodById(id: string, userId: string): Promise<PaymentMethodDTO>;
  initializeCardAddition(input: AddCardInput): Promise<{ paymentUrl: string; reference: string }>;
  savePaymentMethodFromTransaction(
    userId: string,
    authorizationCode: string,
    cardDetails: {
      cardType: string;
      last4: string;
      expMonth: string;
      expYear: string;
      bank?: string;
      brand: string;
    }
  ): Promise<PaymentMethodDTO>;
  setDefaultPaymentMethod(id: string, userId: string): Promise<PaymentMethodDTO>;
  deletePaymentMethod(id: string, userId: string): Promise<void>;
  chargeSavedCard(input: ChargeSavedCardInput): Promise<{ reference: string; amount: number }>;
}

/**
 * Payment Method Service Implementation
 */
export class PaymentMethodService implements IPaymentMethodService {
  private paymentMethodRepository: IPaymentMethodRepository;
  private paystackService: IPaystackService;

  constructor(
    paymentMethodRepository?: IPaymentMethodRepository,
    paystackService?: IPaystackService
  ) {
    this.paymentMethodRepository = paymentMethodRepository || new PaymentMethodRepository();
    this.paystackService = paystackService || new PaystackService();
  }

  /**
   * Initialize card addition flow
   * Creates a small verification payment to tokenize the card
   */
  async initializeCardAddition(input: AddCardInput): Promise<{ paymentUrl: string; reference: string }> {
    console.log({ msg: 'Initializing card addition', userId: input.userId });

    // Use a small verification amount (50 NGN = 5000 kobo)
    const verificationAmount = input.amount || 50;
    const reference = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Initialize payment with Paystack to tokenize the card
    const paymentResult = await this.paystackService.initializePayment({
      email: input.userEmail,
      amount: PaystackService.toKobo(verificationAmount),
      reference,
      currency: 'NGN',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/wallet/payment-callback?type=card_addition`,
      metadata: {
        userId: input.userId,
        purpose: 'card_tokenization',
        verificationAmount,
      },
    });

    console.log({ msg: 'Card addition initialized', userId: input.userId, reference });

    return {
      paymentUrl: paymentResult.authorizationUrl,
      reference: paymentResult.reference,
    };
  }

  /**
   * Get all payment methods for a user
   */
  async getUserPaymentMethods(userId: string): Promise<PaymentMethodDTO[]> {
    console.log({ msg: 'Getting user payment methods', userId });
    return await this.paymentMethodRepository.findByUserId(userId);
  }

  /**
   * Get a specific payment method by ID
   */
  async getPaymentMethodById(id: string, userId: string): Promise<PaymentMethodDTO> {
    console.log({ msg: 'Getting payment method by ID', id, userId });

    const paymentMethod = await this.paymentMethodRepository.findById(id);

    if (!paymentMethod || paymentMethod.userId !== userId) {
      throw new NotFoundError('Payment method not found');
    }

    return paymentMethod;
  }

  /**
   * Save payment method from a successful transaction
   * This is called after a successful payment to save the authorization code
   */
  async savePaymentMethodFromTransaction(
    userId: string,
    authorizationCode: string,
    cardDetails: {
      cardType: string;
      last4: string;
      expMonth: string;
      expYear: string;
      bank?: string;
      brand: string;
    }
  ): Promise<PaymentMethodDTO> {
    console.log({ msg: 'Saving payment method from transaction', userId, last4: cardDetails.last4 });

    // Check if this authorization code already exists
    const existing = await this.paymentMethodRepository.findByAuthorizationCode(authorizationCode);
    if (existing) {
      console.log({ msg: 'Payment method already exists', id: existing.id });
      return existing;
    }

    // Check if user has any payment methods
    const userMethods = await this.paymentMethodRepository.findByUserId(userId);
    const isFirstCard = userMethods.length === 0;

    // Create new payment method
    const input: CreatePaymentMethodInput = {
      userId,
      authorizationCode,
      cardType: cardDetails.cardType,
      last4: cardDetails.last4,
      expMonth: cardDetails.expMonth,
      expYear: cardDetails.expYear,
      bank: cardDetails.bank,
      brand: cardDetails.brand,
      isDefault: isFirstCard, // First card is default
    };

    const paymentMethod = await this.paymentMethodRepository.create(input);

    console.log({ msg: 'Payment method saved successfully', id: paymentMethod.id });
    return paymentMethod;
  }

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(id: string, userId: string): Promise<PaymentMethodDTO> {
    console.log({ msg: 'Setting default payment method', id, userId });
    return await this.paymentMethodRepository.setDefault(id, userId);
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(id: string, userId: string): Promise<void> {
    console.log({ msg: 'Deleting payment method', id, userId });
    await this.paymentMethodRepository.delete(id, userId);
  }

  /**
   * Charge a saved card using Paystack's charge authorization
   * This allows charging without redirecting the user
   */
  async chargeSavedCard(input: ChargeSavedCardInput): Promise<{ reference: string; amount: number }> {
    console.log({ msg: 'Charging saved card', userId: input.userId, amount: input.amount });

    // Validate amount
    if (input.amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    // Get payment method
    const paymentMethod = await this.getPaymentMethodById(input.paymentMethodId, input.userId);

    if (!paymentMethod.isActive) {
      throw new ValidationError('Payment method is not active');
    }

    // Generate unique reference
    const reference = `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    try {
      // Charge the authorization using Paystack
      const chargeResult = await this.chargeAuthorization({
        authorizationCode: paymentMethod.authorizationCode,
        email: input.userEmail,
        amount: input.amount,
        reference,
        currency: input.currency || 'NGN',
        metadata: {
          userId: input.userId,
          paymentMethodId: input.paymentMethodId,
          note: input.note,
        },
      });

      // If charge is successful, fund the wallet directly
      if (chargeResult.success) {
        // Fund wallet using database transaction
        await executeWalletOperation(async (tx) => {
          // Get wallet
          const wallet = await tx.wallet.findUnique({
            where: { userId: input.userId },
          });

          if (!wallet) {
            throw new NotFoundError('Wallet not found');
          }

          const balanceBefore = Number(wallet.balance);
          const balanceAfter = balanceBefore + input.amount;

          // Update wallet balance
          await tx.wallet.update({
            where: { userId: input.userId },
            data: {
              balance: { increment: input.amount },
            },
          });

          // Create transaction record
          await tx.transaction.create({
            data: {
              transactionReference: reference,
              userId: input.userId,
              walletId: wallet.id,
              type: TransactionType.CREDIT,
              amount: input.amount,
              balanceBefore,
              balanceAfter,
              description: input.note || 'Wallet funding via saved card',
              paymentMethod: 'CARD' as any,
              status: TransactionStatus.COMPLETED,
              gatewayReference: reference,
              transactionDate: new Date(),
              metadata: {
                paymentMethodId: input.paymentMethodId,
                cardLast4: paymentMethod.last4,
                cardBrand: paymentMethod.brand,
              },
            },
          });
        });

        console.log({ msg: 'Saved card charged successfully', reference, amount: input.amount });

        return {
          reference,
          amount: input.amount,
        };
      } else {
        throw new PaymentError('Card charge failed', reference);
      }
    } catch (error) {
      console.error('Error charging saved card:', error);
      throw error;
    }
  }

  /**
   * Charge authorization using Paystack API
   * Private method to handle the actual API call
   */
  private async chargeAuthorization(params: {
    authorizationCode: string;
    email: string;
    amount: number;
    reference: string;
    currency: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; reference: string; message: string }> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    if (!secretKey) {
      throw new PaymentError('Paystack secret key is not configured', params.reference);
    }

    const url = 'https://api.paystack.co/transaction/charge_authorization';
    const payload = {
      authorization_code: params.authorizationCode,
      email: params.email,
      amount: PaystackService.toKobo(params.amount),
      reference: params.reference,
      currency: params.currency,
      metadata: params.metadata,
    };

    console.log('Charging authorization:', {
      reference: params.reference,
      amount: params.amount,
      email: params.email,
      last4: params.authorizationCode.slice(-4),
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Paystack charge authorization failed:', errorData);
        throw new PaymentError(
          `Card charge failed: ${errorData.message || response.statusText}`,
          params.reference
        );
      }

      const data = await response.json();

      if (!data.status) {
        throw new PaymentError(`Card charge failed: ${data.message}`, params.reference);
      }

      console.log({ msg: 'Authorization charged successfully', reference: params.reference });

      return {
        success: true,
        reference: data.data.reference,
        message: data.message,
      };
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }

      console.error('Error charging authorization:', error);
      throw new PaymentError('Failed to charge card. Please try again.', params.reference);
    }
  }
}

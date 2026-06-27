/**
 * Payment Method Service
 * Business logic for managing saved payment methods with Embedly Cards
 */

import {
  PaymentMethodRepository,
  IPaymentMethodRepository,
  PaymentMethodDTO,
  CreatePaymentMethodInput,
} from '@/src/repositories/PaymentMethodRepository';
import { EmbedlyCardsService, IEmbedlyCardsService } from '@/src/services/EmbedlyCardsService';
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
  private embedlyCardsService: IEmbedlyCardsService;

  constructor(
    paymentMethodRepository?: IPaymentMethodRepository,
    embedlyCardsService?: IEmbedlyCardsService
  ) {
    this.paymentMethodRepository = paymentMethodRepository || new PaymentMethodRepository();
    this.embedlyCardsService = embedlyCardsService || new EmbedlyCardsService();
  }

  /**
   * Initialize card addition flow via Embedly
   * Redirects user to Embedly hosted card entry form for tokenization
   */
  async initializeCardAddition(input: AddCardInput): Promise<{ paymentUrl: string; reference: string }> {
    console.log({ msg: 'Initializing card addition', userId: input.userId });

    const verificationAmount = input.amount || 50; // NGN (not kobo)
    const reference = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const result = await this.embedlyCardsService.tokenizeCard({
      userId: input.userId,
      userEmail: input.userEmail,
      amount: verificationAmount,
      reference,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/wallet/payment-callback?type=card_addition`,
    });

    console.log({ msg: 'Card addition initialized', userId: input.userId, reference });

    return {
      paymentUrl: result.paymentUrl,
      reference: result.reference,
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
   * Charge a saved card using Embedly card token
   */
  async chargeSavedCard(input: ChargeSavedCardInput): Promise<{ reference: string; amount: number }> {
    console.log({ msg: 'Charging saved card', userId: input.userId, amount: input.amount });

    if (input.amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    const paymentMethod = await this.getPaymentMethodById(input.paymentMethodId, input.userId);

    if (!paymentMethod.isActive) {
      throw new ValidationError('Payment method is not active');
    }

    const reference = `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    try {
      const chargeResult = await this.embedlyCardsService.chargeCard({
        cardToken: paymentMethod.authorizationCode,
        userEmail: input.userEmail,
        amount: input.amount, // NGN, not kobo
        reference,
        currency: input.currency || 'NGN',
        metadata: {
          userId: input.userId,
          paymentMethodId: input.paymentMethodId,
          note: input.note,
        },
      });

      if (!chargeResult.success) {
        throw new PaymentError('Card charge failed', reference);
      }

      // Fund wallet on successful charge
      await executeWalletOperation(async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { userId: input.userId } });
        if (!wallet) throw new NotFoundError('Wallet not found');

        const balanceBefore = Number(wallet.balance);
        const balanceAfter = balanceBefore + input.amount;

        await tx.wallet.update({
          where: { userId: input.userId },
          data: { balance: { increment: input.amount } },
        });

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
            gatewayReference: chargeResult.transactionId ?? reference,
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
      return { reference, amount: input.amount };
    } catch (error) {
      console.error('Error charging saved card:', error);
      throw error;
    }
  }
}

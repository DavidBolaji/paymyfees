/**
 * Payment Service
 * Business logic for payment operations
 * Implements service layer with dependency injection
 */

import { executePaymentProcessing } from '@/src/database/prisma';
import { ValidationError, NotFoundError, PaymentError } from '@/src/types/errors';
import { logger } from '@/src/utils/logger';
import { 
  PaymentStatus,
  TransactionStatus,
  TransactionType,
  PaymentMethod
} from '@prisma/client';
import { 
  PaymentDTO, 
  CreatePaymentInput,
  ProcessPaymentInput
} from '@/src/types';
import { WalletService, IWalletService } from '@/src/services/WalletService';
import { LoanService, ILoanService } from '@/src/services/LoanService';

/**
 * Payment Service Interface
 */
export interface IPaymentService {
  createPayment(input: CreatePaymentInput): Promise<PaymentDTO>;
  processPayment(input: ProcessPaymentInput): Promise<PaymentDTO>;
  getPaymentById(id: string): Promise<PaymentDTO>;
  getPaymentsByLoanId(loanId: string): Promise<PaymentDTO[]>;
  generateReceipt(paymentId: string): Promise<{ receiptUrl: string; payment: PaymentDTO }>;
}

/**
 * Convert Prisma Payment to PaymentDTO
 */
function toPaymentDTO(payment: any): PaymentDTO {
  return {
    ...payment,
    amount: Number(payment.amount)
  };
}

/**
 * Payment Service Implementation
 */
export class PaymentService implements IPaymentService {
  private walletService: IWalletService;
  private loanService: ILoanService;

  constructor(
    walletService?: IWalletService,
    loanService?: ILoanService
  ) {
    this.walletService = walletService || new WalletService();
    this.loanService = loanService || new LoanService();
  }

  /**
   * Create a new payment
   */
  async createPayment(input: CreatePaymentInput): Promise<PaymentDTO> {
    logger.info({ msg: 'Creating payment', userId: input.userId, loanId: input.loanId, amount: input.amount });

    // Verify loan exists and belongs to user
    const loan = await this.loanService.getLoanById(input.loanId);
    
    if (loan.userId !== input.userId) {
      throw new ValidationError('Loan does not belong to this user');
    }

    // Verify loan is in a status that allows payments
    if (loan.status !== 'ACTIVE' && loan.status !== 'DISBURSED') {
      throw new ValidationError(`Cannot make payment for loan in ${loan.status} status`);
    }

    // Verify payment amount
    if (input.amount <= 0) {
      throw new ValidationError('Payment amount must be greater than zero');
    }

    if (input.amount > loan.outstandingBalance) {
      throw new ValidationError('Payment amount exceeds outstanding balance');
    }

    // Generate payment reference
    const paymentReference = `PMT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Process payment based on payment method
    if (input.paymentMethod === PaymentMethod.WALLET) {
      // Debit wallet
      try {
        await this.walletService.debitWallet({
          userId: input.userId,
          amount: input.amount,
          description: `Loan payment for ${loan.loanNumber}`,
          category: 'LOAN_PAYMENT'
        });
      } catch (error) {
        if (error instanceof ValidationError && error.message.includes('Insufficient')) {
          throw new PaymentError('Insufficient wallet balance');
        }
        throw error;
      }

      // Create payment record and update loan
      const result = await executePaymentProcessing(async (tx) => {
        // Create payment record
        const payment = await tx.payment.create({
          data: {
            paymentReference,
            loanId: input.loanId,
            installmentId: input.installmentId,
            userId: input.userId,
            amount: input.amount,
            paymentMethod: input.paymentMethod,
            status: TransactionStatus.COMPLETED,
            paymentDate: new Date(),
            confirmedAt: new Date(),
          },
        });

        // Update loan
        await tx.loan.update({
          where: { id: input.loanId },
          data: {
            amountRepaid: { increment: input.amount },
            outstandingBalance: { decrement: input.amount },
            lastPaymentDate: new Date(),
            status: loan.outstandingBalance - input.amount <= 0 ? 'COMPLETED' : loan.status,
          },
        });

        // Update installment if specified
        if (input.installmentId) {
          await tx.installment.update({
            where: { id: input.installmentId },
            data: {
              status: PaymentStatus.PAID,
              paidDate: new Date(),
            },
          });
        }

        // Create transaction record
        await tx.transaction.create({
          data: {
            transactionReference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: input.userId,
            paymentId: payment.id,
            type: TransactionType.DEBIT,
            amount: input.amount,
            balanceBefore: 0, // This would be set by the wallet service
            balanceAfter: 0, // This would be set by the wallet service
            description: `Loan payment for ${loan.loanNumber}`,
            category: 'LOAN_PAYMENT',
            status: TransactionStatus.COMPLETED,
            transactionDate: new Date(),
          },
        });

        return payment;
      });

      logger.info({ msg: 'Payment created successfully', paymentId: result.id, loanId: input.loanId });
      return toPaymentDTO(result);
    } else {
      // For other payment methods (CARD, BANK_TRANSFER, etc.)
      // In a real implementation, we would integrate with a payment gateway
      throw new ValidationError('Only wallet payments are supported at this time');
    }
  }

  /**
   * Process payment (for external payment methods)
   */
  async processPayment(input: ProcessPaymentInput): Promise<PaymentDTO> {
    logger.info({ msg: 'Processing payment', paymentId: input.paymentId });

    // Find payment
    const payment = await this.getPaymentById(input.paymentId);

    // Update payment status
    const updatedPayment = await executePaymentProcessing(async (tx) => {
      const result = await tx.payment.update({
        where: { id: input.paymentId },
        data: {
          status: input.status,
          gatewayReference: input.gatewayReference,
          gatewayResponse: input.gatewayResponse,
          confirmedAt: input.status === TransactionStatus.COMPLETED ? new Date() : null,
        },
      });

      // If payment is completed, update loan
      if (input.status === TransactionStatus.COMPLETED) {
        // Get loan
        const loan = await tx.loan.findUnique({
          where: { id: payment.loanId },
        });

        if (!loan) {
          throw new NotFoundError('Loan not found');
        }

        // Update loan
        await tx.loan.update({
          where: { id: payment.loanId },
          data: {
            amountRepaid: { increment: payment.amount },
            outstandingBalance: { decrement: payment.amount },
            lastPaymentDate: new Date(),
            status: Number(loan.outstandingBalance) - Number(payment.amount) <= 0 ? 'COMPLETED' : loan.status,
          },
        });

        // Update installment if specified
        if (payment.installmentId) {
          await tx.installment.update({
            where: { id: payment.installmentId },
            data: {
              status: PaymentStatus.PAID,
              paidDate: new Date(),
            },
          });
        }
      }

      return result;
    });

    logger.info({ msg: 'Payment processed', paymentId: input.paymentId, status: input.status });
    return toPaymentDTO(updatedPayment);
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<PaymentDTO> {
    logger.info({ msg: 'Getting payment by ID', paymentId: id });

    const payment = await executePaymentProcessing(async (tx) => {
      return await tx.payment.findUnique({
        where: { id },
        include: {
          loan: {
            select: {
              loanNumber: true,
              schoolName: true,
            },
          },
          installment: true,
        },
      });
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return toPaymentDTO(payment);
  }

  /**
   * Get payments by loan ID
   */
  async getPaymentsByLoanId(loanId: string): Promise<PaymentDTO[]> {
    logger.info({ msg: 'Getting payments by loan ID', loanId });

    const payments = await executePaymentProcessing(async (tx) => {
      return await tx.payment.findMany({
        where: { loanId },
        orderBy: { paymentDate: 'desc' },
        include: {
          installment: true,
        },
      });
    });

    return payments.map(payment => toPaymentDTO(payment));
  }

  /**
   * Generate receipt for payment
   */
  async generateReceipt(paymentId: string): Promise<{ receiptUrl: string; payment: PaymentDTO }> {
    logger.info({ msg: 'Generating receipt', paymentId });

    const payment = await this.getPaymentById(paymentId);

    // Verify payment is completed
    if (payment.status !== TransactionStatus.COMPLETED) {
      throw new ValidationError('Cannot generate receipt for incomplete payment');
    }

    // In a real implementation, we would generate a PDF receipt
    // For now, we'll just return a mock URL
    const receiptUrl = `https://paymyfees.co/receipts/${paymentId}.pdf`;

    return {
      receiptUrl,
      payment,
    };
  }
}
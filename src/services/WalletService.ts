/**
 * Wallet Service
 * Business logic for wallet operations
 * Implements service layer with dependency injection
 */

import { WalletRepository, IWalletRepository } from '@/src/repositories/WalletRepository';
import { TransactionRepository, ITransactionRepository } from '@/src/repositories/TransactionRepository';
import { executeWalletOperation } from '@/src/database/prisma';
import { ValidationError, NotFoundError, PaymentError } from '@/src/types/errors';
import { logger } from '@/src/utils/logger';
import { 
  TransactionType, 
  TransactionStatus, 
  PaymentMethod 
} from '@prisma/client';
import { 
  WalletDTO, 
  TransactionDTO, 
  DebitWalletInput,
  PaginationParams
} from '@/src/types';

/**
 * Fund Wallet Input Interface
 */
export interface FundWalletInput {
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference: string;
}

/**
 * Wallet Service Interface
 */
export interface IWalletService {
  getBalance(userId: string): Promise<number>;
  fundWallet(input: FundWalletInput): Promise<{ wallet: WalletDTO; transaction: TransactionDTO }>;
  verifyPayment(reference: string, userId: string): Promise<{ success: boolean; transaction: TransactionDTO | null }>;
  debitWallet(input: DebitWalletInput): Promise<{ wallet: WalletDTO; transaction: TransactionDTO }>;
  getTransactions(userId: string, pagination: PaginationParams): Promise<{ transactions: TransactionDTO[]; total: number; page: number; limit: number }>;
}

/**
 * Convert Prisma Wallet to WalletDTO
 */
function toWalletDTO(wallet: any): WalletDTO {
  return {
    ...wallet,
    balance: Number(wallet.balance),
    dailyLimit: wallet.dailyLimit ? Number(wallet.dailyLimit) : null,
    monthlyLimit: wallet.monthlyLimit ? Number(wallet.monthlyLimit) : null
  };
}

/**
 * Convert Prisma Transaction to TransactionDTO
 */
function toTransactionDTO(transaction: any): TransactionDTO {
  return {
    ...transaction,
    amount: Number(transaction.amount),
    balanceBefore: Number(transaction.balanceBefore),
    balanceAfter: Number(transaction.balanceAfter)
  };
}

/**
 * Wallet Service Implementation
 */
export class WalletService implements IWalletService {
  private walletRepository: IWalletRepository;
  private transactionRepository: ITransactionRepository;

  constructor(
    walletRepository?: IWalletRepository,
    transactionRepository?: ITransactionRepository
  ) {
    this.walletRepository = walletRepository || new WalletRepository();
    this.transactionRepository = transactionRepository || new TransactionRepository();
  }

  /**
   * Get wallet balance for a user
   */
  async getBalance(userId: string): Promise<number> {
    logger.info({ msg: 'Getting wallet balance', userId });
    return await this.walletRepository.getBalance(userId);
  }

  /**
   * Fund wallet
   * Creates a transaction and updates wallet balance
   */
  async fundWallet(input: FundWalletInput): Promise<{ wallet: WalletDTO; transaction: TransactionDTO }> {
    logger.info({ msg: 'Funding wallet', userId: input.userId, amount: input.amount });

    // Generate transaction reference if not provided
    const reference = input.reference || `PMF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Execute in transaction to ensure atomicity
    const result = await executeWalletOperation(async (tx) => {
      // Get current wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: input.userId },
      });

      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + input.amount;

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: input.userId },
        data: {
          balance: { increment: input.amount },
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          transactionReference: reference,
          userId: input.userId,
          walletId: wallet.id,
          type: TransactionType.CREDIT,
          amount: input.amount,
          balanceBefore,
          balanceAfter,
          description: 'Wallet funding',
          paymentMethod: input.paymentMethod,
          status: TransactionStatus.PENDING, // Initially pending until verified
          transactionDate: new Date(),
        },
      });

      return {
        wallet: toWalletDTO(updatedWallet),
        transaction: toTransactionDTO(transaction)
      };
    });

    logger.info({ msg: 'Wallet funding initiated', userId: input.userId, reference });
    return result;
  }

  /**
   * Verify payment
   * Updates transaction status based on payment gateway response
   */
  async verifyPayment(reference: string, userId: string): Promise<{ success: boolean; transaction: TransactionDTO | null }> {
    logger.info({ msg: 'Verifying payment', reference, userId });

    // Find transaction by reference
    const transaction = await this.transactionRepository.findByReference(reference);

    if (!transaction) {
      logger.warn({ msg: 'Transaction not found for verification', reference });
      throw new NotFoundError('Transaction not found');
    }

    // Verify transaction belongs to user
    if (transaction.userId !== userId) {
      logger.warn({ msg: 'Unauthorized transaction verification attempt', reference, userId });
      throw new ValidationError('Unauthorized to verify this transaction');
    }

    // If already verified, return success
    if (transaction.status === TransactionStatus.COMPLETED) {
      return { 
        success: true, 
        transaction: toTransactionDTO(transaction)
      };
    }

    // In a real implementation, we would call the payment gateway API here
    // For now, we'll simulate a successful verification
    const isSuccessful = true; // This would be determined by the payment gateway response

    if (isSuccessful) {
      // Update transaction status
      const updatedTransaction = await executeWalletOperation(async (tx) => {
        return await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.COMPLETED,
            gatewayResponse: 'Payment verified successfully',
          },
        });
      });

      logger.info({ msg: 'Payment verified successfully', reference });
      return { 
        success: true, 
        transaction: toTransactionDTO(updatedTransaction)
      };
    } else {
      // Handle failed payment
      const updatedTransaction = await executeWalletOperation(async (tx) => {
        // Revert wallet balance if wallet ID exists
        if (transaction.walletId) {
          await tx.wallet.update({
            where: { id: transaction.walletId },
            data: {
              balance: { decrement: transaction.amount },
            },
          });
        }

        // Update transaction status
        return await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.FAILED,
            gatewayResponse: 'Payment verification failed',
          },
        });
      });

      logger.warn({ msg: 'Payment verification failed', reference });
      throw new PaymentError('Payment verification failed', reference);
    }
  }

  /**
   * Debit wallet
   * Reduces wallet balance and creates a transaction record
   */
  async debitWallet(input: DebitWalletInput): Promise<{ wallet: WalletDTO; transaction: TransactionDTO }> {
    logger.info({ msg: 'Debiting wallet', userId: input.userId, amount: input.amount });

    const result = await executeWalletOperation(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: input.userId },
      });

      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);

      if (balanceBefore < input.amount) {
        throw new ValidationError('Insufficient wallet balance');
      }

      const balanceAfter = balanceBefore - input.amount;

      const updatedWallet = await tx.wallet.update({
        where: { userId: input.userId },
        data: {
          balance: { decrement: input.amount },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          transactionReference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: input.userId,
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          amount: input.amount,
          balanceBefore,
          balanceAfter,
          description: input.description,
          category: input.category,
          status: TransactionStatus.COMPLETED,
          transactionDate: new Date(),
        },
      });

      return {
        wallet: toWalletDTO(updatedWallet),
        transaction: toTransactionDTO(transaction)
      };
    });

    logger.info({ msg: 'Wallet debited successfully', userId: input.userId });
    return result;
  }

  /**
   * Get wallet transactions
   * Returns paginated list of transactions for a user
   */
  async getTransactions(userId: string, pagination: PaginationParams): Promise<{ transactions: TransactionDTO[]; total: number; page: number; limit: number }> {
    logger.info({ msg: 'Getting wallet transactions', userId });

    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    const { transactions, total } = await this.transactionRepository.findByWalletId(
      wallet.id,
      {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
      }
    );

    return {
      transactions: transactions.map(t => toTransactionDTO(t)),
      total,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
    };
  }
}
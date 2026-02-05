/**
 * Transaction Service
 * Business logic for transaction operations
 * Implements service layer with dependency injection
 */

import { TransactionRepository, ITransactionRepository, TransactionFilters } from '@/src/repositories/TransactionRepository';
import { NotFoundError } from '@/src/types/errors';
import { 
  TransactionDTO, 
  PaginationParams
} from '@/src/types';

/**
 * Transaction Service Interface
 */
export interface ITransactionService {
  getTransactionById(id: string): Promise<TransactionDTO>;
  getTransactionsByUserId(userId: string, filters?: TransactionFilters, pagination?: PaginationParams): Promise<{ transactions: TransactionDTO[]; total: number; page: number; limit: number }>;
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
 * Transaction Service Implementation
 */
export class TransactionService implements ITransactionService {
  private transactionRepository: ITransactionRepository;

  constructor(transactionRepository?: ITransactionRepository) {
    this.transactionRepository = transactionRepository || new TransactionRepository();
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<TransactionDTO> {
    console.log({ msg: 'Getting transaction by ID', transactionId: id });

    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    return toTransactionDTO(transaction);
  }

  /**
   * Get transactions by user ID
   */
  async getTransactionsByUserId(
    userId: string,
    filters?: TransactionFilters,
    pagination?: PaginationParams
  ): Promise<{ transactions: TransactionDTO[]; total: number; page: number; limit: number }> {
    console.log({ msg: 'Getting transactions by user ID', userId, filters });

    const { transactions, total } = await this.transactionRepository.findByUserId(
      userId,
      filters,
      {
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
      }
    );

    return {
      transactions: transactions.map(transaction => toTransactionDTO(transaction)),
      total,
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
    };
  }
}
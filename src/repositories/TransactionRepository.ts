/**
 * Transaction Repository
 * Database layer for Transaction entity operations
 * Implements repository pattern with Prisma and PostgreSQL
 */

import { prisma } from '@/src/database/prisma';
import { Transaction, TransactionType, TransactionStatus } from '@prisma/client';

export interface TransactionFilters {
  userId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Transaction Repository Interface
 */
export interface ITransactionRepository {
  create(data: any): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByReference(reference: string): Promise<Transaction | null>;
  findByUserId(userId: string, filters?: TransactionFilters, pagination?: PaginationOptions): Promise<{ transactions: Transaction[]; total: number }>;
  findByWalletId(walletId: string, pagination?: PaginationOptions): Promise<{ transactions: Transaction[]; total: number }>;
}

/**
 * Transaction Repository Implementation
 */
export class TransactionRepository implements ITransactionRepository {
  /**
   * Create a new transaction
   */
  async create(data: any): Promise<Transaction> {
    return await prisma.transaction.create({
      data,
    });
  }

  /**
   * Find transaction by ID
   */
  async findById(id: string): Promise<Transaction | null> {
    return await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        wallet: true,
        payment: true,
      },
    });
  }

  /**
   * Find transaction by reference
   */
  async findByReference(reference: string): Promise<Transaction | null> {
    return await prisma.transaction.findUnique({
      where: { transactionReference: reference },
    });
  }

  /**
   * Find transactions by user ID with filters and pagination
   */
  async findByUserId(
    userId: string,
    filters?: TransactionFilters,
    pagination?: PaginationOptions
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const where: any = { userId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.transactionDate = {};
      if (filters.startDate) {
        where.transactionDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.transactionDate.lte = filters.endDate;
      }
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transactionDate: 'desc' },
        include: {
          wallet: true,
          payment: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  /**
   * Find transactions by wallet ID with pagination
   */
  async findByWalletId(
    walletId: string,
    pagination?: PaginationOptions
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { walletId },
        skip,
        take: limit,
        orderBy: { transactionDate: 'desc' },
      }),
      prisma.transaction.count({ where: { walletId } }),
    ]);

    return { transactions, total };
  }
}

/**
 * Transaction Controller
 * HTTP request/response handling for transaction endpoints
 * Implements controller layer with proper status codes and response formatting
 */

import { NextResponse } from 'next/server';
import { TransactionService, ITransactionService } from '@/src/services/TransactionService';
import { transactionQuerySchema } from '@/src/validation/schemas';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';
import { AuthUser } from '@/src/middleware/auth';

/**
 * Transaction Controller
 * Handles HTTP layer for transaction operations
 */
export class TransactionController {
  private transactionService: ITransactionService;

  constructor(transactionService?: ITransactionService) {
    this.transactionService = transactionService || new TransactionService();
  }

  /**
   * Get transactions
   * GET /api/transactions
   */
  async getTransactions(req: Request, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Get transactions', userId: user.id });

    const { searchParams } = new URL(req.url);
    const queryParams = transactionQuerySchema.parse({
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    });

    const result = await this.transactionService.getTransactionsByUserId(
      user.id,
      {
        type: queryParams.type,
        status: queryParams.status,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
      },
      {
        page: queryParams.page,
        limit: queryParams.limit,
      }
    );

    const response: ApiResponse = {
      success: true,
      data: {
        transactions: result.transactions.map(t => ({
          id: t.id,
          reference: t.transactionReference,
          date: t.transactionDate.toISOString(),
          description: t.description,
          amount: t.amount,
          type: t.type,
          status: t.status,
          paymentMethod: t.paymentMethod,
          category: t.category,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
          hasNext: result.page * result.limit < result.total,
          hasPrevious: result.page > 1,
        },
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Get transaction by ID
   * GET /api/transactions/:transactionId
   */
  async getTransactionById(_req: Request, transactionId: string, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Get transaction details', transactionId, userId: user.id });

    const transaction = await this.transactionService.getTransactionById(transactionId);

    // Verify transaction belongs to user
    if (transaction.userId !== user.id) {
      console.warn({ msg: 'Unauthorized transaction access attempt', transactionId, userId: user.id });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to access this transaction',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: {
        id: transaction.id,
        reference: transaction.transactionReference,
        date: transaction.transactionDate.toISOString(),
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        category: transaction.category,
        balanceBefore: transaction.balanceBefore,
        balanceAfter: transaction.balanceAfter,
        metadata: transaction.metadata,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }
}
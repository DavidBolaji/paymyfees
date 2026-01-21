/**
 * Wallet Controller
 * HTTP request/response handling for wallet endpoints
 * Implements controller layer with proper status codes and response formatting
 */

import { NextResponse } from 'next/server';
import { WalletService, IWalletService } from '@/src/services/WalletService';
import { fundWalletSchema, paginationSchema } from '@/src/validation/schemas';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';
import { AuthUser } from '@/src/middleware/auth';

/**
 * Wallet Controller
 * Handles HTTP layer for wallet operations
 */
export class WalletController {
  private walletService: IWalletService;

  constructor(walletService?: IWalletService) {
    this.walletService = walletService || new WalletService();
  }

  /**
   * Get wallet balance
   * GET /api/wallet/balance
   */
  async getBalance(req: Request, user: AuthUser): Promise<NextResponse> {
    logger.info({ msg: 'Getting wallet balance', userId: user.id });
    
    const balance = await this.walletService.getBalance(user.id);

    const response: ApiResponse = {
      success: true,
      data: {
        balance,
        currency: 'NGN',
        lastUpdated: new Date().toISOString(),
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Fund wallet
   * POST /api/wallet/fund
   */
  async fundWallet(req: Request, user: AuthUser): Promise<NextResponse> {
    const body = await req.json();
    const validatedData = fundWalletSchema.parse(body);

    // Generate payment reference
    const reference = `PMF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Execute business logic
    const result = await this.walletService.fundWallet({
      userId: user.id,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
      reference,
    });

    logger.info({ msg: 'Wallet funding initiated', userId: user.id, reference });

    const response: ApiResponse = {
      success: true,
      data: {
        transactionId: result.transaction.id,
        amount: validatedData.amount,
        reference,
        newBalance: Number(result.wallet.balance),
        // In production, return payment gateway URL
        paymentUrl: `https://payment-gateway.com/pay/${reference}`,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Verify payment
   * GET /api/wallet/verify/:reference
   */
  async verifyPayment(req: Request, reference: string, user: AuthUser): Promise<NextResponse> {
    logger.info({ msg: 'Verifying payment', reference, userId: user.id });

    const result = await this.walletService.verifyPayment(reference, user.id);

    const response: ApiResponse = {
      success: true,
      data: {
        verified: result.success,
        transactionId: result.transaction?.id,
        status: result.transaction?.status,
        amount: result.transaction?.amount,
        newBalance: result.transaction?.balanceAfter,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Get wallet transactions
   * GET /api/wallet/transactions
   */
  async getWalletTransactions(req: Request, user: AuthUser): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const pagination = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    });

    logger.info({ 
      msg: 'Getting wallet transactions', 
      userId: user.id, 
      page: pagination.page, 
      limit: pagination.limit 
    });

    const result = await this.walletService.getTransactions(
      user.id,
      {
        page: pagination.page,
        limit: pagination.limit,
      }
    );

    const response: ApiResponse = {
      success: true,
      data: {
        transactions: result.transactions.map((t) => ({
          id: t.id,
          date: t.transactionDate.toISOString(),
          description: t.description,
          amount: Number(t.amount),
          type: t.type,
          status: t.status,
          reference: t.transactionReference,
          paymentMethod: t.paymentMethod,
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
}
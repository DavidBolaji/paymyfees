/**
 * Wallet Controller (Updated with Paystack Integration)
 * HTTP request/response handling for wallet endpoints
 */

import { NextResponse } from 'next/server';
import { WalletService, IWalletService } from '@/src/services/WalletService';
import { paginationSchema } from '@/src/validation/schemas';
import { z } from 'zod';
import { ApiResponse } from '@/src/types';
import { AuthUser } from '@/src/middleware/auth';
import { PaymentMethod } from '@prisma/client';
import { IUserService, UserService } from '../services/UserService';

/**
 * Initialize Payment Schema
 */
const initializePaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CARD_PAYMENT', 'USSD_CODE']),
  currency: z.string().optional().default('NGN'),
  note: z.string().optional(),
  callbackUrl: z.string().url().optional(),
});

/**
 * Wallet Controller
 */
export class WalletController {
  private walletService: IWalletService;
  private userService: IUserService

  constructor(walletService?: IWalletService, userService?: IUserService) {
    this.walletService = walletService || new WalletService();
    this.userService = userService || new UserService();
  }

  /**
   * Get wallet balance
   * GET /api/wallet/balance
   */
  async getBalance(_req: Request, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Getting wallet balance', userId: user.id });
    
    const walletDetails = await this.walletService.getWalletDetails(user.id);
    const upcomingRepayment = await this.walletService.getUpcomingRepayment(user.id);
    const fundingHistory = await this.walletService.getFundingHistory(user.id);

    const response: ApiResponse = {
      success: true,
      data: {
        balance: walletDetails.balance,
        currency: walletDetails.currency,
        lastUpdated: new Date().toISOString(),
        autoDebitEnabled: walletDetails.autoDebitEnabled,
        upcomingRepayment,
        fundingHistory,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Initialize payment
   * POST /api/wallet/initialize-payment
   */
  async initializePayment(req: Request, user: AuthUser): Promise<NextResponse> {
    const body = await req.json();
    const validatedData = initializePaymentSchema.parse(body);

    console.log({ 
      msg: 'Initializing payment', 
      userId: user.id, 
      amount: validatedData.amount 
    });

    const card_map: {[key: string]: PaymentMethod} = {
      BANK_TRANSFER: "BANK_TRANSFER",
      CARD_PAYMENT: "CARD",
      USSD_CODE: "USSD",
      WALLET: "WALLET"
    }

    const userEmail = await this.userService.getUserProfile(user.id)

    // Initialize payment with Paystack
    const result = await this.walletService.initializePayment({
      userId: user.id,
      amount: validatedData.amount,
      paymentMethod: card_map[validatedData.paymentMethod] as PaymentMethod,
      currency: validatedData.currency,
      note: validatedData.note,
      userEmail: userEmail.email,
      callbackUrl: validatedData.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/wallet/payment-callback`,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        paymentUrl: result.paymentUrl,
        reference: result.reference,
        accessCode: result.accessCode,
        amount: validatedData.amount,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Verify payment and fund wallet
   * GET /api/wallet/verify-payment/:reference
   */
  async verifyPayment(_req: Request, reference: string, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Verifying payment', reference, userId: user.id });

    const result = await this.walletService.verifyAndFundWallet(reference, user.id);

    const response: ApiResponse = {
      success: true,
      data: {
        verified: true,
        transactionId: result.transaction.id,
        status: result.transaction.status,
        amount: result.transaction.amount,
        newBalance: result.wallet.balance,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Paystack webhook callback
   * POST /api/wallet/webhook
   */
  async handleWebhook(req: Request): Promise<NextResponse> {
    console.log({ msg: 'Received Paystack webhook' });

    try {
      const body = await req.json();
      const signature = req.headers.get('x-paystack-signature');

      // Verify webhook signature
      const secret = process.env.PAYSTACK_SECRET_KEY || '';
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (hash !== signature) {
        console.warn({ msg: 'Invalid webhook signature' });
        return NextResponse.json(
          { success: false, message: 'Invalid signature' },
          { status: 400 }
        );
      }

      // Handle webhook event
      const event = body.event;
      const data = body.data;

      if (event === 'charge.success') {
        const reference = data.reference;
        const userId = data.metadata?.userId;

        if (userId && reference) {
          // Verify and fund wallet
          await this.walletService.verifyAndFundWallet(reference, userId);
          console.log({ msg: 'Webhook processed successfully', reference, userId });
        }
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Webhook processing error:', error);
      return NextResponse.json(
        { success: false, message: 'Webhook processing failed' },
        { status: 500 }
      );
    }
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

    console.log({ 
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

  /**
   * Get wallet chart data
   * GET /api/wallet/chart
   */
  async getWalletChartData(req: Request, user: AuthUser): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '6months';
    
    console.log({ msg: 'Getting wallet chart data', userId: user.id, period });
    
    const chartData = await this.walletService.getWalletChartData(user.id, period);
    
    const response: ApiResponse = {
      success: true,
      data: chartData,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }
}
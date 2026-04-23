/**
 * Wallet Controller (Updated for Embedly Integration)
 * HTTP request/response handling for wallet endpoints
 * Wallet funding is driven by Embedly inflow webhooks only (no checkout flow)
 */

import { NextResponse } from 'next/server';
import { WalletService, IWalletService } from '@/src/services/WalletService';
import { RepaymentService } from '@/src/services/RepaymentService';
import { paginationSchema } from '@/src/validation/schemas';
import { ApiResponse } from '@/src/types';
import { AuthUser } from '@/src/middleware/auth';
import crypto from 'crypto';

/**
 * Wallet Controller
 */
export class WalletController {
  private walletService: IWalletService;
  private repaymentService: RepaymentService;

  constructor(walletService?: IWalletService, repaymentService?: RepaymentService) {
    this.walletService = walletService || new WalletService();
    this.repaymentService = repaymentService || new RepaymentService();
  }

  /**
   * Get wallet balance + virtual account details
   * GET /api/wallet/balance
   */
  async getBalance(req: Request, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Getting wallet balance', userId: user.id });
    
    const url = new URL(req.url);
    const loanId = url.searchParams.get('loanId') || undefined;

    const walletDetails = await this.walletService.getWalletDetails(user.id);
    const upcomingRepayment = await this.walletService.getUpcomingRepayment(user.id, loanId);
    const fundingHistory = await this.walletService.getFundingHistory(user.id);

    const response: ApiResponse = {
      success: true,
      data: {
        balance: walletDetails.balance,
        currency: walletDetails.currency,
        lastUpdated: new Date().toISOString(),
        autoDebitEnabled: walletDetails.autoDebitEnabled,
        virtualAccountNumber: walletDetails.virtualAccountNumber,
        virtualAccountBank: walletDetails.virtualAccountBank,
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
   * Embedly unified webhook handler
   * POST /api/wallet/webhook
   *
   * Handles three event types:
   *   inflow            — user's virtual account received money → credit wallet
   *   payout.success    — repayment transfer confirmed → mark installment PAID
   *   payout.failed     — repayment transfer failed → rollback wallet debit
   */
  async handleWebhook(req: Request): Promise<NextResponse> {
    console.log({ msg: 'Received Embedly webhook' });

    // ── Read raw body (needed for HMAC verification) ───────────────────────────
    let rawBody: string;
    try {
      rawBody = await req.text();
    } catch {
      return NextResponse.json({ success: false, message: 'Cannot read request body' }, { status: 400 });
    }

    // ── Verify HMAC signature ────────────────────────────────────────────
    const webhookSecret = process.env.EMBEDLY_WEBHOOK_SECRET || '';
    const signature = req.headers.get('x-embedly-signature') ?? req.headers.get('x-webhook-signature') ?? '';

    if (webhookSecret) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(signature))) {
        console.warn({ msg: 'Invalid Embedly webhook signature' });
        return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.warn('EMBEDLY_WEBHOOK_SECRET not set — skipping signature verification (unsafe in production)');
    }

    // ── Parse body ──────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
    }

    const eventType: string = (body.event ?? body.eventType ?? body.type ?? '') as string;
    const data = (body.data ?? body) as Record<string, unknown>;

    console.log({ msg: 'Processing Embedly webhook event', eventType });

    try {
      // ── Route by event type ────────────────────────────────────────────
      if (eventType === 'inflow' || eventType === 'wallet.inflow' || eventType === 'credit') {
        await this.handleInflowEvent(data);
      } else if (eventType === 'payout.success' || eventType === 'transfer.success') {
        await this.handlePayoutSuccessEvent(data);
      } else if (eventType === 'payout.failed' || eventType === 'transfer.failed') {
        await this.handlePayoutFailedEvent(data);
      } else {
        // Unknown event — acknowledge silently (Embedly may add new events over time)
        console.log({ msg: 'Unhandled Embedly webhook event type', eventType });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Embedly webhook processing error:', error);
      // Return 200 to prevent Embedly from retrying events that are application-level errors
      // (e.g. wallet not found). Return 500 only for unexpected infra errors.
      const isKnownError = error instanceof Error && (
        error.message.includes('not found') ||
        error.message.includes('Duplicate') ||
        error.message.includes('already')
      );
      return NextResponse.json(
        { success: false, message: 'Webhook processing failed' },
        { status: isKnownError ? 200 : 500 }
      );
    }
  }

  // ── Private webhook event handlers ─────────────────────────────────────

  /** Wallet received money from a bank transfer — credit user's wallet */
  private async handleInflowEvent(data: Record<string, unknown>): Promise<void> {
    const accountNumber = (data.beneficiaryAccountNumber ?? data.accountNumber ?? data.virtualAccountNumber ?? '') as string;
    const amount = Number(data.amount ?? 0);
    const transactionReference = (data.transactionReference ?? data.reference ?? data.sessionId ?? '') as string;
    const narration = (data.narration ?? data.remarks ?? '') as string;
    const occurredAt = (data.transactionDate ?? data.createdAt ?? '') as string;

    if (!accountNumber || !transactionReference || amount <= 0) {
      console.warn({ msg: 'Inflow webhook missing required fields', accountNumber, transactionReference, amount });
      return;
    }

    await this.walletService.handleInflowWebhook({
      accountNumber,
      amount,
      transactionReference,
      narration,
      occurredAt: occurredAt || undefined,
    });
  }

  /** Payout (repayment) confirmed successful — mark installment PAID */
  private async handlePayoutSuccessEvent(data: Record<string, unknown>): Promise<void> {
    const customerTransactionReference = (data.customerTransactionReference ?? data.reference ?? '') as string;
    const gatewayReference = (data.transactionRef ?? data.transactionReference ?? '') as string;
    const amount = Number(data.amount ?? 0);

    if (!customerTransactionReference) {
      console.warn({ msg: 'payout.success webhook missing customerTransactionReference', data });
      return;
    }

    await this.repaymentService.confirmRepaymentSuccess({
      customerTransactionReference,
      gatewayReference,
      status: 'success',
      amount,
    });
  }

  /** Payout (repayment) failed — rollback wallet debit */
  private async handlePayoutFailedEvent(data: Record<string, unknown>): Promise<void> {
    const customerTransactionReference = (data.customerTransactionReference ?? data.reference ?? '') as string;
    const failureReason = (data.failureReason ?? data.responseDescription ?? data.message ?? 'Payout failed') as string;

    if (!customerTransactionReference) {
      console.warn({ msg: 'payout.failed webhook missing customerTransactionReference', data });
      return;
    }

    await this.repaymentService.rollbackRepayment({
      customerTransactionReference,
      status: 'failed',
      failureReason,
    });
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
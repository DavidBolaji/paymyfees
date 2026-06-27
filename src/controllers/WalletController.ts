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
    const requestId = `wh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    console.log({ msg: '[webhook] Received Embedly webhook', requestId });

    // ── Read raw body (needed for HMAC verification) ───────────────────────────
    let rawBody: string;
    try {
      rawBody = await req.text();
    } catch (err) {
      console.error({ msg: '[webhook] Failed to read request body', requestId, error: String(err) });
      return NextResponse.json({ success: false, message: 'Cannot read request body' }, { status: 400 });
    }

    console.log({ msg: '[webhook] Raw body received', requestId, bodyLength: rawBody.length, bodyPreview: rawBody.slice(0, 300) });

    // ── Log all headers to identify the exact signature header name ────────────
    const allHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => { allHeaders[key] = key.toLowerCase().includes('sig') || key.toLowerCase().includes('auth') || key.toLowerCase().includes('hash') ? value : value.slice(0, 30); });
    console.log({ msg: '[webhook] Incoming headers', requestId, headers: allHeaders });

    // ── Verify HMAC signature ────────────────────────────────────────────
    // Embedly signs with: HMAC-SHA512(rawBody, apiKey)
    // Header: x-embedly-signature
    // Secret: the API key (no separate webhook secret)
    const apiKey = process.env.EMBEDLY_API_KEY || '';
    const signature = req.headers.get('x-embedly-signature') ?? '';

    console.log({
      msg: '[webhook] Signature check',
      requestId,
      hasApiKey: !!apiKey,
      signatureHeader: signature ? `${signature.slice(0, 8)}…` : '(none)',
      signatureLength: signature.length,
    });

    const skipSigVerification = process.env.EMBEDLY_SKIP_SIG_VERIFICATION === 'true';

    if (skipSigVerification) {
      console.warn({ msg: '[webhook] Signature verification SKIPPED (EMBEDLY_SKIP_SIG_VERIFICATION=true) — remove before production', requestId });
    } else if (apiKey) {
      const expectedSig = crypto
        .createHmac('sha512', apiKey)
        .update(rawBody, 'utf8')
        .digest('hex');

      console.log({ msg: '[webhook] Computed HMAC', requestId, computedSigPreview: `${expectedSig.slice(0, 16)}…`, computedLength: expectedSig.length });

      const sigValid =
        signature.length === expectedSig.length &&
        crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(signature));

      if (!sigValid) {
        console.warn({
          msg: '[webhook] Invalid HMAC signature — rejecting',
          requestId,
          expectedLength: expectedSig.length,
          receivedLength: signature.length,
        });
        return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
      }

      console.log({ msg: '[webhook] Signature verified OK', requestId });
    } else {
      console.warn({ msg: '[webhook] EMBEDLY_API_KEY not set — skipping signature verification', requestId });
    }

    // ── Parse body ──────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch (err) {
      console.error({ msg: '[webhook] Failed to parse JSON body', requestId, error: String(err), rawBody: rawBody.slice(0, 500) });
      return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
    }

    const eventType: string = (body.event ?? body.eventType ?? body.type ?? '') as string;
    const data = (body.data ?? body) as Record<string, unknown>;

    console.log({
      msg: '[webhook] Routing event',
      requestId,
      eventType,
      dataKeys: Object.keys(data),
      // Log key inflow fields for diagnostics
      accountNumber: data.beneficiaryAccountNumber ?? data.accountNumber ?? data.virtualAccountNumber ?? '(none)',
      amount: data.amount ?? '(none)',
      reference: data.transactionReference ?? data.reference ?? data.sessionId ?? '(none)',
    });

    try {
      // ── Route by event type ────────────────────────────────────────────
      if (eventType === 'inflow' || eventType === 'wallet.inflow' || eventType === 'credit' || eventType === 'nip') {
        console.log({ msg: '[webhook] Handling inflow event', requestId });
        await this.handleInflowEvent(data);
        console.log({ msg: '[webhook] Inflow event processed successfully', requestId });
      } else if (eventType === 'payout.success' || eventType === 'transfer.success') {
        console.log({ msg: '[webhook] Handling payout.success event', requestId });
        await this.handlePayoutSuccessEvent(data);
        console.log({ msg: '[webhook] Payout success event processed', requestId });
      } else if (eventType === 'payout.failed' || eventType === 'transfer.failed') {
        console.log({ msg: '[webhook] Handling payout.failed event', requestId });
        await this.handlePayoutFailedEvent(data);
        console.log({ msg: '[webhook] Payout failed event processed', requestId });
      } else {
        console.warn({ msg: '[webhook] Unhandled event type — acknowledging silently', requestId, eventType, fullBody: body });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      // Known application-level errors (wallet not found, duplicates) — return 200 so Embedly
      // does not retry. These require manual investigation, not automatic retry.
      const isKnownError =
        errorMsg.includes('not found') ||
        errorMsg.includes('Duplicate') ||
        errorMsg.includes('already') ||
        errorMsg.includes('Invalid inflow amount');

      console.error({
        msg: '[webhook] Event processing failed',
        requestId,
        eventType,
        isKnownError,
        error: errorMsg,
        stack: errorStack,
        data,
      });

      return NextResponse.json(
        { success: false, message: 'Webhook processing failed', error: errorMsg },
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
/**
 * Embedly Payout Service
 * Handles inter-bank transfers (loan repayments) and related operations
 * Base URL: https://payout-{env}.embedly.ng
 * Auth: x-api-key header
 * Amount unit: NGN (NOT kobo)
 * Transfers are ASYNC — completion confirmed via webhook
 */

import { ExternalServiceError } from '@/src/types/errors';

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface InterBankTransferInput {
  destinationBankCode: string;
  destinationAccountNumber: string;
  destinationAccountName: string;
  sourceAccountNumber: string;
  sourceAccountName: string;
  remarks: string;
  amount: number; // NGN
  customerTransactionReference: string; // unique per transfer, e.g. "RPY-{timestamp}-{random}"
  /** Staging only: force outcome for testing */
  stagingStatus?: 'success' | 'failed';
}

export interface InterBankTransferResult {
  /** Embedly's transaction ID (store as gatewayReference) */
  transactionRef: string;
  message: string;
}

export interface PayoutStatusResult {
  status: 'success' | 'pending' | 'failed' | 'unknown';
  amount?: number;
  transactionRef?: string;
  message?: string;
}

export interface BankListEntry {
  bankCode: string;
  bankName: string;
  nipCode?: string;
}

export interface NameEnquiryResult {
  accountNumber: string;
  accountName: string;
  destinationBankCode: string;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IEmbedlyPayoutService {
  interBankTransfer(input: InterBankTransferInput): Promise<InterBankTransferResult>;
  getTransferStatus(customerTransactionReference: string): Promise<PayoutStatusResult>;
  getBanks(): Promise<BankListEntry[]>;
  nameEnquiry(bankCode: string, accountNumber: string): Promise<NameEnquiryResult>;
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class EmbedlyPayoutService implements IEmbedlyPayoutService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly ngn_currency_id: string;
  private readonly isStaging: boolean;

  constructor() {
    this.isStaging = process.env.EMBEDLY_ENV !== 'production';
    const env = this.isStaging ? 'staging' : 'prod';
    this.baseUrl = `https://payout-${env}.embedly.ng`;
    this.apiKey = process.env.EMBEDLY_API_KEY || '';
    this.ngn_currency_id =
      process.env.EMBEDLY_NGN_CURRENCY_ID || 'fd5e474d-bb42-4db1-ab74-e8d2a01047e9';

    if (!this.apiKey) {
      console.warn('⚠️  EMBEDLY_API_KEY is not set in environment variables');
    }
  }

  /**
   * Initiate an inter-bank transfer (ASYNC)
   * Transfer goes from user's Embedly virtual account → paymyfees real bank account
   * Completion confirmed via payout.success / payout.failed webhook
   */
  async interBankTransfer(input: InterBankTransferInput): Promise<InterBankTransferResult> {
    this.assertConfigured();

    console.log({
      msg: 'Initiating inter-bank transfer',
      ref: input.customerTransactionReference,
      amount: input.amount,
      source: input.sourceAccountNumber,
      destination: input.destinationAccountNumber,
    });

    const payload: Record<string, unknown> = {
      destinationBankCode: input.destinationBankCode,
      destinationAccountNumber: input.destinationAccountNumber,
      destinationAccountName: input.destinationAccountName,
      sourceAccountNumber: input.sourceAccountNumber,
      sourceAccountName: input.sourceAccountName,
      remarks: input.remarks,
      amount: input.amount,
      currencyId: this.ngn_currency_id,
      customerTransactionReference: input.customerTransactionReference,
    };

    // Staging helper: allows simulating success/failed outcomes in test environment
    if (this.isStaging && input.stagingStatus) {
      payload.stagingStatus = input.stagingStatus;
    }

    try {
      const data = await this.request<any>('POST', '/api/Payout/inter-bank-transfer', payload);

      if (!data?.succeeded) {
        throw new ExternalServiceError(
          'EmbedlyPayout',
          `Transfer rejected: ${data?.message ?? 'Unknown error'}`
        );
      }

      // `data.data` is the transaction ref from Embedly
      const transactionRef: string = data.data ?? data.transactionReference ?? '';
      if (!transactionRef) {
        throw new ExternalServiceError('EmbedlyPayout', 'Transfer response missing transactionRef');
      }

      console.log({
        msg: 'Inter-bank transfer initiated',
        transactionRef,
        message: data.message,
      });

      return { transactionRef, message: data.message ?? 'Request is being processed.' };
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      console.error('Embedly inter-bank transfer error:', error);
      throw new ExternalServiceError(
        'EmbedlyPayout',
        `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Re-query transfer status by our own reference
   * Used by the cron job when webhook never arrives (PROCESSING timeout)
   */
  async getTransferStatus(customerTransactionReference: string): Promise<PayoutStatusResult> {
    console.log({ msg: 'Requeryng payout status', ref: customerTransactionReference });

    try {
      const data = await this.request<any>(
        'GET',
        `/api/Payout/requery/${encodeURIComponent(customerTransactionReference)}`
      );

      if (!data?.succeeded) {
        console.warn('Payout requery returned non-success:', data);
        return { status: 'unknown', message: data?.message };
      }

      const statusMap: Record<string, PayoutStatusResult['status']> = {
        success: 'success',
        successful: 'success',
        '00': 'success',
        failed: 'failed',
        fail: 'failed',
        pending: 'pending',
      };

      const rawStatus: string = (data.data?.status ?? '').toLowerCase();
      const status = statusMap[rawStatus] ?? 'unknown';

      return {
        status,
        amount: data.data?.amount,
        transactionRef: data.data?.transactionRef,
        message: data.data?.message ?? data.message,
      };
    } catch (error) {
      console.error('Embedly payout requery error:', error);
      return { status: 'unknown', message: 'Requery failed' };
    }
  }

  /**
   * Get list of supported Nigerian banks and their codes
   */
  async getBanks(): Promise<BankListEntry[]> {
    try {
      const data = await this.request<any>('GET', '/api/Payout/banks');
      const list: any[] = data?.data ?? [];
      return list.map((b) => ({
        bankCode: b.bankCode ?? b.code,
        bankName: b.bankName ?? b.name,
        nipCode: b.nipCode,
      }));
    } catch (error) {
      console.error('Embedly getBanks error:', error);
      throw new ExternalServiceError(
        'EmbedlyPayout',
        `Failed to fetch banks: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Perform name enquiry on a bank account
   * Use before first repayment to confirm PMF_DESTINATION_ACCOUNT_NAME
   */
  async nameEnquiry(bankCode: string, accountNumber: string): Promise<NameEnquiryResult> {
    const data = await this.request<any>('POST', '/api/Payout/name-enquiry', {
      bankCode,
      accountNumber,
    });

    if (!data?.succeeded || !data?.data?.accountName) {
      throw new ExternalServiceError(
        'EmbedlyPayout',
        `Name enquiry failed: ${data?.message ?? 'Unknown error'}`
      );
    }

    return {
      accountNumber: data.data.accountNumber,
      accountName: data.data.accountName,
      destinationBankCode: data.data.destinationBankCode ?? bankCode,
    };
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private assertConfigured(): void {
    if (!this.apiKey) {
      throw new ExternalServiceError(
        'EmbedlyPayout',
        'EMBEDLY_API_KEY must be configured in environment variables'
      );
    }
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const responseText = await response.text();

    let data: T;
    try {
      data = JSON.parse(responseText) as T;
    } catch {
      throw new ExternalServiceError(
        'EmbedlyPayout',
        `Non-JSON response (status ${response.status}): ${responseText.slice(0, 200)}`
      );
    }

    if (!response.ok) {
      const msg = (data as any)?.message ?? `HTTP ${response.status}`;
      console.error('Embedly Payout API error:', { status: response.status, path, msg });
      throw new ExternalServiceError('EmbedlyPayout', msg);
    }

    return data;
  }
}

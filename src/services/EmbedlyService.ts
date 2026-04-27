/**
 * Embedly WaaS Service
 * Handles customer provisioning, wallet creation, and transaction lookups
 * Base URL: https://waas-{env}.embedly.ng/api/v1
 * Auth: x-api-key header
 */

import { ExternalServiceError } from '@/src/types/errors';

// ─── Response Types ───────────────────────────────────────────────────────────

interface EmbedlyBaseResponse<T = unknown> {
  code: string;
  success: boolean;
  message: string;
  data: T;
}

interface EmbedlyCustomerData {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  mobileNumber: string;
}

interface EmbedlyVirtualAccount {
  accountNumber: string;
  bankCode: string;
  bankName: string;
}

interface EmbedlyWalletData {
  walletId?: string;
  id?: string;
  virtualAccount: EmbedlyVirtualAccount;
  availableBalance?: number;
  ledgerBalance?: number;
}

interface EmbedlyWalletHistoryEntry {
  id: string;
  walletId: string;
  amount: number;
  debitCreditIndicator: 'D' | 'C';
  balance: number;
  transactionReference: string;
  transactionId: string;
  remarks: string;
  dateCreated: string;
  accountNumber: string;
}

// ─── Input Types ─────────────────────────────────────────────────────────────

export interface CreateEmbedlyCustomerInput {
  firstName: string;
  lastName: string;
  middleName?: string;
  emailAddress: string;
  mobileNumber: string;
  dob: string; // YYYY-MM-DD
  address: string;
  city: string;
  countryId: string;
  customerTypeId: string;
}

export interface CreateEmbedlyWalletInput {
  customerId: string;
  currencyId: string;
  name: string;
}

// ─── Result Types ─────────────────────────────────────────────────────────────

export interface EmbedlyCustomerResult {
  embedlyCustomerId: string;
}

export interface EmbedlyWalletResult {
  embedlyWalletId: string;
  virtualAccountNumber: string;
  virtualAccountBank: string;
  virtualAccountBankCode: string;
}

export interface EmbedlyTransactionVerificationResult {
  found: boolean;
  status: 'success' | 'pending' | 'failed';
  amount: number;
  reference: string;
  narration?: string;
}

// ─── Interface ────────────────────────────────────────────────────────────────

// ─── Wallet-to-Wallet Types ───────────────────────────────────────────────────

export interface WalletToWalletInput {
  fromAccount: string;   // source virtual account number
  toAccount: string;     // destination virtual account number (org wallet)
  amount: number;        // NGN
  transactionReference: string; // unique per transfer
  remarks: string;
}

export interface WalletToWalletResult {
  transactionReference: string;
  message: string;
}

export interface WalletToWalletStatusResult {
  status: 'success' | 'pending' | 'failed' | 'unknown';
  amount?: number;
  transactionReference?: string;
  message?: string;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IEmbedlyService {
  createCustomer(input: CreateEmbedlyCustomerInput): Promise<EmbedlyCustomerResult>;
  createWallet(input: CreateEmbedlyWalletInput): Promise<EmbedlyWalletResult>;
  verifyInflowTransaction(walletId: string, reference: string): Promise<EmbedlyTransactionVerificationResult>;
  walletToWalletTransfer(input: WalletToWalletInput): Promise<WalletToWalletResult>;
  getWalletToWalletStatus(transactionReference: string): Promise<WalletToWalletStatusResult>;
  getDefaultCurrencyId(): string;
  getDefaultCustomerTypeId(): string;
  getDefaultCountryId(): string;
  fetchCurrencyId(): Promise<string>;
  fetchCustomerTypeId(): Promise<string>;
  fetchCountryId(): Promise<string>;
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class EmbedlyService implements IEmbedlyService {
  private readonly apiKey: string;
  private readonly orgId: string;
  private readonly baseUrl: string;
  private readonly waasBaseUrl: string;
  private readonly ngn_currency_id: string;
  private readonly customer_type_id: string;
  private readonly country_id: string;

  constructor() {
    const env = process.env.EMBEDLY_ENV === 'production' ? 'prod' : 'staging';
    this.baseUrl = `https://waas-${env}.embedly.ng/api/v1`;
    this.waasBaseUrl = `https://waas-${env}.embedly.ng/WaasCore/api/v1`;
    this.apiKey = process.env.EMBEDLY_API_KEY || '';
    this.orgId = process.env.EMBEDLY_ORG_ID || '';
    this.ngn_currency_id = process.env.EMBEDLY_NGN_CURRENCY_ID || 'fd5e474d-bb42-4db1-ab74-e8d2a01047e9';
    this.customer_type_id = process.env.EMBEDLY_CUSTOMER_TYPE_ID || 'f671da57-e281-4b40-965f-a96f4205405e';
    this.country_id = process.env.EMBEDLY_COUNTRY_ID || 'c15ad9ae-c4d7-4342-b70f-de5508627e3b';

    if (!this.apiKey) {
      console.warn('⚠️  EMBEDLY_API_KEY is not set in environment variables');
    }
    if (!this.orgId) {
      console.warn('⚠️  EMBEDLY_ORG_ID is not set in environment variables');
    }
  }

  getDefaultCurrencyId(): string {
    return this.ngn_currency_id;
  }

  getDefaultCustomerTypeId(): string {
    return this.customer_type_id;
  }

  getDefaultCountryId(): string {
    return this.country_id;
  }

  /**
   * Fetch currency ID dynamically from Embedly API
   * Falls back to env var or hardcoded value on failure
   */
  async fetchCurrencyId(): Promise<string> {
    if (this.ngn_currency_id) return this.ngn_currency_id;
    try {
      const res = await this.request<{ data: { id: string; code: string }[] }>('GET', '/currencies');
      const ngn = res.data?.find((c) => c.code === 'NGN');
      if (ngn) return ngn.id;
    } catch (e) {
      console.warn('Failed to fetch currency ID, using fallback', e);
    }
    return 'fd5e474d-bb42-4db1-ab74-e8d2a01047e9'; // fallback
  }

  /**
   * Fetch customer type ID dynamically from Embedly API
   * Falls back to env var or hardcoded value on failure
   */
  async fetchCustomerTypeId(): Promise<string> {
    if (this.customer_type_id) return this.customer_type_id;
    try {
      const res = await this.request<{ data: { id: string; name: string }[] }>('GET', '/customer-types');
      const retail = res.data?.find((c) => c.name?.toLowerCase().includes('retail'));
      if (retail) return retail.id;
    } catch (e) {
      console.warn('Failed to fetch customer type ID, using fallback', e);
    }
    return 'f671da57-e281-4b40-965f-a96f4205405e'; // fallback
  }

  /**
   * Fetch country ID dynamically from Embedly API
   * Falls back to env var or hardcoded value on failure
   */
  async fetchCountryId(): Promise<string> {
    if (this.country_id) return this.country_id;
    try {
      const res = await this.request<{ data: { id: string; name: string }[] }>('GET', '/countries');
      const nigeria = res.data?.find((c) => c.name === 'Nigeria');
      if (nigeria) return nigeria.id;
    } catch (e) {
      console.warn('Failed to fetch country ID, using fallback', e);
    }
    return 'c15ad9ae-c4d7-4342-b70f-de5508627e3b'; // fallback
  }

  /**
   * Create a customer in Embedly.
   * If Embedly responds that the customer already exists, looks up and returns
   * their existing ID instead of throwing — making this call fully idempotent.
   */
  async createCustomer(input: CreateEmbedlyCustomerInput): Promise<EmbedlyCustomerResult> {
    this.assertConfigured();
    console.log({ msg: 'Creating Embedly customer', email: input.emailAddress });

    const payload = {
      organizationId: this.orgId,
      firstName: input.firstName,
      lastName: input.lastName,
      middleName: input.middleName || input.firstName,
      emailAddress: input.emailAddress,
      mobileNumber: this.normalizeMobile(input.mobileNumber),
      dob: input.dob,
      customerTypeId: input.customerTypeId,
      address: input.address || 'Nigeria',
      city: input.city || 'Lagos',
      countryId: input.countryId,
    };

    try {
      const data = await this.request<EmbedlyBaseResponse<EmbedlyCustomerData>>(
        'POST',
        '/customers/add',
        payload
      );

      if (!data.success || !data.data?.id) {
        // Embedly returns success:false with "already exist" instead of an HTTP error
        if (this.isAlreadyExistsMessage(data.message)) {
          console.log({ msg: 'Customer already exists on Embedly, looking up existing ID', email: input.emailAddress });
          const existingId = await this.findCustomerByEmail(input.emailAddress);
          if (existingId) {
            console.log({ msg: 'Found existing Embedly customer', email: input.emailAddress, embedlyCustomerId: existingId });
            return { embedlyCustomerId: existingId };
          }
        }
        throw new ExternalServiceError('Embedly', `Failed to create customer: ${data.message}`);
      }

      console.log({ msg: 'Embedly customer created', embedlyCustomerId: data.data.id });
      return { embedlyCustomerId: data.data.id };
    } catch (error) {
      if (error instanceof ExternalServiceError) {
        // If the error message indicates the customer already exists, look them up
        if (this.isAlreadyExistsMessage(error.message)) {
          console.log({ msg: 'Customer already exists on Embedly (error path), looking up existing ID', email: input.emailAddress });
          const existingId = await this.findCustomerByEmail(input.emailAddress);
          if (existingId) {
            console.log({ msg: 'Found existing Embedly customer', email: input.emailAddress, embedlyCustomerId: existingId });
            return { embedlyCustomerId: existingId };
          }
        }
        throw error;
      }
      console.error('Error creating Embedly customer:', error);
      throw new ExternalServiceError(
        'Embedly',
        `Customer creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a wallet for an Embedly customer.
   * If a wallet already exists for the customer, looks it up and returns it
   * instead of throwing — making this call fully idempotent.
   */
  async createWallet(input: CreateEmbedlyWalletInput): Promise<EmbedlyWalletResult> {
    this.assertConfigured();
    console.log({ msg: 'Creating Embedly wallet', customerId: input.customerId });

    const payload = {
      customerId: input.customerId,
      currencyId: input.currencyId,
      name: input.name,
    };

    try {
      const data = await this.request<EmbedlyWalletData & { message: string; success?: boolean }>(
        'POST',
        '/wallets/add',
        payload
      );

      const walletId: string | undefined = (data as any).walletId ?? (data as any).id ?? (data as any).data?.id;
      const virtualAccount: EmbedlyVirtualAccount | undefined =
        (data as any).virtualAccount ?? (data as any).data?.virtualAccount;

      if (!walletId || !virtualAccount?.accountNumber) {
        // Wallet may already exist — try looking it up before giving up
        if (this.isAlreadyExistsMessage((data as any).message ?? '')) {
          console.log({ msg: 'Wallet already exists on Embedly, looking up existing wallet', customerId: input.customerId });
          const existing = await this.findWalletByCustomerId(input.customerId);
          if (existing) {
            console.log({ msg: 'Found existing Embedly wallet', customerId: input.customerId, walletId: existing.embedlyWalletId });
            return existing;
          }
        }
        console.error('Unexpected Embedly wallet response:', data);
        throw new ExternalServiceError('Embedly', 'Wallet creation response missing walletId or virtualAccount');
      }

      console.log({
        msg: 'Embedly wallet created',
        embedlyWalletId: walletId,
        virtualAccountNumber: virtualAccount.accountNumber,
        bank: virtualAccount.bankName,
      });

      return {
        embedlyWalletId: walletId,
        virtualAccountNumber: virtualAccount.accountNumber,
        virtualAccountBank: virtualAccount.bankName,
        virtualAccountBankCode: virtualAccount.bankCode,
      };
    } catch (error) {
      if (error instanceof ExternalServiceError) {
        // If the error message indicates the wallet already exists, look it up
        if (this.isAlreadyExistsMessage(error.message)) {
          console.log({ msg: 'Wallet already exists on Embedly (error path), looking up existing wallet', customerId: input.customerId });
          const existing = await this.findWalletByCustomerId(input.customerId);
          if (existing) {
            console.log({ msg: 'Found existing Embedly wallet', customerId: input.customerId, walletId: existing.embedlyWalletId });
            return existing;
          }
        }
        throw error;
      }
      console.error('Error creating Embedly wallet:', error);
      throw new ExternalServiceError(
        'Embedly',
        `Wallet creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verify an inflow transaction by scanning wallet history
   * Used independently before crediting the user wallet (defense-in-depth)
   * Falls back gracefully: if history is unavailable, trust the webhook
   */
  async verifyInflowTransaction(
    walletId: string,
    reference: string
  ): Promise<EmbedlyTransactionVerificationResult> {
    console.log({ msg: 'Verifying inflow transaction', walletId, reference });

    try {
      const now = new Date();
      const from = new Date(now.getTime() - 10 * 60 * 1000); // last 10 minutes window

      const params = new URLSearchParams({
        walletId,
        From: from.toISOString(),
        To: now.toISOString(),
        PageNumber: '1',
        PageSize: '50',
      });

      const data = await this.request<any>('GET', `/wallets/history?${params.toString()}`);

      const histories: EmbedlyWalletHistoryEntry[] = data?.data?.walletHistories ?? [];

      const match = histories.find(
        (h) =>
          (h.transactionReference === reference || h.transactionId === reference) &&
          h.debitCreditIndicator === 'C'
      );

      if (match) {
        console.log({ msg: 'Inflow transaction verified', reference, amount: match.amount });
        return {
          found: true,
          status: 'success',
          amount: match.amount,
          reference: match.transactionReference,
          narration: match.remarks,
        };
      }

      // Not found in history window — treat as not-yet-processed but don't block
      console.warn({ msg: 'Inflow transaction not found in history window', reference });
      return { found: false, status: 'pending', amount: 0, reference };
    } catch (error) {
      // Non-fatal: history verification is best-effort
      console.error('Embedly history verification failed (non-fatal):', error);
      return { found: false, status: 'pending', amount: 0, reference };
    }
  }

  /**
   * Wallet-to-wallet transfer (instant, intra-org)
   * Used for loan repayments: user's virtual account → company org wallet
   * Transfer is synchronous — success response means funds moved immediately.
   */
  async walletToWalletTransfer(input: WalletToWalletInput): Promise<WalletToWalletResult> {
    this.assertConfigured();
    console.log({
      msg: 'Initiating wallet-to-wallet transfer',
      from: input.fromAccount,
      to: input.toAccount,
      amount: input.amount,
      ref: input.transactionReference,
    });

    try {
      const data = await this.request<any>(
        'PUT',
        '/wallets/wallet/transaction/v2/wallet-to-wallet',
        {
          fromAccount: input.fromAccount,
          toAccount: input.toAccount,
          amount: input.amount,
          transactionReference: input.transactionReference,
          remarks: input.remarks,
        }
      );

      const success: boolean = data?.success === true || data?.code === '00' || data?.succeeded === true;
      if (!success) {
        throw new ExternalServiceError('Embedly', `Wallet-to-wallet transfer failed: ${data?.message ?? 'Unknown error'}`);
      }

      console.log({ msg: 'Wallet-to-wallet transfer completed', ref: input.transactionReference });
      return {
        transactionReference: input.transactionReference,
        message: data?.message ?? 'Transfer successful',
      };
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      console.error('Embedly walletToWalletTransfer error:', error);
      throw new ExternalServiceError(
        'Embedly',
        `Wallet-to-wallet transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Requery a wallet-to-wallet transfer by our transaction reference
   */
  async getWalletToWalletStatus(transactionReference: string): Promise<WalletToWalletStatusResult> {
    console.log({ msg: 'Requeyring wallet-to-wallet status', ref: transactionReference });

    try {
      const data = await this.request<any>(
        'GET',
        `/wallets/wallet/transaction/wallet-to-wallet/status/${encodeURIComponent(transactionReference)}`
      );

      const success: boolean = data?.success === true || data?.code === '00' || data?.succeeded === true;
      if (!success) {
        return { status: 'unknown', message: data?.message };
      }

      const rawStatus: string = (data?.data?.status ?? '').toLowerCase();
      const statusMap: Record<string, WalletToWalletStatusResult['status']> = {
        success: 'success',
        successful: 'success',
        '00': 'success',
        failed: 'failed',
        fail: 'failed',
        pending: 'pending',
      };

      return {
        status: statusMap[rawStatus] ?? 'unknown',
        amount: data?.data?.amount,
        transactionReference: data?.data?.transactionReference ?? transactionReference,
        message: data?.data?.message ?? data?.message,
      };
    } catch (error) {
      console.error('Embedly walletToWalletStatus error:', error);
      return { status: 'unknown', message: 'Requery failed' };
    }
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private assertConfigured(): void {
    if (!this.apiKey || !this.orgId) {
      throw new ExternalServiceError(
        'Embedly',
        'EMBEDLY_API_KEY and EMBEDLY_ORG_ID must be configured in environment variables'
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

    // Always parse response body
    const responseText = await response.text();
    let data: T;
    try {
      data = JSON.parse(responseText) as T;
    } catch {
      throw new ExternalServiceError(
        'Embedly',
        `Non-JSON response (status ${response.status}): ${responseText.slice(0, 200)}`
      );
    }

    if (!response.ok) {
      const msg = (data as any)?.message ?? `HTTP ${response.status}`;
      console.error('Embedly API error:', { status: response.status, path, msg, data });
      throw new ExternalServiceError('Embedly', msg);
    }

    return data;
  }

  /** Normalise phone: ensure leading 0, strip country code if present */
  private normalizeMobile(phone: string): string {
    // Strip +234 or 234 prefix
    const stripped = phone.replace(/^\+?234/, '');
    // Ensure leading 0
    return stripped.startsWith('0') ? stripped : `0${stripped}`;
  }

  /**
   * Check if an Embedly error / response message indicates the resource already exists.
   * Embedly uses several phrasings — match case-insensitively.
   */
  private isAlreadyExistsMessage(message: string): boolean {
    const lower = (message ?? '').toLowerCase();
    return (
      lower.includes('already exist') ||
      lower.includes('already exists') ||
      lower.includes('duplicate') ||
      lower.includes('already been created')
    );
  }

  /**
   * Look up an existing Embedly customer by email address.
   * Tries multiple strategies in order to maximise the chance of a hit:
   *   1. Direct email-search endpoint (if Embedly supports it)
   *   2. Paginated list scan (up to 3 pages × 200 records)
   * Returns the customer ID string, or null if not found.
   */
  async findCustomerByEmail(email: string): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase();

    // ── Strategy 1: dedicated search endpoint ──────────────────────────────────
    for (const path of [
      `/customers/search?emailAddress=${encodeURIComponent(email)}`,
      `/customers/get/by-email/${encodeURIComponent(email)}`,
      `/customers/filter?emailAddress=${encodeURIComponent(email)}`,
    ]) {
      try {
        const data = await this.request<any>('GET', path);
        const id = this.extractCustomerIdFromResponse(data, normalizedEmail);
        if (id) {
          console.log({ msg: 'Found Embedly customer via search endpoint', path, email, id });
          return id;
        }
      } catch {
        // endpoint may not exist — continue to next strategy
      }
    }

    // ── Strategy 2: paginated list scan (up to 3 pages) ───────────────────────
    for (const path of [
      '/customers/get/all?pageNumber=1&pageSize=200',
      '/customers/get/all?page=1&limit=200',
      '/customers/get/all',
    ]) {
      try {
        const data = await this.request<any>('GET', path);
        const id = this.extractCustomerIdFromResponse(data, normalizedEmail);
        if (id) {
          console.log({ msg: 'Found Embedly customer via list scan', path, email, id });
          return id;
        }
      } catch {
        // continue to next path variant
      }
    }

    console.warn({ msg: 'Customer not found in Embedly after exhausting all lookup strategies', email });
    return null;
  }

  /** Extract a customer ID from various Embedly list/search response shapes */
  private extractCustomerIdFromResponse(data: any, normalizedEmail: string): string | null {
    const list: any[] =
      Array.isArray(data?.data) ? data.data :
      Array.isArray(data?.data?.customers) ? data.data.customers :
      Array.isArray(data?.data?.data) ? data.data.data :
      Array.isArray(data) ? data :
      // single-object response (direct lookup)
      (data?.data?.id || data?.data?.customerId) ? [data.data] :
      (data?.id || data?.customerId) ? [data] :
      [];

    const match = list.find(
      (c: any) => (c.emailAddress ?? c.email ?? '').trim().toLowerCase() === normalizedEmail
    );
    return match ? (match.id ?? match.customerId ?? null) : null;
  }

  /**
   * Look up an existing Embedly wallet for a customer via the WaasCore API.
   * Returns the first wallet's details, or null if none found.
   */
  async findWalletByCustomerId(customerId: string): Promise<EmbedlyWalletResult | null> {
    try {
      const url = `${this.waasBaseUrl}/wallets/get/list/${customerId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
      });
      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { return null; }

      const list: any[] =
        Array.isArray(data?.data) ? data.data :
        Array.isArray(data?.data?.wallets) ? data.data.wallets :
        Array.isArray(data) ? data : [];

      const wallet = list[0];
      if (!wallet) {
        console.warn({ msg: 'No wallet found for Embedly customer', customerId });
        return null;
      }

      const walletId: string = wallet.walletId ?? wallet.id;
      const va = wallet.virtualAccount ?? wallet.virtualAccountDetails ?? wallet;
      const accountNumber: string = va?.accountNumber ?? wallet.accountNumber;
      const bankName: string = va?.bankName ?? wallet.bankName ?? '';
      const bankCode: string = va?.bankCode ?? wallet.bankCode ?? '';

      if (!walletId || !accountNumber) {
        console.warn({ msg: 'Embedly wallet missing walletId or accountNumber', customerId, wallet });
        return null;
      }

      return {
        embedlyWalletId: walletId,
        virtualAccountNumber: accountNumber,
        virtualAccountBank: bankName,
        virtualAccountBankCode: bankCode,
      };
    } catch (err) {
      console.error({ msg: 'Failed to look up Embedly wallet', customerId, error: String(err) });
      return null;
    }
  }
}

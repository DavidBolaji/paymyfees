/**
 * Embedly Cards (Card Middleware) Service
 * Handles card tokenization and card charging
 * Base URL: https://waas-card-middleware-api-{env}.embedly.ng
 * Auth: x-api-key header
 * Amount unit: NGN (NOT kobo)
 */

import { ExternalServiceError, PaymentError } from '@/src/types/errors';

// ─── Response / Request Types ─────────────────────────────────────────────────

export interface EmbedlyTokenizeCardInput {
  userId: string;
  userEmail: string;
  /** NGN amount for card verification (small, e.g. 50) */
  amount: number;
  redirectUrl: string;
  reference: string;
}

export interface EmbedlyTokenizeCardResult {
  /** URL to redirect user to for card entry */
  paymentUrl: string;
  reference: string;
}

export interface EmbedlyChargeCardInput {
  /** Token / authorization code returned from tokenization */
  cardToken: string;
  userEmail: string;
  amount: number; // NGN
  reference: string;
  currency?: string;
  metadata?: Record<string, unknown>;
}

export interface EmbedlyChargeCardResult {
  success: boolean;
  reference: string;
  transactionId?: string;
  message: string;
}

// Card details returned after tokenization verification
export interface EmbedlyCardDetails {
  cardToken: string;
  cardType: string;
  last4: string;
  expMonth: string;
  expYear: string;
  bank?: string;
  brand: string;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IEmbedlyCardsService {
  tokenizeCard(input: EmbedlyTokenizeCardInput): Promise<EmbedlyTokenizeCardResult>;
  chargeCard(input: EmbedlyChargeCardInput): Promise<EmbedlyChargeCardResult>;
  verifyCardTokenization(reference: string): Promise<EmbedlyCardDetails | null>;
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class EmbedlyCardsService implements IEmbedlyCardsService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    const env = process.env.EMBEDLY_ENV === 'production' ? 'prod' : 'staging';
    // Override via EMBEDLY_CARDS_BASE_URL env var if the guessed URL is wrong
    this.baseUrl = process.env.EMBEDLY_CARDS_BASE_URL || `https://waas-card-middleware-api-${env}.embedly.ng`;
    this.apiKey = process.env.EMBEDLY_API_KEY || '';

    console.log({ msg: 'EmbedlyCardsService init', baseUrl: this.baseUrl });

    if (!this.apiKey) {
      console.warn('⚠️  EMBEDLY_API_KEY is not set for EmbedlyCardsService');
    }
  }

  /**
   * Initiate card tokenization
   * Redirects user to a hosted card entry form.
   * On completion, Embedly calls the redirectUrl with the card token.
   */
  async tokenizeCard(input: EmbedlyTokenizeCardInput): Promise<EmbedlyTokenizeCardResult> {
    this.assertConfigured();
    console.log({ msg: 'Tokenizing card', userId: input.userId, reference: input.reference });

    const payload = {
      email: input.userEmail,
      amount: input.amount,
      reference: input.reference,
      callbackUrl: input.redirectUrl,
      metadata: {
        userId: input.userId,
        purpose: 'card_tokenization',
      },
    };

    try {
      const data = await this.request<any>('POST', '/cards/tokenize', payload);

      const paymentUrl: string = data?.data?.authorizationUrl ?? data?.authorizationUrl ?? data?.paymentUrl;
      if (!paymentUrl) {
        console.error('Unexpected tokenize response:', data);
        throw new ExternalServiceError('EmbedlyCards', 'Tokenize response missing payment URL');
      }

      return { paymentUrl, reference: input.reference };
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      console.error('Embedly tokenizeCard error:', error);
      throw new ExternalServiceError(
        'EmbedlyCards',
        `Card tokenization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Charge a previously tokenized card
   * Used for charging saved cards (e.g. wallet top-up)
   */
  async chargeCard(input: EmbedlyChargeCardInput): Promise<EmbedlyChargeCardResult> {
    this.assertConfigured();
    console.log({
      msg: 'Charging tokenized card',
      reference: input.reference,
      amount: input.amount,
    });

    const payload = {
      cardToken: input.cardToken,
      email: input.userEmail,
      amount: input.amount,
      reference: input.reference,
      currency: input.currency || 'NGN',
      metadata: input.metadata ?? {},
    };

    try {
      const data = await this.request<any>('POST', '/cards/charge', payload);

      const success: boolean =
        data?.success === true || data?.status === true || data?.code === '00';

      if (!success) {
        throw new PaymentError(
          `Card charge failed: ${data?.message ?? 'Unknown error'}`,
          input.reference
        );
      }

      console.log({ msg: 'Card charged successfully', reference: input.reference });

      return {
        success: true,
        reference: data?.data?.reference ?? input.reference,
        transactionId: data?.data?.transactionId ?? data?.transactionId,
        message: data?.message ?? 'Charge successful',
      };
    } catch (error) {
      if (error instanceof ExternalServiceError || error instanceof PaymentError) throw error;
      console.error('Embedly chargeCard error:', error);
      throw new PaymentError(
        `Card charge failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        input.reference
      );
    }
  }

  /**
   * Verify a card tokenization transaction by reference
   * Returns card details if tokenization was successful, null otherwise
   */
  async verifyCardTokenization(reference: string): Promise<EmbedlyCardDetails | null> {
    console.log({ msg: 'Verifying card tokenization', reference });

    try {
      const data = await this.request<any>(
        'GET',
        `/cards/verify/${encodeURIComponent(reference)}`
      );

      const success: boolean =
        data?.success === true || data?.status === true || data?.code === '00';

      if (!success) {
        console.warn({ msg: 'Card tokenization not successful', reference, data });
        return null;
      }

      const cardData = data?.data ?? data;
      const cardToken: string = cardData?.cardToken ?? cardData?.token ?? cardData?.authorizationCode;

      if (!cardToken) {
        console.warn({ msg: 'No card token in verification response', reference, cardData });
        return null;
      }

      return {
        cardToken,
        cardType: cardData?.cardType ?? cardData?.card_type ?? 'debit',
        last4: cardData?.last4 ?? cardData?.last_four ?? '',
        expMonth: cardData?.expMonth ?? cardData?.exp_month ?? '',
        expYear: cardData?.expYear ?? cardData?.exp_year ?? '',
        bank: cardData?.bank ?? cardData?.bankName,
        brand: cardData?.brand ?? cardData?.cardBrand ?? 'VISA',
      };
    } catch (error) {
      console.error('Embedly verifyCardTokenization error:', error);
      return null;
    }
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────────

  private assertConfigured(): void {
    if (!this.apiKey) {
      throw new ExternalServiceError(
        'EmbedlyCards',
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
        'EmbedlyCards',
        `Non-JSON response (status ${response.status}): ${responseText.slice(0, 200)}`
      );
    }

    if (!response.ok) {
      const msg = (data as any)?.message ?? `HTTP ${response.status}`;
      console.error('Embedly Cards API error:', { status: response.status, path, msg });
      throw new ExternalServiceError('EmbedlyCards', msg);
    }

    return data;
  }
}

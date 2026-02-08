/**
 * Payment Method Controller
 * HTTP request/response handling for payment method endpoints
 */

import { NextResponse } from 'next/server';
import { PaymentMethodService, IPaymentMethodService } from '@/src/services/PaymentMethodService';
import { ApiResponse } from '@/src/types';
import { AuthUser } from '@/src/middleware/auth';
import { z } from 'zod';
import { IUserService, UserService } from '../services/UserService';

/**
 * Initialize Card Addition Schema
 */
const initializeCardAdditionSchema = z.object({
  amount: z.number().positive().optional().default(50),
});

/**
 * Charge Saved Card Schema
 */
const chargeSavedCardSchema = z.object({
  paymentMethodId: z.string().uuid('Invalid payment method ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().optional().default('NGN'),
  note: z.string().optional(),
});

/**
 * Set Default Schema
 */
const setDefaultSchema = z.object({
  paymentMethodId: z.string().uuid('Invalid payment method ID'),
});

/**
 * Payment Method Controller
 */
export class PaymentMethodController {
  private paymentMethodService: IPaymentMethodService;
  private userService: IUserService;

  constructor(paymentMethodService?: IPaymentMethodService, userService?: IUserService) {
    this.paymentMethodService = paymentMethodService || new PaymentMethodService();
    this.userService = userService || new UserService();
  }

  /**
   * Initialize card addition
   * POST /api/payment-methods/add-card
   */
  async initializeCardAddition(req: Request, user: AuthUser): Promise<NextResponse> {
    const body = await req.json();
    const validatedData = initializeCardAdditionSchema.parse(body);

    console.log({ msg: 'Initializing card addition', userId: user.id });

    // Get user email
    const userProfile = await this.userService.getUserProfile(user.id);

    // Initialize card addition
    const result = await this.paymentMethodService.initializeCardAddition({
      userId: user.id,
      userEmail: userProfile.email,
      amount: validatedData.amount,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        paymentUrl: result.paymentUrl,
        reference: result.reference,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Get all payment methods for the authenticated user
   * GET /api/payment-methods
   */
  async getPaymentMethods(_req: Request, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Getting payment methods', userId: user.id });

    const paymentMethods = await this.paymentMethodService.getUserPaymentMethods(user.id);

    const response: ApiResponse = {
      success: true,
      data: paymentMethods.map((pm) => ({
        id: pm.id,
        cardType: pm.cardType,
        last4: pm.last4,
        expMonth: pm.expMonth,
        expYear: pm.expYear,
        bank: pm.bank,
        brand: pm.brand,
        isDefault: pm.isDefault,
        createdAt: pm.createdAt.toISOString(),
      })),
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Get a specific payment method
   * GET /api/payment-methods/:id
   */
  async getPaymentMethodById(_req: Request, id: string, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Getting payment method by ID', id, userId: user.id });

    const paymentMethod = await this.paymentMethodService.getPaymentMethodById(id, user.id);

    const response: ApiResponse = {
      success: true,
      data: {
        id: paymentMethod.id,
        cardType: paymentMethod.cardType,
        last4: paymentMethod.last4,
        expMonth: paymentMethod.expMonth,
        expYear: paymentMethod.expYear,
        bank: paymentMethod.bank,
        brand: paymentMethod.brand,
        isDefault: paymentMethod.isDefault,
        createdAt: paymentMethod.createdAt.toISOString(),
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Charge a saved card
   * POST /api/payment-methods/charge
   */
  async chargeSavedCard(req: Request, user: AuthUser): Promise<NextResponse> {
    const body = await req.json();
    const validatedData = chargeSavedCardSchema.parse(body);

    console.log({
      msg: 'Charging saved card',
      userId: user.id,
      paymentMethodId: validatedData.paymentMethodId,
      amount: validatedData.amount,
    });

    // Get user email
    const userProfile = await this.userService.getUserProfile(user.id);

    // Charge the saved card
    const result = await this.paymentMethodService.chargeSavedCard({
      userId: user.id,
      paymentMethodId: validatedData.paymentMethodId,
      amount: validatedData.amount,
      userEmail: userProfile.email,
      currency: validatedData.currency,
      note: validatedData.note,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        reference: result.reference,
        amount: result.amount,
        message: 'Payment successful! Your wallet has been funded.',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Set a payment method as default
   * POST /api/payment-methods/set-default
   */
  async setDefaultPaymentMethod(req: Request, user: AuthUser): Promise<NextResponse> {
    const body = await req.json();
    const validatedData = setDefaultSchema.parse(body);

    console.log({
      msg: 'Setting default payment method',
      userId: user.id,
      paymentMethodId: validatedData.paymentMethodId,
    });

    const paymentMethod = await this.paymentMethodService.setDefaultPaymentMethod(
      validatedData.paymentMethodId,
      user.id
    );

    const response: ApiResponse = {
      success: true,
      data: {
        id: paymentMethod.id,
        isDefault: paymentMethod.isDefault,
      },
      message: 'Default payment method updated successfully',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Delete a payment method
   * DELETE /api/payment-methods/:id
   */
  async deletePaymentMethod(_req: Request, id: string, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Deleting payment method', id, userId: user.id });

    await this.paymentMethodService.deletePaymentMethod(id, user.id);

    const response: ApiResponse = {
      success: true,
      message: 'Payment method deleted successfully',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }
}

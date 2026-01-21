/**
 * Payment Controller
 * HTTP request/response handling for payment endpoints
 * Implements controller layer with proper status codes and response formatting
 */

import { NextResponse } from 'next/server';
import { PaymentService, IPaymentService } from '@/src/services/PaymentService';
import { PaymentPlanService, IPaymentPlanService } from '@/src/services/PaymentPlanService';
import { makePaymentSchema } from '@/src/validation/schemas';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';
import { AuthUser } from '@/src/middleware/auth';
import { NotFoundError } from '@/src/types/errors';

/**
 * Payment Controller
 * Handles HTTP layer for payment operations
 */
export class PaymentController {
  private paymentService: IPaymentService;
  private paymentPlanService: IPaymentPlanService;

  constructor(paymentService?: IPaymentService, paymentPlanService?: IPaymentPlanService) {
    this.paymentService = paymentService || new PaymentService();
    this.paymentPlanService = paymentPlanService || new PaymentPlanService();
  }

  /**
   * Make a payment
   * POST /api/payments/make
   */
  async makePayment(req: Request, user: AuthUser): Promise<NextResponse> {
    logger.info({ msg: 'Payment request', userId: user.id });
    
    const body = await req.json();
    const validatedData = makePaymentSchema.parse(body);

    // Execute business logic
    const payment = await this.paymentService.createPayment({
      userId: user.id,
      loanId: validatedData.loanId,
      installmentId: validatedData.installmentNumber ? `installment-${validatedData.installmentNumber}` : undefined,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        paymentId: payment.id,
        loanId: payment.loanId,
        amount: payment.amount,
        status: payment.status,
        paymentDate: payment.paymentDate.toISOString(),
        paymentMethod: payment.paymentMethod,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  }

  /**
   * Get payment receipt
   * GET /api/payments/:paymentId/receipt
   */
  async getReceipt(_req: Request, paymentId: string, user: AuthUser): Promise<NextResponse> {
    logger.info({ msg: 'Get payment receipt', paymentId, userId: user.id });

    const result = await this.paymentService.generateReceipt(paymentId);

    // Verify payment belongs to user
    if (result.payment.userId !== user.id) {
      logger.warn({ msg: 'Unauthorized payment receipt access attempt', paymentId, userId: user.id });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to access this payment receipt',
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
        receiptUrl: result.receiptUrl,
        payment: {
          id: result.payment.id,
          loanId: result.payment.loanId,
          amount: result.payment.amount,
          paymentDate: result.payment.paymentDate.toISOString(),
          paymentMethod: result.payment.paymentMethod,
          status: result.payment.status,
        },
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Get payment plan for the current user
   * GET /api/payment-plan
   */
  async getPaymentPlan(_req: Request, userId: string): Promise<NextResponse> {
    logger.info({ msg: 'Get payment plan', userId });

    try {
      // Get payment plan from service
      const paymentPlan = await this.paymentPlanService.getPaymentPlanByUserId(userId);

      const response: ApiResponse = {
        success: true,
        data: paymentPlan,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'No active payment plan found',
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: 404 }
        );
      }

      // Re-throw other errors to be handled by error middleware
      throw error;
    }
  }
}
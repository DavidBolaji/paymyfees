/**
 * Repayment Controller (FIXED)
 * HTTP request/response handling for repayment endpoints
 */

import { NextResponse } from 'next/server';
import { RepaymentService, IRepaymentService } from '@/src/services/RepaymentService';
import { z } from 'zod';
import { ApiResponse } from '@/src/types';
import { AuthUser } from '@/src/middleware/auth';

/**
 * Make Repayment Schema (simplified - no amount field)
 */
const makeRepaymentSchema = z.object({
  installmentId: z.string().uuid('Invalid installment ID'),
});

/**
 * Repayment Controller
 */
export class RepaymentController {
  private repaymentService: IRepaymentService;

  constructor(repaymentService?: IRepaymentService) {
    this.repaymentService = repaymentService || new RepaymentService();
  }

  /**
   * Get next due installment
   * GET /api/repayment/next-due
   */
  async getNextDueInstallment(req: Request, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Getting next due installment', userId: user.id });

    const { searchParams } = new URL(req.url);
    const loanId = searchParams.get('loanId') ?? undefined;

    const summary = await this.repaymentService.getNextDueInstallment(user.id, loanId);

    const response: ApiResponse = {
      success: true,
      data: summary,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Make repayment
   * POST /api/repayment/pay
   */
  async makeRepayment(req: Request, user: AuthUser): Promise<NextResponse> {
    const body = await req.json();
    const validatedData = makeRepaymentSchema.parse(body);

    console.log({ 
      msg: 'Processing repayment', 
      userId: user.id, 
      installmentId: validatedData.installmentId 
    });

    const result = await this.repaymentService.makeRepayment({
      userId: user.id,
      installmentId: validatedData.installmentId,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        transactionReference: result.transactionReference,
        amountPaid: result.amountPaid,
        newWalletBalance: result.newWalletBalance,
        installmentStatus: result.installmentStatus,
        loanStatus: result.loanStatus,
      },
      message: result.loanStatus === 'COMPLETED' 
        ? '🎉 Congratulations! Your loan has been fully repaid.'
        : '✅ Repayment successful! Thank you for your payment.',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }
}
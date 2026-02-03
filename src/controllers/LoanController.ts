/**
 * Enhanced Loan Controller
 * Added getDetailedLoanById method
 */

import { NextResponse } from 'next/server';
import { LoanService, ILoanService } from '@/src/services/LoanService';
import { SchoolService, ISchoolService } from '@/src/services/SchoolService';
import { createLoanSchema, loanQuerySchema } from '@/src/validation/schemas';
import { ApiResponse } from '@/src/types';
import { AuthUser } from '@/src/middleware/auth';
import { LoanStatus, ResidencyStatus } from '@prisma/client';

/**
 * Loan Controller
 * Handles HTTP layer for loan operations
 */
export class LoanController {
  private loanService: ILoanService;
  private schoolService: ISchoolService;

  constructor(loanService?: ILoanService, schoolService?: ISchoolService) {
    this.loanService = loanService || new LoanService();
    this.schoolService = schoolService || new SchoolService();
  }

  /**
   * Apply for a loan (both local and international)
   * POST /api/loans/apply
   */
  async applyForLoan(req: Request, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Loan application request', userId: user.id });
    
    const body = await req.json();
    const validatedData = createLoanSchema.parse(body);

    // Determine loan type
    const isInternational = validatedData.residencyStatus === ResidencyStatus.INTERNATIONAL;

    // Find or create school profile
    const schoolId = await this.schoolService.findOrCreateSchool({
      schoolName: validatedData.schoolName,
      residencyStatus: validatedData.residencyStatus,
      countryOfStudy: isInternational ? (validatedData as any).countryOfStudy : undefined
    });

    console.log({ 
      msg: 'School resolved', 
      schoolId, 
      schoolName: validatedData.schoolName 
    });

    // Base loan data
    const baseLoanData = {
      userId: user.id,
      schoolId,
      loanAmount: validatedData.loanAmount,
      repaymentMonths: validatedData.repaymentMonths,
      schoolName: validatedData.schoolName,
      academicSession: validatedData.academicSession,
      residencyStatus: validatedData.residencyStatus
    };

    // Execute business logic based on loan type
    const loan = isInternational
      ? await this.loanService.createInternationalLoan({
          ...baseLoanData,
          countryOfStudy: (validatedData as any).countryOfStudy,
          programCourseOfStudy: (validatedData as any).programCourseOfStudy,
          employmentStatus: (validatedData as any).employmentStatus,
          companyName: (validatedData as any).companyName,
          jobTitleRole: (validatedData as any).jobTitleRole,
          monthlyNetIncome: (validatedData as any).monthlyNetIncome,
          paymentFrequency: (validatedData as any).paymentFrequency,
          accountHolderName: (validatedData as any).accountHolderName,
          bankName: (validatedData as any).bankName,
          accountNumber: (validatedData as any).accountNumber,
          countryOfBankAccount: (validatedData as any).countryOfBankAccount
        })
      : await this.loanService.createLocalLoan({
          ...baseLoanData,
          term: (validatedData as any).term
        });

    const response: ApiResponse = {
      success: true,
      data: {
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        status: loan.status,
        residencyStatus: loan.residencyStatus,
        amount: loan.loanAmount,
        monthlyPayment: loan.monthlyPayment,
        totalAmount: loan.totalAmount,
        applicationDate: loan.applicationDate.toISOString(),
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  }

  /**
   * Get loan by ID (basic info)
   * GET /api/loans/:loanId
   */
  async getLoanById(_req: Request, loanId: string, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Get loan details', loanId, userId: user.id });

    const loan = await this.loanService.getLoanById(loanId);

    // Verify loan belongs to user
    if (loan.userId !== user.id) {
      console.warn({ msg: 'Unauthorized loan access attempt', loanId, userId: user.id });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to access this loan',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: loan,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Get detailed loan by ID with all related information
   * GET /api/loans/:loanId/details
   */
  async getDetailedLoanById(_req: Request, loanId: string, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Get detailed loan information', loanId, userId: user.id });

    const loan = await this.loanService.getLoanByIdDetailed(loanId);

    // Verify loan belongs to user
    if (loan.userId !== user.id) {
      console.warn({ msg: 'Unauthorized loan access attempt', loanId, userId: user.id });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to access this loan',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: loan,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Get loan history
   * GET /api/loans/history
   */
  async getLoanHistory(req: Request, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Get loan history', userId: user.id });

    const { searchParams } = new URL(req.url);
    const queryParams = loanQuerySchema.parse({
      status: searchParams.get('status') || undefined,
      residencyStatus: searchParams.get('residencyStatus') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    });

    const result = await this.loanService.getLoansByUserId(
      user.id,
      queryParams.status as LoanStatus | undefined,
      {
        page: parseInt(queryParams.page),
        limit: parseInt(queryParams.limit),
      },
      queryParams.residencyStatus as ResidencyStatus | undefined
    );

    const response: ApiResponse = {
      success: true,
      data: {
        loans: result.loans,
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
   * Upload loan documents
   * POST /api/loans/:loanId/documents
   */
  async uploadDocuments(_req: Request, loanId: string, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Upload loan documents', loanId, userId: user.id });

    // First, verify loan belongs to user
    const loan = await this.loanService.getLoanById(loanId);

    if (loan.userId !== user.id) {
      console.warn({ msg: 'Unauthorized document upload attempt', loanId, userId: user.id });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to upload documents for this loan',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // In a real implementation, we would process the uploaded files here
    // For now, we'll just return a success response
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Documents uploaded successfully',
        loanId,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }


/**
 * Get active loan payment plan for user
 * GET /api/loans/payment-plan
 */
async getActivePaymentPlan(req: Request, user: AuthUser): Promise<NextResponse> {
  console.log({ msg: 'Get active payment plan', userId: user.id });

  // Get all user's loans
  const { loans } = await this.loanService.getLoansByUserId(
    user.id,
    undefined,
    { page: 1, limit: 10 }
  );

  console.log({ 
    msg: 'Fetched loans for payment plan', 
    userId: user.id, 
    loanCount: loans.length,
    statuses: loans.map(l => l.status)
  });

  // Statuses that should show a payment plan (excluding rejected, cancelled, pending)
  const activeStatuses = [
    LoanStatus.ACTIVE,
    LoanStatus.DISBURSED,
    LoanStatus.APPROVED,
    LoanStatus.UNDER_REVIEW, // Include under review as it may have installments
  ];

  // Filter for loans with payment plans
  const activeLoan = loans.find(loan => 
    activeStatuses.includes(loan.status as LoanStatus)
  );

  if (!activeLoan) {
    console.log({ 
      msg: 'No active payment plan found', 
      userId: user.id,
      availableStatuses: loans.map(l => l.status)
    });
    
    const response: ApiResponse = {
      success: true,
      data: null,
      message: 'No active payment plan found',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
    return NextResponse.json(response, { status: 200 });
  }

  console.log({ 
    msg: 'Found active loan for payment plan', 
    loanId: activeLoan.id,
    status: activeLoan.status 
  });

  // Get detailed loan information
  const detailedLoan = await this.loanService.getLoanByIdDetailed(activeLoan.id);

  // Transform to payment plan format
  const paymentPlan = this.transformToPaymentPlan(detailedLoan);

  console.log({ 
    msg: 'Payment plan generated', 
    loanId: activeLoan.id,
    hasInstallments: paymentPlan.installments?.length > 0
  });

  const response: ApiResponse = {
    success: true,
    data: paymentPlan,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Get payment plan by loan ID
 * GET /api/loans/:loanId/payment-plan
 */
async getPaymentPlanById(_req: Request, loanId: string, user: AuthUser): Promise<NextResponse> {
  console.log({ msg: 'Get payment plan by loan ID', loanId, userId: user.id });

  const loan = await this.loanService.getLoanByIdDetailed(loanId);

  // Verify loan belongs to user
  if (loan.userId !== user.id) {
    console.warn({ msg: 'Unauthorized payment plan access attempt', loanId, userId: user.id });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'You do not have permission to access this payment plan',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 403 }
    );
  }

  // Transform to payment plan format
  const paymentPlan = this.transformToPaymentPlan(loan);

  const response: ApiResponse = {
    success: true,
    data: paymentPlan,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Transform detailed loan data to PaymentPlan format
 */
private transformToPaymentPlan(loan: any): any {
  const installments = loan.installments || [];
  const paidInstallments = installments.filter((i: any) => i.status === 'PAID');
  const overdueInstallments = installments.filter((i: any) => i.status === 'OVERDUE');
  const nextPendingInstallment = installments.find((i: any) => i.status === 'PENDING');

  // Calculate progress
  const progress = installments.length > 0 
    ? Math.round((paidInstallments.length / installments.length) * 100)
    : 0;

  // Determine current status
  let currentStatus: 'active' | 'overdue' | 'completed' = 'active';
  if (loan.status === 'COMPLETED') {
    currentStatus = 'completed';
  } else if (overdueInstallments.length > 0) {
    currentStatus = 'overdue';
  }

  // Calculate overdue amount and days
  const overdueAmount = overdueInstallments.reduce(
    (sum: number, inst: any) => sum + Number(inst.amount) + Number(inst.lateFee),
    0
  );

  const overdueDays = overdueInstallments.length > 0
    ? Math.max(...overdueInstallments.map((i: any) => i.daysOverdue))
    : 0;

  // Determine next payment
  const nextPaymentInstallment = overdueInstallments.length > 0 
    ? overdueInstallments[0] 
    : nextPendingInstallment;

  return {
    planType: this.determinePlanType(loan.repaymentMonths),
    planDuration: `${loan.repaymentMonths} Months`,
    totalTuition: Number(loan.loanAmount),
    schoolName: loan.school?.schoolName || loan.schoolName,
    currentStatus,
    paymentsCompleted: paidInstallments.length,
    totalPayments: installments.length,
    progress,
    totalPaid: Number(loan.amountRepaid),
    outstanding: Number(loan.outstandingBalance),
    nextRepayment: nextPaymentInstallment 
      ? Number(nextPaymentInstallment.amount) + Number(nextPaymentInstallment.lateFee || 0)
      : 0,
    nextPaymentDate: nextPaymentInstallment?.dueDate 
      ? new Date(nextPaymentInstallment.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null,
    overdueAmount: currentStatus === 'overdue' ? overdueAmount : undefined,
    overdueDays: currentStatus === 'overdue' ? overdueDays : undefined,
    installments: installments.map((inst: any) => ({
      installmentNumber: inst.installmentNumber,
      amount: Number(inst.amount),
      dueDate: new Date(inst.dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      status: inst.status.toLowerCase()
    }))
  };
}

/**
 * Determine plan type based on repayment months
 */
private determinePlanType(months: number): string {
  if (months <= 3) return 'Fast Track Plan';
  if (months <= 6) return 'Flex Plan';
  if (months <= 12) return 'Extended Plan';
  return 'Custom Plan';
}
}
/**
 * Loan Controller
 * HTTP request/response handling for loan endpoints
 * Supports both local and international student loans with school lookup
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
      // studentId: validatedData.studentId,
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
   * Get loan by ID
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
}
/**
 * Loan Controller
 * HTTP request/response handling for loan endpoints
 * Implements controller layer with proper status codes and response formatting
 */

import { NextResponse } from 'next/server';
import { LoanService, ILoanService } from '@/src/services/LoanService';
import { createLoanSchema, loanQuerySchema } from '@/src/validation/schemas';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';
import { AuthUser } from '@/src/middleware/auth';
import { LoanStatus } from '@prisma/client';

/**
 * Loan Controller
 * Handles HTTP layer for loan operations
 */
export class LoanController {
  private loanService: ILoanService;

  constructor(loanService?: ILoanService) {
    this.loanService = loanService || new LoanService();
  }

  /**
   * Apply for a loan
   * POST /api/loans/apply
   */
  async applyForLoan(req: Request, user: AuthUser): Promise<NextResponse> {
    logger.info({ msg: 'Loan application request', userId: user.id });
    
    const body = await req.json();
    const validatedData = createLoanSchema.parse(body);

    // Execute business logic
    const loan = await this.loanService.createLoan({
      userId: user.id,
      studentId: validatedData.studentId,
      schoolId: '', // This would be determined from the school name in a real implementation
      loanAmount: validatedData.loanAmount,
      repaymentMonths: validatedData.repaymentMonths,
      schoolName: validatedData.schoolName,
      academicSession: validatedData.academicSession,
      term: validatedData.term,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        status: loan.status,
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
    logger.info({ msg: 'Get loan details', loanId, userId: user.id });

    const loan = await this.loanService.getLoanById(loanId);

    // Verify loan belongs to user
    if (loan.userId !== user.id) {
      logger.warn({ msg: 'Unauthorized loan access attempt', loanId, userId: user.id });
      
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
    logger.info({ msg: 'Get loan history', userId: user.id });

    const { searchParams } = new URL(req.url);
    const queryParams = loanQuerySchema.parse({
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    });

    const result = await this.loanService.getLoansByUserId(
      user.id,
      queryParams.status as LoanStatus | undefined,
      {
        page: queryParams.page,
        limit: queryParams.limit,
      }
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
    logger.info({ msg: 'Upload loan documents', loanId, userId: user.id });

    // First, verify loan belongs to user
    const loan = await this.loanService.getLoanById(loanId);

    if (loan.userId !== user.id) {
      logger.warn({ msg: 'Unauthorized document upload attempt', loanId, userId: user.id });
      
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
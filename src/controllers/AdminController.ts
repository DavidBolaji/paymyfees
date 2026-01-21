/**
 * Admin Controller
 * HTTP request/response handling for admin endpoints
 * Implements controller layer with proper status codes and response formatting
 */

import { NextResponse } from 'next/server';
import { AdminService, IAdminService } from '@/src/services/AdminService';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';

/**
 * Admin Controller
 * Handles HTTP layer for admin operations
 */
export class AdminController {
  private adminService: IAdminService;

  constructor(adminService?: IAdminService) {
    this.adminService = adminService || new AdminService();
  }

  /**
   * Get admin analytics
   * GET /api/admin/analytics
   */
  async getAnalytics(req: Request): Promise<NextResponse> {
    logger.info({ msg: 'Admin analytics request' });
    
    // Execute business logic
    const analyticsData = await this.adminService.getAnalytics();

    const response: ApiResponse = {
      success: true,
      data: analyticsData,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Review loan application
   * POST /api/admin/applications/:loanId/review
   */
  async reviewLoanApplication(req: Request, loanId: string): Promise<NextResponse> {
    logger.info({ msg: 'Loan application review request', loanId });
    
    // In a real implementation, we would process the review here
    // For now, we'll just return a success response
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Loan application reviewed successfully',
        loanId,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Process loan disbursement
   * POST /api/admin/disbursements/process
   */
  async processDisbursement(req: Request): Promise<NextResponse> {
    logger.info({ msg: 'Disbursement process request' });
    
    // In a real implementation, we would process the disbursement here
    // For now, we'll just return a success response
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Disbursement processed successfully',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Get loan applications for admin review
   * GET /api/admin/applications
   */
  async getLoanApplications(req: Request): Promise<NextResponse> {
    logger.info({ msg: 'Admin loan applications request' });
    
    // Execute business logic
    const applications = await this.adminService.getLoanApplications();

    const response: ApiResponse = {
      success: true,
      data: applications,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }
}
/**
 * Admin Controller
 * HTTP request/response handling for admin endpoints
 */

import { NextResponse } from 'next/server';
import { AdminService, IAdminService } from '@/src/services/AdminService';
import { ApiResponse } from '@/src/types';
import { LoanStatus } from '@prisma/client';

export class AdminController {
  private adminService: IAdminService;

  constructor(adminService?: IAdminService) {
    this.adminService = adminService || new AdminService();
  }

  /**
   * GET /api/admin/analytics
   */
  async getAnalytics(_req: Request): Promise<NextResponse> {
    console.log({ msg: 'Admin analytics request' });
    
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
   * GET /api/admin/loans
   */
  async getLoans(req: Request): Promise<NextResponse> {
    console.log({ msg: 'Admin loans request' });
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;

    const result = await this.adminService.getLoanApplications(page, limit, status);

    const response: ApiResponse = {
      success: true,
      data: result.loans,
      metadata: {
        timestamp: new Date().toISOString(),
        pagination: result.pagination
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * GET /api/admin/loans/:loanId
   */
  async getLoanDetails(_req: Request, loanId: string): Promise<NextResponse> {
    console.log({ msg: 'Admin loan details request', loanId });
    
    const loan = await this.adminService.getLoanDetails(loanId);

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
   * PATCH /api/admin/loans/:loanId/status
   */
  async updateLoanStatus(req: Request, loanId: string, adminId: string): Promise<NextResponse> {
    console.log({ msg: 'Update loan status request', loanId });
    
    const body = await req.json();
    const { status, reason } = body;

    const loan = await this.adminService.updateLoanStatus(loanId, status as LoanStatus, adminId, reason);

    const response: ApiResponse = {
      success: true,
      data: loan,
      message: `Loan status updated to ${status}`,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * POST /api/admin/loans/:loanId/disburse
   */
  async disburseLoan(_req: Request, loanId: string, adminId: string): Promise<NextResponse> {
    console.log({ msg: 'Disburse loan request', loanId });
    
    const result = await this.adminService.processDisbursement(loanId, adminId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Loan disbursed successfully',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * GET /api/admin/schools
   */
  async getSchools(req: Request): Promise<NextResponse> {
    console.log({ msg: 'Admin schools request' });
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;

    const result = await this.adminService.getSchools(page, limit, status);

    const response: ApiResponse = {
      success: true,
      data: result.schools,
      metadata: {
        timestamp: new Date().toISOString(),
        pagination: result.pagination
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * GET /api/admin/schools/:schoolId
   */
  async getSchoolDetails(_req: Request, schoolId: string): Promise<NextResponse> {
    console.log({ msg: 'Admin school details request', schoolId });
    
    const school = await this.adminService.getSchoolDetails(schoolId);

    const response: ApiResponse = {
      success: true,
      data: school,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * POST /api/admin/schools/:schoolId/approve
   */
  async approveSchool(_req: Request, schoolId: string, adminId: string): Promise<NextResponse> {
    console.log({ msg: 'Approve school request', schoolId });
    
    const school = await this.adminService.approveSchool(schoolId, adminId);

    const response: ApiResponse = {
      success: true,
      data: school,
      message: 'School approved successfully',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * POST /api/admin/schools/:schoolId/reject
   */
  async rejectSchool(req: Request, schoolId: string, adminId: string): Promise<NextResponse> {
    console.log({ msg: 'Reject school request', schoolId });
    
    const body = await req.json();
    const { reason } = body;

    const school = await this.adminService.rejectSchool(schoolId, adminId, reason);

    const response: ApiResponse = {
      success: true,
      data: school,
      message: 'School rejected',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * POST /api/admin/schools
   */
  async addSchool(req: Request, adminId: string): Promise<NextResponse> {
    console.log({ msg: 'Add school request' });
    
    const body = await req.json();
    const result = await this.adminService.addSchool(body, adminId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'School added successfully',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  }

  /**
   * GET /api/admin/support
   */
  async getSupportTickets(req: Request): Promise<NextResponse> {
    console.log({ msg: 'Admin support tickets request' });
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;

    const result = await this.adminService.getSupportTickets(page, limit, status);

    const response: ApiResponse = {
      success: true,
      data: result.tickets,
      metadata: {
        timestamp: new Date().toISOString(),
        pagination: result.pagination
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * POST /api/admin/support/:ticketId/respond
   */
  async respondToTicket(req: Request, ticketId: string, adminId: string): Promise<NextResponse> {
    console.log({ msg: 'Respond to ticket request', ticketId });
    
    const body = await req.json();
    const { message } = body;

    const result = await this.adminService.respondToTicket(ticketId, message, adminId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Response sent successfully',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * PATCH /api/admin/support/:ticketId/status
   */
  async updateTicketStatus(req: Request, ticketId: string, adminId: string): Promise<NextResponse> {
    console.log({ msg: 'Update ticket status request', ticketId });
    
    const body = await req.json();
    const { status } = body;

    const result = await this.adminService.updateTicketStatus(ticketId, status, adminId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Ticket status updated',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * GET /api/admin/schools/:schoolId/verification-logs
   */
  async getVerificationLogs(_req: Request, schoolId: string): Promise<NextResponse> {
    console.log({ msg: 'Get verification logs request', schoolId });
    
    const logs = await this.adminService.getVerificationLogs(schoolId);

    const response: ApiResponse = {
      success: true,
      data: logs,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * POST /api/admin/schools/:schoolId/verification-message
   */
  async addVerificationMessage(req: Request, schoolId: string, adminId: string): Promise<NextResponse> {
    console.log({ msg: 'Add verification message request', schoolId });
    
    const body = await req.json();
    const { message } = body;

    const result = await this.adminService.addVerificationMessage(schoolId, message, adminId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Verification message added',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  }
}

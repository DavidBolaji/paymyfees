/**
 * Admin Controller
 * HTTP request/response handling for admin endpoints
 */

import { NextResponse } from 'next/server';
import { AdminService, IAdminService } from '@/src/services/AdminService';
import { ApiResponse } from '@/src/types';
import { LoanStatus } from '@prisma/client';
import { NotifyService } from '@/src/services/NotifyService';

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
    const statusParam = searchParams.get('status') || undefined;
    const statuses = statusParam ? statusParam.split(',').map(s => s.trim()) : undefined;

    const result = await this.adminService.getLoanApplications(page, limit, statuses);

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

    // Fire notification (async — never blocks response)
    const notify = new NotifyService();
    const userId: string = loan?.user?.id ?? loan?.userId;
    const email: string = loan?.user?.email ?? '';
    const fullName: string = loan?.user?.fullName ?? '';
    const loanNumber: string = loan?.loanNumber ?? loanId;

    if (userId) {
      if (status === LoanStatus.APPROVED) {
        notify.send({
          userId,
          type: 'SUCCESS',
          title: 'Loan Application Approved',
          message: `Your loan application (${loanNumber}) has been approved!`,
          actionUrl: '/dashboard',
          category: 'loan_approval',
          email: email ? { to: email, fullName, method: (mail) => mail.sendLoanApprovedEmail(email, fullName, loanNumber, Number(loan?.loanAmount ?? 0)) } : undefined,
        });
      } else if (status === LoanStatus.REJECTED) {
        notify.send({
          userId,
          type: 'ERROR',
          title: 'Loan Application Update',
          message: `Your loan application (${loanNumber}) was not approved at this time.`,
          actionUrl: '/dashboard',
          category: 'loan_approval',
          email: email ? { to: email, fullName, method: (mail) => mail.sendLoanRejectedEmail(email, fullName, loanNumber, reason) } : undefined,
        });
      } else if ((status as string) === 'COMPLETED') {
        notify.send({
          userId,
          type: 'SUCCESS',
          title: 'Loan Fully Repaid',
          message: `Congratulations! Your loan (${loanNumber}) has been fully repaid.`,
          actionUrl: '/dashboard',
          category: 'loan_approval',
          email: email ? { to: email, fullName, method: (mail) => mail.sendLoanCompletedEmail(email, fullName, loanNumber) } : undefined,
        });
      }
    }

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

    // Fire disbursement notification
    const loan = result?.loan;
    if (loan) {
      // fetch user info since processDisbursement doesn't include it
      const { prisma } = await import('@/src/database/prisma');
      const dbUser = await prisma.user.findUnique({
        where: { id: loan.userId },
        select: { email: true, fullName: true }
      }).catch(() => null);

      const schoolName = loan.school?.schoolName ?? '';

      const notify = new NotifyService();
      notify.send({
        userId: loan.userId,
        type: 'SUCCESS',
        title: 'Loan Disbursed',
        message: `Your loan (${loan.loanNumber}) has been disbursed. Funds have been sent to your school.`,
        actionUrl: '/dashboard',
        category: 'loan_approval',
        email: dbUser?.email
          ? {
              to: dbUser.email,
              fullName: dbUser.fullName,
              method: (mail) => mail.sendLoanDisbursedEmail(dbUser.email, dbUser.fullName, loan.loanNumber, Number(loan.loanAmount), schoolName),
            }
          : undefined,
      });
    }

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
   * GET /api/admin/support/:ticketId
   */
  async getTicketDetails(_req: Request, ticketId: string): Promise<NextResponse> {
    console.log({ msg: 'Get ticket details request', ticketId });
    const ticket = await this.adminService.getTicketDetails(ticketId);
    const response: ApiResponse = {
      success: true,
      data: ticket,
      metadata: { timestamp: new Date().toISOString() },
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

  /**
   * POST /api/admin/schools/:schoolId/verification-log
   */
  async addVerificationLog(req: Request, schoolId: string, adminId: string): Promise<NextResponse> {
    console.log({ msg: 'Add verification log request', schoolId });
    
    const body = await req.json();
    const { activity, details, status } = body;

    const result = await this.adminService.addVerificationLog(schoolId, activity, details, status, adminId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Verification log added',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  }

  async getDashboardStats(_req: Request): Promise<NextResponse> {
    const data = await this.adminService.getDashboardStats();
    return NextResponse.json({ success: true, data }, { status: 200 });
  }

  async getSchoolsStats(_req: Request): Promise<NextResponse> {
    const data = await this.adminService.getSchoolsStats();
    return NextResponse.json({ success: true, data }, { status: 200 });
  }

  async getStudents(req: Request): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const result = await this.adminService.getStudents(page, limit, status);
    return NextResponse.json({ success: true, data: result.students, metadata: { pagination: result.pagination } }, { status: 200 });
  }

  async getStudentsRequiringAction(req: Request): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const result = await this.adminService.getStudentsRequiringAction(page, limit);
    return NextResponse.json({ success: true, data: result.students, metadata: { pagination: result.pagination } }, { status: 200 });
  }

  async getRecentlyActiveStudents(req: Request): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const result = await this.adminService.getRecentlyActiveStudents(page, limit);
    return NextResponse.json({ success: true, data: result.students, metadata: { pagination: result.pagination } }, { status: 200 });
  }

  async getDelayedPayments(req: Request): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const result = await this.adminService.getDelayedPayments(page, limit);
    return NextResponse.json({ success: true, data: result.students, metadata: { pagination: result.pagination } }, { status: 200 });
  }

  async getStudentDetails(_req: Request, userId: string): Promise<NextResponse> {
    const data = await this.adminService.getStudentDetails(userId);
    return NextResponse.json({ success: true, data }, { status: 200 });
  }

  async suspendLoanEligibility(req: Request, userId: string, adminId: string): Promise<NextResponse> {
    const { reason, duration, notes } = await req.json();
    await this.adminService.suspendLoanEligibility(userId, adminId, reason, duration, notes);
    return NextResponse.json({ success: true, message: 'Loan eligibility suspended' }, { status: 200 });
  }

  async sendPaymentReminder(req: Request, userId: string, adminId: string): Promise<NextResponse> {
    const { reminderType, notes, channels } = await req.json();
    await this.adminService.sendPaymentReminder(userId, adminId, reminderType, notes, channels || []);
    return NextResponse.json({ success: true, message: 'Payment reminder sent' }, { status: 200 });
  }

  async freezeAccount(req: Request, userId: string, adminId: string): Promise<NextResponse> {
    const { reason, duration, notes } = await req.json();
    await this.adminService.freezeAccount(userId, adminId, reason, duration, notes);
    return NextResponse.json({ success: true, message: 'Account frozen' }, { status: 200 });
  }

  async flagAccount(req: Request, userId: string, adminId: string): Promise<NextResponse> {
    const { reason, notes } = await req.json();
    await this.adminService.flagAccount(userId, adminId, reason, notes);
    return NextResponse.json({ success: true, message: 'Account flagged' }, { status: 200 });
  }

  async getPendingVerificationSchools(req: Request): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const result = await this.adminService.getPendingVerificationSchools(page, limit);
    return NextResponse.json({ success: true, data: result.schools, metadata: { pagination: result.pagination } }, { status: 200 });
  }

  async requestAdditionalDocuments(req: Request, schoolId: string, adminId: string): Promise<NextResponse> {
    const data = await req.json();
    await this.adminService.requestAdditionalDocuments(schoolId, adminId, data);
    return NextResponse.json({ success: true, message: 'Document request sent' }, { status: 200 });
  }

  async getTeacherLoans(req: Request): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const statusParam = searchParams.get('status') || undefined;
    const statuses = statusParam ? statusParam.split(',').map(s => s.trim()) : undefined;
    const result = await this.adminService.getTeacherLoans(page, limit, statuses);
    return NextResponse.json(
      { success: true, data: result.loans, metadata: { pagination: result.pagination } },
      { status: 200 }
    );
  }

  async getTeacherUsers(req: Request): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const result = await this.adminService.getTeacherUsers(page, limit);
    return NextResponse.json(
      { success: true, data: result.teachers, metadata: { pagination: result.pagination } },
      { status: 200 }
    );
  }

  async getTeacherDetails(_req: Request, userId: string): Promise<NextResponse> {
    const result = await this.adminService.getTeacherDetails(userId);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  }

  async getSchoolLoans(req: Request): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const statusParam = searchParams.get('status') || undefined;
    const statuses = statusParam ? statusParam.split(',').map(s => s.trim()) : undefined;
    const result = await this.adminService.getSchoolLoans(page, limit, statuses);
    return NextResponse.json(
      { success: true, data: result.loans, metadata: { pagination: result.pagination } },
      { status: 200 }
    );
  }

  async getSchoolUserList(req: Request): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const result = await this.adminService.getSchoolUserList(page, limit, status);
    return NextResponse.json(
      { success: true, data: result.students, metadata: { pagination: result.pagination } },
      { status: 200 }
    );
  }

  async getSchoolUserDetails(_req: Request, userId: string): Promise<NextResponse> {
    const result = await this.adminService.getSchoolUserDetails(userId);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  }

  async getSchoolSupportTickets(req: Request): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const result = await this.adminService.getSchoolSupportTickets(page, limit, status);
    return NextResponse.json(
      { success: true, data: result.tickets, metadata: { pagination: result.pagination } },
      { status: 200 }
    );
  }

  async getSchoolAdminDashboardStats(_req: Request): Promise<NextResponse> {
    const result = await this.adminService.getSchoolAdminDashboardStats();
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  }

  async getTeacherSupportTickets(req: Request): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const result = await this.adminService.getTeacherSupportTickets(page, limit, status);
    return NextResponse.json(
      { success: true, data: result.tickets, metadata: { pagination: result.pagination } },
      { status: 200 }
    );
  }

  async getTeacherAdminDashboardStats(_req: Request): Promise<NextResponse> {
    const result = await this.adminService.getTeacherAdminDashboardStats();
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  }
}

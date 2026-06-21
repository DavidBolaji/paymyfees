/**
 * Admin Service
 * Business logic for admin operations
 * Implements service layer with transaction management
 */

import { AdminRepository, IAdminRepository } from '@/src/repositories/AdminRepository';
import { LoanRepository } from '@/src/repositories/LoanRepository';
import { NotFoundError, BadRequestError } from '@/src/types/errors';
import { LoanStatus } from '@prisma/client';

/**
 * Admin Service Interface
 */
export interface IAdminService {
  getAnalytics(): Promise<any>;
  getLoanApplications(page: number, limit: number, statuses?: string[]): Promise<any>;
  getLoanDetails(loanId: string): Promise<any>;
  updateLoanStatus(loanId: string, status: LoanStatus, adminId: string, reason?: string): Promise<any>;
  processDisbursement(loanId: string, adminId: string): Promise<any>;
  getSchools(page: number, limit: number, status?: string): Promise<any>;
  getSchoolDetails(schoolId: string): Promise<any>;
  approveSchool(schoolId: string, adminId: string): Promise<any>;
  rejectSchool(schoolId: string, adminId: string, reason: string): Promise<any>;
  addSchool(data: any, adminId: string): Promise<any>;
  getSupportTickets(page: number, limit: number, status?: string): Promise<any>;
  getTicketDetails(ticketId: string): Promise<any>;
  respondToTicket(ticketId: string, message: string, adminId: string): Promise<any>;
  updateTicketStatus(ticketId: string, status: string, adminId: string): Promise<any>;
  getVerificationLogs(schoolId: string): Promise<any>;
  addVerificationMessage(schoolId: string, message: string, adminId: string): Promise<any>;
  addVerificationLog(schoolId: string, activity: string, details: string, status: string, adminId: string): Promise<any>;
  getDashboardStats(): Promise<any>;
  getStudents(page: number, limit: number, status?: string): Promise<any>;
  getStudentsRequiringAction(page: number, limit: number): Promise<any>;
  getRecentlyActiveStudents(page: number, limit: number): Promise<any>;
  getDelayedPayments(page: number, limit: number): Promise<any>;
  getStudentDetails(userId: string): Promise<any>;
  suspendLoanEligibility(userId: string, adminId: string, reason: string, duration: string, notes: string): Promise<any>;
  sendPaymentReminder(userId: string, adminId: string, reminderType: string, notes: string, channels: string[]): Promise<any>;
  freezeAccount(userId: string, adminId: string, reason: string, duration: string, notes: string): Promise<any>;
  flagAccount(userId: string, adminId: string, reason: string, notes: string): Promise<any>;
  getPendingVerificationSchools(page: number, limit: number): Promise<any>;
  requestAdditionalDocuments(schoolId: string, adminId: string, data: any): Promise<any>;
  getTeacherLoans(page: number, limit: number, statuses?: string[]): Promise<any>;
  getTeacherUsers(page: number, limit: number): Promise<any>;
  getTeacherDetails(userId: string): Promise<any>;
  getSchoolLoans(page: number, limit: number, statuses?: string[]): Promise<any>;
  getSchoolUserList(page: number, limit: number, status?: string): Promise<any>;
  getSchoolUserDetails(userId: string): Promise<any>;
  getSchoolSupportTickets(page: number, limit: number, status?: string): Promise<any>;
  getSchoolAdminDashboardStats(): Promise<any>;
  getTeacherSupportTickets(page: number, limit: number, status?: string): Promise<any>;
  getTeacherAdminDashboardStats(): Promise<any>;
  getSchoolsStats(): Promise<any>;
}

/**
 * Admin Service
 * Handles business logic for admin operations
 */
export class AdminService implements IAdminService {
  private adminRepository: IAdminRepository;
  private loanRepository: LoanRepository;

  constructor(adminRepository?: IAdminRepository) {
    this.adminRepository = adminRepository || new AdminRepository();
    this.loanRepository = new LoanRepository();
  }

  /**
   * Get admin analytics
   */
  async getAnalytics(): Promise<any> {
    console.log({ msg: 'Getting admin analytics' });
    return await this.adminRepository.getAnalytics();
  }

  /**
   * Get loan applications for admin review
   */
  async getLoanApplications(page: number = 1, limit: number = 10, statuses?: string[]): Promise<any> {
    console.log({ msg: 'Getting loan applications for admin', page, limit, statuses });
    return await this.adminRepository.getLoanApplications(page, limit, statuses);
  }

  /**
   * Get loan details with all related information
   */
  async getLoanDetails(loanId: string): Promise<any> {
    console.log({ msg: 'Getting loan details', loanId });
    
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) {
      throw new NotFoundError('Loan not found');
    }

    return loan;
  }

  /**
   * Update loan status
   */
  async updateLoanStatus(loanId: string, status: LoanStatus, adminId: string, reason?: string): Promise<any> {
    console.log({ msg: 'Updating loan status', loanId, status, adminId });
    
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) {
      throw new NotFoundError('Loan not found');
    }

    return await this.adminRepository.updateLoanStatus(loanId, status, adminId, reason);
  }

  /**
   * Process loan disbursement
   */
  async processDisbursement(loanId: string, adminId: string): Promise<any> {
    console.log({ msg: 'Processing disbursement', loanId, adminId });
    
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) {
      throw new NotFoundError('Loan not found');
    }

    if (loan.status !== 'APPROVED') {
      throw new BadRequestError('Only approved loans can be disbursed');
    }

    return await this.adminRepository.processDisbursement(loanId, adminId);
  }

  /**
   * Get schools with pagination
   */
  async getSchools(page: number = 1, limit: number = 10, status?: string): Promise<any> {
    console.log({ msg: 'Getting schools', page, limit, status });
    return await this.adminRepository.getSchools(page, limit, status);
  }

  /**
   * Get school details
   */
  async getSchoolDetails(schoolId: string): Promise<any> {
    console.log({ msg: 'Getting school details', schoolId });
    return await this.adminRepository.getSchoolById(schoolId);
  }

  /**
   * Approve school
   */
  async approveSchool(schoolId: string, adminId: string): Promise<any> {
    console.log({ msg: 'Approving school', schoolId, adminId });

    const foundSchool = await this.adminRepository.getSchoolById(schoolId);

    if (!foundSchool) {
      throw new NotFoundError('School not found');
    }

    return await this.adminRepository.approveSchool(schoolId, adminId);
  }

  /**
   * Reject school
   */
  async rejectSchool(schoolId: string, adminId: string, reason: string): Promise<any> {
    console.log({ msg: 'Rejecting school', schoolId, adminId });
    
    const foundSchool = await this.adminRepository.getSchoolById(schoolId);

    if (!foundSchool) {
      throw new NotFoundError('School not found');
    }

    return await this.adminRepository.rejectSchool(schoolId, adminId, reason);
  }

  /**
   * Add new school
   */
  async addSchool(data: any, adminId: string): Promise<any> {
    console.log({ msg: 'Adding new school', adminId });
    return await this.adminRepository.addSchool(data, adminId);
  }

  /**
   * Get support tickets
   */
  async getSupportTickets(page: number = 1, limit: number = 10, status?: string): Promise<any> {
    console.log({ msg: 'Getting support tickets', page, limit, status });
    return await this.adminRepository.getSupportTickets(page, limit, status);
  }

  /**
   * Get single ticket details
   */
  async getTicketDetails(ticketId: string): Promise<any> {
    console.log({ msg: 'Getting ticket details', ticketId });
    return await this.adminRepository.getTicketDetails(ticketId);
  }

  /**
   * Respond to support ticket
   */
  async respondToTicket(ticketId: string, message: string, adminId: string): Promise<any> {
    console.log({ msg: 'Responding to ticket', ticketId, adminId });
    return await this.adminRepository.respondToTicket(ticketId, message, adminId);
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: string, adminId: string): Promise<any> {
    console.log({ msg: 'Updating ticket status', ticketId, status, adminId });
    return await this.adminRepository.updateTicketStatus(ticketId, status, adminId);
  }

  /**
   * Get verification logs for a school
   */
  async getVerificationLogs(schoolId: string): Promise<any> {
    console.log({ msg: 'Getting verification logs', schoolId });
    return await this.adminRepository.getVerificationLogs(schoolId);
  }

  /**
   * Add verification message
   */
  async addVerificationMessage(schoolId: string, message: string, adminId: string): Promise<any> {
    console.log({ msg: 'Adding verification message', schoolId, adminId });
    return await this.adminRepository.addVerificationMessage(schoolId, message, adminId);
  }

  /**
   * Add verification log
   */
  async addVerificationLog(schoolId: string, activity: string, details: string, status: string, adminId: string): Promise<any> {
    console.log({ msg: 'Adding verification log', schoolId, activity, adminId });
    return await this.adminRepository.addVerificationLog(schoolId, activity, details, status, adminId);
  }

  async getDashboardStats(): Promise<any> {
    return await this.adminRepository.getDashboardStats();
  }

  async getSchoolsStats(): Promise<any> {
    return await this.adminRepository.getSchoolsStats();
  }

  async getStudents(page: number = 1, limit: number = 10, status?: string): Promise<any> {
    return await this.adminRepository.getStudents(page, limit, status);
  }

  async getStudentsRequiringAction(page: number = 1, limit: number = 10): Promise<any> {
    return await this.adminRepository.getStudentsRequiringAction(page, limit);
  }

  async getRecentlyActiveStudents(page: number = 1, limit: number = 10): Promise<any> {
    return await this.adminRepository.getRecentlyActiveStudents(page, limit);
  }

  async getDelayedPayments(page: number = 1, limit: number = 10): Promise<any> {
    return await this.adminRepository.getDelayedPayments(page, limit);
  }

  async getStudentDetails(userId: string): Promise<any> {
    return await this.adminRepository.getStudentDetails(userId);
  }

  async suspendLoanEligibility(userId: string, adminId: string, reason: string, duration: string, notes: string): Promise<any> {
    return await this.adminRepository.suspendLoanEligibility(userId, adminId, reason, duration, notes);
  }

  async sendPaymentReminder(userId: string, adminId: string, reminderType: string, notes: string, channels: string[]): Promise<any> {
    return await this.adminRepository.sendPaymentReminder(userId, adminId, reminderType, notes, channels);
  }

  async freezeAccount(userId: string, adminId: string, reason: string, duration: string, notes: string): Promise<any> {
    return await this.adminRepository.freezeAccount(userId, adminId, reason, duration, notes);
  }

  async flagAccount(userId: string, adminId: string, reason: string, notes: string): Promise<any> {
    return await this.adminRepository.flagAccount(userId, adminId, reason, notes);
  }

  async getPendingVerificationSchools(page: number = 1, limit: number = 10): Promise<any> {
    return await this.adminRepository.getPendingVerificationSchools(page, limit);
  }

  async requestAdditionalDocuments(schoolId: string, adminId: string, data: any): Promise<any> {
    return await this.adminRepository.requestAdditionalDocuments(schoolId, adminId, data);
  }

  async getTeacherLoans(page: number = 1, limit: number = 10, statuses?: string[]): Promise<any> {
    return await this.adminRepository.getTeacherLoans(page, limit, statuses);
  }

  async getTeacherUsers(page: number = 1, limit: number = 10): Promise<any> {
    return await this.adminRepository.getTeacherUsers(page, limit);
  }

  async getTeacherDetails(userId: string): Promise<any> {
    return await this.adminRepository.getTeacherDetails(userId);
  }

  async getSchoolLoans(page: number = 1, limit: number = 10, statuses?: string[]): Promise<any> {
    return await this.adminRepository.getSchoolLoans(page, limit, statuses);
  }

  async getSchoolUserList(page: number = 1, limit: number = 10, status?: string): Promise<any> {
    return await this.adminRepository.getSchoolUserList(page, limit, status);
  }

  async getSchoolUserDetails(userId: string): Promise<any> {
    return await this.adminRepository.getSchoolUserDetails(userId);
  }

  async getSchoolSupportTickets(page: number = 1, limit: number = 10, status?: string): Promise<any> {
    return await this.adminRepository.getSchoolSupportTickets(page, limit, status);
  }

  async getSchoolAdminDashboardStats(): Promise<any> {
    return await this.adminRepository.getSchoolAdminDashboardStats();
  }

  async getTeacherSupportTickets(page: number = 1, limit: number = 10, status?: string): Promise<any> {
    return await this.adminRepository.getTeacherSupportTickets(page, limit, status);
  }

  async getTeacherAdminDashboardStats(): Promise<any> {
    return await this.adminRepository.getTeacherAdminDashboardStats();
  }

  async updateStudent(userId: string, data: any): Promise<any> {
    return await this.adminRepository.updateStudent(userId, data);
  }
}

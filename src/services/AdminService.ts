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
  getLoanApplications(page: number, limit: number, status?: string): Promise<any>;
  getLoanDetails(loanId: string): Promise<any>;
  updateLoanStatus(loanId: string, status: LoanStatus, adminId: string, reason?: string): Promise<any>;
  processDisbursement(loanId: string, adminId: string): Promise<any>;
  getSchools(page: number, limit: number, status?: string): Promise<any>;
  getSchoolDetails(schoolId: string): Promise<any>;
  approveSchool(schoolId: string, adminId: string): Promise<any>;
  rejectSchool(schoolId: string, adminId: string, reason: string): Promise<any>;
  addSchool(data: any, adminId: string): Promise<any>;
  getSupportTickets(page: number, limit: number, status?: string): Promise<any>;
  respondToTicket(ticketId: string, message: string, adminId: string): Promise<any>;
  updateTicketStatus(ticketId: string, status: string, adminId: string): Promise<any>;
  getVerificationLogs(schoolId: string): Promise<any>;
  addVerificationMessage(schoolId: string, message: string, adminId: string): Promise<any>;
  addVerificationLog(schoolId: string, activity: string, details: string, status: string, adminId: string): Promise<any>;
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
  async getLoanApplications(page: number = 1, limit: number = 10, status?: string): Promise<any> {
    console.log({ msg: 'Getting loan applications for admin', page, limit, status });
    return await this.adminRepository.getLoanApplications(page, limit, status);
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
    
    const school = await this.adminRepository.getSchools(1, 1, undefined);
    const foundSchool = school.schools.find((s: any) => s.id === schoolId);
    
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
    
    const school = await this.adminRepository.getSchools(1, 1, undefined);
    const foundSchool = school.schools.find((s: any) => s.id === schoolId);
    
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
}

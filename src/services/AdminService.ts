/**
 * Admin Service
 * Business logic for admin operations
 * Implements service layer with dependency injection
 */

import { AdminRepository, IAdminRepository } from '@/src/repositories/AdminRepository';
import { logger } from '@/src/utils/logger';

/**
 * Admin Analytics Data Interface
 */
export interface AdminAnalyticsData {
  loanStats: {
    totalLoans: number;
    pendingLoans: number;
    approvedLoans: number;
    disbursedLoans: number;
    activeLoans: number;
    completedLoans: number;
    defaultedLoans: number;
    rejectedLoans: number;
    cancelledLoans: number;
  };
  financialStats: {
    totalLoanAmount: number;
    totalDisbursedAmount: number;
    totalRepaidAmount: number;
    totalOutstandingAmount: number;
    repaymentRate: number;
  };
  userStats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
  };
  schoolStats: {
    totalSchools: number;
    verifiedSchools: number;
    pendingSchools: number;
    verificationRate: number;
  };
}

/**
 * Loan Application Interface
 */
export interface LoanApplication {
  id: string;
  userId: string;
  userName: string;
  loanAmount: number;
  purpose: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin Service Interface
 */
export interface IAdminService {
  getAnalytics(): Promise<AdminAnalyticsData>;
  getLoanApplications(): Promise<LoanApplication[]>;
}

/**
 * Admin Service Implementation
 */
export class AdminService implements IAdminService {
  private adminRepository: IAdminRepository;

  constructor(adminRepository?: IAdminRepository) {
    this.adminRepository = adminRepository || new AdminRepository();
  }

  /**
   * Get admin analytics data
   */
  async getAnalytics(): Promise<AdminAnalyticsData> {
    console.log({ msg: 'Getting admin analytics data' });

    // Get loan statistics
    const loanStats = await this.adminRepository.getLoanStats();

    // Get financial statistics
    const totalLoanAmount = await this.adminRepository.getTotalLoanAmount();
    const totalDisbursedAmount = await this.adminRepository.getTotalDisbursedAmount();
    const totalRepaidAmount = await this.adminRepository.getTotalRepaidAmount();
    const totalOutstandingAmount = await this.adminRepository.getTotalOutstandingAmount();
    
    // Calculate repayment rate
    const repaymentRate = totalDisbursedAmount > 0 
      ? (totalRepaidAmount / totalDisbursedAmount) * 100 
      : 0;

    // Get user statistics
    const userStats = await this.adminRepository.getUserStats();

    // Get school statistics
    const schoolStats = await this.adminRepository.getSchoolStats();
    
    // Calculate verification rate
    const verificationRate = schoolStats.totalSchools > 0 
      ? (schoolStats.verifiedSchools / schoolStats.totalSchools) * 100 
      : 0;

    return {
      loanStats,
      financialStats: {
        totalLoanAmount,
        totalDisbursedAmount,
        totalRepaidAmount,
        totalOutstandingAmount,
        repaymentRate,
      },
      userStats,
      schoolStats: {
        ...schoolStats,
        verificationRate,
      },
    };
  }

  /**
   * Get loan applications for admin review
   */
  async getLoanApplications(): Promise<LoanApplication[]> {
    console.log({ msg: 'Getting loan applications for admin review' });

    // Get loan applications from repository
    const applications = await this.adminRepository.getLoanApplications();
    
    return applications;
  }
}
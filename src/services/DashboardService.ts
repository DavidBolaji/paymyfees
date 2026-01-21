/**
 * Dashboard Service
 * Business logic for dashboard operations
 * Implements service layer with dependency injection
 */

import { DashboardRepository, IDashboardRepository } from '@/src/repositories/DashboardRepository';
import { logger } from '@/src/utils/logger';
import {
  DashboardStats,
  AnalyticsData,
  ChartDataPoint
} from '@/src/types';


/**
 * Dashboard Service Interface
 */
export interface IDashboardService {
  getStats(userId: string): Promise<DashboardStats>;
  getAnalytics(userId: string): Promise<AnalyticsData>;
  getChartData(userId: string, year?: number): Promise<ChartDataPoint[]>;
}

/**
 * Dashboard Service Implementation
 */
export class DashboardService implements IDashboardService {
  private dashboardRepository: IDashboardRepository;

  constructor(dashboardRepository?: IDashboardRepository) {
    this.dashboardRepository = dashboardRepository || new DashboardRepository();
  }

  /**
   * Get dashboard statistics
   */
  async getStats(userId: string): Promise<DashboardStats> {
    logger.info({ msg: 'Getting dashboard stats', userId });

    // Get data from repository
    const data = await this.dashboardRepository.getUserStats(userId);
    
    // Get upcoming payment
    let upcomingPayment = null;
    if (data.activeLoans.length > 0) {
      const firstLoan = data.activeLoans[0];
      // In a real implementation, we would get the next installment due
      // For now, we'll just use a mock value
      upcomingPayment = {
        amount: firstLoan?.monthlyPayment || 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      };
    }

    // Get active plan
    let activePlan = null;
    if (data.activeLoans.length > 0) {
      const loan = data.activeLoans[0];
      activePlan = {
        current: loan?.amountRepaid || 0,
        total: loan?.totalAmount || 0,
        planType: 'Monthly',
      };
    }

    // Calculate total outstanding balance
    const totalOutstandingBalance = data.activeLoans.reduce(
      (sum: number, loan: any) => sum + (loan.outstandingBalance || 0),
      0
    );

    return {
      upcomingPayment,
      activePlan,
      balance: {
        amount: totalOutstandingBalance,
        description: 'Total outstanding balance',
      },
      wallet: {
        amount: data.wallet?.balance || 0,
        description: 'Current wallet balance',
      },
    };
  }

  /**
   * Get analytics data
   */
  async getAnalytics(userId: string): Promise<AnalyticsData> {
    logger.info({ msg: 'Getting analytics data', userId });

    // Get data from repository
    const data = await this.dashboardRepository.getUserAnalytics(userId);
    
    // Calculate analytics
    const totalLoans = data.loans.length;
    
    const totalBorrowed = data.loans.reduce(
      (sum: number, loan: any) => sum + (loan.loanAmount || 0),
      0
    );
    
    const totalRepaid = data.loans.reduce(
      (sum: number, loan: any) => sum + (loan.amountRepaid || 0),
      0
    );
    
    const outstandingBalance = data.loans.reduce(
      (sum: number, loan: any) => sum + (loan.outstandingBalance || 0),
      0
    );
    
    // Calculate repayment rate
    const repaymentRate = totalBorrowed > 0 ? (totalRepaid / totalBorrowed) * 100 : 0;
    
    // Calculate average loan amount
    const averageLoanAmount = totalLoans > 0 ? totalBorrowed / totalLoans : 0;

    return {
      totalLoans,
      totalBorrowed,
      totalRepaid,
      outstandingBalance,
      repaymentRate,
      averageLoanAmount,
    };
  }

  /**
   * Get chart data
   */
  async getChartData(userId: string, year?: number): Promise<ChartDataPoint[]> {
    logger.info({ msg: 'Getting chart data', userId, year });

    // Use current year if not specified
    const targetYear = year || new Date().getFullYear();
    
    // Get data from repository
    const transactions = await this.dashboardRepository.getChartData(userId, targetYear);
    
    // Process transactions into monthly data
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Initialize monthly data with zeros
    const monthlyData: { [key: string]: number } = {};
    months.forEach(month => {
      monthlyData[month] = 0;
    });
    
    // Aggregate transaction amounts by month
    transactions.forEach((transaction: any) => {
      const date = new Date(transaction.createdAt);
      const month = months[date.getMonth()];
      if (month) {
        monthlyData[month] += transaction.amount || 0;
      }
    });
    
    // Convert to chart data points
    return months.map(month => ({
      month,
      value: monthlyData[month] || 0,
    }));
  }
}
/**
 * Dashboard Service
 * Business logic for dashboard operations
 * Implements service layer with dependency injection
 */

import { DashboardRepository, IDashboardRepository } from '@/src/repositories/DashboardRepository';
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
    console.log({ msg: 'Getting dashboard stats', userId });

    // Get data from repository
    const data = await this.dashboardRepository.getUserStats(userId);
    
    // Get upcoming payment
    let upcomingPayment = null;
    if (data.activeLoans && data.activeLoans.length > 0) {
      const firstLoan = data.activeLoans[0];
      
      // Get the next pending installment
      const nextInstallment = await this.getNextPendingInstallment(firstLoan.id);
      
      if (nextInstallment) {
        upcomingPayment = {
          amount: nextInstallment.amount,
          dueDate: this.formatDate(new Date(nextInstallment.dueDate)),
        };
      } else {
        // Fallback: Calculate the next payment date (30 days from disbursement date or today)
        const disbursementDate = firstLoan?.disbursementDate || new Date();
        const nextPaymentDate = new Date(disbursementDate);
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
        
        upcomingPayment = {
          amount: firstLoan?.monthlyPayment || 0,
          dueDate: this.formatDate(nextPaymentDate),
        };
      }
    }

    // Get active plan
    let activePlan = null;
    if (data.activeLoans && data.activeLoans.length > 0) {
      const loan = data.activeLoans[0];
      
      // Calculate the number of installments paid and total installments
      const totalInstallments = loan?.repaymentMonths || 0;
      const paidInstallments = Math.floor((loan?.amountRepaid || 0) / (loan?.monthlyPayment || 1));
      
      activePlan = {
        current: paidInstallments,
        total: totalInstallments,
        planType: 'Monthly',
      };
    }

    // Calculate total outstanding balance
    const totalOutstandingBalance = (data.activeLoans || []).reduce(
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
   * Get next pending installment for a loan
   */
  private async getNextPendingInstallment(loanId: string): Promise<any> {
    const { prisma } = await import('@/src/lib/prisma');
    
    const nextInstallment = await prisma.installment.findFirst({
      where: {
        loanId,
        status: 'PENDING',
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
    
    return nextInstallment;
  }
  
  /**
   * Format date to a readable format (e.g., "3rd Feb 2026")
   */
  private formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    // Add ordinal suffix to day
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) {
      suffix = 'st';
    } else if (day === 2 || day === 22) {
      suffix = 'nd';
    } else if (day === 3 || day === 23) {
      suffix = 'rd';
    }
    
    return `${day}${suffix} ${month} ${year}`;
  }

  /**
   * Get analytics data
   */
  async getAnalytics(userId: string): Promise<AnalyticsData> {
    console.log({ msg: 'Getting analytics data', userId });

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
    console.log({ msg: 'Getting chart data', userId, year });

    // Use current year if not specified
    const targetYear = year || new Date().getFullYear();
    
    // Get data from repository
    const transactions = await this.dashboardRepository.getChartData(userId, targetYear);
    
    // Process transactions into monthly data
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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
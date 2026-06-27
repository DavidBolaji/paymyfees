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
  getStats(userId: string, loanId?: string): Promise<DashboardStats>;
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
  async getStats(userId: string, loanId?: string): Promise<DashboardStats> {
    console.log({ msg: 'Getting dashboard stats', userId, loanId });

    // Get data from repository
    const data = await this.dashboardRepository.getUserStats(userId);
    
    // Use the specified loan (if provided) or fall back to the first active loan
    let targetLoan = loanId
      ? (data.activeLoans || []).find((l: any) => l.id === loanId) || data.activeLoans?.[0]
      : data.activeLoans?.[0];

    // Get upcoming payment — use installments already loaded in activeLoans query
    let upcomingPayment = null;
    if (targetLoan) {
      const nextInstallment = (targetLoan as any).installments?.[0];

      if (nextInstallment) {
        upcomingPayment = {
          amount: nextInstallment.amount,
          dueDate: this.formatDate(new Date(nextInstallment.dueDate)),
        };
      } else {
        // Fallback: Calculate the next payment date (30 days from disbursement date or today)
        const disbursementDate = targetLoan?.disbursementDate || new Date();
        const nextPaymentDate = new Date(disbursementDate);
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

        upcomingPayment = {
          amount: targetLoan?.monthlyPayment || 0,
          dueDate: this.formatDate(nextPaymentDate),
        };
      }
    }

    // Get active plan — use _count already loaded in activeLoans query
    let activePlan = null;
    if (targetLoan) {
      const totalInstallments = targetLoan?.repaymentMonths || 0;
      const paidInstallmentsCount = (targetLoan as any)._count?.installments ?? 0;

      activePlan = {
        current: paidInstallmentsCount,
        total: totalInstallments,
        planType: 'Monthly',
      };
    }

    // Outstanding balance: per-selected-loan if loanId given, else total across all active loans
    const outstandingBalance = targetLoan
      ? (targetLoan.outstandingBalance || 0)
      : (data.activeLoans || []).reduce((sum: number, loan: any) => sum + (loan.outstandingBalance || 0), 0);

    return {
      upcomingPayment,
      activePlan,
      balance: {
        amount: outstandingBalance,
        description: 'Balance',
      },
      wallet: {
        amount: data.wallet?.balance || 0,
        description: 'Available',
        virtualAccountNumber: data.wallet?.virtualAccountNumber || null,
        virtualAccountBank: data.wallet?.virtualAccountBank || null,
        embedlyWalletId: data.wallet?.embedlyWalletId || null,
      },
      allLoans: (data.allLoans || []).map((l: any) => ({
        id: l.id,
        loanNumber: l.loanNumber,
        loanAmount: Number(l.loanAmount),
        status: l.status,
        schoolName: l.schoolName,
        createdAt: l.createdAt,
      })),
    };
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
    const disbursements = await this.dashboardRepository.getChartData(userId, targetYear);
    
    console.log({ msg: 'Processing chart data', disbursementCount: disbursements.length });
    
    // Process disbursements into monthly data
    const months = [
      'Jan', 'Feb', 'Mar', 'April', 'May', 'June',
      'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Initialize monthly data with zeros
    const monthlyData: { [key: string]: number } = {};
    months.forEach(month => {
      monthlyData[month] = 0;
    });
    
    // Aggregate disbursement amounts by month
    disbursements.forEach((disbursement: any) => {
      const date = new Date(disbursement.createdAt);
      const monthIndex = date.getMonth();
      const month = months[monthIndex];
      if (month) {
        const amount = Number(disbursement.amount) || 0;
        //@ts-ignore
        monthlyData[month] += amount;
        console.log({ msg: 'Adding to month', month, amount, total: monthlyData[month] });
      }
    });
    
    // Convert to chart data points
    const chartData = months.map(month => ({
      month,
      value: monthlyData[month] || 0,
    }));
    
    console.log({ msg: 'Chart data processed', chartData });
    
    return chartData;
  }
}
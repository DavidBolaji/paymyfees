/**
 * Analytics Repository
 * Database layer for analytics data operations
 */

import { prisma } from '@/src/database/prisma';
import { LoanStatus, TransactionType, TransactionStatus, Installment, Transaction } from '@prisma/client';

export interface AnalyticsData {
  walletBalance: number;
  totalWalletFunding: number;
  totalRepaymentsCompleted: number;
  totalRepaymentAmount: number;
  repaymentProgress: {
    completedInstallments: number;
    totalInstallments: number;
    percentage: number;
  };
  activeLoan: {
    id: string;
    loanNumber: string;
    totalAmount: number;
    amountRepaid: number;
    outstandingBalance: number;
    currentInstallment: number;
    totalInstallments: number;
  } | null;
  upcomingPayment: {
    amount: number;
    dueDate: Date | null;
    installmentNumber: number;
  } | null;
  fundingHistory: {
    count: number;
    totalAmount: number;
  };
  engagementScore: {
    score: number;
    percentage: number;
    metrics: {
      loginFrequency: number;
      paymentConsistency: number;
      walletActivity: number;
      notificationEngagement: number;
    };
  };
  timelineChart: {
    completedPercentage: number;
    pendingPercentage: number;
    completedCount: number;
    pendingCount: number;
  };
}

export interface IAnalyticsRepository {
  getAnalyticsByUserId(userId: string, loanId?: string): Promise<AnalyticsData>;
}

export class AnalyticsRepository implements IAnalyticsRepository {
  /**
   * Get comprehensive analytics for a user
   */
  async getAnalyticsByUserId(userId: string, loanId?: string): Promise<AnalyticsData> {
    // Get wallet data
    const wallet = await this.getWalletData(userId);
    
    // Get active loan data — use specified loan if provided
    const activeLoan = loanId
      ? await this.getLoanDataById(loanId, userId)
      : await this.getActiveLoanData(userId);
    
    // Get repayment data
    const repaymentData = await this.getRepaymentData(userId, activeLoan?.id);
    
    // Get funding history
    const fundingHistory = await this.getFundingHistory(userId);
    
    // Calculate engagement score
    const engagementScore = await this.calculateEngagementScore(userId);
    
    // Get timeline chart data
    const timelineChart = this.calculateTimelineChart(repaymentData.progress);
    
    return {
      walletBalance: wallet.balance,
      totalWalletFunding: wallet.totalFunding,
      totalRepaymentsCompleted: repaymentData.completedCount,
      totalRepaymentAmount: repaymentData.totalAmount,
      repaymentProgress: repaymentData.progress,
      activeLoan: activeLoan ? {
        id: activeLoan.id,
        loanNumber: activeLoan.loanNumber,
        totalAmount: activeLoan.totalAmount,
        amountRepaid: activeLoan.amountRepaid,
        outstandingBalance: activeLoan.outstandingBalance,
        currentInstallment: repaymentData.completedCount,
        totalInstallments: repaymentData.progress.totalInstallments,
      } : null,
      upcomingPayment: repaymentData.upcomingPayment,
      fundingHistory,
      engagementScore,
      timelineChart,
    };
  }

  /**
   * Get wallet data including balance and total funding
   */
  private async getWalletData(userId: string): Promise<{ balance: number; totalFunding: number }> {
    // Get current wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    // Get total wallet funding from successful transactions
    const fundingTransactions = await prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.CREDIT,
        status: TransactionStatus.COMPLETED,
        description: {
          contains: 'wallet funding',
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      balance: wallet ? Number(wallet.balance) : 0,
      totalFunding: fundingTransactions._sum.amount ? Number(fundingTransactions._sum.amount) : 0,
    };
  }

  /**
   * Get active loan data
   */
  private async getActiveLoanData(userId: string) {
    const activeStatuses = [
      LoanStatus.ACTIVE,
      LoanStatus.DISBURSED,
      LoanStatus.APPROVED,
      LoanStatus.UNDER_REVIEW,
      LoanStatus.PENDING,
    ];

    const activeLoan = await prisma.loan.findFirst({
      where: {
        userId,
        status: {
          in: activeStatuses,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!activeLoan) {
      return null;
    }

    return {
      id: activeLoan.id,
      loanNumber: activeLoan.loanNumber,
      totalAmount: Number(activeLoan.totalAmount),
      amountRepaid: Number(activeLoan.amountRepaid),
      outstandingBalance: Number(activeLoan.outstandingBalance),
    };
  }

  /**
   * Get specific loan data by ID (for selected loan analytics)
   */
  private async getLoanDataById(loanId: string, userId: string) {
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId },
    });

    if (!loan) return null;

    return {
      id: loan.id,
      loanNumber: loan.loanNumber,
      totalAmount: Number(loan.totalAmount),
      amountRepaid: Number(loan.amountRepaid),
      outstandingBalance: Number(loan.outstandingBalance),
    };
  }

  /**
   * Get repayment data including completed payments and progress
   */
  private async getRepaymentData(_userId: string, activeLoanId?: string | null) {
    if (!activeLoanId) {
      return {
        completedCount: 0,
        totalAmount: 0,
        progress: {
          completedInstallments: 0,
          totalInstallments: 0,
          percentage: 0,
        },
        upcomingPayment: null,
      };
    }

    // Get all installments for the active loan
    const installments = await prisma.installment.findMany({
      where: {
        loanId: activeLoanId,
      },
      orderBy: {
        installmentNumber: 'asc',
      },
    });

    // Count completed installments
    const completedInstallments = installments.filter(
      (inst: Installment) => inst.status === 'PAID'
    );

    // Get total amount of completed payments
    const totalRepaidAmount = completedInstallments.reduce(
      (sum: number, inst: Installment) => sum + Number(inst.amount),
      0
    );

    // Find next upcoming payment
    const upcomingInstallment = installments.find(
      (inst: Installment) => inst.status === 'PENDING'
    );

    const totalInstallments = installments.length;
    const completedCount = completedInstallments.length;
    const percentage = totalInstallments > 0 
      ? Math.round((completedCount / totalInstallments) * 100) 
      : 0;

    return {
      completedCount,
      totalAmount: totalRepaidAmount,
      progress: {
        completedInstallments: completedCount,
        totalInstallments,
        percentage,
      },
      upcomingPayment: upcomingInstallment
        ? {
            amount: Number(upcomingInstallment.amount),
            dueDate: upcomingInstallment.dueDate,
            installmentNumber: upcomingInstallment.installmentNumber,
          }
        : null,
    };
  }

  /**
   * Get funding history statistics
   */
  private async getFundingHistory(userId: string) {
    const fundingTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.CREDIT,
        status: TransactionStatus.COMPLETED,
      },
      select: {
        amount: true,
      },
    });

    const totalAmount = fundingTransactions.reduce(
      (sum: number, transaction) => sum + Number(transaction.amount),
      0
    );

    return {
      count: fundingTransactions.length,
      totalAmount,
    };
  }

  /**
   * Calculate engagement score based on multiple factors
   * Score is calculated from 0-100 based on:
   * - Login frequency (25%)
   * - Payment consistency (35%)
   * - Wallet activity (20%)
   * - Notification engagement (20%)
   */
  private async calculateEngagementScore(userId: string) {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return {
        score: 0,
        percentage: 0,
        metrics: {
          loginFrequency: 0,
          paymentConsistency: 0,
          walletActivity: 0,
          notificationEngagement: 0,
        },
      };
    }

    // 1. Login Frequency Score (25% weight)
    const loginFrequencyScore = await this.calculateLoginFrequency(userId, user);

    // 2. Payment Consistency Score (35% weight)
    const paymentConsistencyScore = await this.calculatePaymentConsistency(userId);

    // 3. Wallet Activity Score (20% weight)
    const walletActivityScore = await this.calculateWalletActivity(userId);

    // 4. Notification Engagement Score (20% weight)
    const notificationEngagementScore = await this.calculateNotificationEngagement(userId);

    // Calculate weighted total score
    const totalScore = Math.round(
      loginFrequencyScore * 0.25 +
      paymentConsistencyScore * 0.35 +
      walletActivityScore * 0.20 +
      notificationEngagementScore * 0.20
    );

    return {
      score: totalScore,
      percentage: totalScore,
      metrics: {
        loginFrequency: loginFrequencyScore,
        paymentConsistency: paymentConsistencyScore,
        walletActivity: walletActivityScore,
        notificationEngagement: notificationEngagementScore,
      },
    };
  }

  /**
   * Calculate login frequency score
   * Based on recency and frequency of logins
   */
  private async calculateLoginFrequency(_userId: string, user: any): Promise<number> {
    const now = new Date();
    // const accountAge = now.getTime() - user.createdAt.getTime();
    // const daysOld = Math.max(1, accountAge / (1000 * 60 * 60 * 24));

    // Score based on last login recency
    let recencyScore = 0;
    if (user.lastLogin) {
      const daysSinceLogin = (now.getTime() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLogin < 1) {
        recencyScore = 100; // Logged in today
      } else if (daysSinceLogin < 3) {
        recencyScore = 80; // Logged in within 3 days
      } else if (daysSinceLogin < 7) {
        recencyScore = 60; // Logged in within a week
      } else if (daysSinceLogin < 14) {
        recencyScore = 40; // Logged in within 2 weeks
      } else if (daysSinceLogin < 30) {
        recencyScore = 20; // Logged in within a month
      } else {
        recencyScore = 10; // Logged in over a month ago
      }
    } else {
      recencyScore = 50; // Never logged in (first time)
    }

    return recencyScore;
  }

  /**
   * Calculate payment consistency score
   * Based on on-time payments and payment history
   */
  private async calculatePaymentConsistency(userId: string): Promise<number> {
    // Get all installments for user's loans
    const installments = await prisma.installment.findMany({
      where: {
        loan: {
          userId,
        },
      },
    });

    if (installments.length === 0) {
      return 100; // No loans yet, perfect score
    }

    // Calculate on-time payment rate
    const paidInstallments = installments.filter((inst: Installment) => inst.status === 'PAID');
    const overdueInstallments = installments.filter((inst: Installment) => inst.status === 'OVERDUE');
    
    // Score based on payment record
    let score = 100;
    
    // Deduct points for overdue payments
    if (overdueInstallments.length > 0) {
      const overdueRate = overdueInstallments.length / installments.length;
      score -= overdueRate * 50; // Up to 50 points deduction for overdue payments
    }

    // Bonus for having paid installments
    if (paidInstallments.length > 0) {
      const paidRate = paidInstallments.length / installments.length;
      score = score * (0.5 + paidRate * 0.5); // Adjust score based on paid rate
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate wallet activity score
   * Based on wallet funding frequency and amounts
   */
  private async calculateWalletActivity(userId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent wallet transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: thirtyDaysAgo,
        },
        status: TransactionStatus.COMPLETED,
      },
    });

    if (recentTransactions.length === 0) {
      return 30; // Minimal activity score
    }

    // Score based on transaction frequency
    let score = Math.min(50, recentTransactions.length * 5); // Up to 50 points for frequency

    // Bonus for variety of transaction types
    const creditCount = recentTransactions.filter((t: Transaction) => t.type === TransactionType.CREDIT).length;
    const debitCount = recentTransactions.filter((t: Transaction) => t.type === TransactionType.DEBIT).length;
    
    if (creditCount > 0 && debitCount > 0) {
      score += 30; // Bonus for both types of transactions
    } else if (creditCount > 0 || debitCount > 0) {
      score += 20; // Partial bonus for one type
    }

    return Math.min(100, score);
  }

  /**
   * Calculate notification engagement score
   * Based on notification read rate
   */
  private async calculateNotificationEngagement(userId: string): Promise<number> {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      select: {
        isRead: true,
      },
    });

    if (notifications.length === 0) {
      return 50; // Default score if no notifications
    }

    const readCount = notifications.filter((n: any) => n.isRead).length;
    const readRate = readCount / notifications.length;

    return Math.round(readRate * 100);
  }

  /**
   * Calculate timeline chart data for completed vs pending repayments
   */
  private calculateTimelineChart(progress: {
    completedInstallments: number;
    totalInstallments: number;
    percentage: number;
  }) {
    const completedCount = progress.completedInstallments;
    const totalCount = progress.totalInstallments;
    const pendingCount = totalCount - completedCount;

    // Calculate percentages
    const completedPercentage = totalCount > 0 
      ? Math.round((completedCount / totalCount) * 100)
      : 0;
    const pendingPercentage = totalCount > 0 
      ? Math.round((pendingCount / totalCount) * 100)
      : 0;

    return {
      completedPercentage,
      pendingPercentage,
      completedCount,
      pendingCount,
    };
  }
}
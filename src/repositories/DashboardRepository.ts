/**
 * Dashboard Repository
 * Data access layer for dashboard-related operations
 */

import { prisma } from '@/src/lib/prisma';
import { LoanStatus } from '@prisma/client';

/**
 * Dashboard Repository Interface
 */
export interface IDashboardRepository {
  getUserStats(userId: string): Promise<any>;
  getUserAnalytics(userId: string): Promise<any>;
  getChartData(userId: string, year?: number): Promise<any>;
}

/**
 * Dashboard Repository Implementation
 */
export class DashboardRepository implements IDashboardRepository {
  /**
   * Get user dashboard statistics
   */
  async getUserStats(userId: string): Promise<any> {
    console.log({ msg: 'Fetching user dashboard stats from database', userId });
    
    try {
      // Get user to check role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get active loans (includes DISBURSED and ACTIVE status)
      const activeLoans = await prisma.loan.findMany({
        where: {
          userId,
          status: {
            in: [LoanStatus.DISBURSED, LoanStatus.ACTIVE],
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get ALL loans for the loan selector dropdown
      const allLoans = await prisma.loan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          loanNumber: true,
          loanAmount: true,
          status: true,
          schoolName: true,
          createdAt: true,
        },
      });
      
      // Get wallet balance and virtual account details
      const wallet = await prisma.wallet.findUnique({
        where: {
          userId,
        },
        select: {
          balance: true,
          currency: true,
          autoDebitEnabled: true,
          virtualAccountNumber: true,
          virtualAccountBank: true,
          embedlyWalletId: true,
        },
      });
      
      return {
        activeLoans,
        allLoans,
        wallet,
        userRole: user.role,
      };
    } catch (error) {
      console.error({ 
        msg: 'Error fetching user dashboard stats', 
        userId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
  
  /**
   * Get user analytics data
   */
  async getUserAnalytics(userId: string): Promise<any> {
    console.log({ msg: 'Fetching user analytics from database', userId });
    
    try {
      // Get all loans (excluding only CANCELLED and REJECTED)
      const loans = await prisma.loan.findMany({
        where: {
          userId,
          status: {
            notIn: [LoanStatus.CANCELLED, LoanStatus.REJECTED],
          },
        },
      });
      
      // Get all transactions
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      });
      
      return {
        loans,
        transactions,
      };
    } catch (error) {
      console.error({ 
        msg: 'Error fetching user analytics', 
        userId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
  
  /**
   * Get chart data for user
   */
  async getChartData(userId: string, year?: number): Promise<any> {
    const targetYear = year || new Date().getFullYear();
    
    console.log({ msg: 'Fetching chart data from database', userId, year: targetYear });
    
    try {
      // Get loans disbursed in the specified year
      const startDate = new Date(targetYear, 0, 1); // January 1st of the year
      const endDate = new Date(targetYear, 11, 31, 23, 59, 59); // December 31st of the year
      
      // Fetch disbursements (which represent actual loan amounts given out)
      const disbursements = await prisma.disbursement.findMany({
        where: {
          loan: {
            userId,
          },
          disbursedAt: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            in: ['COMPLETED', 'PENDING'], // Include completed and pending disbursements
          },
        },
        select: {
          amount: true,
          disbursedAt: true,
          loan: {
            select: {
              loanAmount: true,
            },
          },
        },
        orderBy: {
          disbursedAt: 'asc',
        },
      });
      
      console.log({ 
        msg: 'Chart data fetched', 
        userId, 
        year: targetYear, 
        disbursementCount: disbursements.length 
      });
      
      // Transform to match expected format (with createdAt and amount)
      return disbursements.map(d => ({
        createdAt: d.disbursedAt,
        amount: Number(d.amount),
      }));
    } catch (error) {
      console.error({ 
        msg: 'Error fetching chart data', 
        userId,
        year: targetYear,
        error: (error as Error).message 
      });
      throw error;
    }
  }
}
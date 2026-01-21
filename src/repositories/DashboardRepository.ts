/**
 * Dashboard Repository
 * Data access layer for dashboard-related operations
 */

import { prisma } from '@/src/lib/prisma';
import { LoanStatus } from '@prisma/client';
import { logger } from '@/src/utils/logger';

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
    logger.info({ msg: 'Fetching user dashboard stats from database', userId });
    
    try {
      // Get active loans
      const activeLoans = await prisma.loan.findMany({
        where: {
          userId,
          status: LoanStatus.ACTIVE,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Get wallet balance
      const wallet = await prisma.wallet.findUnique({
        where: {
          userId,
        },
      });
      
      return {
        activeLoans,
        wallet,
      };
    } catch (error) {
      logger.error({ 
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
    logger.info({ msg: 'Fetching user analytics from database', userId });
    
    try {
      // Get all loans
      const loans = await prisma.loan.findMany({
        where: {
          userId,
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
      logger.error({ 
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
    
    logger.info({ msg: 'Fetching chart data from database', userId, year: targetYear });
    
    try {
      // Get transactions for the specified year
      const startDate = new Date(targetYear, 0, 1); // January 1st of the year
      const endDate = new Date(targetYear, 11, 31, 23, 59, 59); // December 31st of the year
      
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      return transactions;
    } catch (error) {
      logger.error({ 
        msg: 'Error fetching chart data', 
        userId,
        year: targetYear,
        error: (error as Error).message 
      });
      throw error;
    }
  }
}
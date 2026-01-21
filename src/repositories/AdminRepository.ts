/**
 * Admin Repository
 * Database layer for Admin operations
 */

import { prisma } from '@/src/database/prisma';
import { LoanStatus } from '@prisma/client';

import { LoanApplication } from '@/src/services/AdminService';

export interface IAdminRepository {
  getLoanStats(): Promise<{
    totalLoans: number;
    pendingLoans: number;
    approvedLoans: number;
    disbursedLoans: number;
    activeLoans: number;
    completedLoans: number;
    defaultedLoans: number;
    rejectedLoans: number;
    cancelledLoans: number;
  }>;
  getTotalLoanAmount(): Promise<number>;
  getTotalDisbursedAmount(): Promise<number>;
  getTotalRepaidAmount(): Promise<number>;
  getTotalOutstandingAmount(): Promise<number>;
  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
  }>;
  getSchoolStats(): Promise<{
    totalSchools: number;
    verifiedSchools: number;
    pendingSchools: number;
  }>;
  getLoanApplications(): Promise<LoanApplication[]>;
}

export class AdminRepository implements IAdminRepository {
  async getLoanStats(): Promise<{
    totalLoans: number;
    pendingLoans: number;
    approvedLoans: number;
    disbursedLoans: number;
    activeLoans: number;
    completedLoans: number;
    defaultedLoans: number;
    rejectedLoans: number;
    cancelledLoans: number;
  }> {
    const totalLoans = await prisma.loan.count();
    const pendingLoans = await prisma.loan.count({ where: { status: LoanStatus.PENDING } });
    const approvedLoans = await prisma.loan.count({ where: { status: LoanStatus.APPROVED } });
    const disbursedLoans = await prisma.loan.count({ where: { status: LoanStatus.DISBURSED } });
    const activeLoans = await prisma.loan.count({ where: { status: LoanStatus.ACTIVE } });
    const completedLoans = await prisma.loan.count({ where: { status: LoanStatus.COMPLETED } });
    const defaultedLoans = await prisma.loan.count({ where: { status: LoanStatus.DEFAULTED } });
    const rejectedLoans = await prisma.loan.count({ where: { status: LoanStatus.REJECTED } });
    const cancelledLoans = await prisma.loan.count({ where: { status: LoanStatus.CANCELLED } });

    return {
      totalLoans,
      pendingLoans,
      approvedLoans,
      disbursedLoans,
      activeLoans,
      completedLoans,
      defaultedLoans,
      rejectedLoans,
      cancelledLoans,
    };
  }

  async getTotalLoanAmount(): Promise<number> {
    const result = await prisma.loan.aggregate({
      _sum: {
        loanAmount: true,
      },
    });
    return Number(result._sum.loanAmount || 0);
  }

  async getTotalDisbursedAmount(): Promise<number> {
    const result = await prisma.loan.aggregate({
      _sum: {
        amountDisbursed: true,
      },
    });
    return Number(result._sum.amountDisbursed || 0);
  }

  async getTotalRepaidAmount(): Promise<number> {
    const result = await prisma.loan.aggregate({
      _sum: {
        amountRepaid: true,
      },
    });
    return Number(result._sum.amountRepaid || 0);
  }

  async getTotalOutstandingAmount(): Promise<number> {
    const result = await prisma.loan.aggregate({
      _sum: {
        outstandingBalance: true,
      },
    });
    return Number(result._sum.outstandingBalance || 0);
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
  }> {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const inactiveUsers = await prisma.user.count({ where: { isActive: false } });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
    };
  }

  async getSchoolStats(): Promise<{
    totalSchools: number;
    verifiedSchools: number;
    pendingSchools: number;
  }> {
    const totalSchools = await prisma.school.count();
    const verifiedSchools = await prisma.school.count({ where: { isVerified: true } });
    const pendingSchools = await prisma.school.count({ where: { isVerified: false } });

    return {
      totalSchools,
      verifiedSchools,
      pendingSchools,
    };
  }

  /**
   * Get loan applications for admin review
   */
  async getLoanApplications(): Promise<LoanApplication[]> {
    // Get all loan applications with user information
    const loans = await prisma.loan.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map to the LoanApplication interface
    return loans.map((loan: any) => ({
      id: loan.id,
      userId: loan.userId,
      userName: loan.user.name,
      loanAmount: Number(loan.loanAmount),
      purpose: loan.purpose,
      status: loan.status,
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt,
    }));
  }
}
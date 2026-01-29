/**
 * Timeline Repository
 * Database layer for Timeline data operations
 */

import { prisma } from '@/src/database/prisma';
import { Loan, Installment, Disbursement, SchoolVerification, LoanStatus } from '@prisma/client';

export interface LoanWithRelations extends Loan {
  installments: Installment[];
  disbursement: Disbursement | null;
  verification: SchoolVerification | null;
}

/**
 * Timeline Repository Interface
 */
export interface ITimelineRepository {
  getLoanWithInstallments(loanId: string): Promise<LoanWithRelations | null>;
  getUserActiveLoan(userId: string): Promise<LoanWithRelations | null>;
}

/**
 * Timeline Repository Implementation
 */
export class TimelineRepository implements ITimelineRepository {
  /**
   * Get loan with all related timeline data by loan ID
   */
  async getLoanWithInstallments(loanId: string): Promise<LoanWithRelations | null> {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        installments: {
          orderBy: { installmentNumber: 'asc' },
        },
        disbursement: true,
        verification: true,
      },
    });

    return loan;
  }

  /**
   * Get user's most recent active loan
   * Priority: ACTIVE > DISBURSED > APPROVED > most recent loan
   */
  async getUserActiveLoan(userId: string): Promise<LoanWithRelations | null> {
    // First try to get an ACTIVE loan
    let loan = await prisma.loan.findFirst({
      where: { 
        userId,
        status: LoanStatus.ACTIVE 
      },
      include: {
        installments: {
          orderBy: { installmentNumber: 'asc' },
        },
        disbursement: true,
        verification: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // If no ACTIVE loan, try DISBURSED
    if (!loan) {
      loan = await prisma.loan.findFirst({
        where: { 
          userId,
          status: LoanStatus.DISBURSED 
        },
        include: {
          installments: {
            orderBy: { installmentNumber: 'asc' },
          },
          disbursement: true,
          verification: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // If no DISBURSED loan, try APPROVED
    if (!loan) {
      loan = await prisma.loan.findFirst({
        where: { 
          userId,
          status: LoanStatus.APPROVED 
        },
        include: {
          installments: {
            orderBy: { installmentNumber: 'asc' },
          },
          disbursement: true,
          verification: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // If still no loan, get the most recent loan of any status
    if (!loan) {
      loan = await prisma.loan.findFirst({
        where: { userId },
        include: {
          installments: {
            orderBy: { installmentNumber: 'asc' },
          },
          disbursement: true,
          verification: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return loan;
  }
}
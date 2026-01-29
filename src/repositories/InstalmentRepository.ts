/**
 * Installment Repository
 * Database layer for Installment entity operations
 */
import { prisma } from '@/src/database/prisma';
import { Installment, PaymentStatus } from '@prisma/client';


/**
 * Installment Repository Interface
 */
export interface IInstallmentRepository {
  findById(id: string): Promise<Installment | null>;
  findByLoanId(loanId: string): Promise<Installment[]>;
  findPendingByUserId(userId: string): Promise<Installment[]>;
  findNextDueInstallment(loanId: string): Promise<Installment | null>;
  updateStatus(id: string, status: PaymentStatus, paidDate?: Date): Promise<Installment>;
  findOverdueInstallments(userId: string): Promise<Installment[]>;
}

/**
 * Installment Repository Implementation
 */
export class InstallmentRepository implements IInstallmentRepository {
  /**
   * Find installment by ID
   */
  async findById(id: string): Promise<Installment | null> {
    return await prisma.installment.findUnique({
      where: { id },
      include: {
        loan: true,
      },
    });
  }

  /**
   * Find all installments for a loan
   */
  async findByLoanId(loanId: string): Promise<Installment[]> {
    return await prisma.installment.findMany({
      where: { loanId },
      orderBy: { installmentNumber: 'asc' },
    });
  }

  /**
   * Find pending installments for a user
   */
  async findPendingByUserId(userId: string): Promise<Installment[]> {
    return await prisma.installment.findMany({
      where: {
        loan: {
          userId,
          status: { in: ['ACTIVE', 'DISBURSED'] },
        },
        status: 'PENDING',
      },
      include: {
        loan: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Find next due installment for a loan
   */
  async findNextDueInstallment(loanId: string): Promise<Installment | null> {
    return await prisma.installment.findFirst({
      where: {
        loanId,
        status: 'PENDING',
      },
      orderBy: { dueDate: 'asc' },
      include: {
        loan: true,
      },
    });
  }

  /**
   * Update installment status
   */
  async updateStatus(
    id: string,
    status: PaymentStatus,
    paidDate?: Date
  ): Promise<Installment> {
    return await prisma.installment.update({
      where: { id },
      data: {
        status,
        paidDate: paidDate || (status === 'PAID' ? new Date() : undefined),
      },
    });
  }

  /**
   * Find overdue installments for a user
   */
  async findOverdueInstallments(userId: string): Promise<Installment[]> {
    const today = new Date();
    
    return await prisma.installment.findMany({
      where: {
        loan: {
          userId,
          status: { in: ['ACTIVE', 'DISBURSED'] },
        },
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
      },
      include: {
        loan: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
/**
 * Loan Repository
 * Database layer for Loan entity operations
 */

import { prisma, executeWriteTransaction } from '@/src/database/prisma';
import { LoanDTO, CreateLoanInput, PaginationParams } from '@/src/types';
import { NotFoundError } from '@/src/types/errors';
import { Loan, LoanStatus } from '@/prisma/app/generated/prisma-client';

export interface ILoanRepository {
  create(input: CreateLoanInput & { 
    loanNumber: string; 
    interestRate: number; 
    totalInterest: number; 
    totalAmount: number; 
    monthlyPayment: number; 
    outstandingBalance: number;
  }): Promise<LoanDTO>;
  findById(id: string): Promise<LoanDTO | null>;
  findByUserId(userId: string, pagination: PaginationParams): Promise<{ loans: LoanDTO[]; total: number }>;
  update(id: string, data: Partial<Loan>): Promise<LoanDTO>;
  updateStatus(id: string, status: LoanStatus): Promise<LoanDTO>;
}

export class LoanRepository implements ILoanRepository {
  async create(input: CreateLoanInput & { 
    loanNumber: string; 
    interestRate: number; 
    totalInterest: number; 
    totalAmount: number; 
    monthlyPayment: number; 
    outstandingBalance: number;
  }): Promise<LoanDTO> {
    const loan = await prisma.loan.create({
      data: input,
    });
    return this.toDTO(loan);
  }

  async findById(id: string): Promise<LoanDTO | null> {
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        student: true,
        school: true,
        installments: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });
    return loan ? this.toDTO(loan) : null;
  }

  async findByUserId(userId: string, pagination: PaginationParams): Promise<{ loans: LoanDTO[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: true,
          school: true,
        },
      }),
      prisma.loan.count({ where: { userId } }),
    ]);

    return {
      loans: loans.map((loan: any) => this.toDTO(loan)),
      total,
    };
  }

  async update(id: string, data: Partial<Loan>): Promise<LoanDTO> {
    const loan = await prisma.loan.update({
      where: { id },
      data,
    });
    return this.toDTO(loan);
  }

  async updateStatus(id: string, status: LoanStatus): Promise<LoanDTO> {
    return await executeWriteTransaction(async (tx) => {
      // Get current loan
      const currentLoan = await tx.loan.findUnique({
        where: { id },
      });

      if (!currentLoan) {
        throw new NotFoundError('Loan not found');
      }

      // Update loan status
      const loan = await tx.loan.update({
        where: { id },
        data: { status },
      });

      // Create status history
      await tx.loanStatusHistory.create({
        data: {
          loanId: id,
          previousStatus: currentLoan.status,
          newStatus: status,
        },
      });

      return this.toDTO(loan);
    });
  }

  private toDTO(loan: any): LoanDTO {
    return {
      id: loan.id,
      loanNumber: loan.loanNumber,
      userId: loan.userId,
      studentId: loan.studentId,
      schoolId: loan.schoolId,
      loanAmount: Number(loan.loanAmount),
      interestRate: Number(loan.interestRate),
      totalInterest: Number(loan.totalInterest),
      totalAmount: Number(loan.totalAmount),
      monthlyPayment: Number(loan.monthlyPayment),
      repaymentMonths: loan.repaymentMonths,
      schoolName: loan.schoolName,
      academicSession: loan.academicSession,
      term: loan.term,
      status: loan.status,
      amountDisbursed: Number(loan.amountDisbursed),
      amountRepaid: Number(loan.amountRepaid),
      outstandingBalance: Number(loan.outstandingBalance),
      applicationDate: loan.applicationDate,
      approvalDate: loan.approvalDate,
      disbursementDate: loan.disbursementDate,
      firstPaymentDate: loan.firstPaymentDate,
      lastPaymentDate: loan.lastPaymentDate,
      completionDate: loan.completionDate,
      approvedBy: loan.approvedBy,
      rejectionReason: loan.rejectionReason,
      notes: loan.notes,
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt,
    };
  }
}

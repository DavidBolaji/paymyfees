/**
 * Loan Repository
 * Database layer for Loan entity operations
 * Supports both local and international student loans
 */

import { prisma, executeWriteTransaction } from '@/src/database/prisma';
import { LoanDTO, PaginationParams } from '@/src/types';
import { NotFoundError } from '@/src/types/errors';
import { Loan, LoanStatus, ResidencyStatus } from '@prisma/client';

export interface UpdateStatusOptions {
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
  changedBy?: string;
  reason?: string;
}

export interface CreateLoanData {
  userId: string;
  // studentId: string;
  schoolId: string;
  loanNumber: string;
  loanAmount: number;
  interestRate: number;
  totalInterest: number;
  totalAmount: number;
  monthlyPayment: number;
  repaymentMonths: number;
  schoolName: string;
  academicSession: string;
  residencyStatus: ResidencyStatus;
  term?: string;
  
  // International student specific fields
  countryOfStudy?: string;
  programCourseOfStudy?: string;
  employmentStatus?: string;
  companyName?: string;
  jobTitleRole?: string;
  monthlyNetIncome?: number;
  paymentFrequency?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  countryOfBankAccount?: string;
  
  status: LoanStatus;
  outstandingBalance: number;
  amountDisbursed: number;
  amountRepaid: number;
  applicationDate: Date;
}

export interface ILoanRepository {
  create(input: CreateLoanData): Promise<LoanDTO>;
  findById(id: string): Promise<LoanDTO | null>;
  findByUserId(userId: string, filter: any, pagination: PaginationParams): Promise<{ loans: LoanDTO[]; total: number }>;
  update(id: string, data: Partial<Loan>): Promise<LoanDTO>;
  updateStatus(id: string, status: LoanStatus, options?: UpdateStatusOptions): Promise<LoanDTO>;
}

export class LoanRepository implements ILoanRepository {
  async create(input: CreateLoanData): Promise<LoanDTO> {
    const loan = await prisma.loan.create({
      data: input,
    });
    return this.toDTO(loan);
  }

  async findById(id: string): Promise<LoanDTO | null> {
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        // student: true,
        user: true,
        school: true,
        installments: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });
    return loan ? this.toDTO(loan) : null;
  }

  async findByUserId(userId: string, filters: any, pagination: PaginationParams): Promise<{ loans: LoanDTO[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    // Handle status filter
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        where.status = { in: filters.status };
      } else {
        where.status = filters.status;
      }
    }

    // Handle residency status filter
    if (filters.residencyStatus) {
      where.residencyStatus = filters.residencyStatus;
    }

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          // student: true,
          user: true,
          school: true,
        },
      }),
      prisma.loan.count({ where }),
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

  async updateStatus(id: string, status: LoanStatus, options?: UpdateStatusOptions): Promise<LoanDTO> {
    return await executeWriteTransaction(async (tx) => {
      // Get current loan
      const currentLoan = await tx.loan.findUnique({
        where: { id },
      });

      if (!currentLoan) {
        throw new NotFoundError('Loan not found');
      }

      // Prepare update data
      const updateData: any = { status };
      
      // Add optional fields if provided
      if (options?.approvedBy) {
        updateData.approvedBy = options.approvedBy;
      }
      if (options?.rejectionReason) {
        updateData.rejectionReason = options.rejectionReason;
      }
      if (options?.notes) {
        updateData.notes = options.notes;
      }

      // Set approval date if status is APPROVED
      if (status === LoanStatus.APPROVED && !currentLoan.approvalDate) {
        updateData.approvalDate = new Date();
      }

      // Set disbursement date if status is DISBURSED
      if (status === LoanStatus.DISBURSED && !currentLoan.disbursementDate) {
        updateData.disbursementDate = new Date();
      }

      // Update loan status
      const loan = await tx.loan.update({
        where: { id },
        data: updateData,
      });

      // Create status history
      await tx.loanStatusHistory.create({
        data: {
          loanId: id,
          previousStatus: currentLoan.status,
          newStatus: status,
          changedBy: options?.changedBy,
          reason: options?.reason,
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
      // studentId: loan.studentId,
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
      residencyStatus: loan.residencyStatus,
      
      // International student specific fields
      countryOfStudy: loan.countryOfStudy,
      programCourseOfStudy: loan.programCourseOfStudy,
      employmentStatus: loan.employmentStatus,
      companyName: loan.companyName,
      jobTitleRole: loan.jobTitleRole,
      monthlyNetIncome: loan.monthlyNetIncome ? Number(loan.monthlyNetIncome) : undefined,
      paymentFrequency: loan.paymentFrequency,
      accountHolderName: loan.accountHolderName,
      bankName: loan.bankName,
      accountNumber: loan.accountNumber,
      countryOfBankAccount: loan.countryOfBankAccount,
      
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
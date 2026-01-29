/**
 * Loan Service
 * Business logic for loan operations
 * Supports both local and international student loans
 */

import { LoanRepository, ILoanRepository } from '@/src/repositories/LoanRepository';
import { executeTransaction } from '@/src/database/prisma';
import { ValidationError, NotFoundError } from '@/src/types/errors';
import { LoanStatus, ResidencyStatus } from '@prisma/client';
import {
  LoanDTO,
  LocalLoanInput,
  InternationalLoanInput,
  UpdateLoanStatusInput,
  LoanCalculation,
  PaginationParams
} from '@/src/types';

/**
 * Loan Service Interface
 */
export interface ILoanService {
  createLocalLoan(input: Omit<LocalLoanInput, 'userId' | 'schoolId'> & { userId: string; schoolId: string }): Promise<LoanDTO>;
  createInternationalLoan(input: Omit<InternationalLoanInput, 'userId' | 'schoolId'> & { userId: string; schoolId: string }): Promise<LoanDTO>;
  getLoanById(id: string): Promise<LoanDTO>;
  getLoansByUserId(userId: string, status?: LoanStatus, pagination?: PaginationParams, residencyStatus?: ResidencyStatus): Promise<{ loans: LoanDTO[]; total: number; page: number; limit: number }>;
  updateLoanStatus(input: UpdateLoanStatusInput): Promise<LoanDTO>;
  calculateLoan(loanAmount: number, repaymentMonths: number): LoanCalculation;
}

/**
 * Convert Prisma Loan to LoanDTO
 */
function toLoanDTO(loan: any): LoanDTO {
  return {
    ...loan,
    loanAmount: Number(loan.loanAmount),
    interestRate: Number(loan.interestRate),
    totalInterest: Number(loan.totalInterest),
    totalAmount: Number(loan.totalAmount),
    monthlyPayment: Number(loan.monthlyPayment),
    amountDisbursed: Number(loan.amountDisbursed),
    amountRepaid: Number(loan.amountRepaid),
    outstandingBalance: Number(loan.outstandingBalance),
    monthlyNetIncome: loan.monthlyNetIncome ? Number(loan.monthlyNetIncome) : undefined
  };
}

/**
 * Loan Service Implementation
 */
export class LoanService implements ILoanService {
  private loanRepository: ILoanRepository;

  constructor(loanRepository?: ILoanRepository) {
    this.loanRepository = loanRepository || new LoanRepository();
  }

  /**
   * Create a local student loan application
   */
  async createLocalLoan(input: Omit<LocalLoanInput, 'userId' | 'schoolId'> & { userId: string; schoolId: string }): Promise<LoanDTO> {
    console.log({ msg: 'Creating local loan application', userId: input.userId });

    // Check for existing active loans
    await this.validateNoActiveLoan(input.userId);

    // Calculate loan details
    const loanCalculation = this.calculateLoan(input.loanAmount, input.repaymentMonths);

    // Generate loan number
    const loanNumber = `LOAN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create loan with transaction
    const loan = await executeTransaction(async (tx) => {
      // Create loan
      const newLoan = await this.loanRepository.create({
        userId: input.userId,
        // studentId: input.studentId,
        schoolId: input.schoolId,
        loanNumber,
        loanAmount: input.loanAmount,
        interestRate: loanCalculation.interestRate,
        totalInterest: loanCalculation.totalInterest,
        totalAmount: loanCalculation.totalAmount,
        monthlyPayment: loanCalculation.monthlyPayment,
        repaymentMonths: input.repaymentMonths,
        schoolName: input.schoolName,
        academicSession: input.academicSession,
        term: input.term,
        residencyStatus: ResidencyStatus.LOCAL,
        status: LoanStatus.PENDING,
        amountDisbursed: 0,
        amountRepaid: 0,
        outstandingBalance: loanCalculation.totalAmount,
        applicationDate: new Date(),
      });

      // Create installments
      await this.createInstallments(tx, newLoan.id, loanCalculation.monthlyPayment, input.repaymentMonths);

      return newLoan;
    });

    console.log({ msg: 'Local loan application created', loanId: loan.id });
    return toLoanDTO(loan);
  }

  /**
   * Create an international student loan application
   */
  async createInternationalLoan(input: Omit<InternationalLoanInput, 'userId' | 'schoolId'> & { userId: string; schoolId: string }): Promise<LoanDTO> {
    console.log({ msg: 'Creating international loan application', userId: input.userId });

    // Check for existing active loans
    await this.validateNoActiveLoan(input.userId);

    // Calculate loan details
    const loanCalculation = this.calculateLoan(input.loanAmount, input.repaymentMonths);

    // Generate loan number
    const loanNumber = `INTL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create loan with transaction
    const loan = await executeTransaction(async (tx) => {
      // Create loan
      const newLoan = await this.loanRepository.create({
        userId: input.userId,
        // studentId: input.studentId,
        schoolId: input.schoolId,
        loanNumber,
        loanAmount: input.loanAmount,
        interestRate: loanCalculation.interestRate,
        totalInterest: loanCalculation.totalInterest,
        totalAmount: loanCalculation.totalAmount,
        monthlyPayment: loanCalculation.monthlyPayment,
        repaymentMonths: input.repaymentMonths,
        schoolName: input.schoolName,
        academicSession: input.academicSession,
        residencyStatus: ResidencyStatus.INTERNATIONAL,
        
        // International student specific fields
        countryOfStudy: input.countryOfStudy,
        programCourseOfStudy: input.programCourseOfStudy,
        employmentStatus: input.employmentStatus,
        companyName: input.companyName,
        jobTitleRole: input.jobTitleRole,
        monthlyNetIncome: input.monthlyNetIncome,
        paymentFrequency: input.paymentFrequency,
        accountHolderName: input.accountHolderName,
        bankName: input.bankName,
        accountNumber: input.accountNumber,
        countryOfBankAccount: input.countryOfBankAccount,
        
        status: LoanStatus.PENDING,
        amountDisbursed: 0,
        amountRepaid: 0,
        outstandingBalance: loanCalculation.totalAmount,
        applicationDate: new Date(),
      });

      // Create installments
      await this.createInstallments(tx, newLoan.id, loanCalculation.monthlyPayment, input.repaymentMonths);

      return newLoan;
    });

    console.log({ msg: 'International loan application created', loanId: loan.id });
    return toLoanDTO(loan);
  }

  /**
   * Create loan installments
   */
  private async createInstallments(tx: any, loanId: string, monthlyPayment: number, repaymentMonths: number): Promise<void> {
    const installments = [];
    let firstPaymentDate = new Date();
    firstPaymentDate.setDate(firstPaymentDate.getDate() + 30); // First payment due in 30 days

    for (let i = 0; i < repaymentMonths; i++) {
      const dueDate = new Date(firstPaymentDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      installments.push({
        loanId,
        installmentNumber: i + 1,
        amount: monthlyPayment,
        dueDate,
        status: 'PENDING' as any,
        daysOverdue: 0,
        lateFee: 0,
      });
    }

    await tx.installment.createMany({ data: installments });
  }

  /**
   * Validate user doesn't have an active loan
   */
  private async validateNoActiveLoan(userId: string): Promise<void> {
    const activeStatuses = [
      LoanStatus.ACTIVE,
      LoanStatus.DISBURSED,
      LoanStatus.APPROVED,
      LoanStatus.UNDER_REVIEW,
      LoanStatus.PENDING,
    ];

    const { loans } = await this.loanRepository.findByUserId(
      userId,
      { status: activeStatuses },
      { page: 1, limit: 1 }
    );

    if (loans.length > 0) {
      const activeLoan = loans[0];
      throw new ValidationError(
        `You already have an active loan or in review (${activeLoan?.loanNumber}). Please complete or cancel your current loan before applying for another.`
      );
    }
  }

  /**
   * Get loan by ID
   */
  async getLoanById(id: string): Promise<LoanDTO> {
    console.log({ msg: 'Getting loan by ID', loanId: id });

    const loan = await this.loanRepository.findById(id);

    if (!loan) {
      throw new NotFoundError('Loan not found');
    }

    return toLoanDTO(loan);
  }

  /**
   * Get loans by user ID
   */
  async getLoansByUserId(
    userId: string,
    status?: LoanStatus,
    pagination?: PaginationParams,
    residencyStatus?: ResidencyStatus
  ): Promise<{ loans: LoanDTO[]; total: number; page: number; limit: number }> {
    console.log({ msg: 'Getting loans by user ID', userId, status, residencyStatus });

    const filters: any = {};
    if (status) {
      filters.status = status;
    }
    if (residencyStatus) {
      filters.residencyStatus = residencyStatus;
    }

    const { loans, total } = await this.loanRepository.findByUserId(
      userId,
      filters,
      {
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
      }
    );

    return {
      loans: loans.map(loan => toLoanDTO(loan)),
      total,
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
    };
  }

  /**
   * Update loan status
   */
  async updateLoanStatus(input: UpdateLoanStatusInput): Promise<LoanDTO> {
    console.log({ msg: 'Updating loan status', loanId: input.loanId, status: input.status });

    const loan = await this.loanRepository.findById(input.loanId);

    if (!loan) {
      throw new NotFoundError('Loan not found');
    }

    // Validate status transition
    this.validateStatusTransition(loan.status, input.status);

    // Update loan status
    const updatedLoan = await this.loanRepository.updateStatus(
      input.loanId,
      input.status,
      {
        approvedBy: input.approvedBy,
        rejectionReason: input.rejectionReason,
        notes: input.notes,
        changedBy: input.approvedBy || 'system',
        reason: input.notes || `Status updated to ${input.status}`,
      }
    );

    console.log({ msg: 'Loan status updated', loanId: input.loanId, status: input.status });
    return toLoanDTO(updatedLoan);
  }

  /**
   * Calculate loan details
   */
  calculateLoan(loanAmount: number, repaymentMonths: number): LoanCalculation {
    // Interest rate is 15% per annum
    const annualInterestRate = 0.15;

    // Calculate total interest
    const totalInterest = loanAmount * annualInterestRate * (repaymentMonths / 12);

    // Calculate total amount
    const totalAmount = loanAmount + totalInterest;

    // Calculate monthly payment
    const monthlyPayment = totalAmount / repaymentMonths;

    return {
      loanAmount,
      interestRate: annualInterestRate,
      totalInterest,
      totalAmount,
      monthlyPayment,
      repaymentMonths,
    };
  }

  /**
   * Validate loan status transition
   */
  private validateStatusTransition(currentStatus: LoanStatus, newStatus: LoanStatus): void {
    const allowedTransitions: Record<LoanStatus, LoanStatus[]> = {
      [LoanStatus.PENDING]: [LoanStatus.UNDER_REVIEW, LoanStatus.REJECTED, LoanStatus.CANCELLED],
      [LoanStatus.UNDER_REVIEW]: [LoanStatus.APPROVED, LoanStatus.REJECTED, LoanStatus.CANCELLED],
      [LoanStatus.APPROVED]: [LoanStatus.DISBURSED, LoanStatus.CANCELLED],
      [LoanStatus.REJECTED]: [LoanStatus.PENDING, LoanStatus.CANCELLED],
      [LoanStatus.DISBURSED]: [LoanStatus.ACTIVE],
      [LoanStatus.ACTIVE]: [LoanStatus.COMPLETED, LoanStatus.DEFAULTED],
      [LoanStatus.COMPLETED]: [],
      [LoanStatus.DEFAULTED]: [LoanStatus.ACTIVE],
      [LoanStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition loan status from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
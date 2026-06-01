/**
 * Enhanced Loan Repository
 * Added detailed loan fetching with all related data
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

  // Student profile (optional, for parent loans)
  studentProfileId?: string;

  status: LoanStatus;
  outstandingBalance: number;
  amountDisbursed: number;
  amountRepaid: number;
  applicationDate: Date;
}

export interface DetailedLoanDTO extends LoanDTO {
  installments?: Array<{
    id: string;
    installmentNumber: number;
    amount: number;
    dueDate: Date;
    paidDate: Date | null;
    status: string;
    daysOverdue: number;
    lateFee: number;
  }>;
  documents?: Array<{
    id: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    isVerified: boolean;
    createdAt: Date;
  }>;
  disbursement?: {
    id: string;
    disbursementReference: string;
    amount: number;
    status: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    disbursedAt: Date | null;
    transferReference: string | null;
  } | null;
  school?: {
    id: string;
    schoolName: string;
    schoolAddress: string;
    city: string | null;
    state: string | null;
    country: string | null;
  };
}

export interface ILoanRepository {
  create(input: CreateLoanData): Promise<LoanDTO>;
  findById(id: string): Promise<LoanDTO | null>;
  findByIdDetailed(id: string): Promise<DetailedLoanDTO | null>;
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
    // Check if the id is a UUID or a loan number
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const loan = await prisma.loan.findUnique({
      where: isUUID ? { id } : { loanNumber: id },
      include: {
        user: {
          include: {
            parentProfile: {
              select: { city: true, country: true, completedLoans: true, totalLoans: true }
            }
          }
        },
        school: {
          select: { id: true, schoolName: true, isVerified: true }
        },
        studentProfile: {
          select: { id: true, studentName: true, dateOfBirth: true, relationship: true, classLevel: true }
        },
        installments: {
          orderBy: { installmentNumber: 'asc' },
        },
        documents: {
          select: {
            id: true, documentType: true, fileName: true,
            fileUrl: true, fileSize: true, mimeType: true, isVerified: true
          }
        },
      },
    });
    return loan ? this.toDTO(loan) : null;
  }

  /**
   * Find loan by ID with all detailed information
   * Includes installments, documents, disbursement, and school details
   */
  async findByIdDetailed(id: string): Promise<DetailedLoanDTO | null> {
    // Check if the id is a UUID or a loan number
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const loan = await prisma.loan.findUnique({
      where: isUUID ? { id } : { loanNumber: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        school: {
          select: {
            id: true,
            schoolName: true,
            schoolAddress: true,
            city: true,
            state: true,
            country: true,
          },
        },
        installments: {
          orderBy: { installmentNumber: 'asc' },
          select: {
            id: true,
            installmentNumber: true,
            amount: true,
            dueDate: true,
            paidDate: true,
            status: true,
            daysOverdue: true,
            lateFee: true,
          },
        },
        documents: {
          select: {
            id: true,
            documentType: true,
            fileName: true,
            fileUrl: true,
            fileSize: true,
            mimeType: true,
            isVerified: true,
            createdAt: true,
          },
        },
        disbursement: {
          select: {
            id: true,
            disbursementReference: true,
            amount: true,
            status: true,
            bankName: true,
            accountNumber: true,
            accountName: true,
            disbursedAt: true,
            transferReference: true,
          },
        },
        studentProfile: {
          select: { id: true, studentName: true, dateOfBirth: true, relationship: true, classLevel: true }
        },
      },
    });

    if (!loan) {
      return null;
    }

    return this.toDetailedDTO(loan);
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
      
      // User information (if included in query)
      userName: loan.user?.fullName,
      userEmail: loan.user?.email,
      userPhone: loan.user?.phone,
      userCountry: loan.user?.country,
      userCity: loan.user?.parentProfile?.city ?? loan.user?.city ?? null,
      userIsActive: loan.user?.isActive,
      schoolIsVerified: loan.school?.isVerified,
      userPreviousLoans: loan.user?.parentProfile?.completedLoans ?? 0,

      // Student profile (optional)
      studentProfileId: loan.studentProfileId,
      studentProfile: loan.studentProfile ? {
        id: loan.studentProfile.id,
        studentName: loan.studentProfile.studentName,
        dateOfBirth: loan.studentProfile.dateOfBirth,
        relationship: loan.studentProfile.relationship,
        classLevel: loan.studentProfile.classLevel,
      } : null,
      
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
      
      // Include documents and installments if present
      documents: loan.documents,
      installments: loan.installments?.map((inst: any) => ({
        ...inst,
        amount: Number(inst.amount),
        lateFee: Number(inst.lateFee || 0)
      })),
    };
  }

  private toDetailedDTO(loan: any): DetailedLoanDTO {
    const baseDTO = this.toDTO(loan);
    
    return {
      ...baseDTO,
      installments: loan.installments?.map((inst: any) => ({
        id: inst.id,
        installmentNumber: inst.installmentNumber,
        amount: Number(inst.amount),
        dueDate: inst.dueDate,
        paidDate: inst.paidDate,
        status: inst.status,
        daysOverdue: inst.daysOverdue,
        lateFee: Number(inst.lateFee),
      })),
      documents: loan.documents?.map((doc: any) => ({
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        isVerified: doc.isVerified,
        createdAt: doc.createdAt,
      })),
      disbursement: loan.disbursement ? {
        id: loan.disbursement.id,
        disbursementReference: loan.disbursement.disbursementReference,
        amount: Number(loan.disbursement.amount),
        status: loan.disbursement.status,
        bankName: loan.disbursement.bankName,
        accountNumber: loan.disbursement.accountNumber,
        accountName: loan.disbursement.accountName,
        disbursedAt: loan.disbursement.disbursedAt,
        transferReference: loan.disbursement.transferReference,
      } : null,
      school: loan.school ? {
        id: loan.school.id,
        schoolName: loan.school.schoolName,
        schoolAddress: loan.school.schoolAddress,
        city: loan.school.city,
        state: loan.school.state,
        country: loan.school.country,
      } : undefined,
    };
  }
}
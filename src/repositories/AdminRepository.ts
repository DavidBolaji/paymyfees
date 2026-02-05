/**
 * Admin Repository
 * Database layer for Admin operations
 */

import { prisma } from '@/src/database/prisma';
import { Installment, LoanStatus, SupportTicketStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface IAdminRepository {
  getAnalytics(): Promise<any>;
  getLoanApplications(page: number, limit: number, status?: string): Promise<any>;
  updateLoanStatus(loanId: string, status: LoanStatus, adminId: string, reason?: string): Promise<any>;
  processDisbursement(loanId: string, adminId: string): Promise<any>;
  getSchools(page: number, limit: number, status?: string): Promise<any>;
  approveSchool(schoolId: string, adminId: string): Promise<any>;
  rejectSchool(schoolId: string, adminId: string, reason: string): Promise<any>;
  addSchool(data: any, adminId: string): Promise<any>;
  getSupportTickets(page: number, limit: number, status?: string): Promise<any>;
  respondToTicket(ticketId: string, message: string, adminId: string): Promise<any>;
  updateTicketStatus(ticketId: string, status: string, adminId: string): Promise<any>;
  getVerificationLogs(schoolId: string): Promise<any>;
  addVerificationMessage(schoolId: string, message: string, adminId: string): Promise<any>;
}

export class AdminRepository implements IAdminRepository {
  /**
   * Get admin analytics
   */
  async getAnalytics(): Promise<any> {
    const [
      totalLoans,
      pendingLoans,
      approvedLoans,
      activeLoans,
      completedLoans,
      defaultedLoans,
      totalUsers,
      totalSchools,
      verifiedSchools,
      pendingSchools,
      totalTickets,
      openTickets,
      loanAmountSum,
      disbursedAmountSum,
      repaidAmountSum,
      outstandingAmountSum
    ] = await Promise.all([
      prisma.loan.count(),
      prisma.loan.count({ where: { status: LoanStatus.PENDING } }),
      prisma.loan.count({ where: { status: LoanStatus.APPROVED } }),
      prisma.loan.count({ where: { status: LoanStatus.ACTIVE } }),
      prisma.loan.count({ where: { status: LoanStatus.COMPLETED } }),
      prisma.loan.count({ where: { status: LoanStatus.DEFAULTED } }),
      prisma.user.count({ where: { role: { in: [UserRole.PARENT, UserRole.STUDENT] } } }),
      prisma.schoolProfile.count(),
      prisma.schoolProfile.count({ where: { isVerified: true } }),
      prisma.schoolProfile.count({ where: { isVerified: false } }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: SupportTicketStatus.OPEN } }),
      prisma.loan.aggregate({ _sum: { loanAmount: true } }),
      prisma.loan.aggregate({ _sum: { amountDisbursed: true } }),
      prisma.loan.aggregate({ _sum: { amountRepaid: true } }),
      prisma.loan.aggregate({ _sum: { outstandingBalance: true } })
    ]);

    return {
      loans: {
        total: totalLoans,
        pending: pendingLoans,
        approved: approvedLoans,
        active: activeLoans,
        completed: completedLoans,
        defaulted: defaultedLoans
      },
      financial: {
        totalLoanAmount: Number(loanAmountSum._sum.loanAmount || 0),
        totalDisbursed: Number(disbursedAmountSum._sum.amountDisbursed || 0),
        totalRepaid: Number(repaidAmountSum._sum.amountRepaid || 0),
        totalOutstanding: Number(outstandingAmountSum._sum.outstandingBalance || 0)
      },
      users: {
        total: totalUsers
      },
      schools: {
        total: totalSchools,
        verified: verifiedSchools,
        pending: pendingSchools
      },
      support: {
        total: totalTickets,
        open: openTickets
      }
    };
  }

  /**
   * Get loan applications with pagination
   */
  async getLoanApplications(page: number, limit: number, status?: string): Promise<any> {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as LoanStatus } : {};

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          school: {
            select: {
              id: true,
              schoolName: true
            }
          },
          documents: {
            select: {
              id: true,
              documentType: true,
              fileName: true,
              fileUrl: true,
              isVerified: true
            }
          },
          installments: {
            select: {
              id: true,
              installmentNumber: true,
              amount: true,
              dueDate: true,
              status: true
            },
            orderBy: {
              installmentNumber: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.loan.count({ where })
    ]);

    return {
      loans: loans.map((loan: any) => ({
        id: loan.id,
        loanNumber: loan.loanNumber,
        userId: loan.userId,
        userName: loan.user.fullName,
        userEmail: loan.user.email,
        userPhone: loan.user.phone,
        schoolId: loan.schoolId,
        schoolName: loan.school.schoolName,
        loanAmount: Number(loan.loanAmount),
        totalAmount: Number(loan.totalAmount),
        interestRate: Number(loan.interestRate),
        repaymentMonths: loan.repaymentMonths,
        status: loan.status,
        amountDisbursed: Number(loan.amountDisbursed),
        amountRepaid: Number(loan.amountRepaid),
        outstandingBalance: Number(loan.outstandingBalance),
        applicationDate: loan.applicationDate,
        approvalDate: loan.approvalDate,
        disbursementDate: loan.disbursementDate,
        documents: loan.documents,
        installments: loan.installments.map((inst: Installment) => ({
          ...inst,
          amount: Number(inst.amount)
        })),
        residencyStatus: loan.residencyStatus
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    };
  }

  /**
   * Update loan status
   */
  async updateLoanStatus(loanId: string, status: LoanStatus, adminId: string, reason?: string): Promise<any> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === LoanStatus.APPROVED) {
      updateData.approvalDate = new Date();
      updateData.approvedBy = adminId;
    } else if (status === LoanStatus.REJECTED) {
      updateData.rejectionReason = reason;
    }

    const [loan] = await Promise.all([
      prisma.loan.update({
        where: { id: loanId },
        data: updateData,
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      }),
      prisma.loanStatusHistory.create({
        data: {
          loanId,
          newStatus: status,
          changedBy: adminId,
          reason
        }
      })
    ]);

    return loan;
  }

  /**
   * Process loan disbursement
   */
  async processDisbursement(loanId: string, adminId: string): Promise<any> {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        school: true
      }
    });

    if (!loan) {
      throw new Error('Loan not found');
    }

    const disbursementReference = `DISB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const [updatedLoan, disbursement] = await Promise.all([
      prisma.loan.update({
        where: { id: loanId },
        data: {
          status: LoanStatus.DISBURSED,
          amountDisbursed: loan.loanAmount,
          disbursementDate: new Date()
        }
      }),
      prisma.disbursement.create({
        data: {
          disbursementReference,
          loanId,
          schoolId: loan.schoolId,
          amount: loan.loanAmount,
          status: 'COMPLETED',
          bankName: loan.school.bankName || '',
          accountNumber: loan.school.accountNumber || '',
          accountName: loan.school.accountName || '',
          disbursedAt: new Date(),
          confirmedAt: new Date()
        }
      }),
      prisma.loanStatusHistory.create({
        data: {
          loanId,
          newStatus: LoanStatus.DISBURSED,
          changedBy: adminId,
          reason: 'Disbursement processed by admin'
        }
      })
    ]);

    return { loan: updatedLoan, disbursement };
  }

  /**
   * Get schools with pagination
   */
  async getSchools(page: number, limit: number, status?: string): Promise<any> {
    const skip = (page - 1) * limit;
    const where = status === 'verified' 
      ? { isVerified: true } 
      : status === 'pending' 
        ? { isVerified: false } 
        : {};

    const [schools, total] = await Promise.all([
      prisma.schoolProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          documents: {
            select: {
              id: true,
              documentType: true,
              fileName: true,
              fileUrl: true,
              isVerified: true
            }
          },
          loans: {
            select: {
              id: true,
              loanNumber: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.schoolProfile.count({ where })
    ]);

    return {
      schools: schools.map((school: any) => ({
        id: school.id,
        userId: school.userId,
        schoolName: school.schoolName,
        schoolEmail: school.schoolEmail,
        schoolPhone: school.schoolPhone,
        schoolAddress: school.schoolAddress,
        city: school.city,
        state: school.state,
        country: school.country,
        contactPersonName: school.contactPersonName,
        contactPersonEmail: school.contactPersonEmail,
        contactPersonPhone: school.contactPersonPhone,
        bankName: school.bankName,
        accountNumber: school.accountNumber,
        accountName: school.accountName,
        isVerified: school.isVerified,
        verifiedAt: school.verifiedAt,
        totalStudents: school.totalStudents,
        totalDisbursements: Number(school.totalDisbursements),
        createdAt: school.createdAt,
        documents: school.documents,
        loans: school.loans
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    };
  }

  /**
   * Approve school
   */
  async approveSchool(schoolId: string, _adminId: string): Promise<any> {
    return await prisma.schoolProfile.update({
      where: { id: schoolId },
      data: {
        isVerified: true,
        verifiedAt: new Date()
      }
    });
  }

  /**
   * Reject school
   */
  async rejectSchool(schoolId: string, _adminId: string, reason: string): Promise<any> {
    await prisma.schoolSupportMessage.create({
      data: {
        schoolId,
        message: `School verification rejected: ${reason}`,
        priority: 'urgent',
        isRead: false
      }
    });

    return await prisma.schoolProfile.update({
      where: { id: schoolId },
      data: {
        isVerified: false,
        verifiedAt: null
      }
    });
  }

  /**
   * Add new school
   */
  async addSchool(data: any, _adminId: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(data.password || 'School@123456', 10);

    const user = await prisma.user.create({
      data: {
        email: data.schoolEmail,
        phone: data.schoolPhone,
        password: hashedPassword,
        role: UserRole.SCHOOL,
        fullName: data.schoolName,
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        country: data.country || 'Nigeria',
        residencyStatus: 'LOCAL'
      }
    });

    const school = await prisma.schoolProfile.create({
      data: {
        userId: user.id,
        isPrimary: true,
        schoolName: data.schoolName,
        schoolAddress: data.schoolAddress,
        city: data.city,
        state: data.state,
        country: data.country || 'Nigeria',
        schoolEmail: data.schoolEmail,
        schoolPhone: data.schoolPhone,
        website: data.website,
        contactPersonName: data.contactPersonName,
        contactPersonPosition: data.contactPersonPosition,
        contactPersonEmail: data.contactPersonEmail,
        contactPersonPhone: data.contactPersonPhone,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        isVerified: true,
        verifiedAt: new Date()
      }
    });

    return { user, school };
  }

  /**
   * Get support tickets with pagination
   */
  async getSupportTickets(page: number, limit: number, status?: string): Promise<any> {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as SupportTicketStatus } : {};

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              role: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.supportTicket.count({ where })
    ]);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    };
  }

  /**
   * Respond to support ticket
   */
  async respondToTicket(ticketId: string, message: string, adminId: string): Promise<any> {
    return await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: adminId,
        senderRole: UserRole.ADMIN,
        message,
        isInternal: false
      }
    });
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: string, adminId: string): Promise<any> {
    const updateData: any = {
      status: status as SupportTicketStatus,
      updatedAt: new Date()
    };

    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    } else if (status === 'CLOSED') {
      updateData.closedAt = new Date();
    }

    if (!updateData.assignedTo) {
      updateData.assignedTo = adminId;
    }

    return await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData
    });
  }

  /**
   * Get verification logs for a school
   */
  async getVerificationLogs(schoolId: string): Promise<any> {
    return await prisma.schoolSupportMessage.findMany({
      where: { schoolId },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Add verification message
   */
  async addVerificationMessage(schoolId: string, message: string, _adminId: string): Promise<any> {
    return await prisma.schoolSupportMessage.create({
      data: {
        schoolId,
        message,
        priority: 'normal',
        isRead: false
      }
    });
  }
}

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
  getSchoolById(schoolId: string): Promise<any>;
  approveSchool(schoolId: string, adminId: string): Promise<any>;
  rejectSchool(schoolId: string, adminId: string, reason: string): Promise<any>;
  addSchool(data: any, adminId: string): Promise<any>;
  getSupportTickets(page: number, limit: number, status?: string): Promise<any>;
  respondToTicket(ticketId: string, message: string, adminId: string): Promise<any>;
  updateTicketStatus(ticketId: string, status: string, adminId: string): Promise<any>;
  getVerificationLogs(schoolId: string): Promise<any>;
  addVerificationMessage(schoolId: string, message: string, adminId: string): Promise<any>;
  addVerificationLog(schoolId: string, activity: string, details: string, status: string, adminId: string): Promise<any>;
}

export class AdminRepository implements IAdminRepository {
  /**
   * Get admin analytics (Optimized for Prisma Accelerate)
   * Reduces 16 queries to 4 queries using groupBy and aggregations
   * Uses Prisma Accelerate caching with 60-second TTL
   */
  async getAnalytics(): Promise<any> {
    // Batch 1: Loan statistics with groupBy (1 query instead of 6)
    // Cache for 60 seconds to reduce load
    const loanStats = await prisma.loan.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: {
        loanAmount: true,
        amountDisbursed: true,
        amountRepaid: true,
        outstandingBalance: true
      },
      cacheStrategy: { ttl: 60, swr: 120 } // Cache for 60s, stale-while-revalidate for 120s
    });

    // Batch 2: School statistics with groupBy (1 query instead of 3)
    const schoolStats = await prisma.schoolProfile.groupBy({
      by: ['isVerified'],
      _count: { id: true },
      cacheStrategy: { ttl: 60, swr: 120 }
    });

    // Batch 3: Support ticket statistics with groupBy (1 query instead of 2)
    const ticketStats = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: { id: true },
      cacheStrategy: { ttl: 60, swr: 120 }
    });

    // Batch 4: User count (1 query)
    const totalUsers = await prisma.user.count({ 
      where: { role: { in: [UserRole.PARENT, UserRole.STUDENT] } },
      cacheStrategy: { ttl: 60, swr: 120 }
    });

    // Process loan statistics
    const loansByStatus = loanStats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: stat._count.id,
        loanAmount: Number(stat._sum.loanAmount || 0),
        disbursed: Number(stat._sum.amountDisbursed || 0),
        repaid: Number(stat._sum.amountRepaid || 0),
        outstanding: Number(stat._sum.outstandingBalance || 0)
      };
      return acc;
    }, {} as Record<string, any>);

    const totalLoans = loanStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const totalLoanAmount = loanStats.reduce((sum, stat) => sum + Number(stat._sum.loanAmount || 0), 0);
    const totalDisbursed = loanStats.reduce((sum, stat) => sum + Number(stat._sum.amountDisbursed || 0), 0);
    const totalRepaid = loanStats.reduce((sum, stat) => sum + Number(stat._sum.amountRepaid || 0), 0);
    const totalOutstanding = loanStats.reduce((sum, stat) => sum + Number(stat._sum.outstandingBalance || 0), 0);

    // Process school statistics
    const totalSchools = schoolStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const verifiedSchools = schoolStats.find(s => s.isVerified)?._count.id || 0;
    const pendingSchools = schoolStats.find(s => !s.isVerified)?._count.id || 0;

    // Process ticket statistics
    const totalTickets = ticketStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const openTickets = ticketStats.find(t => t.status === SupportTicketStatus.OPEN)?._count.id || 0;

    return {
      loans: {
        total: totalLoans,
        pending: loansByStatus[LoanStatus.PENDING]?.count || 0,
        approved: loansByStatus[LoanStatus.APPROVED]?.count || 0,
        active: loansByStatus[LoanStatus.ACTIVE]?.count || 0,
        completed: loansByStatus[LoanStatus.COMPLETED]?.count || 0,
        defaulted: loansByStatus[LoanStatus.DEFAULTED]?.count || 0
      },
      financial: {
        totalLoanAmount,
        totalDisbursed,
        totalRepaid,
        totalOutstanding
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
   * Get school by ID (optimized for single school fetch)
   */
  async getSchoolById(schoolId: string): Promise<any> {
    const school = await prisma.schoolProfile.findUnique({
      where: { id: schoolId },
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
            status: true,
            loanAmount: true
          },
          take: 10,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!school) {
      throw new Error('School not found');
    }

    return {
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
      contactPersonPosition: school.contactPersonPosition,
      bankName: school.bankName,
      accountNumber: school.accountNumber,
      accountName: school.accountName,
      isVerified: school.isVerified,
      verifiedAt: school.verifiedAt,
      totalStudents: school.totalStudents,
      totalDisbursements: Number(school.totalDisbursements),
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
      documents: school.documents,
      loans: school.loans.map((loan: any) => ({
        ...loan,
        loanAmount: Number(loan.loanAmount)
      }))
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

    // Normalize emails to lowercase
    const normalizedSchoolEmail = data.schoolEmail.trim().toLowerCase();
    const normalizedContactEmail = data.contactPersonEmail?.trim().toLowerCase();

    const user = await prisma.user.create({
      data: {
        email: normalizedSchoolEmail,
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
        schoolEmail: normalizedSchoolEmail,
        schoolPhone: data.schoolPhone,
        website: data.website,
        contactPersonName: data.contactPersonName,
        contactPersonPosition: data.contactPersonPosition,
        contactPersonEmail: normalizedContactEmail,
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

  /**
   * Add verification log for school profile verification
   */
  async addVerificationLog(schoolId: string, activity: string, details: string, status: string, adminId: string): Promise<any> {
    // Map status to VerificationStatus enum
    const statusMap: Record<string, string> = {
      'APPROVED': 'VERIFIED',
      'REJECTED': 'REJECTED',
      'PENDING': 'PENDING',
      'VERIFIED': 'VERIFIED',
      'EXPIRED': 'EXPIRED'
    };

    const mappedStatus = statusMap[status] || 'PENDING';

    // Get the school and user information
    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { id: schoolId },
      include: {
        user: true,
        profileVerifications: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!schoolProfile) {
      throw new Error('School not found');
    }

    let verificationId: string;

    // Use existing profile verification or create a new one
    if (schoolProfile.profileVerifications.length > 0) {
      verificationId = schoolProfile.profileVerifications[0].id;
    } else {
      // Create a new school profile verification record
      const verification = await prisma.schoolProfileVerification.create({
        data: {
          schoolId,
          userId: schoolProfile.userId,
          status: mappedStatus as any,
          submittedAt: new Date()
        }
      });
      verificationId = verification.id;
    }

    // Create the verification log
    return await prisma.schoolProfileVerificationLog.create({
      data: {
        verificationId,
        schoolId,
        activity,
        details,
        status: mappedStatus as any,
        performedBy: adminId
      }
    });
  }
}

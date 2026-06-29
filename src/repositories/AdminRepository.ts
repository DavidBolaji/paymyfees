/**
 * Admin Repository
 * Database layer for Admin operations
 */

import { prisma } from '@/src/database/prisma';
import { Installment, LoanStatus, NotificationType, PaymentStatus, SupportTicketStatus, UserRole, VerificationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { MailService } from '@/src/services/MailService';

export interface IAdminRepository {
  getAnalytics(): Promise<any>;
  getLoanApplications(page: number, limit: number, statuses?: string[]): Promise<any>;
  updateLoanStatus(loanId: string, status: LoanStatus, adminId: string, reason?: string): Promise<any>;
  processDisbursement(loanId: string, adminId: string): Promise<any>;
  getSchools(page: number, limit: number, status?: string): Promise<any>;
  getSchoolById(schoolId: string): Promise<any>;
  approveSchool(schoolId: string, adminId: string): Promise<any>;
  rejectSchool(schoolId: string, adminId: string, reason: string): Promise<any>;
  addSchool(data: any, adminId: string): Promise<any>;
  getSupportTickets(page: number, limit: number, status?: string): Promise<any>;
  getTicketDetails(ticketId: string): Promise<any>;
  respondToTicket(ticketId: string, message: string, adminId: string): Promise<any>;
  updateTicketStatus(ticketId: string, status: string, adminId: string): Promise<any>;
  getVerificationLogs(schoolId: string): Promise<any>;
  addVerificationMessage(schoolId: string, message: string, adminId: string): Promise<any>;
  addVerificationLog(schoolId: string, activity: string, details: string, status: string, adminId: string): Promise<any>;
  getDashboardStats(): Promise<any>;
  getStudents(page: number, limit: number, status?: string): Promise<any>;
  getStudentsRequiringAction(page: number, limit: number): Promise<any>;
  getRecentlyActiveStudents(page: number, limit: number): Promise<any>;
  getDelayedPayments(page: number, limit: number): Promise<any>;
  getStudentDetails(userId: string, loanId?: string): Promise<any>;
  suspendLoanEligibility(userId: string, adminId: string, reason: string, duration: string, notes: string): Promise<any>;
  sendPaymentReminder(userId: string, adminId: string, reminderType: string, notes: string, channels: string[]): Promise<any>;
  freezeAccount(userId: string, adminId: string, reason: string, duration: string, notes: string): Promise<any>;
  flagAccount(userId: string, adminId: string, reason: string, notes: string): Promise<any>;
  getPendingVerificationSchools(page: number, limit: number): Promise<any>;
  requestAdditionalDocuments(schoolId: string, adminId: string, data: any): Promise<any>;
  getTeacherLoans(page: number, limit: number, statuses?: string[]): Promise<any>;
  getTeacherUsers(page: number, limit: number): Promise<any>;
  getTeacherDetails(userId: string): Promise<any>;
  getSchoolLoans(page: number, limit: number, statuses?: string[]): Promise<any>;
  getSchoolUserList(page: number, limit: number, status?: string): Promise<any>;
  getSchoolUserDetails(userId: string): Promise<any>;
  getSchoolSupportTickets(page: number, limit: number, status?: string): Promise<any>;
  getSchoolAdminDashboardStats(): Promise<any>;
  getTeacherSupportTickets(page: number, limit: number, status?: string): Promise<any>;
  getTeacherAdminDashboardStats(): Promise<any>;
  getSchoolsStats(): Promise<any>;
  updateStudent(userId: string, data: any): Promise<any>;
}

export class AdminRepository implements IAdminRepository {
  private getLoanStudentName(loan: any): string {
    return loan.studentProfile?.studentName || loan.user?.fullName || 'N/A';
  }

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
    });

    // Batch 2: School statistics with groupBy (1 query instead of 3)
    const schoolStats = await prisma.schoolProfile.groupBy({
      by: ['isVerified'],
      _count: { id: true },
    });

    // Batch 3: Support ticket statistics with groupBy (1 query instead of 2)
    const ticketStats = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Batch 4: User count (1 query)
    const totalUsers = await prisma.user.count({ 
      where: { role: { in: [UserRole.PARENT, UserRole.STUDENT] } },
    });

    // Process loan statistics
    const loansByStatus = loanStats.reduce((acc: any, stat: any) => {
      acc[stat.status] = {
        count: stat._count.id,
        loanAmount: Number(stat._sum.loanAmount || 0),
        disbursed: Number(stat._sum.amountDisbursed || 0),
        repaid: Number(stat._sum.amountRepaid || 0),
        outstanding: Number(stat._sum.outstandingBalance || 0)
      };
      return acc;
    }, {} as Record<string, any>);

    const totalLoans = loanStats.reduce((sum: any, stat: any) => sum + stat._count.id, 0);
    const totalLoanAmount = loanStats.reduce((sum: any, stat: any) => sum + Number(stat._sum.loanAmount || 0), 0);
    const totalDisbursed = loanStats.reduce((sum: any, stat: any) => sum + Number(stat._sum.amountDisbursed || 0), 0);
    const totalRepaid = loanStats.reduce((sum: any, stat: any) => sum + Number(stat._sum.amountRepaid || 0), 0);
    const totalOutstanding = loanStats.reduce((sum: any, stat: any) => sum + Number(stat._sum.outstandingBalance || 0), 0);

    // Process school statistics
    const totalSchools = schoolStats.reduce((sum: any, stat: any) => sum + stat._count.id, 0);
    const verifiedSchools = schoolStats.find((s: any) => s.isVerified)?._count.id || 0;
    const pendingSchools = schoolStats.find((s: any) => !s.isVerified)?._count.id || 0;

    // Process ticket statistics
    const totalTickets = ticketStats.reduce((sum: any, stat: any) => sum + stat._count.id, 0);
    const openTickets = ticketStats.find((t: any) => t.status === SupportTicketStatus.OPEN)?._count.id || 0;

    return {
      loans: {
        total: totalLoans,
        pending: loansByStatus[LoanStatus.PENDING]?.count || 0,
        approved: loansByStatus[LoanStatus.APPROVED]?.count || 0,
        active: loansByStatus[LoanStatus.ACTIVE]?.count || 0,
        completed: loansByStatus[LoanStatus.COMPLETED]?.count || 0,
        defaulted: loansByStatus[LoanStatus.DEFAULTED]?.count || 0,
        rejected: loansByStatus[LoanStatus.REJECTED]?.count || 0,
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
  async getLoanApplications(page: number, limit: number, statuses?: string[]): Promise<any> {
    const skip = (page - 1) * limit;
    const where = statuses && statuses.length === 1
      ? { status: statuses[0] as LoanStatus }
      : statuses && statuses.length > 1
        ? { status: { in: statuses as LoanStatus[] } }
        : {};

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
              phone: true,
              country: true,
              isActive: true,
              parentProfile: {
                select: { city: true, completedLoans: true }
              }
            }
          },
          school: {
            select: {
              id: true,
              schoolName: true,
              isVerified: true
            }
          },
          studentProfile: {
            select: {
              id: true,
              studentName: true,
              dateOfBirth: true,
              relationship: true,
              classLevel: true
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
        studentName: this.getLoanStudentName(loan),
        studentProfileId: loan.studentProfileId,
        studentProfile: loan.studentProfile,
        userName: loan.user.fullName,
        userEmail: loan.user.email,
        userPhone: loan.user.phone,
        userCountry: loan.user.country,
        userCity: loan.user.parentProfile?.city,
        userIsActive: loan.user.isActive,
        schoolIsVerified: loan.school.isVerified,
        userPreviousLoans: loan.user.parentProfile?.completedLoans ?? 0,
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

    const ops: Promise<any>[] = [
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
    ];

    // Delete all installments when a loan is rejected
    if (status === LoanStatus.REJECTED) {
      ops.push(prisma.installment.deleteMany({ where: { loanId } }));
    }

    const [loan] = await Promise.all(ops);

    return loan;
  }

  /**
   * Process loan disbursement
   */
  async processDisbursement(loanId: string, adminId: string): Promise<any> {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { school: true },
    });

    if (!loan) {
      throw new Error('Loan not found');
    }

    const disbursementDate = new Date();
    const disbursementReference = `DISB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate installment schedule anchored to disbursement date
    const firstPaymentDate = new Date(disbursementDate);
    firstPaymentDate.setDate(firstPaymentDate.getDate() + 30);
    const monthlyPayment = Number(loan.monthlyPayment);
    const installmentsData = Array.from({ length: loan.repaymentMonths }, (_, i) => {
      const dueDate = new Date(firstPaymentDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      return {
        loanId,
        installmentNumber: i + 1,
        amount: monthlyPayment,
        dueDate,
        status: 'PENDING' as const,
        daysOverdue: 0,
        lateFee: 0,
      };
    });

    const [updatedLoan, disbursement] = await prisma.$transaction(async (tx) => {
      const updated = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: LoanStatus.DISBURSED,
          amountDisbursed: loan.loanAmount,
          disbursementDate,
          firstPaymentDate,
        }
      });

      const disb = await tx.disbursement.create({
        data: {
          disbursementReference,
          loanId,
          schoolId: loan.schoolId,
          amount: loan.loanAmount,
          status: 'COMPLETED',
          bankName: loan.school.bankName || '',
          accountNumber: loan.school.accountNumber || '',
          accountName: loan.school.accountName || '',
          disbursedAt: disbursementDate,
          confirmedAt: disbursementDate,
        }
      });

      await tx.loanStatusHistory.create({
        data: {
          loanId,
          newStatus: LoanStatus.DISBURSED,
          changedBy: adminId,
          reason: 'Disbursement processed by admin'
        }
      });

      // Always delete any stale installments and create fresh ones anchored to disbursement date
      await tx.installment.deleteMany({ where: { loanId } });
      await tx.installment.createMany({ data: installmentsData });

      return [updated, disb];
    });

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
   * Get single ticket with full user + loan + school + messages context
   */
  async getTicketDetails(ticketId: string): Promise<any> {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
            loans: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                loanNumber: true,
                school: { select: { schoolName: true } },
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, senderId: true, senderRole: true, message: true, createdAt: true }
        }
      }
    });
    return ticket;
  }

  /**
   * Respond to support ticket — also sets firstResponseAt on first admin reply
   */
  async respondToTicket(ticketId: string, message: string, adminId: string): Promise<any> {
    // Set firstResponseAt if this is the first admin response
    const existing = await prisma.supportMessage.count({
      where: { ticketId, senderRole: UserRole.ADMIN }
    });
    if (existing === 0) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { firstResponseAt: new Date(), status: SupportTicketStatus.IN_PROGRESS, assignedTo: adminId }
      });
    }
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
   * Get stats specific to the school verification page
   */
  async getSchoolsStats(): Promise<any> {
    const [pendingSchoolsCount, underReviewCount, verifiedSchoolsCount, rejectedSchoolsCount] =
      await Promise.all([
        prisma.schoolProfile.count({ where: { isVerified: false } }),
        prisma.schoolVerification.count({ where: { status: VerificationStatus.PENDING } }),
        prisma.schoolProfile.count({ where: { isVerified: true } }),
        prisma.schoolVerification.count({ where: { status: VerificationStatus.REJECTED } }),
      ]);
    return { pendingSchoolsCount, underReviewCount, verifiedSchoolsCount, rejectedSchoolsCount };
  }

  /**
   * Get dashboard stats for new admin dashboard
   */
  async getDashboardStats(): Promise<any> {
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      activeStudentCount, activeLoansCount, overdueCount, openTicketsCount, completedLoansCount,
      pendingSchoolsCount, underReviewCount, verifiedSchoolsCount, rejectedSchoolsCount,
      totalLoansCount, pendingLoansCount, approvedLoansCount, rejectedLoansCount,
      totalTicketsToday, totalPlatformTickets, resolvedTicketsCount, closedTicketsCount,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: { in: [UserRole.PARENT, UserRole.STUDENT] } }
      }),
      prisma.loan.findMany({
        where: { status: { in: [LoanStatus.ACTIVE, LoanStatus.DISBURSED] } },
        distinct: ['userId'],
        select: { userId: true },
      }).then(r => r.length),
      prisma.installment.count({
        where: {
          dueDate: { lt: now },
          status: { notIn: [PaymentStatus.PAID, PaymentStatus.CANCELLED] },
        }
      }),
      prisma.supportTicket.count({ where: { status: SupportTicketStatus.OPEN } }),
      prisma.loan.count({ where: { status: LoanStatus.COMPLETED } }),
      prisma.schoolProfile.count({ where: { isVerified: false } }),
      prisma.schoolVerification.count({ where: { status: VerificationStatus.PENDING } }),
      prisma.schoolProfile.count({ where: { isVerified: true } }),
      prisma.schoolVerification.count({ where: { status: VerificationStatus.REJECTED } }),
      prisma.loan.count(),
      prisma.loan.count({ where: { status: { in: [LoanStatus.PENDING, LoanStatus.UNDER_REVIEW] } } }),
      prisma.loan.count({ where: { status: { in: [LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.DISBURSED, LoanStatus.COMPLETED] } } }),
      prisma.loan.count({ where: { status: LoanStatus.REJECTED } }),
      prisma.supportTicket.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: SupportTicketStatus.RESOLVED } }),
      prisma.supportTicket.count({ where: { status: SupportTicketStatus.CLOSED } }),
    ]);

    // Compute average first response time in minutes using DB-level aggregation
    const avgResult = await prisma.$queryRaw<[{ avg_mins: number | null }]>`
      SELECT AVG(TIMESTAMPDIFF(SECOND, createdAt, firstResponseAt) / 60.0) AS avg_mins
      FROM support_tickets
      WHERE firstResponseAt IS NOT NULL
    `;
    const avgFirstResponseMins = Math.round(avgResult[0]?.avg_mins ?? 0);

    return {
      activeStudentCount, activeLoansCount, overdueCount, openTicketsCount, completedLoansCount,
      pendingSchoolsCount, underReviewCount, verifiedSchoolsCount, rejectedSchoolsCount,
      loans: {
        total: totalLoansCount,
        pending: pendingLoansCount,
        approved: approvedLoansCount,
        rejected: rejectedLoansCount,
      },
      tickets: {
        totalToday: totalTicketsToday,
        open: openTicketsCount,
        resolved: resolvedTicketsCount,
        closed: closedTicketsCount,
        total: totalPlatformTickets,
        avgFirstResponseMins,
      },
    };
  }

  /**
   * Get all students (users with loans) for student profile table
   */
  async getStudents(page: number, limit: number, status?: string): Promise<any> {
    const skip = (page - 1) * limit;

    const studentOnlyFilter: any = {
      user: { role: { notIn: [UserRole.SCHOOL, UserRole.ADMIN] as UserRole[] } },
      ...(status ? { status: status as LoanStatus } : {})
    };

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where: studentOnlyFilter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, isActive: true, createdAt: true } },
          studentProfile: { select: { id: true, studentName: true, dateOfBirth: true, relationship: true, classLevel: true } },
          payments: { select: { paymentDate: true }, orderBy: { paymentDate: 'desc' }, take: 1 }
        }
      }),
      prisma.loan.count({ where: studentOnlyFilter })
    ]);

    return {
      students: loans.map((l: any) => ({
        userId: l.userId,
        loanId: l.id,
        loanNumber: l.loanNumber,
        studentName: this.getLoanStudentName(l),
        studentProfileId: l.studentProfileId,
        studentProfile: l.studentProfile,
        userName: l.user.fullName,
        school: l.schoolName,
        totalAmount: Number(l.loanAmount),
        outstandingBalance: Math.max(0, Number(l.loanAmount) - Number(l.amountRepaid)),
        status: l.status,
        lastActivity: l.payments[0]?.paymentDate || l.updatedAt,
        date: l.createdAt
      })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    };
  }

  /**
   * Get students requiring admin action
   */
  async getStudentsRequiringAction(page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;

    const requiringActionWhere = {
      OR: [
        { status: LoanStatus.DEFAULTED },
        { installments: { some: { daysOverdue: { gt: 0 } } } },
        { status: LoanStatus.ACTIVE },
        { status: LoanStatus.DISBURSED }
      ],
      user: { role: { notIn: [UserRole.SCHOOL, UserRole.ADMIN] as UserRole[] } }
    };

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where: requiringActionWhere,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, isActive: true } },
          studentProfile: { select: { id: true, studentName: true, dateOfBirth: true, relationship: true, classLevel: true } },
          installments: {
            where: { daysOverdue: { gt: 0 } },
            orderBy: { dueDate: 'asc' },
            take: 1
          },
          payments: { orderBy: { paymentDate: 'desc' }, take: 1, select: { paymentDate: true } }
        }
      }),
      prisma.loan.count({ where: requiringActionWhere })
    ]);

    return {
      students: loans.map((l: any) => {
        const overdueInst = l.installments[0];
        const issue = l.status === LoanStatus.DEFAULTED
          ? 'Payment failed'
          : overdueInst
            ? `Overdue by ${overdueInst.daysOverdue} days`
            : 'Pending action';
        const now = new Date();
        const lastAct = l.payments[0]?.paymentDate || l.updatedAt;
        const diffDays = Math.floor((now.getTime() - new Date(lastAct).getTime()) / (1000 * 60 * 60 * 24));
        const lastActivity = diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
        return {
          userId: l.userId,
          loanId: l.id,
          loanNumber: l.loanNumber,
          studentName: this.getLoanStudentName(l),
          studentProfileId: l.studentProfileId,
          studentProfile: l.studentProfile,
          userName: l.user.fullName,
          school: l.schoolName,
          issue,
          status: l.status === LoanStatus.DEFAULTED ? 'pending' : 'pending',
          lastActivity,
          date: l.createdAt
        };
      }),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    };
  }

  /**
   * Get recently active students from transactions
   */
  async getRecentlyActiveStudents(page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { paymentDate: 'desc' },
        include: {
          user: { select: { id: true, fullName: true } },
          loan: {
            select: {
              schoolName: true,
              id: true,
              loanNumber: true,
              outstandingBalance: true,
              amountRepaid: true,
              totalAmount: true,
              studentProfileId: true,
              studentProfile: { select: { id: true, studentName: true, dateOfBirth: true, relationship: true, classLevel: true } }
            }
          },
          installment: { select: { installmentNumber: true } }
        }
      }),
      prisma.payment.count()
    ]);

    return {
      students: payments.map((p: any) => ({
        paymentId: p.id,
        userId: p.userId,
        loanId: p.loanId,
        loanNumber: p.loan.loanNumber,
        student: p.loan.studentProfile?.studentName || p.user.fullName,
        studentName: p.loan.studentProfile?.studentName || p.user.fullName,
        studentProfileId: p.loan.studentProfileId,
        studentProfile: p.loan.studentProfile,
        userName: p.user.fullName,
        activity: p.installment ? `Loan repayment (#${p.installment.installmentNumber})` : 'Loan repayment',
        amount: Number(p.amount),
        method: p.paymentMethod,
        status: p.status === 'COMPLETED' ? 'paid' : 'pending',
        paymentDate: p.paymentDate,
        school: p.loan.schoolName,
        outstanding: Number(p.loan.outstandingBalance),
        amountRepaid: Number(p.loan.amountRepaid),
        totalAmount: Number(p.loan.totalAmount)
      })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    };
  }

  /**
   * Get students with delayed payments
   */
  async getDelayedPayments(page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;
    const now = new Date();

    const overdueInstallmentFilter = {
      dueDate: { lt: now },
      status: { notIn: [PaymentStatus.PAID] }
    };

    const loanWhere = {
      installments: { some: overdueInstallmentFilter },
      user: { role: { notIn: [UserRole.SCHOOL, UserRole.ADMIN] } }
    };

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where: loanWhere,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          loanNumber: true,
          userId: true,
          schoolName: true,
          outstandingBalance: true,
          user: { select: { id: true, fullName: true } },
          studentProfileId: true,
          studentProfile: { select: { id: true, studentName: true, dateOfBirth: true, relationship: true, classLevel: true } },
          installments: {
            where: overdueInstallmentFilter,
            orderBy: { dueDate: 'asc' }
          }
        }
      }),
      prisma.loan.count({ where: loanWhere })
    ]);

    return {
      students: loans.map((loan: any) => {
        const earliest = loan.installments[0];
        const daysOverdue = earliest
          ? Math.floor((now.getTime() - new Date(earliest.dueDate).getTime()) / 86400000)
          : 0;
        // Sum all overdue instalments for this loan
        const overdueTotal = loan.installments.reduce((sum: number, inst: any) => sum + Number(inst.amount), 0);
        return {
          installmentId: earliest?.id ?? null,
          loanId: loan.id,
          loanNumber: loan.loanNumber,
          userId: loan.userId,
          studentName: this.getLoanStudentName(loan),
          studentProfileId: loan.studentProfileId,
          studentProfile: loan.studentProfile,
          userName: loan.user.fullName,
          school: loan.schoolName,
          outstanding: overdueTotal,
          totalOutstanding: Number(loan.outstandingBalance),
          status: 'delayed',
          delayCount: `Delayed for ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`,
          daysOverdue,
          date: earliest?.dueDate ?? null
        };
      }),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    };
  }

  /**
   * Get single student details (by userId)
   */
  async getStudentDetails(userId: string, loanId?: string): Promise<any> {
    const loanWhere = loanId ? { id: loanId, userId } : { userId };

    const [user, loan, transactions, documents] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          parentProfile: true,
          wallet: true
        }
      }),
      prisma.loan.findFirst({
        where: loanWhere,
        orderBy: { createdAt: 'desc' },
        include: {
          studentProfile: { select: { id: true, studentName: true, dateOfBirth: true, relationship: true, classLevel: true } },
          installments: { orderBy: { installmentNumber: 'asc' } },
          disbursement: true,
          school: { select: { schoolName: true, city: true, country: true } },
          payments: { orderBy: { paymentDate: 'desc' }, take: 50, include: { installment: { select: { installmentNumber: true } } } }
        }
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { transactionDate: 'desc' },
        take: 10
      }),
      prisma.document.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 })
    ]);

    if (!user) throw new Error('Student not found');

    const auditLogs = await prisma.auditLog.findMany({
      where: { entityId: userId, entity: 'user', action: { in: ['ADMIN_NOTE', 'SUSPEND', 'FREEZE', 'FLAG'] } },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        country: user.country,
        city: user.parentProfile?.city || null,
        createdAt: user.createdAt
      },
      profile: user.parentProfile,
      wallet: user.wallet ? { balance: Number(user.wallet.balance), isActive: user.wallet.isActive } : null,
      loan: loan ? {
        id: loan.id,
        loanNumber: loan.loanNumber,
        loanAmount: Number(loan.loanAmount),
        amountDisbursed: Number(loan.amountDisbursed),
        amountRepaid: Number(loan.amountRepaid),
        outstandingBalance: Number(loan.outstandingBalance),
        status: loan.status,
        interestRate: Number(loan.interestRate),
        repaymentMonths: loan.repaymentMonths,
        monthlyPayment: Number(loan.monthlyPayment),
        programCourseOfStudy: loan.programCourseOfStudy,
        studentProfileId: loan.studentProfileId,
        studentProfile: loan.studentProfile,
        schoolName: loan.schoolName,
        school: loan.school,
        disbursement: loan.disbursement,
        disbursementDate: loan.disbursementDate ?? loan.disbursement?.disbursedAt ?? null,
        installments: loan.installments.map((i: any) => ({ ...i, amount: Number(i.amount) })),
        recentPayments: loan.payments
      } : null,
      transactions: transactions.map((t: any) => ({ ...t, amount: Number(t.amount) })),
      documents,
      auditLogs
    };
  }

  /**
   * Suspend loan eligibility for a student
   */
  async suspendLoanEligibility(userId: string, adminId: string, reason: string, duration: string, notes: string): Promise<any> {
    // Mark the user's loan eligibility as suspended
    await prisma.user.update({ where: { id: userId }, data: { loanEligibilitySuspended: true } });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'SUSPEND',
        entity: 'user',
        entityId: userId,
        newValues: { reason, duration, notes, type: 'loan_eligibility' }
      }
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'WARNING',
        title: 'Loan Eligibility Suspended',
        message: `Your loan eligibility has been suspended. Reason: ${reason}. Duration: ${duration}.`
      }
    });

    return { success: true };
  }

  /**
   * Send payment reminder to a student
   */
  async sendPaymentReminder(userId: string, adminId: string, reminderType: string, notes: string, channels: string[]): Promise<any> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, email: true } });
    if (!user) throw new Error('Student not found');

    await prisma.notification.create({
      data: {
        userId,
        type: 'REMINDER',
        title: 'Payment Reminder',
        message: notes || `Please make your overdue payment. Reminder type: ${reminderType}.`
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'PAYMENT_REMINDER',
        entity: 'user',
        entityId: userId,
        newValues: { reminderType, notes, channels }
      }
    });

    return { success: true };
  }

  /**
   * Freeze a student account
   */
  async freezeAccount(userId: string, adminId: string, reason: string, duration: string, notes: string): Promise<any> {
    // Parse duration (e.g. "7 days", "1 month", "3 months") into a future date
    const frozenUntil = this.parseDuration(duration);
    await prisma.user.update({ where: { id: userId }, data: { frozenUntil } });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'FREEZE',
        entity: 'user',
        entityId: userId,
        newValues: { reason, duration, notes, frozenUntil: frozenUntil.toISOString() }
      }
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'WARNING',
        title: 'Account Temporarily Frozen',
        message: `Your account has been temporarily frozen until ${frozenUntil.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}. Reason: ${reason}.`
      }
    });

    return { success: true };
  }

  /**
   * Parse a human-readable duration string into an absolute future Date.
   * Supports: "N day(s)", "N week(s)", "N month(s)", "N year(s)".
   * Falls back to 30 days on unrecognised formats.
   */
  private parseDuration(duration: string): Date {
    const now = new Date();
    const match = duration.trim().match(/^(\d+)\s*(day|week|month|year)s?$/i);
    if (!match) {
      // fallback: 30 days
      now.setDate(now.getDate() + 30);
      return now;
    }
    const value = parseInt(match[1]!, 10);
    const unit = match[2]!.toLowerCase();
    if (unit === 'day') now.setDate(now.getDate() + value);
    else if (unit === 'week') now.setDate(now.getDate() + value * 7);
    else if (unit === 'month') now.setMonth(now.getMonth() + value);
    else if (unit === 'year') now.setFullYear(now.getFullYear() + value);
    return now;
  }

  /**
   * Flag a student account
   */
  async flagAccount(userId: string, adminId: string, reason: string, notes: string): Promise<any> {
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'FLAG',
        entity: 'user',
        entityId: userId,
        newValues: { reason, notes }
      }
    });

    return { success: true };
  }

  /**
   * Get schools pending verification
   */
  async getPendingVerificationSchools(page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;

    const [schools, total] = await Promise.all([
      prisma.schoolProfile.findMany({
        where: { isVerified: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          documents: true,
          loans: { select: { id: true }, take: 100 },
          profileVerifications: { orderBy: { createdAt: 'desc' }, take: 1, select: { status: true, reviewedBy: true } }
        }
      }),
      prisma.schoolProfile.count({ where: { isVerified: false } })
    ]);

    return {
      schools: schools.map((s: any) => ({
        id: s.id,
        schoolName: s.schoolName,
        location: `${s.city || ''}${s.state ? ', ' + s.state : ''}${s.country ? ', ' + s.country : ''}`.replace(/^, /, '') || 'N/A',
        city: s.city,
        state: s.state,
        country: s.country,
        schoolEmail: s.schoolEmail,
        schoolPhone: s.schoolPhone,
        website: s.website,
        schoolType: s.schoolType,
        yearEstablished: s.yearEstablished,
        registrationNumber: s.registrationNumber,
        contactPersonName: s.contactPersonName,
        applicationCount: s.loans.length,
        dateSubmitted: s.createdAt,
        status: s.isVerified ? 'verified' : 'pending',
        assignedAdmin: s.profileVerifications[0]?.reviewedBy || null,
        documents: s.documents
      })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    };
  }

  /**
   * Request additional documents from a school
   */
  async requestAdditionalDocuments(schoolId: string, adminId: string, data: any): Promise<any> {
    const { documents, instructions, channels = [], targetUserId, targetUserEmail, targetUserName } = data;
    const message = `Additional documents required: ${documents}. ${instructions ? `Instructions: ${instructions}` : 'Please submit the requested documents promptly.'}`;

    // Always create a school support message (visible in the school dashboard)
    await prisma.schoolSupportMessage.create({
      data: { schoolId, message, priority: 'high', isRead: false },
    });

    // Prefer the explicitly passed student (loan applicant); fall back to school owner
    let recipientId: string | null = targetUserId || null;
    let recipientEmail: string | null = targetUserEmail || null;
    let recipientName: string = targetUserName || 'User';

    if (!recipientId || !recipientEmail) {
      const school = await prisma.schoolProfile.findUnique({
        where: { id: schoolId },
        select: { userId: true, user: { select: { email: true, fullName: true } } },
      });
      recipientId = recipientId || school?.userId || null;
      recipientEmail = recipientEmail || school?.user?.email || null;
      recipientName = recipientName !== 'User' ? recipientName : (school?.user?.fullName || 'User');
    }

    if (recipientId) {
      // In-app notification
      if (channels.includes('in_app')) {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: NotificationType.INFO,
            title: 'Additional Documents Required',
            message,
            isRead: false,
          },
        });
      }

      // Email notification
      if (channels.includes('email') && recipientEmail) {
        const mailService = new MailService();
        await mailService.sendDocumentRequestEmail(
          recipientEmail,
          recipientName,
          documents,
          instructions || '',
        ).catch(err => console.error('Document request email failed:', err));
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'REQUEST_DOCUMENTS',
        entity: 'school',
        entityId: schoolId,
        newValues: { documents, instructions, channels, targetUserId },
      },
    });

    return { success: true };
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
      verificationId = schoolProfile.profileVerifications[0]?.id as string;
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

  /**
   * Get loans for users with TEACHER role
   */
  async getTeacherLoans(page: number, limit: number, statuses?: string[]): Promise<any> {
    const skip = (page - 1) * limit;
    const where: any = {
      user: { role: UserRole.TEACHER },
      ...(statuses?.length === 1
        ? { status: statuses[0] as LoanStatus }
        : statuses && statuses.length > 1
          ? { status: { in: statuses as LoanStatus[] } }
          : {}),
    };

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, country: true, city: true, isActive: true } },
          school: { select: { schoolName: true, isVerified: true } },
        },
      }),
      prisma.loan.count({ where }),
    ]);

    return {
      loans: loans.map((l: any) => ({
        id: l.id,
        loanNumber: l.loanNumber,
        teacherName: l.user.fullName,
        // Aliases used by LoanDetailDrawer while detail fetch is in progress
        userName: l.user.fullName,
        userEmail: l.user.email,
        userPhone: l.user.phone,
        userCountry: l.user.country,
        userCity: l.user.city,
        userIsActive: l.user.isActive,
        userId: l.userId,
        schoolName: l.school?.schoolName ?? l.schoolName,
        schoolIsVerified: l.school?.isVerified ?? false,
        userPreviousLoans: 0,
        loanAmount: Number(l.loanAmount),
        repaymentMonths: l.repaymentMonths,
        status: l.status,
        applicationDate: l.applicationDate,
        createdAt: l.createdAt,
      })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Get single teacher details (user + teacherProfile + loans)
   */
  async getTeacherDetails(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });

    if (!user) throw new Error('Teacher not found');

    const loans = await prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        installments: { orderBy: { installmentNumber: 'asc' } },
        documents: { select: { id: true, documentType: true, fileName: true, fileUrl: true, fileSize: true } },
        school: { select: { schoolName: true } },
      },
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      teacherProfile: user.teacherProfile,
      loans: loans.map((l: any) => ({
        id: l.id,
        loanNumber: l.loanNumber,
        loanAmount: Number(l.loanAmount),
        totalAmount: Number(l.totalAmount),
        amountRepaid: Number(l.amountRepaid),
        outstandingBalance: Number(l.outstandingBalance),
        status: l.status,
        applicationDate: l.applicationDate,
        disbursementDate: l.disbursementDate,
        schoolName: l.school?.schoolName ?? l.schoolName,
        installments: l.installments.map((i: any) => ({ ...i, amount: Number(i.amount) })),
        documents: l.documents,
      })),
    };
  }

  /**
   * Get users with TEACHER role and their profiles
   */
  async getTeacherUsers(page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;
    const where = { role: UserRole.TEACHER };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { teacherProfile: true },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      teachers: users.map((u: any) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        isActive: u.isActive,
        createdAt: u.createdAt,
        staffId: u.teacherProfile?.staffId ?? null,
        subject: u.teacherProfile?.subject ?? null,
        schoolName: u.teacherProfile?.schoolName ?? null,
        employmentStatus: u.teacherProfile?.employmentStatus ?? null,
      })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Get loans for users with SCHOOL role
   */
  async getSchoolLoans(page: number, limit: number, statuses?: string[]): Promise<any> {
    const skip = (page - 1) * limit;
    const where: any = {
      user: { role: UserRole.SCHOOL },
      ...(statuses?.length === 1
        ? { status: statuses[0] as LoanStatus }
        : statuses && statuses.length > 1
          ? { status: { in: statuses as LoanStatus[] } }
          : {}),
    };

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, country: true, city: true, isActive: true } },
          school: { select: { schoolName: true, isVerified: true } },
        },
      }),
      prisma.loan.count({ where }),
    ]);

    return {
      loans: loans.map((l: any) => ({
        id: l.id,
        loanNumber: l.loanNumber,
        userName: l.user.fullName,
        userEmail: l.user.email,
        userPhone: l.user.phone,
        userCountry: l.user.country,
        userCity: l.user.city,
        userIsActive: l.user.isActive,
        userId: l.userId,
        schoolName: l.school?.schoolName ?? l.schoolName,
        schoolIsVerified: l.school?.isVerified ?? false,
        userPreviousLoans: 0,
        loanAmount: Number(l.loanAmount),
        repaymentMonths: l.repaymentMonths,
        status: l.status,
        applicationDate: l.applicationDate,
        createdAt: l.createdAt,
      })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Get users with SCHOOL role as a list (for school-admin students/users page)
   */
  async getSchoolUserList(page: number, limit: number, status?: string): Promise<any> {
    const skip = (page - 1) * limit;
    const loanWhere: any = {
      user: { role: UserRole.SCHOOL },
      ...(status ? { status: status as LoanStatus } : {}),
    };

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where: loanWhere,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        distinct: ['userId'],
        include: {
          user: {
            select: { id: true, fullName: true, email: true, isActive: true, createdAt: true },
          },
          payments: { select: { paymentDate: true }, orderBy: { paymentDate: 'desc' }, take: 1 },
          school: { select: { schoolName: true } },
        },
      }),
      prisma.loan.count({ where: loanWhere }),
    ]);

    return {
      students: loans.map((l: any) => ({
        userId: l.userId,
        loanId: l.id,
        loanNumber: l.loanNumber,
        studentName: l.user.fullName,
        school: l.school?.schoolName ?? l.schoolName,
        status: l.status,
        lastActivity: l.payments[0]?.paymentDate || l.updatedAt,
        date: l.createdAt,
      })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Get single SCHOOL user details (user + schoolProfile + loan + documents)
   */
  async getSchoolUserDetails(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { schoolProfile: true },
    });

    if (!user) throw new Error('School user not found');

    const loan = await prisma.loan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        installments: { orderBy: { installmentNumber: 'asc' } },
        school: { select: { schoolName: true } },
      },
    });

    const documents = await prisma.document.findMany({ where: { userId } });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        country: user.country,
        city: user.city,
        createdAt: user.createdAt,
      },
      schoolProfile: user.schoolProfile,
      loan: loan ? {
        id: loan.id,
        loanNumber: loan.loanNumber,
        loanAmount: Number(loan.loanAmount),
        amountRepaid: Number(loan.amountRepaid),
        remainingAmount: Math.max(0, Number(loan.loanAmount) - Number(loan.amountRepaid)),
        paidAmount: Number(loan.amountRepaid),
        status: loan.status,
        applicationDate: loan.applicationDate,
        disbursementDate: loan.disbursementDate,
        schoolName: loan.school?.schoolName ?? loan.schoolName,
        installments: loan.installments.map((i: any) => ({ ...i, amount: Number(i.amount) })),
      } : null,
      documents,
    };
  }

  /**
   * Get support tickets from SCHOOL role users
   */
  async getSchoolSupportTickets(page: number, limit: number, status?: string): Promise<any> {
    const skip = (page - 1) * limit;
    const where: any = {
      user: { role: UserRole.SCHOOL },
      ...(status ? { status: status as SupportTicketStatus } : {}),
    };

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, role: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return {
      tickets,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Dashboard stats scoped to SCHOOL role users
   */
  async getSchoolAdminDashboardStats(): Promise<any> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const schoolUserFilter = { user: { role: UserRole.SCHOOL } };

    const [
      totalSchoolsCount,
      pendingSchoolsCount,
      verifiedSchoolsCount,
      totalLoansCount,
      pendingLoansCount,
      approvedLoansCount,
      rejectedLoansCount,
      activeLoansCount,
      completedLoansCount,
      overdueCount,
      activeStudentCount,
      openTicketsCount,
      totalTicketsToday,
      totalPlatformTickets,
      resolvedTicketsCount,
    ] = await Promise.all([
      prisma.schoolProfile.count(),
      prisma.schoolProfile.count({ where: { isVerified: false } }),
      prisma.schoolProfile.count({ where: { isVerified: true } }),
      prisma.loan.count({ where: schoolUserFilter }),
      prisma.loan.count({ where: { ...schoolUserFilter, status: LoanStatus.PENDING } }),
      prisma.loan.count({ where: { ...schoolUserFilter, status: { in: [LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.DISBURSED, LoanStatus.COMPLETED] } } }),
      prisma.loan.count({ where: { ...schoolUserFilter, status: LoanStatus.REJECTED } }),
      prisma.loan.count({ where: { ...schoolUserFilter, status: LoanStatus.ACTIVE } }),
      prisma.loan.count({ where: { ...schoolUserFilter, status: LoanStatus.COMPLETED } }),
      prisma.installment.count({ where: { loan: schoolUserFilter, daysOverdue: { gt: 0 } } }),
      prisma.user.count({ where: { role: UserRole.SCHOOL, isActive: true } }),
      prisma.supportTicket.count({ where: { user: { role: UserRole.SCHOOL }, status: SupportTicketStatus.OPEN } }),
      prisma.supportTicket.count({ where: { user: { role: UserRole.SCHOOL }, createdAt: { gte: todayStart } } }),
      prisma.supportTicket.count({ where: { user: { role: UserRole.SCHOOL } } }),
      prisma.supportTicket.count({ where: { user: { role: UserRole.SCHOOL }, status: SupportTicketStatus.RESOLVED } }),
    ]);

    const ticketsWithResponse = await prisma.supportTicket.findMany({
      where: { user: { role: UserRole.SCHOOL }, firstResponseAt: { not: null } },
      select: { createdAt: true, firstResponseAt: true },
    });
    let avgFirstResponseMins = 0;
    if (ticketsWithResponse.length > 0) {
      const totalMins = ticketsWithResponse.reduce((sum, t) => {
        return sum + (t.firstResponseAt!.getTime() - t.createdAt.getTime()) / 60000;
      }, 0);
      avgFirstResponseMins = Math.round(totalMins / ticketsWithResponse.length);
    }

    return {
      totalSchoolsCount,
      pendingSchoolsCount,
      verifiedSchoolsCount,
      activeStudentCount,
      activeLoansCount,
      overdueCount,
      completedLoansCount,
      loans: {
        total: totalLoansCount,
        pending: pendingLoansCount,
        approved: approvedLoansCount,
        rejected: rejectedLoansCount,
      },
      tickets: {
        totalToday: totalTicketsToday,
        open: openTicketsCount,
        resolved: resolvedTicketsCount,
        total: totalPlatformTickets,
        avgFirstResponseMins,
      },
    };
  }

  /**
   * Get support tickets from TEACHER role users
   */
  async getTeacherSupportTickets(page: number, limit: number, status?: string): Promise<any> {
    const skip = (page - 1) * limit;
    const where: any = {
      user: { role: UserRole.TEACHER },
      ...(status ? { status: status as SupportTicketStatus } : {}),
    };

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, role: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return {
      tickets,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Dashboard stats scoped to TEACHER role users
   */
  async getTeacherAdminDashboardStats(): Promise<any> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const teacherFilter = { user: { role: UserRole.TEACHER } };

    const [
      totalLoansCount, pendingLoansCount, approvedLoansCount, rejectedLoansCount,
      openTicketsCount, totalTicketsToday, totalPlatformTickets, resolvedTicketsCount,
    ] = await Promise.all([
      prisma.loan.count({ where: teacherFilter }),
      prisma.loan.count({ where: { ...teacherFilter, status: LoanStatus.PENDING } }),
      prisma.loan.count({ where: { ...teacherFilter, status: { in: [LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.DISBURSED, LoanStatus.COMPLETED] } } }),
      prisma.loan.count({ where: { ...teacherFilter, status: LoanStatus.REJECTED } }),
      prisma.supportTicket.count({ where: { user: { role: UserRole.TEACHER }, status: SupportTicketStatus.OPEN } }),
      prisma.supportTicket.count({ where: { user: { role: UserRole.TEACHER }, createdAt: { gte: todayStart } } }),
      prisma.supportTicket.count({ where: { user: { role: UserRole.TEACHER } } }),
      prisma.supportTicket.count({ where: { user: { role: UserRole.TEACHER }, status: SupportTicketStatus.RESOLVED } }),
    ]);

    const ticketsWithResponse = await prisma.supportTicket.findMany({
      where: { user: { role: UserRole.TEACHER }, firstResponseAt: { not: null } },
      select: { createdAt: true, firstResponseAt: true },
    });
    let avgFirstResponseMins = 0;
    if (ticketsWithResponse.length > 0) {
      const totalMins = ticketsWithResponse.reduce((sum, t) => {
        return sum + (t.firstResponseAt!.getTime() - t.createdAt.getTime()) / 60000;
      }, 0);
      avgFirstResponseMins = Math.round(totalMins / ticketsWithResponse.length);
    }

    return {
      loans: {
        total: totalLoansCount,
        pending: pendingLoansCount,
        approved: approvedLoansCount,
        rejected: rejectedLoansCount,
      },
      tickets: {
        totalToday: totalTicketsToday,
        open: openTicketsCount,
        resolved: resolvedTicketsCount,
        total: totalPlatformTickets,
        avgFirstResponseMins,
      },
    };
  }

  /**
   * Update student profile (user with role PARENT)
   */
  async updateStudent(userId: string, data: any): Promise<any> {
    const updatableFields = ['fullName', 'email', 'phone', 'gender', 'dob', 'country', 'city', 'address'];
    const updateData: any = {};

    // Only allow specific fields to be updated
    updatableFields.forEach(field => {
      if (data[field] !== undefined) {
        if (field === 'dob') {
          updateData[field] = new Date(data[field]);
        } else {
          updateData[field] = data[field];
        }
      }
    });

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        wallet: true,
        loans: {
          include: {
            installments: true,
            school: true,
          },
        },
      },
    });

    return {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      dob: updatedUser.dob,
      country: updatedUser.country,
      city: updatedUser.city,
      address: updatedUser.address,
    };
  }
}

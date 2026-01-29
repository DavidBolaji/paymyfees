/**
 * School Verification Repository
 * Data access layer for school verification operations
 */

import { prisma } from '@/src/lib/prisma';
import { VerificationStatus } from '@prisma/client';

/**
 * School Verification Repository Interface
 */
export interface ISchoolVerificationRepository {
  createVerificationRequest(userId: string, data: any): Promise<any>;
  getVerificationStatus(userId: string): Promise<any>;
  getVerificationById(verificationId: string): Promise<any>;
  updateVerificationStatus(verificationId: string, status: VerificationStatus, notes?: string): Promise<any>;
  getVerificationLogs(schoolId: string, limit?: number): Promise<any[]>;
  createVerificationLog(verificationId: string, schoolId: string, activity: string, details: string, status: VerificationStatus, performedBy?: string): Promise<any>;
  getAllVerificationRequests(schoolId: string): Promise<any[]>;
}

/**
 * School Verification Repository Implementation
 */
export class SchoolVerificationRepository implements ISchoolVerificationRepository {
  /**
   * Create a new school verification request
   */
  async createVerificationRequest(userId: string, data: any): Promise<any> {
    console.log({ msg: 'Creating school verification request', userId });
    
    try {
      // Create verification in a transaction with initial log
      const result = await prisma.$transaction(async (tx) => {
        const verification = await tx.schoolVerification.create({
          data: {
            loanId: data.loanId,
            schoolId: data.schoolId,
            studentName: data.studentName,
            studentClass: data.studentClass,
            invoiceAmount: data.invoiceAmount,
            status: VerificationStatus.PENDING,
          },
        });

        // Create initial log
        await tx.verificationLog.create({
          data: {
            verificationId: verification.id,
            schoolId: data.schoolId,
            activity: 'Submission Received',
            details: `Verification request submitted for ${data.studentName} in ${data.studentClass}`,
            status: VerificationStatus.PENDING,
          },
        });

        return verification;
      });
      
      return result;
    } catch (error) {
      console.error({ 
        msg: 'Error creating school verification request', 
        userId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
  
  /**
   * Get verification status for a user
   */
  async getVerificationStatus(userId: string): Promise<any> {
    console.log({ msg: 'Fetching verification status', userId });
    
    try {
      // Find loans associated with this user
      const userLoans = await prisma.loan.findMany({
        where: {
          userId: userId
        },
        select: {
          id: true
        }
      });
      
      const loanIds = userLoans.map(loan => loan.id);
      
      // Find verification requests for these loans
      const verification = await prisma.schoolVerification.findFirst({
        where: {
          loanId: {
            in: loanIds
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          school: {
            select: {
              id: true,
              schoolName: true,
            },
          },
        },
      });
      
      return verification;
    } catch (error) {
      console.error({ 
        msg: 'Error fetching verification status', 
        userId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
  
  /**
   * Get verification by ID
   */
  async getVerificationById(verificationId: string): Promise<any> {
    console.log({ msg: 'Fetching verification by ID', verificationId });
    
    try {
      const verification = await prisma.schoolVerification.findUnique({
        where: {
          id: verificationId,
        },
        include: {
          loan: {
            select: {
              id: true,
              loanNumber: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                }
              }
            }
          },
          school: {
            select: {
              id: true,
              schoolName: true,
            },
          },
        },
      });
      
      return verification;
    } catch (error) {
      console.error({ 
        msg: 'Error fetching verification by ID', 
        verificationId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
  
  /**
   * Update verification status
   */
  async updateVerificationStatus(verificationId: string, status: VerificationStatus, notes?: string): Promise<any> {
    console.log({ msg: 'Updating verification status', verificationId, status });
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Get verification details first
        const verification = await tx.schoolVerification.findUnique({
          where: { id: verificationId },
          include: {
            school: true,
            loan: {
              include: {
                student: true
              }
            }
          }
        });

        if (!verification) {
          throw new Error('Verification not found');
        }

        // Update verification
        const updated = await tx.schoolVerification.update({
          where: {
            id: verificationId,
          },
          data: {
            status,
            notes,
            respondedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Create log entry
        let activity = '';
        let details = '';

        switch (status) {
          case VerificationStatus.VERIFIED:
            activity = 'School Verified';
            details = `School email confirmed enrollment for ${verification.studentName}`;
            break;
          case VerificationStatus.REJECTED:
            activity = 'Verification Rejected';
            details = notes || 'Verification request was rejected';
            break;
          default:
            activity = 'Status Updated';
            details = `Verification status changed to ${status}`;
        }

        await tx.verificationLog.create({
          data: {
            verificationId: verification.id,
            schoolId: verification.schoolId,
            activity,
            details,
            status,
          },
        });

        return updated;
      });
      
      return result;
    } catch (error) {
      console.error({ 
        msg: 'Error updating verification status', 
        verificationId,
        status,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Get verification logs for a school
   */
  async getVerificationLogs(schoolId: string, limit: number = 10): Promise<any[]> {
    console.log({ msg: 'Fetching verification logs', schoolId });
    
    try {
      const logs = await prisma.verificationLog.findMany({
        where: {
          schoolId: schoolId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        include: {
          verification: {
            include: {
              loan: {
                select: {
                  loanNumber: true,
                  student: {
                    select: {
                      fullName: true,
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      return logs;
    } catch (error) {
      console.error({ 
        msg: 'Error fetching verification logs', 
        schoolId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Create a verification log entry
   */
  async createVerificationLog(
    verificationId: string,
    schoolId: string,
    activity: string,
    details: string,
    status: VerificationStatus,
    performedBy?: string
  ): Promise<any> {
    console.log({ msg: 'Creating verification log', verificationId, activity });
    
    try {
      const log = await prisma.verificationLog.create({
        data: {
          verificationId,
          schoolId,
          activity,
          details,
          status,
          performedBy,
        },
      });
      
      return log;
    } catch (error) {
      console.error({ 
        msg: 'Error creating verification log', 
        verificationId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Get all verification requests for a school
   */
  async getAllVerificationRequests(schoolId: string): Promise<any[]> {
    console.log({ msg: 'Fetching all verification requests', schoolId });
    
    try {
      const requests = await prisma.schoolVerification.findMany({
        where: {
          schoolId: schoolId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          loan: {
            select: {
              id: true,
              loanNumber: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                }
              },
              student: {
                select: {
                  fullName: true,
                }
              }
            }
          },
          school: {
            select: {
              id: true,
              schoolName: true,
            },
          },
        },
      });
      
      return requests;
    } catch (error) {
      console.error({ 
        msg: 'Error fetching verification requests', 
        schoolId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
}
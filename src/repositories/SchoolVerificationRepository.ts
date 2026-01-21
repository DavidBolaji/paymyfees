/**
 * School Verification Repository
 * Data access layer for school verification operations
 */

import { prisma } from '@/src/lib/prisma';
import { logger } from '@/src/utils/logger';
import { VerificationStatus } from '@prisma/client';

/**
 * School Verification Repository Interface
 */
export interface ISchoolVerificationRepository {
  createVerificationRequest(userId: string, data: any): Promise<any>;
  getVerificationStatus(userId: string): Promise<any>;
  getVerificationById(verificationId: string): Promise<any>;
  updateVerificationStatus(verificationId: string, status: VerificationStatus, notes?: string): Promise<any>;
}

/**
 * School Verification Repository Implementation
 */
export class SchoolVerificationRepository implements ISchoolVerificationRepository {
  /**
   * Create a new school verification request
   */
  async createVerificationRequest(userId: string, data: any): Promise<any> {
    logger.info({ msg: 'Creating school verification request', userId });
    
    try {
      const verification = await prisma.schoolVerification.create({
        data: {
          loanId: data.loanId,
          schoolId: data.schoolId,
          studentName: data.studentName,
          studentClass: data.studentClass,
          invoiceAmount: data.invoiceAmount,
          status: VerificationStatus.PENDING,
        },
      });
      
      return verification;
    } catch (error) {
      logger.error({ 
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
    logger.info({ msg: 'Fetching verification status', userId });
    
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
      logger.error({ 
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
    logger.info({ msg: 'Fetching verification by ID', verificationId });
    
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
      logger.error({ 
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
    logger.info({ msg: 'Updating verification status', verificationId, status });
    
    try {
      const verification = await prisma.schoolVerification.update({
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
      
      return verification;
    } catch (error) {
      logger.error({ 
        msg: 'Error updating verification status', 
        verificationId,
        status,
        error: (error as Error).message 
      });
      throw error;
    }
  }
}
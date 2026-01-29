/**
 * School Verification Service
 * Business logic for school verification operations
 */
import { SchoolVerificationRepository, ISchoolVerificationRepository } from '@/src/repositories/SchoolVerificationRepository';
import { ValidationError } from '@/src/types/errors';
import { ISchoolSupportMessageRepository, SchoolSupportMessageRepository } from '../repositories/SupportMessageRepository';

export interface ISchoolVerificationService {
  submitVerificationRequest(userId: string, data: any): Promise<any>;
  getVerificationStatus(userId: string): Promise<any>;
  getVerificationLogs(schoolId: string, limit?: number): Promise<any[]>;
  getSupportMessages(schoolId: string): Promise<any[]>;
  markSupportMessageAsRead(messageId: string): Promise<any>;
  getUnreadSupportCount(schoolId: string): Promise<number>;
}

export class SchoolVerificationService implements ISchoolVerificationService {
  private schoolVerificationRepository: ISchoolVerificationRepository;
  private supportMessageRepository: ISchoolSupportMessageRepository;

  constructor(
    schoolVerificationRepository?: ISchoolVerificationRepository,
    supportMessageRepository?: ISchoolSupportMessageRepository
  ) {
    this.schoolVerificationRepository = schoolVerificationRepository || new SchoolVerificationRepository();
    this.supportMessageRepository = supportMessageRepository || new SchoolSupportMessageRepository();
  }

  /**
   * Submit a school verification request
   */
  async submitVerificationRequest(userId: string, data: any): Promise<any> {
    console.log({ msg: 'Submitting verification request', userId });

    // Validate required fields
    if (!data.loanId) {
      throw new ValidationError('Loan ID is required');
    }
    if (!data.schoolId) {
      throw new ValidationError('School ID is required');
    }
    if (!data.studentName) {
      throw new ValidationError('Student name is required');
    }
    if (!data.studentClass) {
      throw new ValidationError('Student class is required');
    }
    if (!data.invoiceAmount) {
      throw new ValidationError('Invoice amount is required');
    }

    // Check if user already has a pending or approved verification
    const existingVerification = await this.schoolVerificationRepository.getVerificationStatus(userId);
    
    if (existingVerification) {
      if (existingVerification.status === 'PENDING') {
        throw new ValidationError('You already have a pending verification request');
      }
      
      if (existingVerification.status === 'VERIFIED') {
        throw new ValidationError('You are already verified with a school');
      }
    }

    // Submit verification request
    const verification = await this.schoolVerificationRepository.createVerificationRequest(userId, data);
    
    return verification;
  }

  /**
   * Get verification status for a user
   */
  async getVerificationStatus(userId: string): Promise<any> {
    console.log({ msg: 'Getting verification status', userId });

    const verification = await this.schoolVerificationRepository.getVerificationStatus(userId);
    
    return verification || { status: 'NOT_SUBMITTED' };
  }

  /**
   * Get verification logs for a school
   */
  async getVerificationLogs(schoolId: string, limit?: number): Promise<any[]> {
    console.log({ msg: 'Getting verification logs', schoolId });

    const logs = await this.schoolVerificationRepository.getVerificationLogs(schoolId, limit);
    
    // Transform logs for frontend
    return logs.map(log => ({
      id: log.id,
      date: log.createdAt,
      activity: log.activity,
      details: log.details,
      status: log.status,
      studentName: log.verification?.loan?.student?.fullName || 'N/A',
      loanNumber: log.verification?.loan?.loanNumber || 'N/A',
    }));
  }

  /**
   * Get support messages for a school
   */
  async getSupportMessages(schoolId: string): Promise<any[]> {
    console.log({ msg: 'Getting support messages', schoolId });

    const messages = await this.supportMessageRepository.getMessages(schoolId);
    
    return messages;
  }

  /**
   * Mark support message as read
   */
  async markSupportMessageAsRead(messageId: string): Promise<any> {
    console.log({ msg: 'Marking support message as read', messageId });

    const message = await this.supportMessageRepository.markAsRead(messageId);
    
    return message;
  }

  /**
   * Get unread support message count
   */
  async getUnreadSupportCount(schoolId: string): Promise<number> {
    console.log({ msg: 'Getting unread support count', schoolId });

    const count = await this.supportMessageRepository.getUnreadCount(schoolId);
    
    return count;
  }
}
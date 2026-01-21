/**
 * School Verification Service
 * Business logic for school verification operations
 * Implements service layer with dependency injection
 */

import { SchoolVerificationRepository, ISchoolVerificationRepository } from '@/src/repositories/SchoolVerificationRepository';
import { ValidationError, NotFoundError } from '@/src/types/errors';
import { logger } from '@/src/utils/logger';

/**
 * School Verification Service Interface
 */
export interface ISchoolVerificationService {
  submitVerificationRequest(userId: string, data: any): Promise<any>;
  getVerificationStatus(userId: string): Promise<any>;
}

/**
 * School Verification Service Implementation
 */
export class SchoolVerificationService implements ISchoolVerificationService {
  private schoolVerificationRepository: ISchoolVerificationRepository;

  constructor(schoolVerificationRepository?: ISchoolVerificationRepository) {
    this.schoolVerificationRepository = schoolVerificationRepository || new SchoolVerificationRepository();
  }

  /**
   * Submit a school verification request
   */
  async submitVerificationRequest(userId: string, data: any): Promise<any> {
    logger.info({ msg: 'Submitting verification request', userId });

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
    logger.info({ msg: 'Getting verification status', userId });

    const verification = await this.schoolVerificationRepository.getVerificationStatus(userId);
    
    return verification || { status: 'NOT_SUBMITTED' };
  }
}
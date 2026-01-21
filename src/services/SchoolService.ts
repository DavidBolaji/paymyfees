/**
 * School Service
 * Business logic for school operations
 * Implements service layer with dependency injection
 */

import { SchoolRepository, ISchoolRepository } from '@/src/repositories/SchoolRepository';
import { ValidationError, NotFoundError } from '@/src/types/errors';
import { logger } from '@/src/utils/logger';

/**
 * School Service Interface
 */
export interface ISchoolService {
  getSchoolProfile(userId: string): Promise<any>;
  registerSchool(userId: string, data: any): Promise<any>;
  updateSchoolProfile(userId: string, data: any): Promise<any>;
  getVerificationRequests(userId: string): Promise<any[]>;
  getVerificationRequestById(userId: string, verificationId: string): Promise<any>;
  respondToVerificationRequest(userId: string, verificationId: string, status: string, notes?: string): Promise<any>;
  getDisbursements(userId: string): Promise<any[]>;
}

/**
 * School Service Implementation
 */
export class SchoolService implements ISchoolService {
  private schoolRepository: ISchoolRepository;

  constructor(schoolRepository?: ISchoolRepository) {
    this.schoolRepository = schoolRepository || new SchoolRepository();
  }

  /**
   * Get school profile for a user
   */
  async getSchoolProfile(userId: string): Promise<any> {
    logger.info({ msg: 'Getting school profile', userId });

    const school = await this.schoolRepository.getSchoolByUserId(userId);
    
    if (!school) {
      throw new NotFoundError('School profile not found');
    }

    return school;
  }

  /**
   * Register a new school
   */
  async registerSchool(userId: string, data: any): Promise<any> {
    logger.info({ msg: 'Registering new school', userId });

    // Check if user already has a school
    const existingSchool = await this.schoolRepository.getSchoolByUserId(userId);
    if (existingSchool) {
      throw new ValidationError('User already has a registered school');
    }

    // Validate required fields
    if (!data.name) {
      throw new ValidationError('School name is required');
    }

    if (!data.email) {
      throw new ValidationError('School email is required');
    }

    if (!data.phone) {
      throw new ValidationError('School phone is required');
    }

    // Add userId to data
    const schoolData = {
      ...data,
      userId,
    };

    // Register school
    const school = await this.schoolRepository.registerSchool(schoolData);
    
    return school;
  }

  /**
   * Update school profile
   */
  async updateSchoolProfile(userId: string, data: any): Promise<any> {
    logger.info({ msg: 'Updating school profile', userId });

    // Get school for user
    const school = await this.schoolRepository.getSchoolByUserId(userId);
    
    if (!school) {
      throw new NotFoundError('School profile not found');
    }

    // Validate required fields
    if (!data.name) {
      throw new ValidationError('School name is required');
    }

    if (!data.email) {
      throw new ValidationError('School email is required');
    }

    if (!data.phone) {
      throw new ValidationError('School phone is required');
    }

    // Update school profile
    const updatedSchool = await this.schoolRepository.updateSchoolProfile(school.id, data);
    
    return updatedSchool;
  }

  /**
   * Get verification requests for a school
   */
  async getVerificationRequests(userId: string): Promise<any[]> {
    logger.info({ msg: 'Getting verification requests', userId });

    // Get school for user
    const school = await this.schoolRepository.getSchoolByUserId(userId);
    
    if (!school) {
      throw new NotFoundError('School profile not found');
    }

    // Get verification requests
    const verificationRequests = await this.schoolRepository.getVerificationRequests(school.id);
    
    return verificationRequests;
  }

  /**
   * Get verification request by ID
   */
  async getVerificationRequestById(userId: string, verificationId: string): Promise<any> {
    logger.info({ msg: 'Getting verification request by ID', userId, verificationId });

    // Get school for user
    const school = await this.schoolRepository.getSchoolByUserId(userId);
    
    if (!school) {
      throw new NotFoundError('School profile not found');
    }

    // Get verification request
    const verificationRequest = await this.schoolRepository.getVerificationRequestById(verificationId);
    
    if (!verificationRequest) {
      throw new NotFoundError('Verification request not found');
    }

    // Check if verification request belongs to the school
    if (verificationRequest.schoolId !== school.id) {
      throw new ValidationError('Verification request does not belong to this school');
    }

    return verificationRequest;
  }

  /**
   * Respond to verification request
   */
  async respondToVerificationRequest(userId: string, verificationId: string, status: string, notes?: string): Promise<any> {
    logger.info({ msg: 'Responding to verification request', userId, verificationId, status });

    // Validate status
    const validStatuses = ['VERIFIED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status. Status must be VERIFIED or REJECTED');
    }

    // Get school for user
    const school = await this.schoolRepository.getSchoolByUserId(userId);
    
    if (!school) {
      throw new NotFoundError('School profile not found');
    }

    // Get verification request
    const verificationRequest = await this.schoolRepository.getVerificationRequestById(verificationId);
    
    if (!verificationRequest) {
      throw new NotFoundError('Verification request not found');
    }

    // Check if verification request belongs to the school
    if (verificationRequest.schoolId !== school.id) {
      throw new ValidationError('Verification request does not belong to this school');
    }

    // Check if verification request is already processed
    if (verificationRequest.status !== 'PENDING') {
      throw new ValidationError('Verification request has already been processed');
    }

    // Update verification status
    const updatedVerification = await this.schoolRepository.updateVerificationStatus(verificationId, status, notes);
    
    return updatedVerification;
  }

  /**
   * Get disbursements for a school
   */
  async getDisbursements(userId: string): Promise<any[]> {
    logger.info({ msg: 'Getting disbursements', userId });

    // Get school for user
    const school = await this.schoolRepository.getSchoolByUserId(userId);
    
    if (!school) {
      throw new NotFoundError('School profile not found');
    }

    // Get disbursements
    const disbursements = await this.schoolRepository.getDisbursements(school.id);
    
    return disbursements;
  }
}
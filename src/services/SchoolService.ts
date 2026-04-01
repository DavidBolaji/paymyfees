/**
 * School Service
 * Business logic for school operations
 * Supports multiple schools per user
 */

import { SchoolRepository, ISchoolRepository } from '@/src/repositories/SchoolRepository';
import { ValidationError, NotFoundError } from '@/src/types/errors';
import { ResidencyStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';

export interface FindOrCreateSchoolInput {
  schoolName: string;
  residencyStatus: ResidencyStatus;
  countryOfStudy?: string;
}

/**
 * School Service Interface
 */
export interface ISchoolService {
  getSchoolProfile(userId: string, schoolId?: string): Promise<any>;
  getAllUserSchools(userId: string): Promise<any[]>;
  getPrimarySchool(userId: string): Promise<any>;
  getAllSchools(): Promise<any[]>;
  registerSchool(userId: string, data: any): Promise<any>;
  setPrimarySchool(userId: string, schoolId: string): Promise<any>;
  findOrCreateSchool(input: FindOrCreateSchoolInput): Promise<string>;
  findSchoolByName(schoolName: string, countryOfStudy?: string): Promise<string | null>;
  updateSchoolProfile(userId: string, schoolId: string, data: any): Promise<any>;
  getVerificationRequests(userId: string, schoolId: string): Promise<any[]>;
  getVerificationRequestById(userId: string, verificationId: string): Promise<any>;
  respondToVerificationRequest(userId: string, verificationId: string, status: string, notes?: string): Promise<any>;
  getDisbursements(userId: string, schoolId: string): Promise<any[]>;
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
   * Get school profile (primary or specific)
   */
  async getSchoolProfile(userId: string, schoolId?: string): Promise<any> {
    console.log({ msg: 'Getting school profile', userId, schoolId });

    let school;
    
    if (schoolId) {
      school = await this.schoolRepository.getSchoolById(schoolId);
      
      // Verify school belongs to user
      if (school && school.userId !== userId) {
        throw new ValidationError('School does not belong to this user');
      }
    } else {
      // Get primary school
      school = await this.schoolRepository.getSchoolByUserId(userId);
    }
    
    if (!school) {
      throw new NotFoundError('School profile not found');
    }

    return school;
  }

  /**
   * Get all schools for a user
   */
  async getAllUserSchools(userId: string): Promise<any[]> {
    console.log({ msg: 'Getting all user schools', userId });

    const schools = await this.schoolRepository.getAllSchoolsByUserId(userId);
    return schools;
  }

  /**
   * Get primary school for a user
   */
  async getPrimarySchool(userId: string): Promise<any> {
    console.log({ msg: 'Getting primary school', userId });

    const school = await this.schoolRepository.getPrimarySchool(userId);
    
    if (!school) {
      throw new NotFoundError('No primary school found');
    }

    return school;
  }

  /**
   * Get all verified schools (public)
   */
  async getAllSchools(): Promise<any[]> {
    console.log({ msg: 'Getting all schools' });
    
    const schools = await this.schoolRepository.getAllSchools();
    return schools;
  }

  /**
   * Register a new school
   */
  async registerSchool(userId: string, data: any): Promise<any> {
    console.log({ msg: 'Registering new school', userId });

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
   * Set a school as primary
   */
  async setPrimarySchool(userId: string, schoolId: string): Promise<any> {
    console.log({ msg: 'Setting primary school', userId, schoolId });

    // Verify school exists and belongs to user
    const school = await this.schoolRepository.getSchoolById(schoolId);
    
    if (!school) {
      throw new NotFoundError('School not found');
    }

    if (school.userId !== userId) {
      throw new ValidationError('School does not belong to this user');
    }

    // Set as primary
    const updatedSchool = await this.schoolRepository.setPrimarySchool(userId, schoolId);
    
    return updatedSchool;
  }

  /**
   * Update school profile
   */
  async updateSchoolProfile(userId: string, schoolId: string, data: any): Promise<any> {
    console.log({ msg: 'Updating school profile', userId, schoolId });

    // Get school
    const school = await this.schoolRepository.getSchoolById(schoolId);

    if (!school) {
      throw new NotFoundError('School not found');
    }

    // Verify school belongs to user
    if (school.userId !== userId) {
      throw new ValidationError('School does not belong to this user');
    }

    // Update school profile
    const updatedSchool = await this.schoolRepository.updateSchoolProfile(schoolId, data);
    
    return updatedSchool;
  }

  /**
   * Get verification requests for a school
   */
  async getVerificationRequests(userId: string, schoolId: string): Promise<any[]> {
    console.log({ msg: 'Getting verification requests', userId, schoolId });

    // Get school
    const school = await this.schoolRepository.getSchoolById(schoolId);
    
    if (!school) {
      throw new NotFoundError('School profile not found');
    }

    // Verify school belongs to user
    if (school.userId !== userId) {
      throw new ValidationError('School does not belong to this user');
    }

    // Get verification requests
    const verificationRequests = await this.schoolRepository.getVerificationRequests(schoolId);
    
    return verificationRequests;
  }

  /**
   * Get verification request by ID
   */
  async getVerificationRequestById(userId: string, verificationId: string): Promise<any> {
    console.log({ msg: 'Getting verification request by ID', userId, verificationId });

    // Get verification request
    const verificationRequest = await this.schoolRepository.getVerificationRequestById(verificationId);
    
    if (!verificationRequest) {
      throw new NotFoundError('Verification request not found');
    }

    // Get school to verify ownership
    const school = await this.schoolRepository.getSchoolById(verificationRequest.schoolId);
    
    if (!school || school.userId !== userId) {
      throw new ValidationError('Verification request does not belong to this user');
    }

    return verificationRequest;
  }

  /**
   * Respond to verification request
   */
  async respondToVerificationRequest(userId: string, verificationId: string, status: string, notes?: string): Promise<any> {
    console.log({ msg: 'Responding to verification request', userId, verificationId, status });

    // Validate status
    const validStatuses = ['VERIFIED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status. Status must be VERIFIED or REJECTED');
    }

    // Get verification request
    const verificationRequest = await this.schoolRepository.getVerificationRequestById(verificationId);
    
    if (!verificationRequest) {
      throw new NotFoundError('Verification request not found');
    }

    // Get school to verify ownership
    const school = await this.schoolRepository.getSchoolById(verificationRequest.schoolId);
    
    if (!school || school.userId !== userId) {
      throw new ValidationError('Verification request does not belong to this user');
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
  async getDisbursements(userId: string, schoolId: string): Promise<any[]> {
    console.log({ msg: 'Getting disbursements', userId, schoolId });

    // Get school
    const school = await this.schoolRepository.getSchoolById(schoolId);
    
    if (!school) {
      throw new NotFoundError('School profile not found');
    }

    // Verify school belongs to user
    if (school.userId !== userId) {
      throw new ValidationError('School does not belong to this user');
    }

    // Get disbursements
    const disbursements = await this.schoolRepository.getDisbursements(schoolId);
    
    return disbursements;
  }

  /**
   * Find school by name (and optionally country for international schools)
   * Returns schoolId if found, null otherwise
   */
  async findSchoolByName(schoolName: string, countryOfStudy?: string): Promise<string | null> {
    const normalizedSchoolName = schoolName.trim().toLowerCase();

    const whereClause: any = {
      schoolName: {
        equals: normalizedSchoolName
      }
    };

    if (countryOfStudy) {
      whereClause.country = {
        equals: countryOfStudy.trim().toLowerCase()
      };
    }

    const school = await prisma.schoolProfile.findFirst({
      where: whereClause,
      select: { id: true }
    });

    return school?.id || null;
  }

  /**
   * Find or create a school profile
   */
  async findOrCreateSchool(input: FindOrCreateSchoolInput): Promise<string> {
    console.log({ 
      msg: 'Finding or creating school', 
      schoolName: input.schoolName,
      residencyStatus: input.residencyStatus 
    });

    const { schoolName, residencyStatus, countryOfStudy } = input;
    
    // Try to find existing school
    const existingSchoolId = await this.findSchoolByName(
      schoolName, 
      residencyStatus === ResidencyStatus.INTERNATIONAL ? countryOfStudy : undefined
    );

    if (existingSchoolId) {
      console.log({ msg: 'Found existing school', schoolId: existingSchoolId });
      return existingSchoolId;
    }

    // School not found - create placeholder school profile
    console.log({ msg: 'Creating placeholder school profile', schoolName });

    const placeholderSchool = await prisma.schoolProfile.create({
      data: {
        user: {
          create: {
            email: `school-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@placeholder.paymyfees.com`,
            password: 'PLACEHOLDER_ACCOUNT',
            role: 'SCHOOL',
            fullName: schoolName,
            country: residencyStatus === ResidencyStatus.INTERNATIONAL 
              ? (countryOfStudy || 'Unknown') 
              : 'Nigeria',
            isActive: false,
          }
        },
        schoolName: schoolName,
        schoolAddress: 'Address to be verified',
        city: residencyStatus === ResidencyStatus.INTERNATIONAL ? 'To be verified' : undefined,
        state: residencyStatus === ResidencyStatus.LOCAL ? 'To be verified' : undefined,
        country: residencyStatus === ResidencyStatus.INTERNATIONAL 
          ? (countryOfStudy || 'Unknown') 
          : 'Nigeria',
        isVerified: false,
        isPrimary: true, // Placeholder schools are set as primary
        notes: `Placeholder school created from loan application. Requires verification. Residency: ${residencyStatus}`,
      },
      select: { id: true }
    });

    console.log({ 
      msg: 'Created placeholder school', 
      schoolId: placeholderSchool.id,
      schoolName 
    });

    return placeholderSchool.id;
  }
}
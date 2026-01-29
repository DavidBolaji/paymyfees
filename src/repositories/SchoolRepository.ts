/**
 * School Repository
 * Data access layer for school operations
 * Supports multiple schools per user
 */

import { prisma } from '@/src/lib/prisma';
import { Prisma } from '@prisma/client';

export interface ISchoolRepository {
  getSchoolById(schoolId: string): Promise<any>;
  getSchoolByUserId(userId: string): Promise<any>;
  getAllSchoolsByUserId(userId: string): Promise<any[]>;
  getPrimarySchool(userId: string): Promise<any | null>;
  getAllSchools(): Promise<any[]>;
  registerSchool(data: any): Promise<any>;
  updateSchoolProfile(schoolId: string, data: any): Promise<any>;
  setPrimarySchool(userId: string, schoolId: string): Promise<any>;
  getVerificationRequests(schoolId: string): Promise<any[]>;
  getVerificationRequestById(verificationId: string): Promise<any>;
  updateVerificationStatus(verificationId: string, status: string, notes?: string): Promise<any>;
  getDisbursements(schoolId: string): Promise<any[]>;
}

/**
 * School Repository Implementation
 */
export class SchoolRepository implements ISchoolRepository {
  /**
   * Get school by ID
   */
  async getSchoolById(schoolId: string): Promise<any> {
    console.log({ msg: 'Getting school by ID', schoolId });
    
    try {
      const school = await prisma.schoolProfile.findUnique({
        where: { id: schoolId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      return school;
    } catch (error) {
      console.error({ 
        msg: 'Error getting school by ID', 
        schoolId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
  
  /**
   * Get primary school by user ID (backwards compatible)
   */
  async getSchoolByUserId(userId: string): Promise<any> {
    console.log({ msg: 'Getting primary school by user ID', userId });
    
    try {
      // First try to get primary school
      let school = await prisma.schoolProfile.findFirst({
        where: { 
          userId,
          isPrimary: true 
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      // If no primary school, get the first school
      if (!school) {
        school = await prisma.schoolProfile.findFirst({
          where: { userId },
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
              },
            },
          },
        });
      }

      return school;
    } catch (error) {
      console.error({ 
        msg: 'Error getting school by user ID', 
        userId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Get all schools for a user
   */
  async getAllSchoolsByUserId(userId: string): Promise<any[]> {
    console.log({ msg: 'Getting all schools by user ID', userId });
    
    try {
      const schools = await prisma.schoolProfile.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
            },
          },
        },
        orderBy: [
          { isPrimary: 'desc' }, // Primary schools first
          { createdAt: 'desc' }
        ],
      });

      return schools;
    } catch (error) {
      console.error({ 
        msg: 'Error getting all schools by user ID', 
        userId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Get primary school for a user
   */
  async getPrimarySchool(userId: string): Promise<any | null> {
    console.log({ msg: 'Getting primary school', userId });
    
    try {
      const school = await prisma.schoolProfile.findFirst({
        where: { 
          userId,
          isPrimary: true 
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      return school;
    } catch (error) {
      console.error({ 
        msg: 'Error getting primary school', 
        userId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Get all verified schools (public list)
   */
  async getAllSchools(): Promise<any[]> {
    console.log({ msg: 'Getting all verified schools' });
    
    try {
      const schools = await prisma.schoolProfile.findMany({
        where: {
          isVerified: true,
        },
        select: {
          id: true,
          schoolName: true,
          city: true,
          state: true,
          country: true,
          academicLevel: true,
        },
        orderBy: {
          schoolName: 'asc',
        },
      });

      return schools;
    } catch (error) {
      console.error({ 
        msg: 'Error getting all schools',
        error: (error as Error).message 
      });
      throw error;
    }
  }
  
  /**
   * Register a new school
   */
  async registerSchool(data: any): Promise<any> {
    console.log({ msg: 'Registering new school', data });
    
    try {
      // Check if this is the user's first school
      const existingSchools = await prisma.schoolProfile.count({
        where: { userId: data.userId }
      });

      const isFirstSchool = existingSchools === 0;

      const school = await prisma.schoolProfile.create({
        data: {
          userId: data.userId,
          schoolName: data.schoolName,
          schoolAddress: data.schoolAddress,
          isPrimary: data.isPrimary ?? isFirstSchool, // First school is auto-primary
          city: data?.city ?? undefined,
          state: data?.state ?? undefined,
          country: data?.country ?? undefined,
          schoolEmail: data?.schoolEmail ?? undefined,
          schoolPhone: data?.schoolPhone ?? undefined,
          website: data?.website ?? undefined,
          contactPersonName: data?.contactPersonName ?? undefined,
          contactPersonPosition: data?.contactPersonPosition ?? undefined,
          contactPersonEmail: data?.contactPersonEmail ?? undefined,
          contactPersonPhone: data?.contactPersonPhone ?? undefined,
          bankName: data?.bankName ?? undefined,
          accountNumber: data?.accountNumber ?? undefined,
          accountName: data?.accountName ?? undefined,
          academicLevel: data?.academicLevel,
          currentAcademicSession: data?.currentAcademicSession,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      return school;
    } catch (error) {
      console.error({ 
        msg: 'Error registering school', 
        error: (error as Error).message 
      });
      throw error;
    }
  }
  
  /**
   * Update school profile
   */
  async updateSchoolProfile(schoolId: string, data: any): Promise<any> {
    console.log({ msg: 'Updating school profile', schoolId });
    
    try {
      const updateData: Prisma.SchoolProfileUpdateInput = {};

      // Only include fields that are provided
      if (data.schoolName !== undefined) updateData.schoolName = data.schoolName;
      if (data.schoolAddress !== undefined) updateData.schoolAddress = data.schoolAddress;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.state !== undefined) updateData.state = data.state;
      if (data.country !== undefined) updateData.country = data.country;
      if (data.schoolEmail !== undefined) updateData.schoolEmail = data.schoolEmail;
      if (data.schoolPhone !== undefined) updateData.schoolPhone = data.schoolPhone;
      if (data.website !== undefined) updateData.website = data.website;
      if (data.contactPersonName !== undefined) updateData.contactPersonName = data.contactPersonName;
      if (data.contactPersonPosition !== undefined) updateData.contactPersonPosition = data.contactPersonPosition;
      if (data.contactPersonEmail !== undefined) updateData.contactPersonEmail = data.contactPersonEmail;
      if (data.contactPersonPhone !== undefined) updateData.contactPersonPhone = data.contactPersonPhone;
      if (data.bankName !== undefined) updateData.bankName = data.bankName;
      if (data.accountNumber !== undefined) updateData.accountNumber = data.accountNumber;
      if (data.note !== undefined) updateData.notes = data.note;
      if (data.accountName !== undefined) updateData.accountName = data.accountName;
      if (data.academicLevel !== undefined) updateData.academicLevel = data.academicLevel;
      if (data.currentAcademicSession !== undefined) updateData.currentAcademicSession = data.currentAcademicSession;

      const school = await prisma.schoolProfile.update({
        where: { id: schoolId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      return school;
    } catch (error) {
      console.error({ 
        msg: 'Error updating school profile', 
        schoolId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Set a school as primary (and unset others)
   */
  async setPrimarySchool(userId: string, schoolId: string): Promise<any> {
    console.log({ msg: 'Setting primary school', userId, schoolId });
    
    try {
      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // First, unset all schools for this user
        await tx.schoolProfile.updateMany({
          where: { userId },
          data: { isPrimary: false }
        });

        // Then set the specified school as primary
        const school = await tx.schoolProfile.update({
          where: { id: schoolId },
          data: { isPrimary: true },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
              },
            },
          },
        });

        return school;
      });

      return result;
    } catch (error) {
      console.error({ 
        msg: 'Error setting primary school', 
        userId,
        schoolId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
  
  /**
   * Get verification requests for a school
   */
  async getVerificationRequests(schoolId: string): Promise<any[]> {
    console.log({ msg: 'Getting verification requests', schoolId });
    
    try {
      const verificationRequests = await prisma.schoolVerification.findMany({
        where: { schoolId },
        include: {
          loan: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          requestedAt: 'desc',
        },
      });

      return verificationRequests;
    } catch (error) {
      console.error({ 
        msg: 'Error getting verification requests', 
        schoolId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
  
  /**
   * Get verification request by ID
   */
  async getVerificationRequestById(verificationId: string): Promise<any> {
    console.log({ msg: 'Getting verification request by ID', verificationId });
    
    try {
      const verificationRequest = await prisma.schoolVerification.findUnique({
        where: { id: verificationId },
        include: {
          loan: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          school: {
            select: {
              id: true,
              schoolName: true,
            },
          },
        },
      });

      return verificationRequest;
    } catch (error) {
      console.error({ 
        msg: 'Error getting verification request by ID', 
        verificationId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
  
  /**
   * Update verification status
   */
  async updateVerificationStatus(
    verificationId: string, 
    status: string, 
    notes?: string
  ): Promise<any> {
    console.log({ msg: 'Updating verification status', verificationId, status });
    
    try {
      const verification = await prisma.schoolVerification.update({
        where: { id: verificationId },
        data: {
          status: status as any,
          notes,
          respondedAt: new Date(),
        },
        include: {
          loan: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return verification;
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
   * Get disbursements for a school
   */
  async getDisbursements(schoolId: string): Promise<any[]> {
    console.log({ msg: 'Getting disbursements', schoolId });
    
    try {
      const disbursements = await prisma.disbursement.findMany({
        where: { schoolId },
        include: {
          loan: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return disbursements;
    } catch (error) {
      console.error({ 
        msg: 'Error getting disbursements', 
        schoolId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
}
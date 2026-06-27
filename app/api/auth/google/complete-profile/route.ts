import { auth } from '@/auth';
import { prisma } from '@/src/database/prisma';
import { AuthService } from '@/src/services/AuthService';
import { generateToken, generateRefreshToken } from '@/src/middleware/auth';
import { UserRepository } from '@/src/repositories/UserRepository';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { UserRole, Gender } from '@prisma/client';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { AppError, BadRequestError, InternalServerError, NotFoundError } from '@/src/types/errors';

// Validation schema for complete profile request
const completeProfileSchema = z.object({
  phone: z.string().regex(/^(\+?234|0)[789]\d{9}$/, 'Invalid Nigerian phone number').transform(p => {
    const stripped = p.replace(/^\+?234/, '');
    return stripped.startsWith('0') ? stripped : `0${stripped}`;
  }),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  role: z.enum([UserRole.PARENT, UserRole.SCHOOL, UserRole.STUDENT, UserRole.TEACHER]),
  address: z.string().min(5).max(500).optional().default('Nigeria'),
  city: z.string().min(2).max(100).optional().default('Lagos'),
  gender: z.nativeEnum(Gender).optional(),
  schoolName: z.string().min(2).max(200).optional(),
}).superRefine((data, ctx) => {
  if (data.role === UserRole.SCHOOL && !data.schoolName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'School name is required for School role',
      path: ['schoolName'],
    });
  }
});

export const POST = asyncHandler(async (req) => {
  // Get NextAuth session
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if profile is already complete
  if ((session.user as any).profileComplete === true) {
    return NextResponse.json(
      { success: false, error: 'Profile already complete' },
      { status: 400 }
    );
  }

  // Parse and validate body
  const body = await req.json();
  const validated = completeProfileSchema.parse(body);

  const userId = session.user.id;

  // Start a transaction to update user, create profiles, and provision Embedly
  try {
    // Update user with profile information
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: validated.phone,
        dob: new Date(validated.dob),
        role: validated.role,
        address: validated.address,
        city: validated.city,
        gender: validated.gender || null,
        googleProfileComplete: true,
        fullName: (await prisma.user.findUnique({ where: { id: userId } }))?.fullName || '',
      },
    });

    // Fetch fresh user data to get firstName, lastName, etc.
    const userBeforeProfiles = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    // Create role-specific profile based on role
    if (validated.role === UserRole.PARENT) {
      const existingParent = await prisma.parentProfile.findUnique({ where: { userId } });
      if (!existingParent) {
        await prisma.parentProfile.create({ data: { userId } });
      }
    } else if (validated.role === UserRole.SCHOOL) {
      const existingSchool = await prisma.schoolProfile.findFirst({ where: { userId } });
      if (!existingSchool) {
        await prisma.schoolProfile.create({
          data: {
            userId,
            schoolName: validated.schoolName!,
            isPrimary: true,
          },
        });
      } else {
        await prisma.schoolProfile.update({
          where: { id: existingSchool.id },
          data: { schoolName: validated.schoolName! },
        });
      }
    } else if (validated.role === UserRole.TEACHER) {
      const existingTeacher = await prisma.teacherProfile.findUnique({ where: { userId } });
      if (!existingTeacher) {
        await prisma.teacherProfile.create({ data: { userId } });
      }
    }
    // STUDENT role has no profile table

    // Create wallet if not already present
    await prisma.wallet.upsert({
      where: { userId },
      create: {
        userId,
        currency: 'NGN',
        balance: 0,
      },
      update: {},
    });

    // Provision Embedly (synchronous, blocking)
    const authService = new AuthService();
    try {
      await authService.provisionEmbedly({
        id: userBeforeProfiles.id,
        email: userBeforeProfiles.email,
        firstName: userBeforeProfiles.firstName || '',
        lastName: userBeforeProfiles.lastName || '',
        middleName: userBeforeProfiles.middleName || undefined,
        phone: validated.phone,
        dob: validated.dob,
        address: validated.address,
        city: validated.city,
      });
    } catch (error) {
      console.error('Embedly provisioning failed:', error);
      // Return 500 but keep the user record — they can retry Phase 2
      throw new InternalServerError(
        'Failed to provision payment wallet. Please try again.'
      );
    }

    // Generate custom JWT tokens (using existing functions)
    const token = generateToken(updatedUser);
    const refreshToken = generateRefreshToken(updatedUser);

    // Fetch full userDTO with relations
    const userRepository = new UserRepository();
    const userDTO = await userRepository.getUserById(userId);

    if (!userDTO) {
      throw new NotFoundError('User not found');
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: userDTO,
          token,
          refreshToken,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Re-throw app errors as-is, let asyncHandler catch others
    if (error instanceof AppError) throw error;
    if (error instanceof z.ZodError) {
      throw new BadRequestError('Validation failed');
    }
    throw new InternalServerError('An error occurred while completing your profile');
  }
});

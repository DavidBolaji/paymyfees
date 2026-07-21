/**
 * Parent KYC Employment Details API
 * PUT /api/user/kyc
 * Updates parent employment/KYC details and clears isFirstTime flag
 */

import { NextResponse } from 'next/server';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { prisma } from '@/src/database/prisma';
import { z } from 'zod';

const parentKycSchema = z.object({
  employmentStatus: z.string().min(1, 'Employment status is required').max(100),
  employerName: z.string().max(200).optional().nullable(),
  employmentRole: z.string().max(200).optional().nullable(),
  employmentType: z.string().max(100).optional().nullable(),
  lengthOfEmployment: z.string().max(100).optional().nullable(),
  monthlyIncome: z.number().positive('Monthly income must be a positive number').optional().nullable(),
  dismiss: z.boolean().optional(), // true = just dismiss the banner without full submission
});

export const PUT = asyncHandler(async (req: Request) => {
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const body = await req.json();

  // If user is just dismissing the banner, only update isFirstTime
  if (body.dismiss === true) {
    await prisma.user.update({
      where: { id: authResult.userId! },
      data: { isFirstTime: false },
    });
    return NextResponse.json({
      success: true,
      message: 'KYC prompt dismissed',
    });
  }

  const validated = parentKycSchema.parse(body);

  // Update parentProfile employment fields and clear isFirstTime
  const updated = await prisma.user.update({
    where: { id: authResult.userId! },
    data: {
      isFirstTime: false,
      parentProfile: {
        upsert: {
          create: {
            employmentStatus: validated.employmentStatus,
            employerName: validated.employerName ?? null,
            employmentRole: validated.employmentRole ?? null,
            employmentType: validated.employmentType ?? null,
            lengthOfEmployment: validated.lengthOfEmployment ?? null,
            monthlyIncome: validated.monthlyIncome ?? null,
          },
          update: {
            employmentStatus: validated.employmentStatus,
            employerName: validated.employerName ?? null,
            employmentRole: validated.employmentRole ?? null,
            employmentType: validated.employmentType ?? null,
            lengthOfEmployment: validated.lengthOfEmployment ?? null,
            monthlyIncome: validated.monthlyIncome ?? null,
          },
        },
      },
    },
    select: {
      id: true,
      isFirstTime: true,
      parentProfile: {
        select: {
          employmentStatus: true,
          employerName: true,
          employmentRole: true,
          employmentType: true,
          lengthOfEmployment: true,
          monthlyIncome: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: updated,
    message: 'KYC details updated successfully',
  });
});

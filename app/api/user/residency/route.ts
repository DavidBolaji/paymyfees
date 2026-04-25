/**
 * Residency Update API Route
 * PUT /api/user/residency
 * Updates residency status and clears isFirstTime flag for students
 */

import { NextResponse } from 'next/server';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { prisma } from '@/src/database/prisma';
import { ResidencyStatus } from '@prisma/client';

export const PUT = asyncHandler(async (req: Request) => {
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const body = await req.json();
  const { residencyStatus } = body;

  if (!residencyStatus || !Object.values(ResidencyStatus).includes(residencyStatus)) {
    return NextResponse.json(
      { success: false, message: 'Invalid residency status. Must be LOCAL or INTERNATIONAL.' },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: authResult.userId! },
    data: {
      residencyStatus,
      isFirstTime: false,
    },
    select: {
      id: true,
      residencyStatus: true,
      isFirstTime: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: updated,
    message: 'Residency status updated successfully',
  });
});

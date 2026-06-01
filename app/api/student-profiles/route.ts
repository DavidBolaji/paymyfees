/**
 * Student Profiles API
 * GET  /api/student-profiles — list parent's student profiles
 * POST /api/student-profiles — create a new student profile
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/src/database/prisma';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { createStudentProfileSchema } from '@/src/validation/schemas';
import { ApiResponse } from '@/src/types';

export const GET = asyncHandler(async (req: Request) => {
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const profiles = await prisma.studentProfile.findMany({
    where: { parentId: authResult.userId! },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      studentName: true,
      dateOfBirth: true,
      relationship: true,
      classLevel: true,
      createdAt: true,
    },
  });

  const response: ApiResponse = {
    success: true,
    data: profiles,
    metadata: { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status: 200 });
});

export const POST = asyncHandler(async (req: Request) => {
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const body = await req.json();
  const validated = createStudentProfileSchema.parse(body);

  const profile = await prisma.studentProfile.create({
    data: {
      parentId: authResult.userId!,
      studentName: validated.studentName,
      dateOfBirth: validated.dateOfBirth ?? null,
      relationship: validated.relationship,
      classLevel: validated.classLevel,
    },
    select: {
      id: true,
      studentName: true,
      dateOfBirth: true,
      relationship: true,
      classLevel: true,
      createdAt: true,
    },
  });

  const response: ApiResponse = {
    success: true,
    data: profile,
    metadata: { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status: 201 });
});

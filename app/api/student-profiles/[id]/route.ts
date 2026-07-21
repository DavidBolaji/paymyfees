/**
 * Student Profile Detail API
 * GET  /api/student-profiles/[id] — get single student profile
 * PUT  /api/student-profiles/[id] — update student profile
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/src/database/prisma';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { updateStudentProfileSchema } from '@/src/validation/schemas';
import { ApiResponse } from '@/src/types';
import { normalizeText } from '@/lib/utils';

export const GET = asyncHandler(async (req: Request, context?: { params: Promise<{ id: string }> }) => {
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const { id } = await (context?.params ?? Promise.resolve({ id: '' }));

  const profile = await prisma.studentProfile.findFirst({
    where: { id, parentId: authResult.userId! },
    select: {
      id: true,
      studentName: true,
      dateOfBirth: true,
      relationship: true,
      classLevel: true,
      createdAt: true,
    },
  });

  if (!profile) {
    return NextResponse.json(
      { success: false, message: 'Student profile not found' },
      { status: 404 }
    );
  }

  const response: ApiResponse = {
    success: true,
    data: profile,
    metadata: { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status: 200 });
});

export const PUT = asyncHandler(async (req: Request, context?: { params: Promise<{ id: string }> }) => {
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const { id } = await (context?.params ?? Promise.resolve({ id: '' }));

  // Verify the profile belongs to this parent
  const existing = await prisma.studentProfile.findFirst({
    where: { id, parentId: authResult.userId! },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, message: 'Student profile not found' },
      { status: 404 }
    );
  }

  const body = await req.json();
  const validated = updateStudentProfileSchema.parse(body);

  const updated = await prisma.studentProfile.update({
    where: { id },
    data: {
      ...(validated.studentName !== undefined && { studentName: normalizeText(validated.studentName) }),
      ...(validated.dateOfBirth !== undefined && { dateOfBirth: validated.dateOfBirth ?? null }),
      ...(validated.relationship !== undefined && { relationship: validated.relationship }),
      ...(validated.classLevel !== undefined && { classLevel: validated.classLevel }),
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
    data: updated,
    metadata: { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status: 200 });
});

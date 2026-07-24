/**
 * Latest Documents API for a Student Profile
 * GET /api/student-profiles/[id]/latest-documents
 * Returns the most recent STUDENT_PHOTO, SCHOOL_INVOICE, SCHOOL_RECEIPTS documents
 * from the latest loan for the given student profile (used for document prefill).
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/src/database/prisma';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { ApiResponse } from '@/src/types';

export const GET = asyncHandler(async (req: Request, context?: { params: Promise<{ id: string }> }) => {
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const { id } = await context!.params;

  // Verify the profile belongs to the requesting parent
  const profile = await prisma.studentProfile.findFirst({
    where: { id, parentId: authResult.userId! },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json(
      { success: false, message: 'Student profile not found' } satisfies ApiResponse,
      { status: 404 }
    );
  }

  // Find the latest loan for this student profile
  const latestLoan = await prisma.loan.findFirst({
    where: {
      studentProfileId: id,
      status: { in: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'DISBURSED', 'ACTIVE', 'COMPLETED'] },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      documents: {
        where: {
          documentType: { in: ['STUDENT_PHOTO', 'SCHOOL_INVOICE', 'SCHOOL_RECEIPTS'] },
        },
        select: {
          id: true,
          documentType: true,
          fileName: true,
          fileUrl: true,
          fileSize: true,
          mimeType: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Group by documentType, take first per type (most recent)
  const docs = latestLoan?.documents ?? [];
  const byType: Record<string, { id: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string }> = {};
  for (const d of docs) {
    const slotId =
      d.documentType === 'STUDENT_PHOTO' ? 'student_photo'
      : d.documentType === 'SCHOOL_INVOICE' ? 'school_invoice'
      : d.documentType === 'SCHOOL_RECEIPTS' ? 'school_receipts'
      : null;
    if (slotId && !byType[slotId]) {
      byType[slotId] = {
        id: d.id,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
      };
    }
  }

  const response: ApiResponse = {
    success: true,
    data: byType,
    metadata: { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status: 200 });
});

/**
 * Latest Documents API for a Student Profile
 * GET /api/student-profiles/[id]/latest-documents?schoolId=...
 *
 * Returns prefill documents for the loan form:
 * - student_photo  → most recent, from any loan for this student
 * - school_invoice → most recent from a loan matching both student + schoolId (if provided)
 * - school_receipts → same as above
 *
 * If schoolId is not supplied, school-specific docs are omitted.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/src/database/prisma';
import { studentAuthMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { ApiResponse } from '@/src/types';

const ACTIVE_STATUSES = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'DISBURSED', 'ACTIVE', 'COMPLETED'] as const;

type PrefillDoc = { id: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string };

export const GET = asyncHandler(async (req: Request, context?: { params: Promise<{ id: string }> }) => {
  const authResult = await studentAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const { id } = await context!.params;
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get('schoolId') ?? undefined;

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

  const bySlot: Record<string, PrefillDoc> = {};

  // ── 1. student_photo — latest across any loan for this student ─────────────
  // Also check PASSPORT type (legacy: old uploads mapped "passport" filename → PASSPORT instead of STUDENT_PHOTO)
  const PHOTO_TYPES = ['STUDENT_PHOTO', 'PASSPORT'] as const;

  const loanWithPhoto = await prisma.loan.findFirst({
    where: {
      studentProfileId: id,
      status: { in: [...ACTIVE_STATUSES] },
      documents: { some: { documentType: { in: [...PHOTO_TYPES] } } },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      documents: {
        where: { documentType: { in: [...PHOTO_TYPES] } },
        select: { id: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const photo = loanWithPhoto?.documents[0];
  if (photo) {
    bySlot['student_photo'] = photo;
  }

  // ── 2. school_invoice + school_receipts — only when same school ────────────
  if (schoolId) {
    // Fetch ALL docs from the most recent loan for this student+school
    // so we can match by type or fall back to positional matching for legacy data
    const loanWithSchoolDocs = await prisma.loan.findFirst({
      where: {
        studentProfileId: id,
        schoolId,
        status: { in: [...ACTIVE_STATUSES] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        documents: {
          select: { id: true, documentType: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    for (const doc of loanWithSchoolDocs?.documents ?? []) {
      // Direct type match
      if (doc.documentType === 'SCHOOL_INVOICE' && !bySlot['school_invoice']) {
        bySlot['school_invoice'] = { id: doc.id, fileName: doc.fileName, fileUrl: doc.fileUrl, fileSize: doc.fileSize, mimeType: doc.mimeType };
      } else if (doc.documentType === 'SCHOOL_RECEIPTS' && !bySlot['school_receipts']) {
        bySlot['school_receipts'] = { id: doc.id, fileName: doc.fileName, fileUrl: doc.fileUrl, fileSize: doc.fileSize, mimeType: doc.mimeType };
      }
    }
  }

  const response: ApiResponse = {
    success: true,
    data: bySlot,
    metadata: { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status: 200 });
});

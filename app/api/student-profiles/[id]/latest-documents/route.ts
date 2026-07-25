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

type PrefillDoc = { id: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string };

const DOC_SELECT = { id: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true } as const;

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

  // ── 1. student_photo — latest for this student (any school) ───────────────
  // Include PASSPORT for legacy data (old filename-based mapper stored passport photos as PASSPORT)
  const photo = await prisma.document.findFirst({
    where: {
      studentProfileId: id,
      documentType: { in: ['STUDENT_PHOTO', 'PASSPORT'] },
    },
    orderBy: { createdAt: 'desc' },
    select: DOC_SELECT,
  });

  if (photo) {
    bySlot['student_photo'] = photo;
  }

  // ── 2. school_invoice + school_receipts — only when same student + school ─
  if (schoolId) {
    const invoice = await prisma.document.findFirst({
      where: { studentProfileId: id, schoolId, documentType: 'SCHOOL_INVOICE' },
      orderBy: { createdAt: 'desc' },
      select: DOC_SELECT,
    });
    if (invoice) bySlot['school_invoice'] = invoice;

    const receipt = await prisma.document.findFirst({
      where: { studentProfileId: id, schoolId, documentType: 'SCHOOL_RECEIPTS' },
      orderBy: { createdAt: 'desc' },
      select: DOC_SELECT,
    });
    if (receipt) bySlot['school_receipts'] = receipt;
  }

  const response: ApiResponse = {
    success: true,
    data: bySlot,
    metadata: { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status: 200 });
});

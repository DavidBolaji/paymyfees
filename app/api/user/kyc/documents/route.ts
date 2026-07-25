/**
 * Parent KYC Documents API
 * POST /api/user/kyc/documents
 * Saves parent-level KYC document records (NIN, salary slips, utility bill, etc.)
 * These are stored against the parent (parentId set, loanId null) and reused across applications.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/src/database/prisma';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { DocumentType } from '@prisma/client';

const KYC_TYPES = [
  DocumentType.NIN,
  DocumentType.SALARY_SLIP,
  DocumentType.BANK_STATEMENT,
  DocumentType.UTILITY_BILL,
  DocumentType.PARENT_PHOTO,
] as const;

const TYPE_TO_SLOT: Record<string, string> = {
  NIN: 'nin',
  SALARY_SLIP: 'salary',
  BANK_STATEMENT: 'bank_statement',
  UTILITY_BILL: 'utility_bill',
  PARENT_PHOTO: 'parent_photo',
};

/**
 * GET /api/user/kyc/documents
 * Returns the most recent KYC document of each type for the authenticated parent.
 * Used to prefill KYC upload slots when returning to the loan form.
 */
export const GET = asyncHandler(async (req: Request) => {
  const authResult = await authMiddleware(req);
  if (!authResult.success) return authResult.response!;

  const userId = authResult.userId!;

  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!parentProfile) {
    return NextResponse.json({ success: true, data: {} });
  }

  // 1. Prefer parent-level docs (new flow: parentId set, loanId null)
  const parentDocs = await prisma.document.findMany({
    where: {
      parentId: parentProfile.id,
      documentType: { in: [...KYC_TYPES] },
      loanId: null,
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
  });

  const bySlot: Record<string, { id: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string }> = {};
  for (const doc of parentDocs) {
    const slotId = TYPE_TO_SLOT[doc.documentType];
    if (slotId && !bySlot[slotId]) {
      bySlot[slotId] = {
        id: doc.id,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
      };
    }
  }

  // 2. Fallback: fill any missing slots from loan-attached docs (legacy data)
  if (Object.keys(bySlot).length < KYC_TYPES.length) {
    const loanDocs = await prisma.document.findMany({
      where: {
        userId,
        documentType: { in: [...KYC_TYPES] },
        loanId: { not: null },
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
    });

    for (const doc of loanDocs) {
      const slotId = TYPE_TO_SLOT[doc.documentType];
      if (slotId && !bySlot[slotId]) {
        bySlot[slotId] = {
          id: doc.id,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
        };
      }
    }
  }

  return NextResponse.json({ success: true, data: bySlot });
});

interface KycDocumentPayload {
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

/** Map document slot IDs to DocumentType enum values */
function slotIdToDocumentType(slotId: string): DocumentType {
  const map: Record<string, DocumentType> = {
    nin: DocumentType.NIN,
    salary: DocumentType.SALARY_SLIP,
    bank_statement: DocumentType.BANK_STATEMENT,
    utility_bill: DocumentType.UTILITY_BILL,
    parent_photo: DocumentType.PARENT_PHOTO,
  };
  return map[slotId] ?? DocumentType.OTHER;
}

export const POST = asyncHandler(async (req: Request) => {
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const userId = authResult.userId!;
  const body = await req.json();
  const { documents } = body as { documents: KycDocumentPayload[] };

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Documents array is required' },
      { status: 400 }
    );
  }

  // Get the parent's parentProfile id
  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  // Determine which document types are being submitted
  const incomingTypes = documents.map(doc => slotIdToDocumentType(doc.documentType));

  // Delete existing KYC docs of these types for this parent, then create fresh (prevents duplicates)
  const createdDocuments = await prisma.$transaction(async (tx) => {
    if (parentProfile) {
      await tx.document.deleteMany({
        where: {
          parentId: parentProfile.id,
          loanId: null,
          documentType: { in: incomingTypes },
        },
      });
    }

    return await Promise.all(
      documents.map(doc =>
        tx.document.create({
          data: {
            userId,
            parentId: parentProfile?.id ?? null,
            loanId: null,
            documentType: slotIdToDocumentType(doc.documentType),
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            isVerified: false,
          },
        })
      )
    );
  });

  return NextResponse.json(
    {
      success: true,
      data: createdDocuments,
      metadata: { timestamp: new Date().toISOString() },
    },
    { status: 201 }
  );
});

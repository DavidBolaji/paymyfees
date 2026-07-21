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

  const createdDocuments = await prisma.$transaction(
    documents.map(doc =>
      prisma.document.create({
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

  return NextResponse.json(
    {
      success: true,
      data: createdDocuments,
      metadata: { timestamp: new Date().toISOString() },
    },
    { status: 201 }
  );
});

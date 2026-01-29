/**
 * Document Upload API Route
 * POST /api/documents/upload
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { authMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';

interface DocumentPayload {
  schoolId?: string;
  parentId?: string;
  loanId?: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export const POST = asyncHandler(async (req: Request) => {
  // Authenticate user
  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const userId = authResult.userId!;

  try {
    const body = await req.json();
    const { documents } = body as { documents: DocumentPayload[] };

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Documents array is required',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Create all documents in a transaction
    const createdDocuments = await prisma.$transaction(
      documents.map((doc) =>
        prisma.document.create({
          data: {
            userId,
            schoolId: doc.schoolId || null,
            parentId: doc.parentId || null,
            loanId: doc.loanId || null,
            documentType: doc.documentType as any,
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
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error({
      msg: 'Error uploading documents',
      userId,
      error: (error as Error).message,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while uploading documents',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
});
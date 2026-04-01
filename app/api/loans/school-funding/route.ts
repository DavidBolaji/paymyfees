/**
 * School Funding Application API Route
 * POST /api/loans/school-funding
 *
 * Allows a school user (SCHOOL role) to submit a funding application.
 * The school's own schoolProfile.id is used as the schoolId.
 */

import { NextResponse } from 'next/server';
import { LoanService } from '@/src/services/LoanService';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { standardRateLimiter } from '@/src/middleware/rateLimiter';
import { schoolAuthMiddleware } from '@/src/middleware/authMiddleware';
import { prisma } from '@/src/database/prisma';
import { ResidencyStatus } from '@prisma/client';

const loanService = new LoanService();

/**
 * POST /api/loans/school-funding
 * Create a funding application for a school user
 */
export const POST = asyncHandler(async (req: Request) => {
  await standardRateLimiter(req);

  const authResult = await schoolAuthMiddleware(req);
  if (!authResult.success) {
    return authResult.response!;
  }

  const userId = authResult.userId!;
  const body = await req.json();

  // Resolve the school profile for the authenticated school user
  const schoolProfile = await prisma.schoolProfile.findFirst({
    where: { userId },
    select: { id: true, schoolName: true },
  });

  if (!schoolProfile) {
    return NextResponse.json(
      {
        success: false,
        error: 'School profile not found',
        message: 'Please complete your school profile before applying for funding.',
        metadata: { timestamp: new Date().toISOString() },
      },
      { status: 404 }
    );
  }

  // Validate required fields
  const loanAmount = parseInt(body.loanAmount ?? body.amount ?? '0', 10);
  if (!loanAmount || loanAmount <= 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid loan amount',
        message: 'Please provide a valid funding amount.',
        metadata: { timestamp: new Date().toISOString() },
      },
      { status: 400 }
    );
  }

  const repaymentMonths = parseInt(body.repaymentMonths ?? body.selectedPlan ?? '0', 10);
  if (!repaymentMonths || repaymentMonths < 1) {
    return NextResponse.json(
      {
        success: false,
        error: 'Repayment plan required',
        message: 'Please select a repayment plan.',
        metadata: { timestamp: new Date().toISOString() },
      },
      { status: 400 }
    );
  }

  const loan = await loanService.createLocalLoan({
    userId,
    schoolId: schoolProfile.id,
    loanAmount,
    repaymentMonths,
    schoolName: schoolProfile.schoolName ?? body.schoolName ?? '',
    academicSession: body.academicSession ?? `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    term: body.term ?? undefined,
    residencyStatus: ResidencyStatus.LOCAL,
    uploadedFiles: Array.isArray(body.documents) ? body.documents : [],
  });

  // Persist all extra form fields into the dedicated SchoolFundingDetails table.
  // Non-fatal: if this fails, the loan was already created — log and continue.
  try {
    await prisma.schoolFundingDetails.create({
      data: {
        loanId: loan.id,
        // Financial Information
        totalTermlyRevenue: body.totalTermlyRevenue ? parseFloat(body.totalTermlyRevenue) : null,
        numberOfTeachers: body.numberOfTeachers ? parseInt(body.numberOfTeachers, 10) : null,
        existingDebts: body.existingDebts ? parseFloat(body.existingDebts) : null,
        otherIncomeSources: body.otherIncomeSources ?? null,
        // School Identity (snapshot at application time)
        schoolEmail: body.schoolEmail ?? null,
        schoolRegistrationNumber: body.schoolRegistrationNumber ?? null,
        schoolAddress: body.schoolAddress ?? null,
        // School Operations
        totalNumberOfStudents: body.totalNumberOfStudents ? parseInt(body.totalNumberOfStudents, 10) : null,
        academicLevelsOffered: body.academicLevelsOffered ?? null,
        numberOfNonTeachingStaff: body.numberOfNonTeachingStaff ?? null,
        // Consent audit trail
        consentSchoolDetails: body.consents?.schoolDetails === true,
        consentDirectPayment: body.consents?.directPayment === true,
        consentTerms: body.consents?.terms === true,
        consentTimestamp: new Date(),
      },
    });
  } catch (detailsError) {
    console.error({ msg: 'Failed to save school funding details (non-fatal)', loanId: loan.id, error: (detailsError as Error).message });
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        status: loan.status,
        amount: loan.loanAmount,
        monthlyPayment: loan.monthlyPayment,
        totalAmount: loan.totalAmount,
        applicationDate: loan.applicationDate,
      },
      metadata: { timestamp: new Date().toISOString() },
    },
    { status: 201 }
  );
});

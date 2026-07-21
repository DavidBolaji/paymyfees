'use client';

import { LoadingHourGlassIcon } from '@/assets/icons/LoadingHourGlassIcon';
import { CloseCircleIcon } from '@/assets/icons/CloseCircleIcon';
import { SentIcon } from '@/assets/icons/SentIcon';
import useLoan from '@/hooks/useLoan';
import { LoanStatus } from '@prisma/client';
import { CheckSquareIcon } from '@/assets/icons/CheckSquareIcon';
import { useRouter } from 'next/navigation';
import useDashboardStore from '@/src/stores/dashboardStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const LOAN_STEPS = ['Submitted', 'Under Review', 'Pending Disbursement', 'Active'];

function getActiveStep(status: LoanStatus): number {
  switch (status) {
    case LoanStatus.PENDING:        return 0;
    case LoanStatus.UNDER_REVIEW:   return 1;
    case LoanStatus.APPROVED:       return 2;
    case LoanStatus.DISBURSED:
    case LoanStatus.ACTIVE:         return 3;
    default:                        return 0;
  }
}

export function ApplicationStatus() {
  const { currentLoan, loanHistory } = useLoan();
  const { selectedLoanId, stats } = useDashboardStore();
  const router = useRouter();

  // Find the selected loan: match by UUID from stats.allLoans, then map to loanHistory by loanNumber
  const selectedSummary = selectedLoanId
    ? (stats?.allLoans ?? []).find(l => l.id === selectedLoanId)
    : null;
  const activeLoan = selectedSummary
    ? (loanHistory.find(l => l.loanId === selectedSummary.loanNumber) ?? currentLoan)
    : currentLoan;

  // Use activeLoan as the displayed loan, with status from the summary if available
  const displayStatus = selectedSummary
    ? (selectedSummary.status as LoanStatus)
    : (activeLoan?.status ?? null);

  const handleRepayment = () => {
    router.push('/dashboard/wallet');
  };

  if (!displayStatus) {
    return (
      <div className="flex flex-col justify-center items-center py-12 sm:py-16 md:py-20 text-center px-4">
        <div className="flex justify-center items-center bg-blue-50 mb-4 sm:mb-6 md:mb-8 rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
          <LoadingHourGlassIcon size={40}/>
        </div>
        <h3 className="mb-2 sm:mb-3 md:mb-4 font-semibold text-[#292D32] text-lg sm:text-xl md:text-2xl lg:text-[27px]">
          No loan history yet.
        </h3>
        <p className="max-w-md text-[#7C7C7C] text-sm sm:text-base md:text-[15px] leading-relaxed">
          There is no loan history available, to be able to see a loan history, you need to apply for a loan.
        </p>
      </div>
    );
  }

  if (displayStatus === LoanStatus.DISBURSED || displayStatus === LoanStatus.ACTIVE) {
    return (
      <div className="flex flex-col justify-center items-center py-12 sm:py-16 md:py-20 text-center px-4">
        <div className="flex justify-center items-center bg-blue-50 mb-3 sm:mb-4 md:mb-5 rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem]">
          <SentIcon size={32}/>
        </div>
        <h3 className="mb-1 sm:mb-2 md:mb-3 font-semibold text-[#191919] text-lg sm:text-xl md:text-2xl lg:text-[1.6875rem]">
          Application has been approved
        </h3>
        <p className="mb-4 sm:mb-5 md:mb-6 max-w-md text-[#5F5F5F] text-sm sm:text-base md:text-[1.075rem] leading-relaxed">
          The loan you requested for your tuition has been paid to your school, for repayment click on the tab below.
        </p>
        <button onClick={handleRepayment} className="flex justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg min-w-[180px] sm:min-w-[200px] font-medium text-white transition-colors text-sm sm:text-base">
          <CheckSquareIcon />
          Make Repayment
        </button>
      </div>
    );
  }

  if (displayStatus === LoanStatus.REJECTED) {
    return (
      <div className="flex flex-col justify-center items-center py-12 sm:py-16 md:py-20 text-center px-4">
        <div className="flex justify-center items-center bg-[#FEE6E6] mb-3 sm:mb-4 md:mb-5 rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-[4.5rem] md:h-[4.5rem]">
          <CloseCircleIcon size={32} color="#DC0505" />
        </div>
        <h3 className="mb-1 sm:mb-2 md:mb-3 font-semibold text-[#191919] text-lg sm:text-xl md:text-2xl lg:text-[1.6875rem]">
          Application has been denied!
        </h3>
        <p className="max-w-md text-[#5F5F5F] text-sm sm:text-base md:text-[1.075rem] leading-relaxed">
          Your application has been denied due to certain reasons, you can re-apply for another loan on the apply for loan tab.
        </p>
      </div>
    );
  }

  // Pending / Under Review / Approved — show rich info card
  const activeStep = getActiveStep(displayStatus);
  const statusDescriptions: Partial<Record<LoanStatus, string>> = {
    [LoanStatus.PENDING]: 'Your application has been submitted and is awaiting initial review.',
    [LoanStatus.UNDER_REVIEW]: 'Our team is currently reviewing your application. We will notify you of any updates.',
    [LoanStatus.APPROVED]: 'Your application has been approved and is pending disbursement to your school.',
  };

  return (
    <div className="px-2 py-6 sm:py-8">
      {/* Status icon */}
      <div className="flex justify-center mb-4">
        <div className="flex justify-center items-center bg-blue-50 rounded-full w-14 h-14 sm:w-16 sm:h-16">
          <LoadingHourGlassIcon size={32} color="#00296B" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-center mb-1 font-semibold text-[#191919] text-lg sm:text-xl lg:text-[1.6875rem]">
        Application is pending
      </h3>
      <p className="text-center mb-6 max-w-sm mx-auto text-[#5F5F5F] text-sm leading-relaxed">
        {statusDescriptions[displayStatus] ?? 'Your application is still pending. Kindly hold on for your application status to change.'}
      </p>

      {/* Application details card */}
      {selectedSummary && (
        <div className="bg-[#f5f5f5] rounded-xl p-4 mb-6 max-w-sm mx-auto space-y-2 text-sm">
          {selectedSummary.studentName && (
            <div className="flex justify-between">
              <span className="text-[#7C7C7C]">Student</span>
              <span className="font-medium text-[#292D32]">{selectedSummary.studentName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#7C7C7C]">School</span>
            <span className="font-medium text-[#292D32] text-right max-w-[55%]">{selectedSummary.schoolName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7C7C7C]">Amount</span>
            <span className="font-medium text-[#292D32]">{formatCurrency(selectedSummary.loanAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7C7C7C]">Submitted</span>
            <span className="font-medium text-[#292D32]">{formatDate(selectedSummary.createdAt)}</span>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="max-w-sm mx-auto">
        <div className="flex items-center">
          {LOAN_STEPS.map((stepLabel, index) => (
            <div key={stepLabel} className="flex flex-1 items-center">
              {/* Node */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                  index < activeStep
                    ? "bg-green-500 text-white"
                    : index === activeStep
                    ? "bg-[#00296B] text-white"
                    : "bg-gray-200 text-gray-500"
                )}>
                  {index < activeStep ? '✓' : index + 1}
                </div>
                <span className={cn(
                  "mt-1 text-[9px] text-center w-14 leading-tight",
                  index === activeStep ? "text-[#00296B] font-semibold" : "text-[#7C7C7C]"
                )}>
                  {stepLabel}
                </span>
              </div>
              {/* Connector line (not after last step) */}
              {index < LOAN_STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-1 mb-4",
                  index < activeStep ? "bg-green-400" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

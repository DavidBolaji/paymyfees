'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Download, Headphones, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { InfoCard } from '@/components/dashboard/info-card';
import { StatusBadge } from '@/components/dashboard/status-badge';

import { fetchLoanDetails, DetailedLoanData } from '@/src/utils/loan-api';
import { InfoCardSkeleton } from './InfoCardSkeleton';
import { DocumentsCardSkeleton } from './DocumentCardSkeleton';

export default function FullLoanInformationPage() {
  const params = useParams();
  const [loanDetails, setLoanDetails] = useState<DetailedLoanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLoanDetails = async () => {
      if (!params.loanId || typeof params.loanId !== 'string') {
        setError('Invalid loan ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchLoanDetails(params.loanId);
        
        if (data) {
          setLoanDetails(data);
        } else {
          setError('Loan not found');
        }
      } catch (err) {
        console.error('Error fetching loan details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load loan details');
      } finally {
        setLoading(false);
      }
    };

    loadLoanDetails();
  }, [params.loanId]);

  // Calculate repayment progress
  const calculateProgress = () => {
    if (!loanDetails || !loanDetails.installments) {
      return { percentage: 0, paidCount: 0, totalCount: 0 };
    }

    const paidCount = loanDetails.installments.filter(inst => inst.status === 'PAID').length;
    const totalCount = loanDetails.installments.length;
    const percentage = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

    return { percentage, paidCount, totalCount };
  };

  // Get next repayment details
  const getNextRepayment = () => {
    if (!loanDetails || !loanDetails.installments) {
      return { amount: 0, date: '-', installmentNumber: 0 };
    }

    const nextInstallment = loanDetails.installments.find(inst => inst.status === 'PENDING');
    
    if (nextInstallment) {
      return {
        amount: nextInstallment.amount,
        date: new Date(nextInstallment.dueDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        installmentNumber: nextInstallment.installmentNumber
      };
    }

    return { amount: 0, date: '-', installmentNumber: 0 };
  };

  // Format status for display
  const getStatusValue = (status: string): 'ongoing' | 'completed' | 'pending' | 'cancelled' => {
    const statusMap: Record<string, 'ongoing' | 'completed' | 'pending' | 'cancelled'> = {
      'ACTIVE': 'ongoing',
      'DISBURSED': 'ongoing',
      'COMPLETED': 'completed',
      'PENDING': 'pending',
      'UNDER_REVIEW': 'pending',
      'APPROVED': 'pending',
      'REJECTED': 'cancelled',
      'CANCELLED': 'cancelled',
      'DEFAULTED': 'cancelled',
    };
    return statusMap[status] || 'pending';
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file type icon
  const getFileIcon = (_mimeType: string) => {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-[#F6F6F6] p-4 md:p-6 min-h-full">
        <div className="">
          {/* Back Navigation */}
          <BackNavigation href="/dashboard" label="Back to Dashboard" />

          {/* Page Title */}
          <h1 className="mt-2.5 mb-8 font-semibold text-[#191919] text-lg md:text-[22px] leading-[1.2]">
            Full Loan Information
          </h1>

          {/* Loading Skeletons */}
          <div className="items-stretch gap-3 grid grid-cols-1 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <InfoCardSkeleton itemCount={7} />
            </div>
            <div className="col-span-1 md:col-span-2">
              <InfoCardSkeleton itemCount={6} hasTopContent />
            </div>
          </div>

          <div className="items-stretch gap-3 grid grid-cols-1 md:grid-cols-4 my-6">
            <div className="col-span-1 md:col-span-2">
              <InfoCardSkeleton itemCount={5} />
            </div>
            <div className="col-span-1 md:col-span-2">
              <DocumentsCardSkeleton documentCount={3} />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 max-w-4xl">
            <div className="flex-1 h-[46px] bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 h-[46px] bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 h-[46px] bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !loanDetails) {
    return (
      <div className="bg-[#F6F6F6] p-4 md:p-6 min-h-full">
        <BackNavigation href="/dashboard" label="Back to Dashboard" />
        <div className="flex justify-center items-center h-[400px]">
          <div className="text-center">
            <p className="text-red-600 text-lg font-semibold mb-2">
              {error || 'Loan not found'}
            </p>
            <p className="text-[#7C7C7C]">
              Unable to load loan details. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const nextRepayment = getNextRepayment();

  return (
    <div className="bg-[#F6F6F6] min-h-full">
      <div className="pt-6 md:pt-0">
        {/* Back Navigation */}
        <BackNavigation href="/dashboard" label="Back to Dashboard" />

        {/* Page Title */}
        <h1 className="mt-2.5 mb-8 font-semibold text-[#191919] text-lg md:text-[22px] leading-[1.2]">
          Full Loan Information
        </h1>

        {/* Main Content Grid */}
        <div className="">
          {/* Top row */}
          <div className="items-stretch gap-3 grid grid-cols-1 md:grid-cols-4">
            {/* Loan Summary Card */}
            <div className="col-span-2 h-full">
              <InfoCard
                title="Loan Summary"
                items={[
                  { label: 'Loan ID', value: loanDetails.loanNumber },
                  { label: 'Status', value: <StatusBadge status={getStatusValue(loanDetails.status)} /> },
                  { label: 'Borrowed Amount', value: `₦${loanDetails.loanAmount.toLocaleString()}` },
                  { label: 'Total Repayable', value: `₦${loanDetails.totalAmount.toLocaleString()}` },
                  { label: 'Tenure', value: `${loanDetails.repaymentMonths} Months` },
                  { label: 'Repayment Plan', value: 'Monthly Auto-Debit/ Bank Transfer' },
                  { label: 'Interest Rate', value: `${(loanDetails.interestRate * 100).toFixed(1)}% Annually` }
                ]}
              />
            </div>

            {/* Repayment progress */}
            <div className="col-span-2 h-full">
              <InfoCard
                title="Repayment Progress"
                topContent={
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-[#7C7C7C] text-sm">
                        Repayment Tracker
                      </span>
                      <span className="font-semibold text-[#00296B] text-sm">
                        {progress.percentage}% Completed
                      </span>
                    </div>

                    <div className="bg-[#B0BDD1] rounded w-full h-3">
                      <div
                        className="bg-gradient-to-b from-[#002561] via-[#00296B] to-black rounded h-3"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                }
                items={[
                  { label: 'Progress', value: `${progress.paidCount} / ${progress.totalCount} months paid` },
                  { label: 'Total Paid', value: `₦${loanDetails.amountRepaid.toLocaleString()}` },
                  { label: 'Outstanding', value: `₦${loanDetails.outstandingBalance.toLocaleString()}` },
                  { label: 'Next Repayment', value: `₦${nextRepayment.amount.toLocaleString()}` },
                  { label: 'Next Repayment Date', value: nextRepayment.date },
                  { label: 'Reminder', value: 'Yes' },
                ]}
              />
            </div>
          </div>

          {/* Bottom row */}
          <div className="items-stretch gap-3 grid grid-cols-1 md:grid-cols-4 my-6">
            {/* Disbursement Details Card */}
            <div className="col-span-2 h-full">
              <InfoCard
                title="Disbursement Details"
                items={[
                  { label: 'Disbursed To', value: loanDetails.schoolName },
                  { 
                    label: 'Date Disbursed', 
                    value: loanDetails.disbursementDate 
                      ? new Date(loanDetails.disbursementDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Pending'
                  },
                  { label: 'Amount Disbursed', value: `₦${loanDetails.amountDisbursed.toLocaleString()}` },
                  { label: 'Mode', value: 'Direct School Payment' },
                  { label: 'Transaction ID', value: loanDetails.disbursement?.disbursementReference || 'Pending' }
                ]}
              >
                {loanDetails.disbursement && (
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Download className="w-6 h-6 text-[#00296B]" />
                    <span className="font-semibold text-[#00296B] text-[0.875rem] leading-[1.2]">
                      Download disbursement receipt
                    </span>
                  </div>
                )}
              </InfoCard>
            </div>

            {/* Documents Submitted Card */}
            <div className="col-span-2 h-full">
              <div className="bg-white p-5 rounded-[16px] h-full">
                <h2 className="mb-5 font-semibold text-[#5F5F5F] text-[18px] leading-[1.2]">
                  Documents Submitted
                </h2>

                {loanDetails.documents && loanDetails.documents.length > 0 ? (
                  <div className="space-y-3">
                    {loanDetails.documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex justify-between items-center bg-[#F2F2F2] p-3 border border-[#DCDCDC] rounded-[8px]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 text-[#00296B]">
                            {getFileIcon(document.mimeType)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#090909] text-[14px] leading-[1.2]">
                              {document.fileName}
                            </p>
                            <p className="font-bold text-[#7C7C7C] text-[11px] leading-[1.2]">
                              {formatFileSize(document.fileSize)}
                            </p>
                          </div>
                        </div>
                        <Download 
                          className="w-6 h-6 text-[#00296B] cursor-pointer" 
                          onClick={() => window.open(document.fileUrl, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#7C7C7C]">No documents submitted yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <Button
            variant="navy-outline"
            className="flex-1 gap-2 h-[46px]"
            onClick={() => console.log('Contact support')}
          >
            <Headphones className="w-6 h-6" />
            Contact Support
          </Button>

          {/* <Button
            variant="navy"
            className="flex-1 gap-2 h-[46px]"
            onClick={() => console.log('Request payment extension')}
          >
            <CheckSquare className="w-6 h-6" />
            Request Payment Extension
          </Button> */}

          <Button
            variant="navy-outline"
            className="flex-1 gap-2 h-[46px]"
            onClick={() => console.log('Cancel')}
          >
            <X className="w-6 h-6" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
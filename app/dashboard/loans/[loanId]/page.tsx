'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Download, Headphones, CheckSquare, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { InfoCard } from '@/components/dashboard/info-card';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface LoanDetails {
  loanId: string;
  status: 'ongoing' | 'completed' | 'pending' | 'cancelled';
  borrowedAmount: number;
  totalRepayable: number;
  tenure: string;
  repaymentPlan: string;
  interestRate: string;
  disbursedTo: string;
  dateDisbursed: string;
  amountDisbursed: number;
  mode: string;
  transactionId: string;
  progress: string;
  totalPaid: number;
  outstanding: number;
  nextRepayment: number;
  nextRepaymentDate: string;
  reminder: string;
  documents: Array<{
    name: string;
    size: string;
    type: 'pdf' | 'doc';
  }>;
}

export default function FullLoanInformationPage() {
  const params = useParams();
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch loan details
    const fetchLoanDetails = async () => {
      try {
        // Mock data based on the Figma design
        const mockLoanDetails: LoanDetails = {
          loanId: 'PMF-2024-0021',
          status: 'completed',
          borrowedAmount: 120000,
          totalRepayable: 160000,
          tenure: '6 Months',
          repaymentPlan: 'Monthly Auto-Debit/ Bank Transfer',
          interestRate: '2.5% Monthly',
          disbursedTo: 'Babcock University',
          dateDisbursed: '14 Aug 2024',
          amountDisbursed: 120000,
          mode: 'Direct School Payment',
          transactionId: 'TXN-89433-A22',
          progress: '7 / 12 months paid',
          totalPaid: 95000,
          outstanding: 65000,
          nextRepayment: 15000,
          nextRepaymentDate: '28 Dec 2025',
          reminder: 'Yes',
          documents: [
            {
              name: 'National_Identity_Number.pdf',
              size: '2.4 MB',
              type: 'pdf'
            },
            {
              name: 'Bvn.pdf',
              size: '2.4 MB',
              type: 'pdf'
            }
          ]
        };

        setLoanDetails(mockLoanDetails);
      } catch (error) {
        console.error('Error fetching loan details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [params.loanId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 border-[#00296B] border-4 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
          <p className="text-[#7C7C7C]">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (!loanDetails) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <p className="text-[#7C7C7C]">Loan not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F6F6] p-6 min-h-full">
      <div className="mx-auto max-w-7xl">
        {/* Back Navigation */}
        <BackNavigation
          href="/dashboard"
          label="Back to Dashboard"
        />

        {/* Page Title */}
        <h1 className="mt-2.5 mb-8 font-semibold text-[#191919] text-[22px] leading-[1.2]">
          Full Loan Information
        </h1>

        {/* Main Content Grid */}
        <div className="">
          {/* Top row */}
          <div className="items-stretch gap-3 grid grid-cols-2 md:grid-cols-4">
            {/* Loan Summary Card */}
            <div className='col-span-2 h-full'>
              <InfoCard
                title="Loan Summary"
                items={[
                  { label: 'Loan ID', value: loanDetails.loanId },
                  { label: 'Status', value: <StatusBadge status={loanDetails.status} /> },
                  { label: 'Borrowed Amount', value: `₦${loanDetails.borrowedAmount.toLocaleString()}` },
                  { label: 'Total Repayable', value: `₦${loanDetails.totalRepayable.toLocaleString()}` },
                  { label: 'Tenure', value: loanDetails.tenure },
                  { label: 'Repayment Plan', value: loanDetails.repaymentPlan },
                  { label: 'Interest Rate', value: loanDetails.interestRate }
                ]}
              />
            </div>
            {/* Repayment progress */}
            <div className='col-span-2 h-full'>
              <InfoCard
                title="Repayment Progress"
                topContent={
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-[#7C7C7C] text-sm">
                        Repayment Tracker
                      </span>
                      <span className="font-semibold text-[#00296B] text-sm">
                        60% Completed
                      </span>
                    </div>

                    <div className="bg-[#B0BDD1] rounded w-full h-3">
                      <div
                        className="bg-gradient-to-b from-[#002561] via-[#00296B] to-black rounded h-3"
                        style={{ width: '60%' }}
                      />
                    </div>
                  </div>
                }
                items={[
                  { label: 'Progress', value: loanDetails.progress },
                  { label: 'Total Paid', value: `₦${loanDetails.totalPaid.toLocaleString()}` },
                  { label: 'Outstanding', value: `₦${loanDetails.outstanding.toLocaleString()}` },
                  { label: 'Next Repayment', value: `₦${loanDetails.nextRepayment.toLocaleString()}` },
                  { label: 'Next Repayment Date', value: loanDetails.nextRepaymentDate },
                  { label: 'Reminder', value: loanDetails.reminder },
                ]}
              />

            </div>
          </div>

          {/* Bottom row */}
          <div className="items-stretch gap-3 grid grid-cols-2 md:grid-cols-4 my-6">
            {/* Disbursement Details Card */}
            <div className='col-span-2 h-full'>
              <InfoCard
                title="Disbursement Details"
                items={[
                  { label: 'Disbursed To', value: loanDetails.disbursedTo },
                  { label: 'Date Disbursed', value: loanDetails.dateDisbursed },
                  { label: 'Amount Disbursed', value: `₦${loanDetails.amountDisbursed.toLocaleString()}` },
                  { label: 'Mode', value: loanDetails.mode },
                  { label: 'Transaction ID', value: loanDetails.transactionId }
                ]}
              >
                {/* Download Receipt */}
                <div className="flex items-center gap-2 cursor-pointer">
                  <Download className="w-6 h-6 text-[#00296B]" />
                  <span className="font-semibold text-[#00296B] text-[0.875rem] leading-[1.2]">
                    Download disbursement receipt
                  </span>
                </div>
              </InfoCard>
            </div>
            {/* Document progress */}
            <div className="col-span-2 h-full">

              {/* Documents Submitted Card */}
              <div className="bg-white p-5 rounded-[16px] h-full">
                <h2 className="mb-5 font-semibold text-[#5F5F5F] text-[18px] leading-[1.2]">
                  Documents Submitted
                </h2>

                <div className="space-y-3">
                  {loanDetails.documents.map((document, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-[#F2F2F2] p-3 border border-[#DCDCDC] rounded-[8px]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 text-[#00296B]">
                          {/* PDF Icon */}
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-[#090909] text-[14px] leading-[1.2]">
                            {document.name}
                          </p>
                          <p className="font-bold text-[#7C7C7C] text-[11px] leading-[1.2]">
                            {document.size}
                          </p>
                        </div>
                      </div>
                      <Download className="w-6 h-6 text-[#00296B] cursor-pointer" />
                    </div>
                  ))}
                </div>

                {/* Additional Document */}
                <div className="mt-3">
                  <div className="flex justify-between items-center bg-[#F2F2F2] p-3 border border-[#DCDCDC] rounded-[8px]">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 text-[#00296B]">
                        {/* File Icon */}
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-[#090909] text-[14px] leading-[1.2]">
                          Aamuotuma_biodata
                        </p>
                      </div>
                    </div>
                    <Download className="w-6 h-6 text-[#00296B] cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>


        {/* Action Buttons */}
        <div className="flex gap-8 max-w-4xl">
          <Button
            variant="navy-outline"
            className="flex-1 gap-2 h-[46px]"
            onClick={() => console.log('Contact support')}
          >
            <Headphones className="w-6 h-6" />
            Contact Support
          </Button>

          <Button
            variant="navy"
            className="flex-1 gap-2 h-[46px]"
            onClick={() => console.log('Request payment extension')}
          >
            <CheckSquare className="w-6 h-6" />
            Request Payment Extension
          </Button>

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
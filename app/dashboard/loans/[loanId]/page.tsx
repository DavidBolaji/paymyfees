'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Download, Headphones, CheckSquare, X } from 'lucide-react';
import { BackNavigation, StatusBadge } from '@/components/dashboard';
import { Button } from '@/components/ui/button';


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
  const router = useRouter();
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00296B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#7C7C7C]">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (!loanDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-[#7C7C7C]">Loan not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F6F6F6] min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <BackNavigation 
          href="/dashboard" 
          label="Back to Dashboard"
         

        />

        {/* Page Title */}
        <h1 className="text-[22px] mt-6 font-semibold text-[#191919] leading-[1.2] mb-12">
          Full Loan Information
        </h1>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Loan Summary Card */}
            <div className="bg-white rounded-[16px] p-5">
              <h2 className="text-[18px] font-semibold text-[#5F5F5F] leading-[1.2] mb-4">
                Loan Summary
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Loan ID:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    {loanDetails.loanId}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Status:
                  </span>
                  <StatusBadge status={loanDetails.status} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Borrowed Amount:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    ₦{loanDetails.borrowedAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Total Repayable:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    ₦{loanDetails.totalRepayable.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Tenure:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    {loanDetails.tenure}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Repayment Plan:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    {loanDetails.repaymentPlan}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Interest Rate:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    {loanDetails.interestRate}
                  </span>
                </div>
              </div>
            </div>

            {/* Disbursement Details Card */}
            <div className="bg-white rounded-[16px] p-5">
              <h2 className="text-[18px] font-semibold text-[#5F5F5F] leading-[1.2] mb-4">
                Disbursement Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Disbursed To:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    {loanDetails.disbursedTo}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Date Disbursed:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    {loanDetails.dateDisbursed}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Amount Disbursed:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    ₦{loanDetails.amountDisbursed.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Mode:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    {loanDetails.mode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Transaction ID:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    {loanDetails.transactionId}
                  </span>
                </div>
              </div>

              {/* Download Receipt */}
              <div className="flex items-center gap-2 mt-4 cursor-pointer">
                <Download className="w-6 h-6 text-[#00296B]" />
                <span className="text-[14px] font-semibold text-[#00296B] leading-[1.2]">
                  Download disbursement receipt
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Repayment Progress Card */}
            <div className="bg-white rounded-[16px] p-5">
              <h2 className="text-[18px] font-semibold text-[#5F5F5F] leading-[1.2] mb-5">
                Repayment Progress
              </h2>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-semibold text-[#7C7C7C] leading-[1.2]">
                    Repayment Tracker
                  </span>
                  <span className="text-[14px] font-semibold text-[#00296B] leading-[1.2]">
                    60% Completed
                  </span>
                </div>
                <div className="w-full bg-[#B0BDD1] rounded-[2px] h-3">
                  <div 
                    className="bg-gradient-to-b from-[#002561] via-[#00296B] to-[#000000] h-3 rounded-[2px]"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Progress:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    {loanDetails.progress}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Total Paid:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    ₦{loanDetails.totalPaid.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Outstanding:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    ₦{loanDetails.outstanding.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Next Repayment:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    ₦{loanDetails.nextRepayment.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Next Repayment Date:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    {loanDetails.nextRepaymentDate}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    Reminder:
                  </span>
                  <span className="text-[18px] font-medium text-[#7C7C7C] leading-[1.2]">
                    {loanDetails.reminder}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents Submitted Card */}
            <div className="bg-white rounded-[16px] p-5">
              <h2 className="text-[18px] font-semibold text-[#5F5F5F] leading-[1.2] mb-5">
                Documents Submitted
              </h2>
              
              <div className="space-y-3">
                {loanDetails.documents.map((document, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#F2F2F2] border border-[#DCDCDC] rounded-[8px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 text-[#00296B]">
                        {/* PDF Icon */}
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#090909] leading-[1.2]">
                          {document.name}
                        </p>
                        <p className="text-[11px] font-bold text-[#7C7C7C] leading-[1.2]">
                          {document.size}
                        </p>
                      </div>
                    </div>
                    <Download className="w-6 h-6 text-[#00296B] cursor-pointer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-8 max-w-4xl">
          <Button
            variant="navy-outline"
            className="flex-1 h-[46px] gap-2"
            onClick={() => console.log('Contact support')}
          >
            <Headphones className="w-6 h-6" />
            Contact Support
          </Button>

          <Button
            variant="navy"
            className="flex-1 h-[46px] gap-2"
            onClick={() => console.log('Request payment extension')}
          >
            <CheckSquare className="w-6 h-6" />
            Request Payment Extension
          </Button>

          <Button
            variant="navy-outline"
            className="flex-1 h-[46px] gap-2"
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
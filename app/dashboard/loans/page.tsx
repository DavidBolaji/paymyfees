'use client';

import { useState, useEffect } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { LoanDisbursementDrawer } from '@/components/dashboard';
import { fetchLoanHistory, LOAN_HISTORY_COLUMNS_FULL, loanHistoryDataFull } from '@/data';

export default function LoansPage() {
  const [loanHistory, setLoanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchLoanHistory();
        setLoanHistory(loanHistoryDataFull);
      } catch (error) {
        console.error('Error loading loan history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loan history...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <BackNavigation href="/dashboard" label="Back to Dashboard" />
        
        <div className="mb-6">
          <h1 className="text-[#191919] font-semibold text-[1.6875rem] mb-2">
            Loan / Disbursement History
          </h1>
          <p className="text-[#5F5F5F] text-base">
            View all your loan applications and disbursement records
          </p>
        </div>

        <DataTable
          title="All Loans"
          columns={LOAN_HISTORY_COLUMNS_FULL}
          data={loanHistory}
          onRowClick={(loan) => {
            setSelectedLoan(loan);
            setIsDrawerOpen(true);
          }}
        />
      </div>
    </div>

    <LoanDisbursementDrawer
      isOpen={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      loan={selectedLoan}
    />
    </>
  );
}

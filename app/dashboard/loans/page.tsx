'use client';

import { useState } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { DataTable } from '@/components/dashboard/data-table';


import { LOAN_HISTORY_COLUMNS_SIMPLE } from '@/data';
import { LoanDisbursementDrawer } from '@/components/dashboard/detail-drawer';
import useLoan from '@/hooks/useLoan';

export default function LoansPage() {
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {loanHistory, paginationInfo, loading} = useLoan()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
          <p className="text-gray-600">Loading loan history...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="">
          <BackNavigation href="/dashboard" label="Back to Dashboard" />

          <div className="mb-6">
            <h1 className="mb-2 font-semibold text-[#191919] text-xl md:text-[1.6875rem]">
              Loan / Disbursement History
            </h1>
            <p className="text-[#5F5F5F] text-base">
              View all your loan applications and disbursement records
            </p>
          </div>

          <DataTable
            title="All Loans"
            columns={LOAN_HISTORY_COLUMNS_SIMPLE}
            data={loanHistory}
            paginationInfo={paginationInfo}
            onPageChange={() => { }}
            itemsPerPage={10}
            isLoading={loading}
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

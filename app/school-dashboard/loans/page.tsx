'use client';

import { useState } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { LOAN_HISTORY_COLUMNS_SIMPLE } from '@/data';
import { LoanDisbursementDrawer } from '@/components/dashboard/detail-drawer';
import useLoan from '@/hooks/useLoan';

export default function SchoolLoansPage() {
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { loanHistory, paginationInfo, loading, handlePageChange } = useLoan();

  return (
    <>
      <div className="">
        <div className="pt-6 md:pt-0">
          <BackNavigation href="/school-dashboard" label="Back to Dashboard" />
          <div className="mb-6">
            <h1 className="mb-2 font-semibold text-[#191919] text-xl md:text-[1.6875rem]">
              Funding History
            </h1>
            <p className="font-medium text-[#7C7C7C] text-[15px]">
              View all your funding applications and disbursements.
            </p>
          </div>

          <DataTable
            title="Funding / Disbursement History"
            columns={LOAN_HISTORY_COLUMNS_SIMPLE}
            data={loanHistory}
            paginationInfo={paginationInfo}
            onPageChange={handlePageChange}
            itemsPerPage={10}
            isLoading={loading}
            onRowClick={(loan) => {
              setSelectedLoan(loan);
              setIsDrawerOpen(true);
            }}
            searchable={true}
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

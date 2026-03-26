'use client';

import { useState } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { TRANSACTION_COLUMNS } from '@/data';
import { TransactionDrawer } from '@/components/dashboard/detail-drawer';
import useTransaction from '@/hooks/useTransaction';

export default function SchoolTransactionsPage() {
  const { transactions, paginationInfo: tpaginationInfo, loading: transactionLoading, handlePageChange } = useTransaction();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div className="">
        <div className="pt-6 md:pt-0">
          <BackNavigation href="/school-dashboard" label="Back to Dashboard" />
          <div className="mb-6">
            <h1 className="mb-2 font-semibold text-[#191919] text-xl md:text-[1.6875rem]">
              Transactions
            </h1>
            <p className="font-medium text-[#7C7C7C] text-[15px]">
              View all your transaction history.
            </p>
          </div>

          <DataTable
            title="All Transactions"
            columns={TRANSACTION_COLUMNS}
            data={transactions}
            itemsPerPage={10}
            isLoading={transactionLoading}
            paginationInfo={tpaginationInfo}
            onPageChange={handlePageChange}
            onRowClick={(transaction) => {
              setSelectedTransaction(transaction);
              setIsDrawerOpen(true);
            }}
            searchable={true}
          />
        </div>
      </div>

      <TransactionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  );
}

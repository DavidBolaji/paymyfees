'use client';

import { useState } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { TransactionTableSkeleton } from '@/components/dashboard/transaction-table-skeleton';
import {  TRANSACTION_COLUMNS } from '@/data';
import { TransactionDrawer } from '@/components/dashboard/detail-drawer';
import useTransaction from '@/hooks/useTransaction';

export default function TransactionsPage() {
  const {transactions, paginationInfo: tpaginationInfo, loading: transactionLoading} = useTransaction()
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);


  return (
    <>
      <div className="">
        <div className="pt-6 md:pt-0">
          <BackNavigation href="/dashboard" label="Back to Dashboard" />

          <div className="mb-6">
            <h1 className="mb-2 font-semibold text-[#191919] text-xl md:text-[1.6875rem]">
              Transaction History
            </h1>
            <p className="text-[#5F5F5F] text-base">
              View all your payment transactions and activity
            </p>
          </div>

          {transactionLoading ? (
            <TransactionTableSkeleton rowCount={10} />
          ) : (
            <DataTable
              title="All Transactions"
              columns={TRANSACTION_COLUMNS}
              data={transactions}
              onPageChange={() => { }}
              paginationInfo={tpaginationInfo}
              itemsPerPage={10}
              isLoading={transactionLoading}
              onRowClick={(transaction) => {
                setSelectedTransaction(transaction);
                setIsDrawerOpen(true);
              }}
            />
          )}
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

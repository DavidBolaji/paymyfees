'use client';

import { useState } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { DataTable } from '@/components/dashboard/data-table';

import {  TRANSACTION_COLUMNS } from '@/data';
import { TransactionDrawer } from '@/components/dashboard/detail-drawer';
import useTransaction from '@/hooks/useTransaction';

export default function TransactionsPage() {
  const {transactions, paginationInfo: tpaginationInfo, loading: transactionLoading} = useTransaction()
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);


  if (transactionLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

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

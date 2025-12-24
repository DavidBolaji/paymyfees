'use client';

import { useState, useEffect } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { DataTable } from '@/components/dashboard/data-table';
// import { TransactionDrawer } from '@/components/dashboard';
import { fetchRecentTransactions, TRANSACTION_COLUMNS_FULL, recentTransactionsDataFull } from '@/data';
import { TransactionDrawer } from '@/components/dashboard/detail-drawer';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchRecentTransactions();
        setTransactions(recentTransactionsDataFull);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
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
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <BackNavigation href="/dashboard" label="Back to Dashboard" />
        
        <div className="mb-6">
          <h1 className="mb-2 font-semibold text-[#191919] text-[1.6875rem]">
            Transaction History
          </h1>
          <p className="text-[#5F5F5F] text-base">
            View all your payment transactions and activity
          </p>
        </div>

        <DataTable
          title="All Transactions"
          columns={TRANSACTION_COLUMNS_FULL}
          data={transactions}
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

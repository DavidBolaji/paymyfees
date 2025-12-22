'use client';

import { useState, useEffect } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { TransactionDrawer } from '@/components/dashboard';
import { fetchRecentTransactions, TRANSACTION_COLUMNS_FULL, recentTransactionsDataFull } from '@/data';

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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
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

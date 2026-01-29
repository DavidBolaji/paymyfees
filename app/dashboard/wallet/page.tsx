'use client';

import { useState, useEffect } from 'react';
import { Send, Wallet, Download, PhoneCall } from 'lucide-react';
import { DataTable } from '@/components/dashboard/data-table';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { WALLET_TRANSACTION_COLUMNS } from '@/data/constants';
import WalletCard from './WalletCard';
import FundWalletModal from './FundWalletModal';
import useWalletStore from '@/src/stores/walletStore';
import { WalletCardSkeleton } from '@/components/wallet/wallet-card-skeleton';
import { WalletStatCards } from '@/components/wallet/wallet-stat-cards';
import { RechartsFundingChart } from '@/components/wallet/recharts-funding-chart';
import { LinkedPaymentMethods } from '@/components/wallet/linked-payment-methods';
import MakeRepaymentModal from '@/components/dashboard/make-repayment-modal';
// import useAuthStore from '@/src/authStore';

export default function WalletPage() {
  // const { user } = useAuthStore();
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isMakePaymentModalOpen, setIsMakePaymentModalOpen] = useState(false);

  // Get wallet state and actions from store
  const {
    balance,
    transactions,
    chartData,
    paymentMethods,
    stats,
    paginationInfo,
    isLoading,
    isTransactionsLoading,
    isChartLoading,
    isPaymentMethodsLoading,
    fetchWalletBalance,
    fetchWalletTransactions,
    fetchChartData,
    fetchPaymentMethods,
    // fundWallet,
    addPaymentMethod,
    removePaymentMethod
  } = useWalletStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchWalletBalance();
    fetchWalletTransactions();
    fetchChartData('6months'); // Fetch 6 months of chart data
    fetchPaymentMethods();
  }, [fetchWalletBalance, fetchWalletTransactions, fetchChartData, fetchPaymentMethods]);

  // Handle page change for transactions table
  const handlePageChange = (page: number) => {
    fetchWalletTransactions(page);
  };

  // Determine if wallet is empty (no balance and no transactions)
  // const isWalletEmpty = !isLoading && balance?.balance === 0 && transactions.length === 0;

  return (
    <div className="p-6">
      <div className="">
        <BackNavigation href="/dashboard" label="Back to Dashboard" />

        <h1 className="text-2xl font-semibold text-[#191919] mb-2">Wallet</h1>
        <p className="text-sm text-gray-600 mb-6">
          Manage your wallet balance, top up funds, track transactions, and automate loan repayments.
        </p>


        <>
          {/* Wallet Stats */}
          <WalletStatCards
            stats={stats}
            isLoading={isLoading}
            className="mb-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Wallet Card */}
            <div className="w-full col-span-1">
              {isLoading ? (
                <WalletCardSkeleton />
              ) : (
                <WalletCard
                  balance={balance?.balance || 0}
                  currency={balance?.currency || "NGN"}
                />
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="w-full col-span-1">
              <div className="h-full rounded-[16px] border-2 border-[#00296B] p-8 bg-[#C5D3E8] flex flex-col">
                <h2 className="text-lg font-semibold text-[#191919] mb-6">Quick Actions</h2>
                <div className="flex-1 flex items-center justify-center gap-12">
                  {/* Make Repayment */}
                  <div className="flex flex-col items-center gap-3">
                    <button 
                    onClick={() => setIsMakePaymentModalOpen(true)}
                    className="w-16 h-16 rounded-full bg-[#00296B] flex items-center justify-center hover:bg-[#003D82] transition-colors">
                      <Send className="w-6 h-6 text-white" />
                    </button>
                    <span className="text-sm font-medium text-[#191919]">Make Repayment</span>
                  </div>

                  {/* Fund Wallet */}
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => setIsFundModalOpen(true)}
                      className="w-16 h-16 rounded-full bg-[#00296B] flex items-center justify-center hover:bg-[#003D82] transition-colors"
                    >
                      <Wallet className="w-6 h-6 text-white" />
                    </button>
                    <span className="text-sm font-medium text-[#191919]">Fund Wallet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <DataTable
            title="Wallet & Repayment Activity"
            columns={WALLET_TRANSACTION_COLUMNS}
            data={transactions}
            itemsPerPage={5}
            isLoading={isTransactionsLoading}
            paginationInfo={paginationInfo}
            onPageChange={handlePageChange}
            onRowClick={(item) => console.log('Wallet transaction clicked:', item)}
            className="mb-8"
          />

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funding vs Repayment Chart */}
            <div className="lg:col-span-2">
              <RechartsFundingChart
                data={chartData}
                isLoading={isChartLoading}
              />
            </div>

            {/* Linked Payment Methods */}
            <div className="lg:col-span-1">
              <LinkedPaymentMethods
                paymentMethods={paymentMethods}
                isLoading={isPaymentMethodsLoading}
                onAddPaymentMethod={addPaymentMethod}
                onRemovePaymentMethod={removePaymentMethod}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <button
              className="h-12 rounded-lg border border-[#00296B] bg-white text-[#00296B] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Statement
            </button>
            <button

              className="h-12 rounded-lg border border-[#00296B] bg-white text-[#00296B] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-5 h-5" />
              Contact support
            </button>
          </div>
        </>

      </div>

      {/* Fund Wallet Modal */}
      <FundWalletModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
      />

      {/* Fund Wallet Modal */}
      <MakeRepaymentModal
        isOpen={isMakePaymentModalOpen}
        onClose={() => setIsMakePaymentModalOpen(false)}
        onSuccess={() => {}}
        walletBalance={balance?.balance || 0}
      />
    </div>
  );
}

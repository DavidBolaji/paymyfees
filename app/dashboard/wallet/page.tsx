'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, PhoneCall, CheckCircle2, X } from 'lucide-react';
import { DataTable } from '@/components/dashboard/data-table';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { WALLET_TRANSACTION_COLUMNS } from '@/data/constants';
import WalletCard from './WalletCard';
import FundWalletModal from './FundWalletModal';
import useWalletStore from '@/src/stores/walletStore';
import { WalletCardSkeleton } from '@/components/wallet/wallet-card-skeleton';
import { WalletStatCards } from '@/components/wallet/wallet-stat-cards';
import { RechartsFundingChart } from '@/components/wallet/recharts-funding-chart';
import { PaymentMethodData } from '@/components/wallet/linked-payment-methods';
import { ChargeCardModal } from '@/components/wallet/charge-card-modal';
import MakeRepaymentModal from '@/components/dashboard/make-repayment-modal';
import ContactSupportModal from '@/app/dashboard/school-verification/ContactSupportModal';
import { getPaymentMethods, chargeSavedCard } from '@/src/utils/payment-method-api';
import { GradientSendIcon } from '@/assets/icons/GredientSendIcon';
import { GradientWalletIcon } from '@/assets/icons/GradientWalletIcon';
import { NetworkIcon } from '@/assets/icons/NetworkIcon';
import useDashboardStore from '@/src/stores/dashboardStore';
// import useAuthStore from '@/src/authStore';

export default function WalletPage({ basePath = "/dashboard" }: { basePath?: string }) {
  // const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const { selectedLoanId } = useDashboardStore();
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isMakePaymentModalOpen, setIsMakePaymentModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [, setIsLoadingPaymentMethods] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PaymentMethodData | null>(null);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const activityTableRef = useRef<HTMLDivElement>(null);

  const scrollToActivity = () => {
    activityTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDownloadStatement = () => {
    if (!transactions || transactions.length === 0) return;
    const headers = ['Date', 'Reference', 'Type', 'Description', 'Amount', 'Status'];
    const rows = transactions.map((tx: any) => [
      new Date(tx.transactionDate || tx.date || '').toLocaleDateString('en-GB'),
      tx.reference || tx.transactionReference || '',
      tx.transactionType || tx.type || '',
      tx.description || '',
      Number(tx.amount || 0).toFixed(2),
      tx.status || '',
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map((v: string) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-statement-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get wallet state and actions from store
  const {
    balance,
    transactions,
    chartData,
    stats,
    paginationInfo,
    isLoading,
    isTransactionsLoading,
    isChartLoading,
    fetchWalletBalance,
    fetchWalletTransactions,
    fetchChartData,
  } = useWalletStore();

  // Fetch payment methods
  const loadPaymentMethods = async () => {
    setIsLoadingPaymentMethods(true);
    try {
      const result = await getPaymentMethods();
      if (result.success && result.data) {
        setPaymentMethods(result.data);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  // Fetch data on component mount and when selected loan changes
  useEffect(() => {
    fetchWalletBalance(selectedLoanId ?? undefined);
    fetchWalletTransactions();
    fetchChartData('6months');
    loadPaymentMethods();
  }, [fetchWalletBalance, fetchWalletTransactions, fetchChartData, selectedLoanId]);

  // Check for payment success from URL params
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const amount = searchParams.get('amount');
    const cardAdded = searchParams.get('card_added');
    
    if (paymentSuccess === 'true') {
      // Show success message
      setSuccessMessage(
        amount 
          ? `Payment successful! ₦${parseFloat(amount).toLocaleString()} has been added to your wallet.`
          : 'Payment successful! Your wallet has been credited.'
      );
      setShowSuccessMessage(true);
      
      // Refresh wallet data
      fetchWalletBalance(selectedLoanId ?? undefined);
      fetchWalletTransactions();
      fetchChartData('6months');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      // Clean up URL params
      window.history.replaceState({}, '', `${basePath}/wallet`);
    }

    if (cardAdded === 'true') {
      // Reload payment methods after card addition
      loadPaymentMethods();
      
      // Show success message
      setSuccessMessage('Card added successfully! You can now use it for quick payments.');
      setShowSuccessMessage(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      // Clean up URL params
      window.history.replaceState({}, '', `${basePath}/wallet`);
    }
  }, [searchParams, fetchWalletBalance, fetchWalletTransactions, fetchChartData, basePath, selectedLoanId]);

  // Handle page change for transactions table
  const handlePageChange = (page: number) => {
    fetchWalletTransactions(page);
  };

  // Handle successful repayment
  const handleRepaymentSuccess = (amount: number) => {
    // Show success message
    setSuccessMessage(`Repayment successful! ₦${amount.toLocaleString()} has been deducted from your wallet.`);
    setShowSuccessMessage(true);
    
    // Refresh wallet data
    fetchWalletBalance(selectedLoanId ?? undefined);
    fetchWalletTransactions();
    fetchChartData('6months');
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  // Handle charge card
  const handleChargeCard = async (amount: number) => {
    if (!selectedCard) return;

    try {
      const result = await chargeSavedCard(selectedCard.id, amount, 'Wallet funding');
      if (result.success && result.data) {
        // Show success message
        setSuccessMessage(result.data.message);
        setShowSuccessMessage(true);
        
        // Refresh wallet data
        fetchWalletBalance(selectedLoanId ?? undefined);
        fetchWalletTransactions();
        fetchChartData('6months');
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to charge card');
      }
    } catch (error) {
      console.error('Error charging card:', error);
      throw error;
    }
  };

  // Determine if wallet is empty (no balance and no transactions)
  // const isWalletEmpty = !isLoading && balance?.balance === 0 && transactions.length === 0;

  return (
    <div className="">
      <div className="pt-6 md:pt-0">
        <BackNavigation href={basePath} label="Back to Dashboard" />

        <h1 className="text-xl md:text-2xl font-semibold text-[#191919] mb-2">Wallet</h1>
        <p className="text-sm text-gray-600 mb-6">
          Manage your wallet balance, top up funds, track transactions, and automate loan repayments.
        </p>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 flex-1">{successMessage}</p>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <>
          {/* Wallet Stats */}
          <WalletStatCards
            stats={stats}
            isLoading={isLoading}
            className="mb-14"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14 mb-8">
            {/* Wallet Card */}
            <div className="w-full col-span-1">
              {isLoading ? (
                <WalletCardSkeleton />
              ) : (
                <WalletCard
                  balance={balance?.balance || 0}
                  currency={balance?.currency || "NGN"}
                  virtualAccountNumber={balance?.virtualAccountNumber}
                  virtualAccountBank={balance?.virtualAccountBank}
                />
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="w-full col-span-1">
              <div className="lg:h-full rounded-[20px] border-2 border-[#00296B] px-3 sm:px-6 md:px-[72px] bg-[#B0BDD1] flex flex-col py-4 sm:py-5 md:py-0">
                <h2 className="text-base sm:text-lg md:text-[22px] font-bold text-[#00296B] mt-3 sm:mt-4 md:mt-9 mb-3 sm:mb-4 md:mb-10 text-center w-full">Quick Actions</h2>
                <div className="flex justify-between items-center px-2 sm:px-3 gap-2 sm:gap-4">
                  {/* Make Repayment */}
                  <div className="flex flex-col items-center gap-2">
                    <button 
                    onClick={() => setIsMakePaymentModalOpen(true)}
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-[#00296B] flex items-center justify-center hover:bg-[#003D82] transition-colors">
                      <GradientSendIcon />
                    </button>
                    <span className="text-xs sm:text-sm font-medium text-[#00296B] text-center">Make Repayment</span>
                  </div>
                  
                  {/* Payment History */}
                  <div className="flex flex-col items-center gap-2">
                    <button 
                    onClick={scrollToActivity}
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-[#00296B] flex items-center justify-center hover:bg-[#003D82] transition-colors">
                      <NetworkIcon color='white' />
                    </button>
                    <span className="text-xs sm:text-sm font-medium text-[#00296B] text-center">Payment History</span>
                  </div>

                  {/* Fund Wallet */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => setIsFundModalOpen(true)}
                      className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-[#00296B] flex items-center justify-center hover:bg-[#003D82] transition-colors"
                    >
                      <GradientWalletIcon />
                    </button>
                    <span className="text-xs sm:text-sm font-medium text-[#00296B] text-center">Fund Wallet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div ref={activityTableRef}>
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
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funding vs Repayment Chart */}
            <div className="lg:col-span-3">
              <RechartsFundingChart
                data={chartData}
                isLoading={isChartLoading}
              />
            </div>

            {/* Linked Payment Methods */}
            {/* <div className="lg:col-span-1">
              <LinkedPaymentMethods
                paymentMethods={paymentMethods}
                isLoading={isLoadingPaymentMethods}
                onAddCard={handleAddCard}
                onRemoveCard={handleRemoveCard}
                onCardClick={handleCardClick}
              />
            </div> */}
          </div>

          {/* Footer Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <button
              onClick={handleDownloadStatement}
              className="h-12 rounded-lg border border-[#00296B] bg-white text-[#00296B] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Statement
            </button>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="h-12 rounded-lg border border-[#00296B] bg-white text-[#00296B] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-5 h-5" />
              Contact support
            </button>
          </div>
        </>

      </div>

      {/* Modals */}
      <FundWalletModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        virtualAccountNumber={balance?.virtualAccountNumber}
        virtualAccountBank={balance?.virtualAccountBank}
      />

      <MakeRepaymentModal
        isOpen={isMakePaymentModalOpen}
        onClose={() => setIsMakePaymentModalOpen(false)}
        onSuccess={handleRepaymentSuccess}
        walletBalance={balance?.balance || 0}
      />

      {selectedCard && (
        <ChargeCardModal
          isOpen={isChargeModalOpen}
          onClose={() => {
            setIsChargeModalOpen(false);
            setSelectedCard(null);
          }}
          card={{
            id: selectedCard.id,
            cardType: selectedCard.cardType,
            last4: selectedCard.last4,
            brand: selectedCard.brand,
          }}
          onCharge={handleChargeCard}
        />
      )}

      <ContactSupportModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}

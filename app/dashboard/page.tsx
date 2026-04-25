'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';


import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { DataTable } from '@/components/dashboard/data-table';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { ProgressTrackerSkeleton } from '@/components/dashboard/progress-tracker-skeleton';
import { ChartCard } from '@/components/dashboard/chart-card';
import { ChartCardSkeleton } from '@/components/dashboard/chart-card-skeleton';
import { QuickActionsCard } from '@/components/dashboard/quick-actions-card';

import {
  LOAN_HISTORY_COLUMNS,
  TRANSACTION_COLUMNS,
} from '@/data';
import useAuthStore from '@/src/authStore';
import { LoanDisbursementDrawer, TransactionDrawer } from '@/components/dashboard/detail-drawer';
import useLoan from '@/hooks/useLoan';
import useTransaction from '@/hooks/useTransaction';
import useDashboard from '@/hooks/useDashboard';
import useDashboardStore from '@/src/stores/dashboardStore';

export interface TransactionItem {
  date: string;
  description: string;
  amount: number;
  method: string;
  status: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Use custom hooks with caching
  const {
    stats,
    chartData,
    timelineData,
    selectedYear,
    loading: dashboardLoading,
    handleYearChange,
  } = useDashboard();

  const {
    loanHistory,
    paginationInfo,
    loading: loanLoading,
    handlePageChange: handleLoanPageChange
  } = useLoan();

  const {
    transactions,
    paginationInfo: tpaginationInfo,
    loading: transactionLoading,
    handlePageChange: handleTransactionPageChange
  } = useTransaction();

  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerTOpen, setIsTDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const handleChartSearch = (query: string) => {
    // Handle chart search functionality
    console.log('Chart search:', query);
  };

  // Determine loading state
  const isLoading = dashboardLoading || !stats;

  // Determine if selected loan is active (ACTIVE or DISBURSED)
  const { selectedLoanId } = useDashboardStore();
  const selectedLoanSummary = selectedLoanId
    ? (stats?.allLoans ?? []).find((l) => l.id === selectedLoanId)
    : null;
  const selectedLoanIsActive =
    !selectedLoanSummary ||
    selectedLoanSummary.status === 'ACTIVE' ||
    selectedLoanSummary.status === 'DISBURSED';

  // Ensure we have a valid user object even during loading
  const userName = user?.fullName?.split(" ")[0] || "User";

  return (
    <>
      <div className="">
        <div className="pt-6 md:pt-0">
          <h2 className='mb-2 md:mb-4 font-semibold text-[#191919] text-xl md:text-[1.6875rem]'>Dashboard</h2>
          <p className='mb-5 md:mb-[1.375rem] font-semibold text-[#5F5F5F] text-lg md:text-[1.6875rem]'>Welcome Back, {userName}</p>

          {/* Quick Actions Card */}
          <QuickActionsCard />

          {/* Stats Grid */}
          <div className="gap-x-4 gap-y-2.5 sm:gap-x-4 sm:gap-y-3 md:gap-x-6 md:gap-y-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {isLoading ? (
              <>
                <StatCardSkeleton variant="primary" />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title="Upcoming Payment"
                  value={
                    selectedLoanIsActive && stats.upcomingPayment
                      ? `₦${Number(stats.upcomingPayment.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "₦-"
                  }
                  subtitle={selectedLoanIsActive && stats.upcomingPayment ? "Due" : undefined}
                  footer={
                    selectedLoanIsActive && stats.upcomingPayment
                      ? `Next fee deadline: ${stats.upcomingPayment.dueDate}`
                      : "Next fee deadline:-"
                  }
                  variant={"primary"}
                />

                <StatCard
                  title="Active Plan"
                  value={
                    selectedLoanIsActive && stats.activePlan
                      ? `${stats.activePlan.current}/${stats.activePlan.total}`
                      : "None"
                  }
                  subtitle={selectedLoanIsActive && stats.activePlan ? stats.activePlan.planType : undefined}
                  footer={
                    selectedLoanIsActive && stats.activePlan
                      ? "You're doing great. Keep it up!"
                      : "--"
                  }
                  variant="default"
                />

                <StatCard
                  title="Balance"
                  value={
                    stats.balance.amount === 0
                      ? "₦-"
                      : `₦${Number(stats.balance.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  }
                  subtitle={stats.balance.amount === 0 ? "" : stats.balance.description}
                  hideSubtitleOnMobile
                  footer="Your remaining loan balance."
                  variant="default"
                />

                <StatCard
                  title="Wallet"
                  value={
                    selectedLoanIsActive && stats.activePlan
                      ? (stats.wallet.amount === 0
                        ? "₦0"
                        : `₦${Number(stats.wallet.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
                      : "₦-"
                  }
                  subtitle={stats.wallet.amount === 0 ? "" : stats.wallet.description}
                  hideSubtitleOnMobile
                  footer={
                    stats.wallet.virtualAccountNumber ? (
                      <div className="text-[10px] sm:text-xs">
                        <div className="hidden sm:block">Acct: {stats.wallet.virtualAccountNumber}</div>
                        <div className="hidden sm:block text-[9px] sm:text-[10px] opacity-80">{stats.wallet.virtualAccountBank}</div>
                        <span className="sm:hidden">Fund wallet to make repayment</span>
                      </div>
                    ) : (
                      <>
                        <span className="sm:hidden">Fund wallet to make repayment</span>
                        <span className="hidden sm:inline">Fund wallet to make repayment automated.</span>
                      </>
                    )
                  }
                  variant="default"
                />
              </>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="items-stretch gap-6 grid grid-cols-1 lg:grid-cols-4 mb-8">
            {/* Loan History Table */}
            <div className="lg:col-span-3 h-full">
              <DataTable
                title="Loan / Disbursement History"
                columns={LOAN_HISTORY_COLUMNS}
                data={loanHistory}
                viewAllHref="/dashboard/loans"
                paginationInfo={paginationInfo}
                onPageChange={(page) => {
                  if (paginationInfo && loanHistory.length > 0) {
                    handleLoanPageChange(page);
                  }
                }}
                itemsPerPage={loanHistory?.length > 0 ? 5 : 1}
                isLoading={loanLoading || isLoading}
                onRowClick={(loan) => {
                  setSelectedLoan(loan);
                  setIsDrawerOpen(true);
                }}
                searchable={true}
              />
            </div>

            {/* Progress Tracker */}
            <div className="h-full">
              {isLoading || !timelineData ? (
                <ProgressTrackerSkeleton variant="mini" />
              ) : (
                <ProgressTracker
                  title="Progress Tracker"
                  subtitle="Track the timeline of your loan and repayment"
                  steps={timelineData.detailedTimeline}
                  actionLabel="Check Timeline"
                  onAction={() => router.push('/dashboard/timeline')}
                  className="h-auto"
                  variant="mini"
                />
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
            {/* Recent Transactions */}
            <div className="space-y-6 lg:col-span-3">
              <DataTable
                title="Recent Transactions"
                columns={TRANSACTION_COLUMNS}
                data={transactions}
                viewAllHref="/dashboard/transactions"
                itemsPerPage={transactions?.length > 0 ? 5 : 1}
                isLoading={transactionLoading || isLoading}
                paginationInfo={tpaginationInfo}
                onPageChange={(page) => {
                  if (tpaginationInfo && transactions.length > 0) {
                    handleTransactionPageChange(page);
                  }
                }}
                onRowClick={(transaction) => {
                  setSelectedTransaction(transaction);
                  setIsTDrawerOpen(true);
                }}
                searchable={true}
              />
            </div>

          </div>

          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-4 mt-8">
              <div className="lg:col-span-3">
                {isLoading ? (
                  <ChartCardSkeleton />
                ) : (
                  <ChartCard
                    title="Loan Borrowed Overtime"
                    subtitle="See your loan borrowed chart on paymyfees"
                    data={chartData}
                    selectedYear={selectedYear}
                    onYearChange={handleYearChange}
                    searchPlaceholder="Search"
                    onSearch={handleChartSearch}
                  />
                )}
              </div>
              <div className='lg:col-span-1' />
            </div>)}
        </div>
      </div>

      <LoanDisbursementDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        loan={{
          ...selectedLoan,
          // Add dashboard stats data to the loan object
          activePlan: stats?.activePlan,
          upcomingPayment: stats?.upcomingPayment,
          balance: stats?.balance
        }}
      />
      <TransactionDrawer
        isOpen={isDrawerTOpen}
        onClose={() => setIsTDrawerOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  );
}

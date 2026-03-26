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

import {
  LOAN_HISTORY_COLUMNS,
  TRANSACTION_COLUMNS,
} from '@/data';
import useAuthStore from '@/src/authStore';
import { LoanDisbursementDrawer, TransactionDrawer } from '@/components/dashboard/detail-drawer';
import useLoan from '@/hooks/useLoan';
import useTransaction from '@/hooks/useTransaction';
import useDashboard from '@/hooks/useDashboard';
import { QuickActionsCardSchool } from '@/components/dashboard/quick-actions-card-school';

export default function SchoolDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

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
    handlePageChange: handleLoanPageChange,
  } = useLoan();

  const {
    transactions,
    paginationInfo: tpaginationInfo,
    loading: transactionLoading,
    handlePageChange: handleTransactionPageChange,
  } = useTransaction();

  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerTOpen, setIsTDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const handleChartSearch = (query: string) => {
    console.log('Chart search:', query);
  };

  const isLoading = dashboardLoading || !stats;

  // Use school name for the welcome message
  const schoolName =
    user?.schoolProfile?.schoolName ||
    user?.fullName ||
    'School';

  return (
    <>
      <div className="">
        <div className="pt-6 md:pt-0">
          <h2 className="mb-2 md:mb-4 font-semibold text-[#191919] text-xl md:text-[1.6875rem]">
            Dashboard
          </h2>
          <p className="mb-5 md:mb-[1.375rem] font-semibold text-[#5F5F5F] text-lg md:text-[1.6875rem]">
            Welcome back, {schoolName}
          </p>

         <QuickActionsCardSchool />

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
                    stats.upcomingPayment
                      ? `₦${Number(stats.upcomingPayment.amount).toLocaleString('en-NG', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '₦-'
                  }
                  subtitle={stats.upcomingPayment ? 'Due' : undefined}
                  footer={
                    stats.upcomingPayment
                      ? `Next deadline: ${stats.upcomingPayment.dueDate}`
                      : 'Next deadline: -'
                  }
                  variant="primary"
                />

                <StatCard
                  title="Active Funding"
                  value={
                    stats.activePlan
                      ? `${stats.activePlan.current}/${stats.activePlan.total}`
                      : 'None'
                  }
                  subtitle={stats.activePlan ? stats.activePlan.planType : undefined}
                  footer={stats.activePlan ? 'Funding plan active.' : '--'}
                  variant="default"
                />

                <StatCard
                  title="Balance"
                  value={
                    stats.balance.amount === 0
                      ? '₦-'
                      : `₦${Number(stats.balance.amount).toLocaleString('en-NG', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                  }
                  subtitle={stats.balance.amount === 0 ? '' : stats.balance.description}
                  hideSubtitleOnMobile
                  footer="Your remaining funding balance."
                  variant="default"
                />

                <StatCard
                  title="Wallet"
                  value={
                    stats.activePlan
                      ? stats.wallet.amount === 0
                        ? '₦0'
                        : `₦${Number(stats.wallet.amount).toLocaleString('en-NG', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                      : '₦-'
                  }
                  subtitle={stats.wallet.amount === 0 ? '' : stats.wallet.description}
                  hideSubtitleOnMobile
                  footer="Fund wallet to make repayments automated."
                  variant="default"
                />
              </>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="items-stretch gap-6 grid grid-cols-1 lg:grid-cols-4 mb-8">
            <div className="lg:col-span-3 h-full">
              <DataTable
                title="Funding / Disbursement History"
                columns={LOAN_HISTORY_COLUMNS}
                data={loanHistory}
                viewAllHref="/school-dashboard/loans"
                paginationInfo={paginationInfo}
                onPageChange={(page) => {
                  if (paginationInfo && loanHistory.length > 0) {
                    handleLoanPageChange(page);
                  }
                }}
                itemsPerPage={5}
                isLoading={loanLoading || isLoading}
                onRowClick={(loan) => {
                  setSelectedLoan(loan);
                  setIsDrawerOpen(true);
                }}
                searchable={true}
              />
            </div>

            <div className="h-full">
              {isLoading || !timelineData ? (
                <ProgressTrackerSkeleton variant="mini" />
              ) : (
                <ProgressTracker
                  title="Progress Tracker"
                  subtitle="Track the timeline of your funding and repayment"
                  steps={timelineData.detailedTimeline}
                  onAction={() => router.push('/school-dashboard/timeline')}
                  className="h-auto"
                  variant="mini"
                />
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-3">
              <DataTable
                title="Recent Transactions"
                columns={TRANSACTION_COLUMNS}
                data={transactions}
                viewAllHref="/school-dashboard/transactions"
                itemsPerPage={5}
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

          <div className="grid grid-cols-1 lg:grid-cols-4 mt-8">
            <div className="lg:col-span-3">
              {isLoading ? (
                <ChartCardSkeleton />
              ) : (
                <ChartCard
                  title="Funding Borrowed Overtime"
                  subtitle="See your funding chart on PayMyFees"
                  data={chartData}
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                  searchPlaceholder="Search"
                  onSearch={handleChartSearch}
                />
              )}
            </div>
            <div className="lg:col-span-1" />
          </div>
        </div>
      </div>

      <LoanDisbursementDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        loan={{
          ...selectedLoan,
          activePlan: stats?.activePlan,
          upcomingPayment: stats?.upcomingPayment,
          balance: stats?.balance,
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

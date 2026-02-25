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
  
  // Ensure we have a valid user object even during loading
  const userName = user?.fullName?.split(" ")[0] || "User";

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="">
          <h2 className='mb-[0.56rem] font-semibold text-[#191919] text-xl md:text-[1.6875rem]'>Dashboard</h2>
          <p className='mb-[1.375rem] font-semibold text-[#5F5F5F] text-lg md:text-[1.6875rem]'>Welcome Back, {userName}</p>
          
          {/* Quick Actions Card */}
          <QuickActionsCard />

          {/* Stats Grid */}
          <div className="gap-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
                      ? `₦${Number(stats.upcomingPayment.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "₦-"
                  }
                  subtitle={stats.upcomingPayment ? "Due" : undefined}
                  footer={
                    stats.upcomingPayment
                      ? `Next fee deadline: ${stats.upcomingPayment.dueDate}`
                      : "Next fee deadline:-"
                  }
                  variant={"primary"}
                />

                <StatCard
                  title="Active Plan"
                  value={
                    stats.activePlan
                      ? `${stats.activePlan.current}/${stats.activePlan.total}`
                      : "None"
                  }
                  subtitle={stats.activePlan ? stats.activePlan.planType : undefined}
                  footer={
                    stats.activePlan
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
                  footer="Your remaining loan balance."
                  variant="default"
                />

                <StatCard
                  title="Wallet"
                  value={
                    stats.activePlan
                      ? (stats.wallet.amount === 0
                          ? "₦0"
                          : `₦${Number(stats.wallet.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
                      : "₦-"
                  }
                  subtitle={stats.wallet.amount === 0 ? "" : stats.wallet.description}
                  footer="Fund wallet, make repayment automated."
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
                itemsPerPage={5}
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
          </div>
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { DataTable } from '@/components/dashboard/data-table';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { ProgressTrackerSkeleton } from '@/components/dashboard/progress-tracker-skeleton';
import { LoanDisbursementDrawer } from '@/components/dashboard/detail-drawer';
import { LOAN_HISTORY_COLUMNS } from '@/data';
import useAuthStore from '@/src/authStore';
import useLoan from '@/hooks/useLoan';
import useDashboard from '@/hooks/useDashboard';
import useDashboardStore from '@/src/stores/dashboardStore';
import { QuickActionsCard2 } from '@/components/dashboard/quick-actions-card';




export default function TeacherDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { stats, timelineData, loading: dashboardLoading } = useDashboard();
  const { loanHistory, paginationInfo, loading: loanLoading, handlePageChange } = useLoan();
  useDashboardStore();
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isLoading = dashboardLoading || !stats;
  const userName = user?.fullName?.split(' ')[0] || 'Teacher';

  const formatCurrency = (v: any) =>
    v !== undefined && v !== null ? `₦${Number(v).toLocaleString()}` : '₦0';

  return (
    <div className="">
      <div className="pt-6 md:pt-0">
        <h2 className="mb-2 md:mb-4 font-semibold text-[#191919] text-xl md:text-[1.6875rem]">Dashboard</h2>
        <p className="mb-5 md:mb-[1.375rem] font-semibold text-[#5F5F5F] text-lg md:text-[1.6875rem]">
          Welcome Back, {userName}
        </p>

        {/* Quick Actions */}
        <QuickActionsCard2 />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                value={stats?.upcomingPayment ? formatCurrency(stats.upcomingPayment.amount) : 'No payments'}
                subtitle={stats?.upcomingPayment?.dueDate ? `Due ${stats.upcomingPayment.dueDate}` : undefined}
                variant="primary"
              />
              <StatCard
                title="Outstanding Balance"
                value={formatCurrency(stats?.balance?.amount)}
                subtitle="Balance"
              />
              <StatCard
                title="Wallet Balance"
                value={formatCurrency(stats?.wallet?.amount)}
                subtitle="Available"
              />
              <StatCard
                title="Repayment Plan"
                value={stats?.activePlan ? `${stats.activePlan.current}/${stats.activePlan.total}` : 'N/A'}
                subtitle={stats?.activePlan?.planType ?? 'Monthly'}
              />
            </>
          )}
        </div>

        {/* Loan History + Progress Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DataTable
              title="Loan History"
              columns={LOAN_HISTORY_COLUMNS}
              data={loanHistory}
              isLoading={loanLoading}
              itemsPerPage={5}
              paginationInfo={paginationInfo}
              onPageChange={handlePageChange}
              onRowClick={(item) => { setSelectedLoan(item); setIsDrawerOpen(true); }}
            />
          </div>
          <div className="lg:col-span-1">
            {isLoading || !timelineData ? (
              <ProgressTrackerSkeleton variant="mini" />
            ) : (
              <ProgressTracker
                title="Progress Tracker"
                subtitle="Track the timeline of your loan and repayment"
                steps={timelineData.detailedTimeline}
                actionLabel="Check Timeline"
                onAction={() => router.push('/teacher-dashboard/timeline')}
                className="h-auto"
                variant="mini"
              />
            )}
          </div>
        </div>
      </div>

      {selectedLoan && (
        <LoanDisbursementDrawer
          isOpen={isDrawerOpen}
          onClose={() => { setIsDrawerOpen(false); setSelectedLoan(null); }}
          loan={{
            ...selectedLoan,
            activePlan: stats?.activePlan,
            upcomingPayment: stats?.upcomingPayment,
            balance: stats?.balance
          }}
          basePath="/teacher-dashboard"
        />
      )}
    </div>
  );
}

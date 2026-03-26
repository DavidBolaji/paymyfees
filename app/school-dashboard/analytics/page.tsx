'use client';

import { BackNavigation, DataTable } from "@/components/dashboard";
import { AnalyticsStatCards } from "@/components/wallet/analytics-stat-cards";
import { useState, useEffect } from "react";
import { fetchAnalytics, AnalyticsStats } from "@/src/utils/analytics-api";
import { TRANSACTION_COLUMNS } from "@/data";
import { TransactionDrawer } from "@/components/dashboard/detail-drawer";
import useTransaction from "@/hooks/useTransaction";
import { RechartsFundingChart } from "@/components/wallet/recharts-funding-chart";
import useWalletStore from "@/src/stores/walletStore";
import { TimelineChartSkeleton } from "@/app/dashboard/analytics/TimelineChartSkeleton";
import { TimelineChart } from "@/app/dashboard/analytics/TimelineChart";
import { BarChartIcon } from "@/assets/icons/BarChatIcon";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AnalyticsPageSkeleton } from "@/app/dashboard/analytics/AnalyticsPageSkeleton";

export default function SchoolAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const { transactions, paginationInfo: tpaginationInfo, loading: transactionLoading } = useTransaction();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { chartData, isChartLoading, fetchChartData } = useWalletStore();
  const { push } = useRouter();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAnalytics();
        setStats(data);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
    fetchChartData('6months');
  }, [fetchChartData]);

  return (
    <div className="">
      <div className="pt-6 md:pt-0">
        <BackNavigation href="/school-dashboard" label="Back to Dashboard" />

        <h1 className="text-xl md:text-2xl font-semibold text-[#191919] mb-2">Analytics</h1>
        <p className="text-sm text-gray-600 mb-6">
          Gain insights into your funding, repayment activity, and engagement across your PayMyFees school dashboard.
        </p>

        {isLoading ? (
          <AnalyticsPageSkeleton />
        ) : stats && stats.activeLoan ? (
          <>
            <AnalyticsStatCards stats={stats} isLoading={false} className="mb-8" />

            <DataTable
              title="All Transactions"
              columns={TRANSACTION_COLUMNS}
              data={transactions}
              onPageChange={() => {}}
              paginationInfo={tpaginationInfo}
              itemsPerPage={5}
              isLoading={transactionLoading}
              onRowClick={(transaction) => {
                setSelectedTransaction(transaction);
                setIsDrawerOpen(true);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-10 mt-5 gap-5">
              <div className="md:col-span-7">
                <RechartsFundingChart data={chartData} isLoading={isChartLoading} />
              </div>
              <div className="md:col-span-3">
                {isChartLoading ? (
                  <TimelineChartSkeleton />
                ) : (
                  <TimelineChart
                    completedPercentage={stats.timelineChart.completedPercentage}
                    pendingPercentage={stats.timelineChart.pendingPercentage}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="bg-gradient-to-b mb-2 from-[#002561] via-[#00296B] to-black w-20 h-20 flex items-center justify-center rounded-full">
              <BarChartIcon color="white" />
            </div>
            <h4 className="font-semibold text-lg text-[#00296B] mb-1">No Analytics Available Yet</h4>
            <p className="font-medium text-sm text-[#00296B] max-w-2xl text-center">
              Data will appear here once your school starts receiving funding and making repayments.
            </p>
            <button
              type="submit"
              onClick={() => push("/school-dashboard/apply-funding")}
              className={cn(
                "h-12 px-4 py-2 flex mt-16 items-center gap-2 rounded-lg font-medium transition-colors bg-[#00296B] text-white hover:bg-[#002561]"
              )}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Apply for Funding
            </button>
          </div>
        )}
      </div>
      <TransactionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}

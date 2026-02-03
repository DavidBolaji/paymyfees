'use client';

import { cn } from '@/lib/utils';
import { WalletStatCardSkeleton } from './wallet-stat-card-skeleton';
import { StatCard } from '@/components/dashboard/stat-card';
import { AnalyticsStats } from '@/src/utils/analytics-api';

interface AnalyticsStatCardsProps {
  stats: AnalyticsStats | null;
  isLoading: boolean;
  className?: string;
}

export function AnalyticsStatCards({ stats, isLoading, className }: AnalyticsStatCardsProps) {
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        <WalletStatCardSkeleton />
        <WalletStatCardSkeleton />
        <WalletStatCardSkeleton />
        <WalletStatCardSkeleton />
      </div>
    );
  }

  if (!stats) {
    // Empty state when no stats are available
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        <StatCard
          title="Total wallet funding"
          value="-"
          footer="Your current spendable wallet balance."
          variant="primary"
        />
        
        <StatCard
          title="Total Repayments Completed"
          value="-"
          footer="Successfully repaid installments."
        />
        
        <StatCard
          title="Repayment Progress"
          value="-"
          footer="Your progress towards full repayment."
        />
        
        <StatCard
          title="Engagement Score"
          value="-"
          footer="Based on dashboard activity & notifications."
        />
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <StatCard
        title="Total Wallet Funding"
        value={`₦${stats.totalWalletFunding.toLocaleString()}`}
        // subtitle={`Balance: ₦${stats.walletBalance.toLocaleString()}`}
        footer="Track inflow trends and wallet balance."
        variant="primary"
      />
      
      <StatCard
        title="Total Repayments Completed"
        value={`₦${stats.totalRepaymentAmount.toLocaleString()}`}
        // subtitle={`${stats.totalRepaymentsCompleted} payment${stats.totalRepaymentsCompleted !== 1 ? 's' : ''} made`}
        subtitle={"repaid"}
        footer="Repayment adherence and payment history."
      />
      
      <StatCard
        title="Repayment Progress"
        value={
          stats.activeLoan
            ? `${stats.repaymentProgress.completedInstallments}/${stats.repaymentProgress.totalInstallments}`
            : "No Active Loan"
        }
        subtitle={
          stats.activeLoan
            ? `installments completed`
            : "-"
        }
        footer="Visualize progress towards full repayment."
      />
      
      <StatCard
        title="Engagement Score"
        value={`${stats.engagementScore.percentage}%`}
        subtitle={
          stats.fundingHistory.count > 0
            ? `${stats.fundingHistory.count} wallet top-up${stats.fundingHistory.count !== 1 ? 's' : ''}`
            : "No activity yet"
        }
        // footer="Based on login, payments, and wallet activity."
        footer="Based on dashboard activity & notifications."
      />
    </div>
  );
}
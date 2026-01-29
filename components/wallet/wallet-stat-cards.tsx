'use client';

import { cn } from '@/lib/utils';
import { WalletStatCardSkeleton } from './wallet-stat-card-skeleton';
import { WalletStats } from '@/src/stores/walletStore';
import { StatCard } from '@/components/dashboard/stat-card';

interface WalletStatCardsProps {
  stats: WalletStats | null;
  isLoading: boolean;
  className?: string;
}

export function WalletStatCards({ stats, isLoading, className }: WalletStatCardsProps) {
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
          title="Wallet Balance"
          value="-"
          footer="Your current spendable wallet balance."
          variant="primary"
        />
        
        <StatCard
          title="Auto-Debit Status"
          value="-"
          footer="Deducted automatically from your wallet."
        />
        
        <StatCard
          title="Upcoming Repayment"
          value="-"
          footer="See your upcoming repayments."
        />
        
        <StatCard
          title="Funding History"
          value="-"
          footer="Your funding activity and payment patterns."
        />
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <StatCard
        title="Wallet Balance"
        value={`₦${stats.walletBalance.toLocaleString() || ''}`}
        subtitle="Available"
        footer="Your current spendable wallet balance."
        variant="primary"
      />
      
      <StatCard
        title="Auto-Debit Status"
        value={stats.autoDebitStatus}
        footer="Deducted automatically from your wallet."
      />
      
      <StatCard
        title="Upcoming Repayment"
        value={stats?.upcomingRepayment
          ? `₦${stats.upcomingRepayment?.amount.toLocaleString()}`
          : "-"
        }
        subtitle={stats?.upcomingRepayment ? `Due ${stats?.upcomingRepayment?.dueDate}` : ""}
        footer="See your upcoming repayments."
      />
      
      <StatCard
        title="Funding History"
        value={stats?.fundingHistory
          ? `${stats?.fundingHistory?.count} Top-Ups`
          : "-"
        }
        subtitle={stats?.fundingHistory ? `This ${stats?.fundingHistory?.period}` : ""}
        footer="Your funding activity and payment patterns."
      />
    </div>
  );
}

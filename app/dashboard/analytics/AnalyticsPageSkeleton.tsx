'use client';

import { cn } from '@/lib/utils';
import { WalletStatCardSkeleton } from '@/components/wallet/wallet-stat-card-skeleton';
import { TimelineChartSkeleton } from './TimelineChartSkeleton';

interface AnalyticsPageSkeletonProps {
  className?: string;
}

export function AnalyticsPageSkeleton({ className }: AnalyticsPageSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {/* Header Section */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <WalletStatCardSkeleton />
        <WalletStatCardSkeleton />
        <WalletStatCardSkeleton />
        <WalletStatCardSkeleton />
      </div>

      {/* Transactions Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        {/* Table Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded-lg" />
        </div>

        {/* Table Content */}
        <div className="space-y-4">
          {/* Table Headers */}
          <div className="grid grid-cols-5 gap-4 pb-3 border-b border-gray-200">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>

          {/* Table Rows */}
          {[...Array(5)].map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 py-3">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-5">
        {/* Funding vs Repayment Chart Skeleton */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                <div className="h-8 w-20 bg-gray-200 rounded-lg" />
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-[300px] flex items-end justify-between gap-2 px-4">
              {[...Array(12)].map((_, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gray-200 rounded-t"
                  style={{
                    height: `${Math.random() * 60 + 40}%`,
                  }}
                />
              ))}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Chart Skeleton */}
        <div className="md:col-span-3">
          <TimelineChartSkeleton />
        </div>
      </div>
    </div>
  );
}

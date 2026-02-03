'use client';

import { cn } from '@/lib/utils';

interface TimelineChartSkeletonProps {
  className?: string;
}

export function TimelineChartSkeleton({ className }: TimelineChartSkeletonProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200 p-6 animate-pulse", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-36 bg-gray-200 rounded" />
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Chart */}
      <div className="flex flex-col items-center">
        {/* Donut chart skeleton */}
        <div className="w-full max-w-[320px] h-[320px] flex items-center justify-center">
          <div className="relative w-[280px] h-[280px]">
            {/* Outer circle */}
            <div className="absolute inset-0 rounded-full border-[70px] border-gray-200" />
            {/* Inner circle (hole) */}
            <div className="absolute inset-[70px] rounded-full bg-white" />
          </div>
        </div>

        {/* Legend skeleton */}
        <div className="flex flex-col gap-3 mt-6 w-full max-w-[280px]">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-gray-200 flex-shrink-0" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-gray-200 flex-shrink-0" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { cn } from '@/lib/utils';

interface FundingChartSkeletonProps {
  className?: string;
}

export function FundingChartSkeleton({ className }: FundingChartSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 p-6 bg-white animate-pulse",
        className
      )}
    >
      {/* Header with filters skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Summary boxes skeleton */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Chart area skeleton */}
      <div className="h-[300px] bg-gray-100 rounded-lg relative">
        {/* X-axis skeleton */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-200 rounded-b-lg"></div>
        
        {/* Y-axis skeleton */}
        <div className="absolute top-0 left-0 bottom-0 w-12 bg-gray-200 rounded-l-lg"></div>
        
        {/* Chart lines skeleton */}
        <div className="absolute top-1/3 left-16 right-4 h-1 bg-gray-300 rounded"></div>
        <div className="absolute top-2/3 left-16 right-4 h-1 bg-gray-300 rounded"></div>
      </div>
      
      {/* Legend skeleton */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
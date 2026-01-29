'use client';

import { cn } from '@/lib/utils';

interface ChartCardSkeletonProps {
  className?: string;
}

export function ChartCardSkeleton({ className }: ChartCardSkeletonProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse", className)}>
      {/* Header Skeleton */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {/* Title Skeleton */}
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            {/* Subtitle Skeleton */}
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
          
          {/* Controls Skeleton */}
          <div className="flex items-center gap-3">
            {/* Search Input Skeleton */}
            <div className="w-40 h-10 bg-gray-200 rounded-lg"></div>
            
            {/* Year Selector Skeleton */}
            <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="px-6 pb-6">
        <div className="h-80 w-full bg-gray-100 rounded-lg relative">
          {/* X-axis Skeleton */}
          <div className="h-6 w-[calc(100%-12px)] bg-gray-200 rounded-lg absolute bottom-0 left-0 mx-6"></div>
          
          {/* Y-axis Skeleton */}
          <div className="w-6 h-[calc(100%-12px)] bg-gray-200 rounded-lg absolute top-0 left-0 my-6"></div>
          
          {/* Chart Line Skeleton */}
          <div className="h-1 w-3/4 bg-gray-300 rounded absolute top-1/2 left-12 transform -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
}
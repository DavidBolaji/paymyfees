'use client';

import { cn } from '@/lib/utils';

interface InfoCardSkeletonProps {
  className?: string;
  itemCount?: number;
  hasTopContent?: boolean;
}

export function InfoCardSkeleton({ 
  className, 
  itemCount = 5,
  hasTopContent = false 
}: InfoCardSkeletonProps) {
  return (
    <div className={cn("bg-white p-5 rounded-[16px] h-full animate-pulse", className)}>
      {/* Title skeleton */}
      <div className="h-5 w-32 bg-gray-200 rounded mb-5" />

      {/* Top content skeleton (for progress bar) */}
      {hasTopContent && (
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="bg-gray-200 rounded w-full h-3" />
        </div>
      )}

      {/* Items skeleton */}
      <div className="space-y-4">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className="flex justify-between items-start">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
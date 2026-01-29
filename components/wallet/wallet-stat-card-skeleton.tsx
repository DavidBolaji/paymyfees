'use client';

import { cn } from '@/lib/utils';

interface WalletStatCardSkeletonProps {
  className?: string;
}

export function WalletStatCardSkeleton({ className }: WalletStatCardSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-gray-200 p-4 bg-gray-50 animate-pulse",
        className
      )}
    >
      {/* Header with arrow icon skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="h-5 w-32 bg-gray-200 rounded"></div>
        <div className="h-5 w-5 bg-gray-200 rounded"></div>
      </div>
      
      {/* Value skeleton */}
      <div className="h-7 w-24 bg-gray-200 rounded mb-2"></div>
      
      {/* Description skeleton */}
      <div className="h-4 w-full bg-gray-200 rounded"></div>
    </div>
  );
}
'use client';

import { cn } from '@/lib/utils';

interface WalletCardSkeletonProps {
  className?: string;
}

export function WalletCardSkeleton({ className }: WalletCardSkeletonProps) {
  return (
    <div
      className={cn(
        "w-full h-[269px] rounded-[20px] px-[29px] py-[41px] relative animate-pulse",
        className
      )}
      style={{
        background: 'radial-gradient(93.3% 178.46% at 85.28% 74.17%, rgba(0, 41, 107, 0.6) 0%, rgba(0, 41, 107, 0.7) 14.77%, rgba(2, 48, 123, 0.7) 34.48%, rgba(4, 55, 138, 0.5) 54.19%, rgba(2, 28, 69, 0.6) 77.1%, rgba(0, 41, 107, 0.6) 99.37%)'
      }}
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-32 bg-white/20 rounded"></div>
        <div className="h-6 w-16 bg-white/20 rounded-md"></div>
      </div>
      
      {/* Balance Skeleton */}
      <div className="h-10 w-48 bg-white/20 rounded mb-8"></div>
      
      {/* Footer Skeleton */}
      <div className="flex items-center gap-1.5 mt-auto">
        <div className="h-4 w-4 bg-white/20 rounded-full"></div>
        <div className="h-4 w-64 bg-white/20 rounded"></div>
      </div>
    </div>
  );
}
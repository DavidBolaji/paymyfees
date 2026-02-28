'use client';

import { cn } from '@/lib/utils';

interface StatCardSkeletonProps {
  className?: string;
  variant?: 'default' | 'primary';
}

export function StatCardSkeleton({ 
  className,
  variant = 'default'
}: StatCardSkeletonProps) {
  const isActive = variant === 'primary';

  return (
    <div 
      className={cn(
        "py-6 px-4 shadow-sm relative overflow-hidden h-[148px] animate-pulse",
        className
      )}
      style={{
        borderRadius: '1.25rem', // 20px
        background: isActive 
          ? 'linear-gradient(117.13deg, #002561 15.52%, #06409D 47.53%, #033876 75.66%, #000000 119.76%)'
          : '#E6EAF0'
      }}
    >
      

      {/* Content Skeleton */}
      <div className="pr-14">
        {/* Title Skeleton */}
        <div className={cn(
          "h-4 w-24 mb-4 rounded",
          isActive ? "bg-white/20" : "bg-gray-300"
        )}></div>

        {/* Value Skeleton */}
        <div className={cn(
          "h-8 w-32 mb-[1.125rem] rounded",
          isActive ? "bg-white/20" : "bg-gray-300"
        )}></div>
        
        {/* Footer Skeleton */}
        <div className={cn(
          "h-3 md:w-40 w-5 absolute bottom-4 left-4 right-6 rounded",
          isActive ? "bg-white/20" : "bg-gray-300"
        )}></div>
      </div>
    </div>
  );
}
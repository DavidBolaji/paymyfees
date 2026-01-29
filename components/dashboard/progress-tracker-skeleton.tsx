'use client';

import { cn } from '@/lib/utils';

interface ProgressTrackerSkeletonProps {
  className?: string;
  variant?: 'mini' | 'max';
}

export function ProgressTrackerSkeleton({
  className,
  variant = 'mini'
}: ProgressTrackerSkeletonProps) {
  // Number of steps to show in skeleton based on variant
  const stepsCount = variant === 'mini' ? 5 : 9;
  
  return (
    <div className={cn("bg-white shadow-sm px-3 py-4 border border-gray-200 rounded-xl h-full flex flex-col animate-pulse overflow-hidden", className)}>
      {/* Header Skeleton */}
      <div className="mb-6">
        {/* Title Skeleton */}
        <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
        {/* Subtitle Skeleton */}
        <div className="h-4 w-56 bg-gray-200 rounded"></div>
      </div>
      
      {/* Steps Container */}
      <div className="mb-4 flex-1">
        <div className="space-y-2">
          {Array.from({ length: stepsCount }).map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              {/* Step Indicator Skeleton */}
              <div className="flex flex-col items-center">
                <div className="w-[25px] h-[25px] rounded-full bg-gray-200 flex-shrink-0"></div>
                
                {/* Connector Line Skeleton */}
                {index < stepsCount - 1 && (
                  <div className="mt-2.5 w-px h-7 bg-gray-200" />
                )}
              </div>
              
              {/* Step Content Skeleton */}
              <div className="flex-1 pt-0.5">
                {/* Title Skeleton */}
                <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                {/* Subtitle Skeleton */}
                <div className="h-3 w-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Button Skeleton */}
      <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
    </div>
  );
}
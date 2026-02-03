'use client';

import { cn } from '@/lib/utils';

interface DocumentsCardSkeletonProps {
  className?: string;
  documentCount?: number;
}

export function DocumentsCardSkeleton({ 
  className,
  documentCount = 3 
}: DocumentsCardSkeletonProps) {
  return (
    <div className={cn("bg-white p-5 rounded-[16px] h-full animate-pulse", className)}>
      {/* Title skeleton */}
      <div className="h-5 w-40 bg-gray-200 rounded mb-5" />

      {/* Documents skeleton */}
      <div className="space-y-3">
        {Array.from({ length: documentCount }).map((_, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-[#F2F2F2] p-3 border border-[#DCDCDC] rounded-[8px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-300 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-300 rounded" />
                <div className="h-3 w-16 bg-gray-300 rounded" />
              </div>
            </div>
            <div className="w-6 h-6 bg-gray-300 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
'use client';

import { cn } from '@/lib/utils';

interface PaymentMethodsSkeletonProps {
  className?: string;
}

export function PaymentMethodsSkeleton({ className }: PaymentMethodsSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 p-6 bg-white animate-pulse",
        className
      )}
    >
      {/* Header skeleton */}
      <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
      
      {/* Card skeleton */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        {/* Form fields skeleton */}
        <div className="space-y-4">
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Button skeleton */}
      <div className="h-12 w-full bg-gray-200 rounded"></div>
    </div>
  );
}
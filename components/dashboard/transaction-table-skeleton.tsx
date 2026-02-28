'use client';

import { cn } from '@/lib/utils';

interface TransactionTableSkeletonProps {
  className?: string;
  rowCount?: number;
}

export function TransactionTableSkeleton({ className, rowCount = 10 }: TransactionTableSkeletonProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[#EFEFEF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Search Skeleton */}
            <div className="flex-1 sm:flex-none">
              <div className="h-10 w-full sm:w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Filter Skeleton */}
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse hidden sm:block"></div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header Row */}
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 sm:px-6 py-3 text-left">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </th>
            </tr>
          </thead>
          
          {/* Data Rows Skeleton */}
          <tbody>
            {[...Array(rowCount)].map((_, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 sm:px-6 py-3">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="hidden md:table-cell px-4 sm:px-6 py-3">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="hidden sm:table-cell px-4 sm:px-6 py-3">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="p-4 sm:p-6 border-t border-[#EFEFEF]">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

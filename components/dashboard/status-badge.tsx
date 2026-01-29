'use client';

import { cn } from '@/lib/utils';
import { VerificationStatus } from '@prisma/client';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export interface StatusBadgeProps2 {
  status: VerificationStatus
  className?: string;
}

const statusStyles: Record<string, string> = {
  ongoing: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  ACTIVE: 'bg-orange-50 text-orange-700 border-orange-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  DISBURSED: 'bg-green-50 text-green-700 border-green-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  UNDER_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200'
};

const statusStyles2 = {
  PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
  VERIFIED: 'bg-green-50 text-green-700 border-green-200',
  // pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-red-50 text-red-700 border-red-200'
};

const statusLabels: Record<string, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  paid: 'Paid',
  pending: 'Pending',
  cancelled: 'Cancelled',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  DISBURSED: 'Disbursed',
  APPROVED: 'Approved',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
  UNDER_REVIEW: 'Under Review'
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Default style for unknown status
  const style = statusStyles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  
  // Default label for unknown status
  const label = statusLabels[status] || status;
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border",
      style,
      className
    )}>
      {label}
    </span>
  );
}

const statusLabels2 = {
  VERIFIED: 'Approved',
  EXPIRED: 'Expired',
  PENDING: 'Pending',
  REJECTED: 'Rejected'
};

export function StatusBadge2({ status, className }: StatusBadgeProps2) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border",
      statusStyles2[status],
      className
    )}>
      {statusLabels2[status]}
    </span>
  );
}
'use client';

import { cn } from '@/lib/utils';
import { VerificationStatus } from '@prisma/client';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export interface StatusBadgeProps2 {
  status: VerificationStatus;
  className?: string;
}

const statusStyles: Record<string, string> = {
  ongoing:      'bg-[#FEF4E6] text-[#DE7F05] border-[#DE7F05]',
  completed:    'bg-[#ECF9E6]  text-[#39AE04]  border-[#39AE04]',
  paid:         'bg-[#ECF9E6]  text-[#39AE04]  border-[#39AE04]',
  pending:      'bg-[#FEF4E6] text-[#DE7F05] border-[#DE7F05]',
  overdue:      'bg-[#FEE6E6]    text-[#DC0505]    border-[#DC0505]',
  cancelled:    'bg-[#FEE6E6]    text-[#DC0505]    border-[#DC0505]',
  delayed:      'bg-[#FEE6E6]    text-[#DC0505]    border-[#DC0505]',
  ACTIVE:       'bg-[#FEF4E6] text-[#DE7F05] border-[#DE7F05]',
  COMPLETED:    'bg-[#ECF9E6]  text-[#39AE04]  border-[#39AE04]',
  DISBURSED:    'bg-[#FEF4E6] text-[#DE7F05] border-[#DE7F05]',
  APPROVED:     'bg-[#FEF4E6] text-[#DE7F05] border-[#DE7F05]',
  PENDING:      'bg-[#FEF4E6] text-[#DE7F05] border-[#DE7F05]',
  OVERDUE:      'bg-[#FEE6E6]    text-[#DC0505]    border-[#DC0505]',
  CANCELLED:    'bg-[#FEE6E6]    text-[#DC0505]    border-[#DC0505]',
  UNDER_REVIEW: 'bg-[#FEF4E6] text-[#DE7F05] border-[#DE7F05]',
  OPEN:         'bg-[#FEF4E6] text-[#DE7F05] border-[#DE7F05]',
  open:         'bg-[#FEF4E6] text-[#DE7F05] border-[#DE7F05]',
  RESOLVED:     'bg-[#ECF9E6]  text-[#39AE04]  border-[#39AE04]',
  resolved:     'bg-[#ECF9E6]  text-[#39AE04]  border-[#39AE04]',
  CLOSED:       'bg-[#E3E3E3] text-[#7D7D7D] border-[#CFCFCF]',
  closed:       'bg-[#E3E3E3] text-[#7D7D7D] border-[#CFCFCF]',
  IN_PROGRESS:  'bg-[#FEF4E6] text-[#DE7F05] border-[#DE7F05]',
  in_progress:  'bg-[#FEF4E6] text-[#DE7F05] border-[#DE7F05]',
};

const statusLabels: Record<string, string> = {
  ongoing:      'Ongoing',
  completed:    'Completed',
  paid:         'Paid',
  pending:      'Pending Review',
  overdue:      'Overdue',
  cancelled:    'Cancelled',
  delayed:      'Payment Delayed',
  ACTIVE:       'Active',
  COMPLETED:    'Completed',
  DISBURSED:    'Disbursed',
  APPROVED:     'Approved',
  PENDING:      'Pending Review',
  OVERDUE:      'Overdue',
  CANCELLED:    'Cancelled',
  UNDER_REVIEW: 'Under Review',
  OPEN:         'Open',
  open:         'Open',
  RESOLVED:     'Resolved',
  resolved:     'Resolved',
  CLOSED:       'Closed',
  closed:       'Closed',
  IN_PROGRESS:  'In Progress',
  in_progress:  'In Progress',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-gray-50 text-gray-600 border-gray-400';
  const label = statusLabels[status] || status;

  return (
    <span
      className={cn(
        'w-[139px] inline-block text-center items-center px-3 py-1 rounded-[4px] text-xs font-semibold border',
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}

const statusStyles2: Record<VerificationStatus, string> = {
  PENDING:  'bg-orange-50 text-orange-500 border-orange-400',
  VERIFIED: 'bg-green-50  text-green-600  border-green-500',
  REJECTED: 'bg-red-50    text-red-600    border-red-500',
  EXPIRED:  'bg-red-50    text-red-600    border-red-500',
};

const statusLabels2: Record<VerificationStatus, string> = {
  PENDING:  'Pending Review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  EXPIRED:  'Expired',
};

export function StatusBadge2({ status, className }: StatusBadgeProps2) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border-2',
        statusStyles2[status],
        className,
      )}
    >
      {statusLabels2[status]}
    </span>
  );
}
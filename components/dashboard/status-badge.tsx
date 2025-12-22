'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'ongoing' | 'completed' | 'paid' | 'pending' | 'cancelled';
  className?: string;
}

const statusStyles = {
  ongoing: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200'
};

const statusLabels = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  paid: 'Paid',
  pending: 'Pending',
  cancelled: 'Cancelled'
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
      statusStyles[status],
      className
    )}>
      {statusLabels[status]}
    </span>
  );
}
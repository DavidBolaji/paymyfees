'use client';

import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentPlan } from '@/data/types';

interface PaymentPlanStatsProps {
  paymentPlan: PaymentPlan;
}

export function PaymentPlanStats({ paymentPlan }: PaymentPlanStatsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-[#00296B]';
      case 'overdue':
        return 'text-red-600';
      case 'completed':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'overdue':
        return 'Overdue';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
      {/* Plan Type */}
      <div className="relative bg-[#E6EAF0] p-6 rounded-xl">
        <ExternalLink className="top-4 right-4 absolute w-5 h-5 text-[#00296B]" />
        <div className="space-y-2">
          <h3 className="font-medium text-[#7C7C7C] text-sm">Plan Type</h3>
          <div className="space-y-1">
            <p className="font-black text-[#00296B] text-[1.6875rem]">
              {paymentPlan.planType}
            </p>
            <p className="text-[#7C7C7C] text-xs">
              {paymentPlan.planDuration}
            </p>
          </div>
        </div>
      </div>

      {/* Total Tuition Covered */}
      <div className="relative bg-[#E6EAF0] p-6 rounded-xl">
        <ExternalLink className="top-4 right-4 absolute w-5 h-5 text-[#00296B]" />
        <div className="space-y-2">
          <h3 className="font-medium text-[#7C7C7C] text-sm">Total Tuition Covered</h3>
          <div className="space-y-1">
            <p className="font-black text-[#00296B] text-[1.6875rem]">
              ₦{paymentPlan.totalTuition.toLocaleString()}
            </p>
            <p className="text-[#7C7C7C] text-xs">
              Paid to {paymentPlan.schoolName}
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="relative bg-[#E6EAF0] p-6 rounded-xl">
        <ExternalLink className="top-4 right-4 absolute w-5 h-5 text-[#00296B]" />
        <div className="space-y-2">
          <h3 className="font-medium text-[#7C7C7C] text-sm">Current Status</h3>
          <div className="space-y-1">
            <p className={cn("font-black text-[1.6875rem]", getStatusColor(paymentPlan.currentStatus))}>
              {getStatusText(paymentPlan.currentStatus)}
            </p>
            <p className="text-[#7C7C7C] text-xs">
              {paymentPlan.paymentsCompleted} of {paymentPlan.totalPayments} payments completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
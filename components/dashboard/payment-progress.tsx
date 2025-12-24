'use client';

import type { PaymentPlan } from '@/data/types';

interface PaymentProgressProps {
  paymentPlan: PaymentPlan;
}

export function PaymentProgress({ paymentPlan }: PaymentProgressProps) {
  return (
    <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-xl">
      <h2 className="mb-6 font-semibold text-[#191919] text-[1.125rem]">
        Repayment Progress
      </h2>

      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-[#7C7C7C] text-sm">Repayment Tracker</span>
            <span className="font-semibold text-[#00296B] text-sm">
              {paymentPlan.progress}% Completed
            </span>
          </div>
          <div className="bg-gray-200 rounded-full w-full h-3">
            <div
              className="bg-[#00296B] rounded-full h-3 transition-all duration-300"
              style={{ width: `${paymentPlan.progress}%` }}
            />
          </div>
        </div>

        {/* Progress Details */}
        <div className="gap-6 grid grid-cols-2 md:grid-cols-4">
          <div>
            <p className="mb-1 text-[#7C7C7C] text-sm">Progress:</p>
            <p className="font-semibold text-[#191919] text-lg">
              {paymentPlan.paymentsCompleted}/{paymentPlan.totalPayments} months paid
            </p>
          </div>
          <div>
            <p className="mb-1 text-[#7C7C7C] text-sm">Total Paid:</p>
            <p className="font-semibold text-[#191919] text-lg">
              ₦{paymentPlan.totalPaid.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[#7C7C7C] text-sm">Outstanding:</p>
            <p className="font-semibold text-[#191919] text-lg">
              ₦{paymentPlan.outstanding.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[#7C7C7C] text-sm">Next Repayment:</p>
            <p className="font-semibold text-[#191919] text-lg">
              ₦{paymentPlan.nextRepayment.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
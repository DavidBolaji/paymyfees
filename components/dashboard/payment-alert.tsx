'use client';

import { AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaymentPlan } from '@/data/types';

interface PaymentAlertProps {
  paymentPlan: PaymentPlan;
}

export function PaymentAlert({ paymentPlan }: PaymentAlertProps) {
  if (paymentPlan.currentStatus === 'overdue') {
    return (
      <div className="bg-red-50 p-4 border border-red-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="flex-shrink-0 mt-0.5 w-5 h-5 text-red-600" />
          <div className="flex-1">
            <p className="font-medium text-red-800 text-sm">
              Your repayment is {paymentPlan.overdueDays} days late. Make repayment now, late repayment attracts extra surcharge.
            </p>
          </div>
        </div>
        
        <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4 mt-4">
          <div className="bg-red-100 p-4 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-red-600 rounded-full w-10 h-10">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-red-800 text-sm">Payment Overdue</p>
                <p className="font-black text-red-900 text-2xl">
                  ₦{paymentPlan.overdueAmount?.toLocaleString()}
                </p>
                <p className="text-red-700 text-xs">
                  📅 {paymentPlan.nextPaymentDate} • {paymentPlan.overdueDays} Days Late. Charges may apply
                </p>
              </div>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 mt-3 w-full text-white">
              💳 Pay Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentPlan.currentStatus === 'active' && paymentPlan.nextPaymentDate) {
    return (
      <div className="bg-blue-50 p-4 border border-blue-200 rounded-xl">
        <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4">
          <div className="bg-blue-100 p-4 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-[#00296B] rounded-full w-10 h-10">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#00296B] text-sm">Next Payment Due</p>
                <p className="font-black text-[#00296B] text-2xl">
                  ₦{paymentPlan.nextRepayment.toLocaleString()}
                </p>
                <p className="text-[#00296B] text-xs">
                  📅 {paymentPlan.nextPaymentDate}
                </p>
              </div>
            </div>
            <Button className="bg-[#00296B] hover:bg-[#002561] mt-3 w-full text-white">
              💳 Pay Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
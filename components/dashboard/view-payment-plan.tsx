'use client';

import { BellIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { EmptyPaymentPlan } from './empty-payment-plan';
import type { PaymentPlan } from '@/data/types';
import { cn } from '@/lib/utils';
import { StatCard } from './stat-card';
import { InfoCard } from './info-card';
import { DataTable } from './data-table';
import { INSTALLMENT_COLUMNS } from '@/data';

interface ViewPaymentPlanProps {
  paymentPlan: PaymentPlan | null;
}

export function ViewPaymentPlan({ paymentPlan }: ViewPaymentPlanProps) {
  // If no payment plan exists, show empty state
  if (!paymentPlan) {
    return <EmptyPaymentPlan />;
  }


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

  // Progress bar component
  const ProgressBar = () => (
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
  );

  // Custom payment card for right side
  const PaymentCard = () => {
    const isOverdue = paymentPlan.currentStatus === 'overdue';

    return (
      <div className={`rounded-[20px] p-6 border-2 ${isOverdue
        ? 'bg-[#FEF2F2] border-[#EF4444]'
        : 'bg-[#F0F4FF] border-[#00296B]'
        }`}>
        {/* Header with icon and title */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${isOverdue ? 'bg-[#EF4444]' : 'bg-[#00296B]'
            }`}>
            {/* Bell icon */}

            <BellIcon color='white' />
            {/* Red notification dot for active payments */}

            <div className={cn(`top-3 left-6 absolute rounded-full w-2 h-2`, {
              "bg-white": isOverdue,
              "bg-[#EF4444]": !isOverdue
            })}></div>

          </div>
          <h3 className={`text-lg font-semibold ${isOverdue ? 'text-[#7C7C7C]' : 'text-[#7C7C7C]'
            }`}>
            {isOverdue ? 'Payment Overdue' : 'Next Payment Due'}
          </h3>
        </div>

        {/* Amount */}
        <div className="mb-4 text-center">
          <p className={`text-[2.5rem] font-black leading-none ${isOverdue ? 'text-[#EF4444]' : 'text-[#00296B]'
            }`}>
            ₦{(isOverdue ? paymentPlan.overdueAmount : paymentPlan.nextRepayment)?.toLocaleString()}
          </p>
        </div>

        {/* Date and additional info */}
        <div className="mb-6 text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <svg className={`w-4 h-4 ${isOverdue ? 'text-[#EF4444]' : 'text-[#00296B]'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" />
            </svg>
            <span className="font-medium text-[#7C7C7C]">
              {paymentPlan.nextPaymentDate}
            </span>
          </div>
          {isOverdue && (
            <p className="text-[#7C7C7C] text-sm">
              {paymentPlan.overdueDays} days Late, Charges may apply
            </p>
          )}
        </div>

        {/* Pay Now Button */}
        <Button className={`w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 ${isOverdue
          ? 'bg-[#EF4444] hover:bg-[#DC2626]'
          : 'bg-[#00296B] hover:bg-[#002561]'
          }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Pay Now
        </Button>
      </div >
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 font-semibold text-[#191919] text-[1.6875rem]">
          View Payment Plan
        </h1>
        <p className="text-[#7C7C7C] text-[15px]">
          Here&apos;s a clear breakdown of your tuition repayment schedule.
        </p>
      </div>



      {/* Stats Cards - 3 columns */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
        <StatCard
          title="Plan Type"
          value={paymentPlan.planType}
          subtitle={paymentPlan.planDuration}
          footer="You are currently on a 6 month plan."
        />
        <StatCard
          title="Total Tuition Covered"
          value={`₦${paymentPlan.totalTuition.toLocaleString()}`}
          footer={`Paid to the ${paymentPlan.schoolName}`}
        />
        <StatCard
          title="Current Status"
          value={getStatusText(paymentPlan.currentStatus)}
          footer={`${paymentPlan.paymentsCompleted} of ${paymentPlan.totalPayments} payments completed`}
        />
      </div>

      {/* 2 Column Grid Section - 8/4 split */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side - 8 columns - InfoCard */}
        <div className="lg:col-span-8">
          <InfoCard
            title="Repayment Progress"
            topContent={<ProgressBar />}
            items={[
              {
                label: 'Progress',
                value: `${paymentPlan.paymentsCompleted}/${paymentPlan.totalPayments} months paid`
              },
              {
                label: 'Total Paid',
                value: `₦${paymentPlan.totalPaid.toLocaleString()}`
              },
              {
                label: 'Outstanding',
                value: `₦${paymentPlan.outstanding.toLocaleString()}`
              },
              {
                label: 'Next Repayment',
                value: `₦${paymentPlan.nextRepayment.toLocaleString()}`
              }
            ]}
          />
        </div>

        {/* Right Side - 4 columns - Custom Payment Card */}
        <div className="lg:col-span-4">
          <PaymentCard />
        </div>
      </div>

      {/* Table Section - 6 columns out of 12 */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="md:col-span-7">
          <DataTable
            title="Installment Breakdown"
            columns={INSTALLMENT_COLUMNS}
            data={paymentPlan.installments.map(installment => ({
              installment: `${installment.installmentNumber} of ${paymentPlan.installments.length}`,
              amount: installment.amount,
              dueDate: installment.dueDate,
              status: installment.status
            }))}
            itemsPerPage={5}
            viewAllHref="#"
            searchable={false}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex sm:flex-row flex-col gap-4">
        <Button
          variant="outline"
          className="flex-1 hover:bg-gray-50 border-2 border-gray-300 h-12 text-gray-700"
        >
          Cancel
        </Button>
        <Button
          className="flex-1 bg-[#00296B] hover:bg-[#002561] h-12 text-white"
        >
          Request Payment Extension
        </Button>
      </div>
    </div>
  );
}
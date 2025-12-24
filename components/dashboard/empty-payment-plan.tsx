'use client';


import { SentIcon } from '@/assets/icons/SentIcon';
import Link from 'next/link';

export function EmptyPaymentPlan() {


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

      {/* Empty State */}
        <div className="flex flex-col justify-center items-center py-20 text-center">
              <div className="flex justify-center items-center bg-blue-50 mb-3 rounded-full w-16 h-16">
                <SentIcon size={40} />
              </div>
              
              <h3 className="mb-1 font-semibold text-[#191919] text-[1.6875rem]">
               You do not have any active payment plan
              </h3>
              
              <p className="mb-4 max-w-md text-[#5F5F5F] text-[1.075rem] leading-relaxed">
               In other to have a repayment plan you need to apply for a loan first, to apply for loan, click on the button below.
              </p>
      
              <Link href="/dashboard/apply-loan" className="flex justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] px-8 py-3 rounded-lg min-w-[200px] font-medium text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
               Apply for loan
              </Link>
            </div>
    </div>
  );
}
'use client';

import { ApplyForLoanTabs } from "@/components/dashboard/apply-for-loan-tabs";
import { BackNavigation } from "@/components/dashboard/back-navigation";



export default function ApplyForLoanPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
         <BackNavigation href="/dashboard" label="Back to Dashboard" />
        <div className="mb-6">
          <h1 className="mb-2 font-semibold text-[#191919] text-[1.6875rem]">
            Apply for loan
          </h1>
          <p className="font-medium text-[#7C7C7C] text-[15px]">
            Split your school fees into manageable payments. We pay your school directly after verification.
          </p>
        </div>
        
        <ApplyForLoanTabs />
      </div>
    </div>
  );
}
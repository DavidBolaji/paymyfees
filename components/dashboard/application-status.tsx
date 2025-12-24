'use client';

import { LoadingHourGlassIcon } from '@/assets/icons/LoadingHourGlassIcon';

import { CloseCircleIcon } from '@/assets/icons/CloseCircleIcon';
import { useState } from 'react';
import { SentIcon } from '@/assets/icons/SentIcon';

type ApplicationState = 'pending' | 'approved' | 'no-history' | 'denied';


export function ApplicationStatus() {
  // This would normally come from API/state management
  const [applicationState] = useState<ApplicationState>('approved');

  if (applicationState === 'no-history') {
    return (
      <div className="flex flex-col justify-center items-center py-20 text-center">
        <div className="flex justify-center items-center bg-blue-50 mb-8 rounded-full w-16 h-16">
          <LoadingHourGlassIcon />
        </div>
        
        <h3 className="mb-4 font-semibold text-[#292D32] text-[27px]">
          No loan history yet.!
        </h3>
        
        <p className="max-w-md text-[#7C7C7C] text-[15px] leading-relaxed">
          There is no loan history available, to be able to see a loan history, you need to apply for a loan.
        </p>
      </div>
    );
  }

  if (applicationState === 'approved') {
    return (
      <div className="flex flex-col justify-center items-center py-20 text-center">
        <div className="flex justify-center items-center bg-blue-50 mb-3 rounded-full w-16 h-16">
          <SentIcon size={40} />
        </div>
        
        <h3 className="mb-1 font-semibold text-[#191919] text-[1.6875rem]">
          Application has been approved
        </h3>
        
        <p className="mb-4 max-w-md text-[#5F5F5F] text-[1.075rem] leading-relaxed">
          The loan you requested for your tuition has been paid to your school, for repayment click on the tab below.
        </p>

        <button className="flex justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] px-8 py-3 rounded-lg min-w-[200px] font-medium text-white transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Make Repayment
        </button>
      </div>
    );
  }

  if (applicationState === 'denied') {
    return (
      <div className="flex flex-col justify-center items-center py-20 text-center">
        <div className="flex justify-center items-center bg-[#FEE6E6] mb-3 rounded-full w-16 h-16">
          <CloseCircleIcon size={40} color="#DC0505"  />
        </div>
        
        <h3 className="mb-1 font-semibold text-[#191919] text-[1.6875rem]">
         Application has been denied!
        </h3>
        
        <p className="max-w-md text-[#5F5F5F] text-[1.075rem] leading-relaxed">
         Your application has been denied due to certain reasons, you can re-apply for another loan on the apply for loan tab.
        </p>

      </div>
    );
  }

  // Pending state
  return (
    <div className="flex flex-col justify-center items-center py-20 text-center">
      <div className="flex justify-center items-center bg-blue-50 mb-3 rounded-full w-16 h-16">
        <LoadingHourGlassIcon size={40} color="#00296B" />
      </div>
      
      <h3 className="mb-1 font-semibold text-[#191919] text-[1.6875rem]">
        Application is pending
      </h3>
      
      <p className="max-w-md text-[#5F5F5F] text-[1.075rem] leading-relaxed">
        Your application is still pending. Kindly hold on for your application status to change.
      </p>
    </div>
  );
}
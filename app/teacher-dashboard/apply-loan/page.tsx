'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { TeacherApplyForLoanForm } from '@/components/teacher-dashboard/apply-for-loan-form';
import { ApplicationStatus } from '@/components/dashboard/application-status';
import { LoanHistory } from '@/components/dashboard/loan-history';

type TabType = 'apply' | 'status' | 'history';

export default function TeacherApplyForLoanPage() {
  const [activeTab, setActiveTab] = useState<TabType>('apply');

  const tabs = [
    { id: 'apply' as const, label: 'Apply for loan' },
    { id: 'status' as const, label: 'Application Status' },
    { id: 'history' as const, label: 'Loan History' },
  ];

  return (
    <div className="">
      <div className="pt-6 md:pt-0">
        <BackNavigation href="/teacher-dashboard" label="Back to Dashboard" />
        <div className="mb-6">
          <h1 className="mb-2 font-semibold text-[#191919] text-xl md:text-[1.6875rem]">
            Apply for loan
          </h1>
          <p className="font-medium text-[#7C7C7C] text-[15px]">
            Access financial support tailored for educators. Fast approval, flexible repayment options.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-gray-200 border-b -mx-0 sm:mx-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 font-semibold text-[0.7rem] sm:text-[0.8125rem] md:text-[0.925rem] text-center transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-[#00296B] text-white'
                  : 'text-[#191919] hover:text-[#00296B] hover:bg-gray-50 bg-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-6">
          <div className={activeTab === 'apply' ? '' : 'hidden'}>
            <TeacherApplyForLoanForm />
          </div>

          <div className={activeTab === 'status' ? 'py-8 text-center' : 'hidden'}>
            <ApplicationStatus />
          </div>

          <div className={activeTab === 'history' ? 'py-8' : 'hidden'}>
            <LoanHistory />
          </div>
        </div>
      </div>
    </div>
  );
}

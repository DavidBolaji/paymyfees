'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ApplyForLoanForm } from './apply-for-loan-form';
import { ApplicationStatus } from './application-status';
import { LoanHistory } from './loan-history';

type TabType = 'apply' | 'status' | 'history';

export function ApplyForLoanTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('apply');

  const tabs = [
    { id: 'apply' as const, label: 'Apply for loan' },
    { id: 'status' as const, label: 'Application Status' },
    { id: 'history' as const, label: 'Loan History' }
  ];

  return (
    <div className="">
      {/* Tab Navigation */}
      <div className="flex border-gray-200 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 px-6 py-4 font-semibold text-[0.925rem] text-center transition-colors",
              activeTab === tab.id
                ? "bg-[#00296B] text-white"
                : "text-[#191919] hover:text-[#00296B] hover:bg-gray-50 bg-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'apply' && (
          <div className="">
           <ApplyForLoanForm />
          </div>
        )}
        {activeTab === 'status' && (
          <div className="py-8 text-center">
           <ApplicationStatus />
          </div>
        )}
        {activeTab === 'history' && (
          <div className="py-8 text-center">
            <LoanHistory />
          </div>
        )}
      </div>
    </div>
  );
}
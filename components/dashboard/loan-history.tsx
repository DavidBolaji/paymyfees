'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { DataTable } from './data-table';
import { LOAN_HISTORY_COLUMNS } from '@/data';

interface LoanHistoryItem {
  loanId: string;
  tuitionAmount: number;
  repaymentPlan: string;
  status: 'ongoing' | 'completed';
  contributedTo: string;
  date: string;
}

export function LoanHistory() {
  // Mock data - this would come from API
  const [loanHistory] = useState<LoanHistoryItem[]>([
    {
      loanId: 'PMF-102-11',
      tuitionAmount: 75000,
      repaymentPlan: '5-month plan',
      status: 'ongoing',
      contributedTo: 'Springlight School',
      date: 'Jan 1 2026'
    },
    {
      loanId: 'PMF-102-11',
      tuitionAmount: 75000,
      repaymentPlan: '5-month plan',
      status: 'completed',
      contributedTo: 'Springlight School',
      date: 'Jan 1 2026'
    }
  ]);

  if (loanHistory.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-16 text-center">
        <div className="flex justify-center items-center bg-blue-100 mb-6 rounded-full w-16 h-16">
          <Clock className="w-8 h-8 text-[#00296B]" />
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

  return (
    <div className="space-y-6">
      <DataTable
        title="Loan History"
        columns={LOAN_HISTORY_COLUMNS}
        data={loanHistory}
        searchable={true}
        filterable={true}
        pagination={true}
        itemsPerPage={5}
        className="shadow-none border-0"
      />
    </div>
  );
}
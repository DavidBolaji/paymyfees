'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, X, Loader2 } from 'lucide-react';
import { InfoCard } from '@/components/dashboard/info-card';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { TimelineData } from '@/src/types';
import { fetchTimelineData } from '@/src/utils/loan-api';

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[#7C7C7C] text-sm">Repayment Tracker</span>
        <span className="font-semibold text-[#00296B] text-sm">{percentage}% Completed</span>
      </div>
      <div className="bg-[#E5E5E5] rounded-full w-full h-3">
        <div className="bg-[#00296B] rounded-full h-3" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function SchoolTimelinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loanId = searchParams?.get('loanId');

  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        setLoading(true);
        const data = await fetchTimelineData(loanId || undefined);
        setTimelineData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, [loanId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00296B]" />
      </div>
    );
  }

  if (error || !timelineData) {
    return (
      <div className="pt-6 md:pt-0">
        <BackNavigation href="/school-dashboard" label="Back to Dashboard" />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <X className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-gray-600">{error || 'No timeline data found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 md:pt-0">
      <BackNavigation href="/school-dashboard" label="Back to Dashboard" />
      <div className="mb-6">
        <h1 className="mb-2 font-semibold text-[#191919] text-xl md:text-[1.6875rem]">
          Funding Timeline
        </h1>
        <p className="font-medium text-[#7C7C7C] text-[15px]">
          Track the complete timeline of your funding application and repayments.
        </p>
      </div>

      <div className="items-stretch gap-8 grid grid-cols-1 md:grid-cols-5">
        {/* Left Column – Progress Overview + Repayment Stages */}
        <div className="space-y-6 col-span-1 md:col-span-3">
          <div className="h-fit">
            <InfoCard
              title="Progress Bar Overview"
              items={[
                { label: 'Progress', value: timelineData.progressOverview.progress },
                { label: 'Total Paid', value: timelineData.progressOverview.totalPaid },
                { label: 'Outstanding', value: timelineData.progressOverview.outstanding },
                { label: 'Next Repayment', value: timelineData.progressOverview.nextRepayment },
                { label: 'Next Repayment Date', value: timelineData.progressOverview.nextRepaymentDate },
              ]}
              topContent={
                <ProgressBar percentage={timelineData.progressOverview.percentageCompleted} />
              }
            />
          </div>
          <div className="h-fit">
            <InfoCard
              title="Repayment Stages"
              items={timelineData.repaymentStages.map((s) => ({ label: s.label, value: s.value }))}
            >
              {timelineData.disbursementReceiptUrl && (
                <button
                  className="flex items-center gap-2 font-medium text-[#00296B] text-sm hover:underline"
                  onClick={() => window.open(timelineData.disbursementReceiptUrl, '_blank')}
                >
                  <Download className="w-4 h-4" />
                  Download disbursement receipt
                </button>
              )}
            </InfoCard>
          </div>
        </div>

        {/* Right Column – Detailed Timeline */}
        <div className="col-span-1 md:col-span-2">
          <ProgressTracker
            title="Detailed Timeline"
            steps={timelineData.detailedTimeline}
            showAction={false}
            className="h-auto"
            variant="max"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={() => router.push('/school-dashboard')}
          className="flex flex-1 justify-center items-center gap-2 bg-white hover:bg-gray-50 px-6 py-3 border border-[#D1D1D1] rounded-lg font-medium text-[#7C7C7C]"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

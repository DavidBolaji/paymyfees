'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Download, X, Loader2 } from 'lucide-react';
import { InfoCard } from '@/components/dashboard/info-card';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { TimelineData } from '@/src/types';
import { fetchTimelineData } from '@/src/utils/loan-api';

// Progress bar component for the overview card
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

export default function TimelinePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loanId = searchParams?.get('loanId'); // Optional loanId from query params
    
    const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
         const loadDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [timelineData] = await Promise.all([
                    fetchTimelineData()
                ]);

                setTimelineData(timelineData);

            } catch (error) {
                console.error('Error loading dashboard data:', error);
                setError((error as Error).message)
            } finally {
                setLoading(false);

            }
        };
        loadDashboardData()
    }, [loanId]);

    if (loading) {
        return (
            <div className="bg-[#F8F9FA] p-4 md:p-6 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00296B]" />
                    <p className="text-[#7C7C7C]">Loading timeline data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#F8F9FA] p-4 md:p-6 min-h-screen">
                <BackNavigation href="/dashboard" label="Back to Dashboard" />
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <div className="text-red-500 text-center">
                        <p className="font-semibold text-lg mb-2">Error Loading Timeline</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-2 bg-[#00296B] text-white rounded-lg hover:bg-[#002561]"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // If no timeline data, this shouldn't happen as service returns empty state
    if (!timelineData) {
        return (
            <div className="bg-[#F8F9FA] p-4 md:p-6 min-h-screen">
                <BackNavigation href="/dashboard" label="Back to Dashboard" />
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <p className="text-[#7C7C7C]">No timeline data available</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-2 bg-[#00296B] text-white rounded-lg hover:bg-[#002561]"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { progressOverview, repaymentStages, detailedTimeline, disbursementReceiptUrl } = timelineData;

    // Check if this is an empty state (no loan)
    const hasNoLoan = progressOverview.progress === '0 / 0 months paid' && progressOverview.totalPaid === '-';

    // Progress overview items
    const progressOverviewItems = [
        {
            label: 'Progress',
            value: progressOverview.progress
        },
        {
            label: 'Total Paid',
            value: progressOverview.totalPaid
        },
        {
            label: 'Outstanding',
            value: progressOverview.outstanding
        },
        {
            label: 'Next Repayment',
            value: progressOverview.nextRepayment
        },
        {
            label: 'Next Repayment Date',
            value: progressOverview.nextRepaymentDate
        }
    ];

    // Repayment stages items
    const repaymentStagesItems = repaymentStages.map(stage => ({
        label: stage.label,
        value: stage.value
    }));

    return (
        <div className="bg-[#F8F9FA] min-h-screen">
            <div className="">
                <BackNavigation href="/dashboard" label="Back to Dashboard" />
                
                {/* Header */}
                <h1 className="mb-8 font-semibold text-[#5F5F5F] text-xl md:text-[1.5rem]">
                    Full Timeline Progress Tracker
                </h1>

                {/* Main Content Grid */}
                <div className="items-stretch gap-8 grid grid-cols-1 md:grid-cols-5">
                    {/* Left Column - Progress Bar Overview */}
                    <div className="space-y-6 col-span-1 md:col-span-3">
                        <div className="h-fit">
                            <InfoCard
                                title="Progress Bar Overview"
                                items={progressOverviewItems}
                                topContent={<ProgressBar percentage={progressOverview.percentageCompleted} />}
                            />
                        </div>
                        <div className='h-fit'>
                            <InfoCard
                                title="Repayment Stages"
                                items={repaymentStagesItems}
                            >
                                {disbursementReceiptUrl && !hasNoLoan && (
                                    <button 
                                        className="flex items-center gap-2 font-medium text-[#00296B] text-sm hover:underline"
                                        onClick={() => window.open(disbursementReceiptUrl, '_blank')}
                                    >
                                        <Download className="w-4 h-4" />
                                        Download disbursement receipt
                                    </button>
                                )}
                            </InfoCard>
                        </div>
                    </div>

                    {/* Right Column - Detailed Timeline */}
                    <div className='col-span-1 md:col-span-2'>
                        <ProgressTracker
                            title="Detailed Timeline"
                            steps={detailedTimeline}
                            showAction={false}
                            className="h-auto"
                            variant="max"
                        />
                    </div>
                </div>

                {/* Bottom Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="flex flex-1 justify-center items-center gap-2 bg-white hover:bg-gray-50 px-6 py-3 border border-[#D1D1D1] rounded-lg font-medium text-[#7C7C7C]"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    {hasNoLoan ? (
                        <button 
                            onClick={() => router.push('/dashboard/apply-loan')}
                            className="flex flex-1 justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] px-6 py-3 rounded-lg font-medium text-white"
                        >
                            <Check className="w-4 h-4" />
                            Apply for Loan
                        </button>
                    ) : (
                        <button 
                            onClick={() => router.push('/dashboard/wallet')}
                            className="flex flex-1 justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] px-6 py-3 rounded-lg font-medium text-white"
                        >
                            <Check className="w-4 h-4" />
                            Fund Wallet Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
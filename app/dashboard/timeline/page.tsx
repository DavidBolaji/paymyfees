'use client';

import React from 'react';
import { Check, Download, X } from 'lucide-react';
import { InfoCard } from '@/components/dashboard/info-card';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { BackNavigation } from '@/components/dashboard/back-navigation';

// Progress bar component for the overview card
function ProgressBar() {
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[#7C7C7C] text-sm">Repayment Tracker</span>
                <span className="font-semibold text-[#00296B] text-sm">60% Completed</span>
            </div>
            <div className="bg-[#E5E5E5] rounded-full w-full h-3">
                <div className="bg-[#00296B] rounded-full h-3" style={{ width: '60%' }} />
            </div>
        </div>
    );
}

export default function TimelinePage() {
    // Progress overview data
    const progressOverviewItems = [
        {
            label: 'Progress',
            value: '7 / 12 months paid'
        },
        {
            label: 'Total Paid',
            value: '₦95,000'
        },
        {
            label: 'Outstanding',
            value: '₦65,000'
        },
        {
            label: 'Next Repayment',
            value: '₦15,000'
        },
        {
            label: 'Next Repayment Date',
            value: '28 Dec 2025'
        }
    ];

    // Repayment stages data
    const repaymentStagesItems = [
        {
            label: '1st Installment Paid',
            value: '₦15,000'
        },
        {
            label: '2nd Installment Paid',
            value: '₦15,000'
        },
        {
            label: '3rd Installment Paid',
            value: '₦15,000'
        },
        {
            label: '4th Installment',
            value: 'Unpaid'
        },
        {
            label: '5th Installment',
            value: 'Unpaid'
        }
    ];

    // Detailed timeline steps
    const detailedTimelineSteps = [
        {
            id: '1',
            title: 'School Verified',
            status: 'completed' as const
        },
        {
            id: '2',
            title: 'Loan Approved',
            status: 'completed' as const
        },
        {
            id: '3',
            title: 'School Paid',
            status: 'completed' as const
        },
        {
            id: '4',
            title: '1/5 Repayment made',
            status: 'completed' as const
        },
        {
            id: '5',
            title: 'Upcoming Repayment due',
            subtitle: 'Jan 15th',
            status: 'completed' as const
        },
        {
            id: '6',
            title: '2/5 Repayment made',
            status: 'completed' as const
        },
        {
            id: '7',
            title: '3/5 Repayment made',
            status: 'completed' as const
        },
        {
            id: '8',
            title: '4/5 Repayment made',
            status: 'upcoming' as const
        },
        {
            id: '9',
            title: '5/5 Repayment made',
            status: 'upcoming' as const
        }
    ];

    return (
        <div className="bg-[#F8F9FA] p-6 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <BackNavigation href="/dashboard" label="Back to Dashboard" />
                {/* Header */}
                <h1 className="mb-8 font-semibold text-[#5F5F5F] text-[1.5rem]">
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
                                topContent={<ProgressBar />}
                            />
                        </div>
                        <div className='h-fit'>
                            <InfoCard
                                title="Repayment Stages"
                                items={repaymentStagesItems}
                            >
                                <button className="flex items-center gap-2 font-medium text-[#00296B] text-sm">
                                    <Download className="w-4 h-4" />
                                    Download disbursement receipt
                                </button>
                            </InfoCard>
                        </div>
                    </div>

                    {/* Right Column - Detailed Timeline */}
                    <div className='col-span-1 md:col-span-2'>
                        <ProgressTracker
                            title="Detailed Timeline"
                            steps={detailedTimelineSteps}
                            showAction={false}
                            className="h-auto"
                        />
                    </div>
                </div>

                {/* Bottom Buttons */}
                <div className="flex gap-4 mt-8">
                    <button className="flex flex-1 justify-center items-center gap-2 bg-white hover:bg-gray-50 px-6 py-3 border border-[#D1D1D1] rounded-lg font-medium text-[#7C7C7C]">
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button className="flex flex-1 justify-center items-center gap-2 bg-[#00296B] hover:bg-[#002561] px-6 py-3 rounded-lg font-medium text-white">
                        <Check className="w-4 h-4" />
                        Fund Wallet Now
                    </button>
                </div>
            </div>
        </div>
    );
}
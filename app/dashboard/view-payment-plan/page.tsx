'use client';

import { useState, useEffect } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { ViewPaymentPlan } from '@/components/dashboard/view-payment-plan';
import { fetchPaymentPlanData } from '@/src/utils/loan-api';
import type { PaymentPlan } from '@/data/types';
import useDashboardStore from '@/src/stores/dashboardStore';

export default function ViewPaymentPlanPage({ basePath = "/dashboard" }: { basePath?: string }) {
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedLoanId } = useDashboardStore();

  useEffect(() => {
    const loadPaymentPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching payment plan data...');
        
        // Fetch payment plan data from API
        const planData = await fetchPaymentPlanData(selectedLoanId ?? undefined);
        
        console.log('📊 Payment plan response:', planData);
        
        if (planData) {
          console.log('✅ Payment plan found:', {
            status: planData.currentStatus,
            installments: planData.installments?.length,
            totalPayments: planData.totalPayments
          });
          setPaymentPlan(planData);
        } else {
          console.log('⚠️ No active payment plan found');
          // No active payment plan found
          setPaymentPlan(null);
        }
      } catch (error) {
        console.error('❌ Error loading payment plan:', error);
        setError(error instanceof Error ? error.message : 'Failed to load payment plan');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentPlan();
  }, [selectedLoanId]);

  if (loading) {
    return (
      <div className="pt-6 md:pt-0">
        <BackNavigation href={basePath} label="Back to Dashboard" />
        
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full sm:w-96 animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton - 3 columns */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* 2 Column Grid Section Skeleton - 8/4 split */}
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-12">
            {/* Left Side - 8 columns */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
                
                {/* Progress bar skeleton */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="bg-gray-200 rounded-full w-full h-3 animate-pulse"></div>
                </div>

                {/* Info items skeleton */}
                <div className="space-y-3 mt-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - 4 columns */}
            <div className="lg:col-span-4">
              <div className="bg-gray-50 rounded-[20px] p-6 border-2 border-gray-200">
                {/* Header skeleton */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>

                {/* Amount skeleton */}
                <div className="mb-4 text-center">
                  <div className="h-12 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
                </div>

                {/* Date skeleton */}
                <div className="mb-6 text-center">
                  <div className="h-4 bg-gray-200 rounded w-40 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
                </div>

                {/* Button skeleton */}
                <div className="h-12 bg-gray-200 rounded-xl w-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Table Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="md:col-span-7">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                
                {/* Table rows skeleton */}
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <BackNavigation href={basePath} label="Back to Dashboard" />
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-4 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payment Plan</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Back Navigation */}
      <div className='md:pt-0 pt-6' />
      <BackNavigation href={basePath} label="Back to Dashboard" />
      
      {/* Payment Plan Component */}
      <ViewPaymentPlan paymentPlan={paymentPlan} />
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { ViewPaymentPlan } from '@/components/dashboard/view-payment-plan';
import { fetchPaymentPlanData } from '@/src/utils/loan-api';
import type { PaymentPlan } from '@/data/types';

export default function ViewPaymentPlanPage() {
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching payment plan data...');
        
        // Fetch payment plan data from API
        const planData = await fetchPaymentPlanData();
        
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
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-gray-600 text-lg">Loading payment plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <BackNavigation href="/dashboard" label="Back to Dashboard" />
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
    <div className="p-6">
      {/* Back Navigation */}
      <BackNavigation href="/dashboard" label="Back to Dashboard" />
      
      {/* Payment Plan Component */}
      <ViewPaymentPlan paymentPlan={paymentPlan} />
    </div>
  );
}
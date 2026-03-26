'use client';

import { useState, useEffect } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { ViewPaymentPlan } from '@/components/dashboard/view-payment-plan';
import { fetchPaymentPlanData } from '@/src/utils/loan-api';
import type { PaymentPlan } from '@/data/types';

export default function SchoolViewPaymentPlanPage() {
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const planData = await fetchPaymentPlanData();
        if (planData) {
          setPaymentPlan(planData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payment plan');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentPlan();
  }, []);

  if (loading) {
    return (
      <div className="pt-6 md:pt-0">
        <BackNavigation href="/school-dashboard" label="Back to Dashboard" />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-[#00296B] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#7C7C7C]">Loading payment plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-6 md:pt-0">
        <BackNavigation href="/school-dashboard" label="Back to Dashboard" />
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
          <p className="font-semibold text-lg text-gray-900">Error Loading Payment Plan</p>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#00296B] text-white rounded-lg hover:bg-[#002561]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 md:pt-0">
      <BackNavigation href="/school-dashboard" label="Back to Dashboard" />
      <ViewPaymentPlan paymentPlan={paymentPlan} />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { ViewPaymentPlan } from '@/components/dashboard/view-payment-plan';
import { fetchPaymentPlan } from '@/data';
import type { PaymentPlan } from '@/data/types';

export default function ViewPaymentPlanPage() {
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPaymentPlan = async () => {
      try {
        const planData = await fetchPaymentPlan();
        setPaymentPlan(planData);
      } catch (error) {
        console.error('Error loading payment plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentPlan();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
          <p className="text-gray-600">Loading payment plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Back Navigation */}
        <BackNavigation href="/dashboard" label="Back to Dashboard" />

        {/* Payment Plan Component */}
        <ViewPaymentPlan paymentPlan={paymentPlan} />
      </div>
    </div>
  );
}
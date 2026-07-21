'use client';

import { useState } from 'react';
import { X, ClipboardList } from 'lucide-react';
import { api } from '@/src/lib/api';
import useAuthStore from '@/src/authStore';
import { ParentKycForm } from '@/components/forms/parent-kyc-form';

export function KycBanner() {
  const { updateUser } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleDismiss = async () => {
    setDismissed(true);
    try {
      await api.put('/api/user/kyc', { dismiss: true });
      updateUser({ isFirstTime: false } as never);
    } catch {
      // Silently fail — the banner stays hidden for this session regardless
    }
  };

  if (dismissed) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl mb-5 overflow-hidden">
      {!showForm ? (
        <div className="flex items-start gap-3 p-4">
          <div className="flex-shrink-0 mt-0.5">
            <ClipboardList className="w-5 h-5 text-[#00296B]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#00296B] text-sm">Complete your KYC profile</p>
            <p className="mt-0.5 text-[#4a6fa5] text-xs">
              Add your employment details once and they will be automatically used for all future loan applications — no need to re-enter them each time.
            </p>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#00296B] hover:bg-[#002561] px-4 py-1.5 rounded-lg font-medium text-white text-xs transition-colors"
              >
                Complete Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-1.5 rounded-lg font-medium text-[#4a6fa5] text-xs hover:bg-blue-100 transition-colors"
              >
                Remind me later
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="flex-shrink-0 text-[#4a6fa5] hover:text-[#00296B]">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#00296B] text-base">Employment & KYC Details</h3>
            <button onClick={() => setShowForm(false)} className="text-[#4a6fa5] hover:text-[#00296B]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ParentKycForm
            onSuccess={() => {
              setDismissed(true);
            }}
            onCancel={() => setShowForm(false)}
            submitLabel="Save & Continue"
          />
        </div>
      )}
    </div>
  );
}

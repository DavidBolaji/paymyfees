'use client';

import { useState } from 'react';
import { Globe, MapPin, Loader2 } from 'lucide-react';
import { api } from '@/src/lib/api';
import useAuthStore from '@/src/authStore';

interface ResidencyModalProps {
  isOpen: boolean;
}

export function ResidencyModal({ isOpen }: ResidencyModalProps) {
  const { updateUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = async (status: 'LOCAL' | 'INTERNATIONAL') => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.put('/api/user/residency', { residencyStatus: status });
      const data = await res.json();

      if (data.success) {
        updateUser({ residencyStatus: status as any, isFirstTime: false });
      } else {
        setError(data.message || 'Failed to update. Please try again.');
        setIsSubmitting(false);
      }
    } catch {
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to PayMyFees!</h2>
          <p className="text-gray-500 text-sm">
            To personalise your experience, please let us know your student status.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Local */}
          <button
            onClick={() => handleSelect('LOCAL')}
            disabled={isSubmitting}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-[#00296B] hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <MapPin className="w-7 h-7 text-[#00296B]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Local Student</p>
              <p className="text-gray-500 text-xs mt-0.5">Studying in Nigeria</p>
            </div>
          </button>

          {/* International */}
          <button
            onClick={() => handleSelect('INTERNATIONAL')}
            disabled={isSubmitting}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-[#00296B] hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Globe className="w-7 h-7 text-[#00296B]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">International</p>
              <p className="text-gray-500 text-xs mt-0.5">Studying abroad</p>
            </div>
          </button>
        </div>

        {isSubmitting && (
          <div className="flex items-center justify-center gap-2 text-[#00296B] text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving your preference...</span>
          </div>
        )}

        {error && (
          <p className="text-center text-red-600 text-sm">{error}</p>
        )}

        <p className="text-center text-gray-400 text-xs mt-4">
          This helps us show you the right loan options. You can change this later in your profile.
        </p>
      </div>
    </div>
  );
}

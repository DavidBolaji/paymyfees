'use client';

import { CheckBoldIcon } from '@/assets/icons/CheckBoldIcon';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = 'Action Successful',
  message,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#F2F2F2] flex flex-col items-center justify-center"
        style={{ width: '390px', maxWidth: '90vw', padding: '23px 15px', minHeight: '256px' }}
      >
        <div className="w-20 h-20 mb-6 rounded-full flex items-center justify-center bg-[#00296B]">
          <CheckBoldIcon color="white" />
        </div>
        <h3 className="text-2xl font-bold text-[#191919] text-center">{title}</h3>
        {message && (
          <p className="mt-2 text-sm text-[#7C7C7C] text-center">{message}</p>
        )}
      </div>
    </div>
  );
}

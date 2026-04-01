'use client';

import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { CustomInput } from '@/components/ui/custom-input';

interface FlagAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; notes: string }) => void;
  loading?: boolean;
}

const REASONS = [
  { value: 'suspected_fraud', label: 'Suspected Fraud' },
  { value: 'identity_mismatch', label: 'Identity Mismatch' },
  { value: 'multiple_missed_payments', label: 'Multiple Missed Payments' },
  { value: 'suspicious_activity', label: 'Suspicious Activity' },
  { value: 'false_information', label: 'False Information Provided' },
];

export function FlagAccountModal({ isOpen, onClose, onConfirm, loading }: FlagAccountModalProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleConfirm = () => {
    if (!reason) return;
    onConfirm({ reason, notes });
  };

  const handleClose = () => {
    setReason('');
    setNotes('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#F2F2F2]"
        style={{ width: '644px', maxWidth: '90vw', padding: '23px 15px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-5">
          <h3 className="text-2xl font-bold text-[#191919]">Flag Account</h3>
        </div>

        {/* Content */}
        <div className="space-y-5">
          <CustomInput
            label="Reason for Flag"
            type="select"
            value={reason}
            onChange={setReason}
            options={REASONS}
            placeholder="Select reason..."
          />

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-[#292929]">Admin Note</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add admin notes..."
              className="w-full h-20 px-3 py-2 rounded-lg border border-[#d1d1d1] bg-[#f5f5f5] focus:outline-none text-[#292929] placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleClose}
              className="h-12 rounded-lg border-2 border-[#00296B] bg-white text-[#00296B] font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !reason}
              className="h-12 rounded-lg bg-[#00296B] text-white font-semibold hover:bg-[#003D82] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Flag Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

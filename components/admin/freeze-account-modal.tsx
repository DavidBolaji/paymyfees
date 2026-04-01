'use client';

import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { CustomInput } from '@/components/ui/custom-input';

interface FreezeAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; notes: string; duration: string }) => void;
  loading?: boolean;
}

const REASONS = [
  { value: 'missed_multiple_payments', label: 'Missed Multiple Payments' },
  { value: 'incomplete_documentation', label: 'Incomplete Documentation' },
  { value: 'suspected_fraudulent_activity', label: 'Suspected Fraudulent Activity' },
];

const DURATIONS = [
  { value: '7_days', label: '7 Days' },
  { value: '14_days', label: '14 Days' },
  { value: '30_days', label: '30 Days' },
  { value: '90_days', label: '90 Days' },
  { value: 'indefinite', label: 'Indefinite' },
];

export function FreezeAccountModal({ isOpen, onClose, onConfirm, loading }: FreezeAccountModalProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('7_days');

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleConfirm = () => {
    if (!reason) return;
    onConfirm({ reason, notes, duration });
  };

  const handleClose = () => {
    setReason('');
    setNotes('');
    setDuration('7_days');
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
          <h3 className="text-2xl font-bold text-[#191919]">Temporarily Freeze Account</h3>
        </div>

        {/* Content */}
        <div className="space-y-5">
          <CustomInput
            label="Select Reason for Freeze"
            type="select"
            value={reason}
            onChange={setReason}
            options={REASONS}
          />

          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-[#292929]">Internal Admin Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes..."
              className="w-full h-20 px-3 py-2 rounded-lg border border-[#d1d1d1] bg-[#f5f5f5] focus:outline-none text-[#292929] placeholder:text-gray-400 resize-none"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-semibold text-[#292929]">Duration</label>
            <div className="flex items-center gap-4">
              {DURATIONS.map((d) => (
                <label key={d.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="freeze-duration"
                    value={d.value}
                    checked={duration === d.value}
                    onChange={() => setDuration(d.value)}
                    className="w-4 h-4 text-[#00296B] border-gray-300"
                  />
                  <span className="text-sm text-[#292929]">{d.label}</span>
                </label>
              ))}
            </div>
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
                  Confirm &amp; Freeze Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { CustomInput } from '@/components/ui/custom-input';

interface RequestDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { documents: string; instructions: string; channels: string[] }) => void;
  loading?: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'CAC_DOCUMENT', label: 'CAC Document' },
  { value: 'BANK_STATEMENT', label: 'Bank Statement' },
  { value: 'SCHOOL_INVOICE', label: 'School Invoice' },
  { value: 'PASSPORT', label: 'Passport / Photo ID' },
  { value: 'SALARY_SLIP', label: 'Salary Slip' },
  { value: 'OTHER', label: 'Other' },
];

const CHANNELS = [
  { id: 'email', label: 'Email Notification' },
  { id: 'in_app', label: 'In App Notification' },
  { id: 'sms', label: 'SMS' },
];

export function RequestDocumentsModal({ isOpen, onClose, onConfirm, loading }: RequestDocumentsModalProps) {
  const [documents, setDocuments] = useState('');
  const [instructions, setInstructions] = useState('');
  const [channels, setChannels] = useState<string[]>(['email']);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const toggleChannel = (ch: string) => {
    setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  const handleConfirm = () => {
    if (!documents) return;
    onConfirm({ documents, instructions, channels });
  };

  const handleClose = () => {
    setDocuments('');
    setInstructions('');
    setChannels(['email']);
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
          <h3 className="text-2xl font-bold text-[#191919]">Request Additional Documents</h3>
        </div>

        {/* Content */}
        <div className="space-y-5">
          <CustomInput
            label="Required Documents"
            type="select"
            value={documents}
            onChange={setDocuments}
            options={DOCUMENT_TYPES}
            placeholder="Select document type..."
          />

          <CustomInput
            label="Additional Instructions"
            type="text"
            value={instructions}
            onChange={setInstructions}
            placeholder="E.g. Please submit within 5 working days"
          />

          <div className="flex flex-col space-y-2">
            <label className="font-semibold text-[#292929]">Send Notification</label>
            <div className="space-y-2">
              {CHANNELS.map((ch) => (
                <label key={ch.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.includes(ch.id)}
                    onChange={() => toggleChannel(ch.id)}
                    className="w-4 h-4 text-[#00296B] border-gray-300 rounded"
                  />
                  <span className="text-sm text-[#292929]">{ch.label}</span>
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
              disabled={loading || !documents}
              className="h-12 rounded-lg bg-[#00296B] text-white font-semibold hover:bg-[#003D82] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm &amp; Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

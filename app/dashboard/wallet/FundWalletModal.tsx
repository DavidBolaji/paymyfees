'use client';

import { useState } from 'react';
import { X, Copy, CheckCircle2, Building2 } from 'lucide-react';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  virtualAccountNumber?: string | null;
  virtualAccountBank?: string | null;
  virtualAccountName?: string | null;
}

export default function FundWalletModal({
  isOpen,
  onClose,
  virtualAccountNumber,
  virtualAccountBank,
  virtualAccountName,
}: FundWalletModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCopy = async () => {
    if (!virtualAccountNumber) return;
    try {
      await navigator.clipboard.writeText(virtualAccountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = virtualAccountNumber;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#F2F2F2]"
        style={{ width: '520px', maxWidth: '90vw', padding: '28px 24px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#191919]">Fund Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {virtualAccountNumber ? (
          <>
            {/* Instruction */}
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Transfer any amount to the account number below from any Nigerian bank. Your wallet
              will be credited automatically once the transfer is confirmed.
            </p>

            {/* Account Card */}
            <div className="rounded-xl border-2 border-[#00296B]/20 bg-[#F0F4FF] p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#00296B] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Bank Name</p>
                  <p className="text-base font-semibold text-[#191919]">{virtualAccountBank || '—'}</p>
                </div>
              </div>

              {virtualAccountName && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Account Name</p>
                  <p className="text-base font-semibold text-[#191919]">{virtualAccountName}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Account Number</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold tracking-widest text-[#00296B]">
                    {virtualAccountNumber}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#00296B] text-white hover:bg-[#003D82] transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2 mb-6">
              {[
                'Open your bank app or USSD',
                `Transfer any amount to the account number above (${virtualAccountBank})`,
                'Your wallet balance updates automatically within minutes',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#00296B] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
                <circle cx="8" cy="8" r="7" stroke="#D97706" strokeWidth="1.5" />
                <path d="M8 4.5V5.5M8 7.5V11.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-xs text-amber-800 leading-relaxed">
                This is a dedicated account assigned only to you. Transfers from any bank are accepted. Keep this number safe — do not share it.
              </p>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 text-sm mb-1">Virtual account not set up yet.</p>
            <p className="text-gray-400 text-xs">Please contact support or try refreshing the page.</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full h-11 rounded-lg border-2 border-[#00296B] bg-white text-[#00296B] font-semibold hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

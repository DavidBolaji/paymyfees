'use client';

import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { CustomInput } from '@/components/ui/custom-input';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FundWalletModal({ isOpen, onClose }: FundWalletModalProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFundWallet = () => {
    // Handle fund wallet logic here
    console.log({ amount, currency, paymentMethod, note });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-[#F2F2F2]"
        style={{
          width: '644px',
          maxWidth: '90vw',
          padding: '23px 15px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#191919]">Add Funds</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5">
          {/* Amount and Payment Method Row */}
          <div className="grid grid-cols-2 gap-5">
            <CustomInput
              label="Amount to Add"
              type="number"
              value={amount}
              onChange={setAmount}
              placeholder="Enter Amount"
              price={true}
            />
            
            <CustomInput
              label="Payment Method"
              type="select"
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={[
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Card Payment', label: 'Card Payment' },
                { value: 'Ussd Code', label: 'Ussd Code' },
              ]}
            />
          </div>

          {/* Select Currency */}
          <CustomInput
            label="Select Currency"
            type="select"
            value={currency}
            onChange={setCurrency}
            options={[
              { value: 'NGN', label: 'NGN (₦)' },
              { value: 'USD', label: 'USD ($)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'EUR', label: 'EUR (€)' },
            ]}
          />

          {/* Note (Optional) */}
          <div className="flex flex-col space-y-1">
            <label className="font-semibold text-[#292929]">Note (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any reference or not for your top-up"
              className="w-full h-20 px-3 py-2 rounded-lg border border-[#d1d1d1] bg-[#f5f5f5] focus:outline-none text-[#292929] placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="h-12 rounded-lg border-2 border-[#00296B] bg-white text-[#00296B] font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              onClick={handleFundWallet}
              className="h-12 rounded-lg bg-[#00296B] text-white font-semibold hover:bg-[#003D82] transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Fund Wallet Now
            </button>
          </div>

          {/* Info Text */}
          <div className="flex items-start gap-2 pt-2">
            <div className="w-4 h-4 mt-0.5 flex-shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="8" r="7" stroke="#00296B" strokeWidth="1.5" />
                <path
                  d="M8 4.5V5.5M8 7.5V11.5"
                  stroke="#00296B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Wallet funds are automatically applied to upcoming repayments. You can view your payment schedule under "View Payment Plan"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

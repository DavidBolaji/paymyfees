'use client';

import React from 'react';

interface WalletCardProps {
  balance: number;
  currency?: string;
}

const WalletCard: React.FC<WalletCardProps> = ({ balance, currency = 'NGN' }) => {
  return (
    <div
      className="w-full h-[269px] rounded-[20px] px-[29px] py-[41px] relative text-white font-sans shadow-xl overflow-hidden"
      style={{
        background: 'radial-gradient(93.3% 178.46% at 85.28% 74.17%, rgba(0, 41, 107, 0.8) 0%, #00296B 14.77%, #02307B 34.48%, rgba(4, 55, 138, 0.7) 54.19%, rgba(2, 28, 69, 0.85) 77.1%, #00296B 99.37%)'
      }}
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-[21px] h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className='flex items-center gap-1'>
            <span className="text-[11px] font-normal text-white/90">Available Balance</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-90"
            >
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M6 4V4.5M6 6V8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
          <button className="bg-white/10 backdrop-blur-sm rounded-md px-2.5 py-1 text-[11px] font-medium flex items-center gap-1 hover:bg-white/15 transition-colors border border-white/20">
            {currency}
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Balance */}
        <div className="text-[40px] font-bold tracking-tight leading-none">
          ₦{balance.toLocaleString()}
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-1.5 text-[10px] text-white/80 leading-tight mt-auto">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M6 4V4.5M6 6V8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <span>Your available balance can be used for automatic repayments.</span>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;

'use client';

import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';

interface WalletCardProps {
  balance: number;
  currency?: string;
}

const WalletCard: React.FC<WalletCardProps> = ({ balance, currency = 'NGN' }) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  return (
    <div
      className="w-full h-[180px] sm:h-[220px] md:h-[269px] rounded-[20px] px-4 sm:px-5 md:px-[29px] py-5 sm:py-7 md:py-[41px] relative text-white font-sans shadow-xl overflow-hidden"
      style={{
        background: 'radial-gradient(93.3% 178.46% at 85.28% 74.17%, rgba(0, 41, 107, 0.8) 0%, #00296B 14.77%, #02307B 34.48%, rgba(4, 55, 138, 0.7) 54.19%, rgba(2, 28, 69, 0.85) 77.1%, #00296B 99.37%)'
      }}
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-[21px] h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className='flex items-center gap-1'>
            <span className="text-xs sm:text-sm font-semibold text-white/90">Available Balance</span>
            <button
              onClick={toggleBalanceVisibility}
              className="p-0 hover:opacity-80 transition-opacity cursor-pointer"
            >
              {isBalanceVisible ? (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              ) : (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              )}
            </button>
          </div>
          <button className="bg-[#97979766] backdrop-blur-sm rounded-[12px] px-2 sm:px-2.5 py-0.5 sm:py-1 text-base sm:text-xl font-medium flex items-center gap-1 transition-colors border border-white/20 w-[70px] sm:w-[89px] h-[32px] sm:h-[44px]">
            {currency}
            <svg
              width="16"
              height="16"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:w-5 sm:h-5"
            >
              <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Balance */}
        <div className="text-2xl sm:text-4xl md:text-[48px] font-bold tracking-tight leading-none">
          {isBalanceVisible ? `₦${balance.toLocaleString()}` : '••••••'}
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] text-white/80 leading-tight mt-auto">
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0 sm:w-3 sm:h-3"
          >
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M6 4V4.5M6 6V8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <span className='text-[8px] sm:text-[11px]'>Your available balance can be used for automatic repayments.</span>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;

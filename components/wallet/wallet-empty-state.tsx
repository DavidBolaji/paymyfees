'use client';

import Image from 'next/image';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletEmptyStateProps {
  className?: string;
  onFundWallet?: () => void;
}

export function WalletEmptyState({ className, onFundWallet }: WalletEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      {/* Empty state illustration */}
      <div className="relative w-64 h-64 mb-6">
        <Image
          src="/assets/wallet/empty.png"
          alt="Empty wallet"
          fill
          className="object-contain"
          priority
        />
      </div>
      
      {/* Empty state message */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Your wallet is empty</h3>
      <p className="text-gray-600 text-center max-w-md mb-8">
        Add funds to your wallet to enable seamless repayments and avoid missed deadlines.
        Your wallet balance can be used for automatic repayments.
      </p>
      
      {/* Action button */}
      <button
        onClick={onFundWallet}
        className="flex items-center gap-2 px-6 py-3 bg-[#00296B] text-white rounded-lg hover:bg-[#003D82] transition-colors"
      >
        <Wallet className="w-5 h-5" />
        <span>Fund Wallet Now</span>
      </button>
    </div>
  );
}
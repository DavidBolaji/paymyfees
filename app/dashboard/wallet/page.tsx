'use client';

import { useState } from 'react';
import { Send, Wallet } from 'lucide-react';
import { DataTable } from '@/components/dashboard/data-table';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { walletTransactionsData } from '@/data/mock';
import { WALLET_TRANSACTION_COLUMNS } from '@/data/constants';
import WalletCard from './WalletCard';
import FundWalletModal from './FundWalletModal';

export default function WalletPage() {
  const [walletBalance] = useState(50000);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="">
        <BackNavigation href="/dashboard" label="Back to Dashboard" />

        <h1 className="text-2xl font-semibold text-[#191919] mb-2">Fund Wallet</h1>
        <p className="text-sm text-gray-600 mb-6">
          Add money to your wallet to enable seamless repayments and avoid missed deadlines.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Wallet Card */}
          <div className="w-full col-span-1">
            <WalletCard balance={59000} currency="NGN" />
          </div>

          {/* Quick Actions Card */}
          <div className="w-full col-span-1">
            <div className="h-full rounded-[16px] border-2 border-[#00296B] p-8 bg-[#C5D3E8] flex flex-col">
              <h2 className="text-lg font-semibold text-[#191919] mb-6">Quick Actions</h2>
              <div className="flex-1 flex items-center justify-center gap-12">
                {/* Make Repayment */}
                <div className="flex flex-col items-center gap-3">
                  <button className="w-16 h-16 rounded-full bg-[#00296B] flex items-center justify-center hover:bg-[#003D82] transition-colors">
                    <Send className="w-6 h-6 text-white" />
                  </button>
                  <span className="text-sm font-medium text-[#191919]">Make Repayment</span>
                </div>

                {/* Fund Wallet */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => setIsFundModalOpen(true)}
                    className="w-16 h-16 rounded-full bg-[#00296B] flex items-center justify-center hover:bg-[#003D82] transition-colors"
                  >
                    <Wallet className="w-6 h-6 text-white" />
                  </button>
                  <span className="text-sm font-medium text-[#191919]">Fund Wallet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DataTable
          title="Wallet & Repayment Activity"
          columns={WALLET_TRANSACTION_COLUMNS}
          data={walletTransactionsData}
          itemsPerPage={5}
          onRowClick={(item) => console.log('Wallet transaction clicked:', item)}
        />
      </div>

      {/* Fund Wallet Modal */}
      <FundWalletModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
      />
    </div>
  );
}

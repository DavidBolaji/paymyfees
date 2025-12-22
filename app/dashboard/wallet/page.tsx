'use client';

import { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { DataTable } from '@/components/dashboard/data-table';
import { walletTransactionsData, WALLET_TRANSACTION_COLUMNS } from '@/data';

export default function WalletPage() {
  const [walletBalance] = useState(50000);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wallet</h1>
          <p className="text-gray-600">Manage your wallet balance and transactions</p>
        </div>

        {/* Wallet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Available Balance"
            value={`₦${walletBalance.toLocaleString()}`}
            subtitle="Ready for payments"
            variant="primary"
          />
          
          <StatCard
            title="Total Credits"
            value="₦125,000"
            subtitle="This month"
            trend="up"
          />
          
          <StatCard
            title="Total Debits"
            value="₦75,000"
            subtitle="This month"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Add Money</span>
            </div>
          </button>

          <button className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">Send Money</span>
            </div>
          </button>

          <button className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <ArrowDownLeft className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">Request Money</span>
            </div>
          </button>

          <button className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                <CreditCard className="w-5 h-5 text-orange-600" />
              </div>
              <span className="font-medium text-gray-900">Pay Bills</span>
            </div>
          </button>
        </div>

        {/* Transaction History */}
        <DataTable
          title="Wallet Transactions"
          columns={WALLET_TRANSACTION_COLUMNS}
          data={walletTransactionsData}
          viewAllHref="/dashboard/wallet/transactions"
        />
      </div>
    </div>
  );
}
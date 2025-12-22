'use client';

import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Track your financial performance and loan analytics</p>
        </div>

        {/* Analytics Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Borrowed"
            value="₦450,000"
            subtitle="Lifetime loan amount"
            trend="up"
          />
          
          <StatCard
            title="Total Repaid"
            value="₦320,000"
            subtitle="Successfully repaid"
            trend="up"
          />
          
          <StatCard
            title="Active Loans"
            value="2"
            subtitle="Currently active"
          />
          
          <StatCard
            title="Credit Score"
            value="750"
            subtitle="Excellent rating"
            variant="success"
          />
        </div>

        {/* Analytics Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Loan Performance</h2>
            </div>
            <p className="text-gray-600">Your loan performance metrics and trends will be displayed here.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Repayment Trends</h2>
            </div>
            <p className="text-gray-600">Track your repayment patterns and upcoming obligations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
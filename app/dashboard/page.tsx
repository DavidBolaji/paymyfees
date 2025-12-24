'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Edit3,
  Calendar,
  Send,
  Building,
  Wallet as WalletIcon
} from 'lucide-react';

import { StatCard } from '@/components/dashboard/stat-card';
import { DataTable } from '@/components/dashboard/data-table';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { InstantActions } from '@/components/dashboard/instant-actions';
import { ChartCard } from '@/components/dashboard/chart-card';

import {
  fetchDashboardStats,
  fetchLoanHistory,
  fetchRecentTransactions,
  fetchChartData,
  progressSteps,
  LOAN_HISTORY_COLUMNS,
  TRANSACTION_COLUMNS,
  INSTANT_ACTIONS
} from '@/data';

interface DashboardStats {
  upcomingPayment: { amount: number; dueDate: string };
  activePlan: { current: number; total: number; planType: string };
  balance: { amount: number; description: string };
  wallet: { amount: number; description: string };
}

interface LoanHistoryItem {
  loanId: string;
  tuitionAmount: number;
  repaymentPlan: string;
  status: string;
  contributedTo: string;
  date: string;
}

interface TransactionItem {
  date: string;
  description: string;
  amount: number;
  method: string;
  status: string;
}

interface ChartDataItem {
  month: string;
  value: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loanHistory, setLoanHistory] = useState<LoanHistoryItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, loanData, transactionData, chartDataResult] = await Promise.all([
          fetchDashboardStats(),
          fetchLoanHistory(),
          fetchRecentTransactions(),
          fetchChartData(selectedYear)
        ]);

        setStats(statsData);
        setLoanHistory(loanData);
        setTransactions(transactionData);
        setChartData(chartDataResult);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedYear]);

  const handleYearChange = async (year: string) => {
    setSelectedYear(year);
    const newChartData = await fetchChartData(year);
    setChartData(newChartData);
  };

  const handleChartSearch = (query: string) => {
    // Handle chart search functionality
    console.log('Chart search:', query);
  };



  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <h2 className='mb-[0.56rem] font-semibold text-[#191919] text-[1.6875rem]'>Dashboard</h2>
          <h2 className='mb-[1.375rem] font-semibold text-[#5F5F5F] text-[1.6875rem]'>Welcome Back, Aanu</h2>
          {/* Stats Grid */}
          <div className="gap-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Upcoming Payment"
              value={`₦${stats.upcomingPayment.amount.toLocaleString()}`}
              subtitle={`Due`}
              footer={` Next fee deadline: ${stats.upcomingPayment.dueDate}`}
              variant="primary"
              trend="up"
            />

            <StatCard
              title="Active Plan"
              value={`${stats.activePlan.current}/${stats.activePlan.total}`}
              subtitle={stats.activePlan.planType}
              footer={`You’re doing great. Two more to go`}
            />

            <StatCard
              title="Balance"
              value={`₦${stats.balance.amount.toLocaleString()}`}
              subtitle={stats.balance.description}
              footer={'Your remaining loan balance.'}
            />

            <StatCard
              title="Wallet"
              value={`₦${stats.wallet.amount.toLocaleString()}`}
              subtitle={stats.wallet.description}
              footer={`Fund to make repayment automated.`}
            />
          </div>

          {/* Main Content Grid */}
          <div className="items-stretch gap-6 grid grid-cols-1 lg:grid-cols-4 mb-8">
            {/* Loan History Table */}
            <div className="lg:col-span-3 h-full">
              <DataTable
                title="Loan / Disbursement History"
                columns={LOAN_HISTORY_COLUMNS}
                data={loanHistory}
                viewAllHref="/dashboard/loans"
                itemsPerPage={5}
                onRowClick={(loan) => {
                  console.log('Loan clicked:', loan);
                }}
              />
            </div>

            {/* Progress Tracker */}
            <div className="h-full">
              <ProgressTracker
                title="Progress Tracker"
                subtitle="Track the timeline of your loan and repayment"
                steps={progressSteps}
                onAction={() => router.push('/dashboard/timeline')}
              />
            </div>
          </div>


          {/* Bottom Section */}
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
            {/* Recent Transactions */}
            <div className="space-y-6 lg:col-span-2">
              <DataTable
                title="Recent Transactions"
                columns={TRANSACTION_COLUMNS}
                data={transactions}
                viewAllHref="/dashboard/transactions"
                itemsPerPage={5}
                onRowClick={(transaction) => {
                  console.log('Transaction clicked:', transaction);
                }}
              />

            </div>

            {/* Instant Actions */}
            <div>
              <InstantActions
                title="Instant Actions"
                subtitle="Handle key tasks in seconds."
                actions={INSTANT_ACTIONS.map(action => ({
                  ...action,
                  icon: action.id === 'apply-loan' ? Edit3 :
                    action.id === 'view-payment-plan' ? Calendar :
                      action.id === 'make-payment' ? Send :
                        action.id === 'update-school' ? Building :
                          WalletIcon,
                  onClick: () => {
                    if (action.id === 'apply-loan') {
                      router.push('/dashboard/apply-loan');
                    } else if (action.id === 'view-payment-plan') {
                      router.push('/dashboard/view-payment-plan');
                    } else {
                      console.log(action.title);
                    }
                  }
                }))}
                onViewAll={() => console.log('View all actions')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 mt-8">
            <div className="lg:col-span-3">
              <ChartCard
                title="Loan Borrowed Overtime"
                subtitle="See your loan borrowed chart on paymyfees"
                data={chartData}
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
                searchPlaceholder="Search"
                onSearch={handleChartSearch}
              />
            </div>
            <div className='lg:col-span-1'/>
          </div>
        </div>
      </div>
    </>
  );
}
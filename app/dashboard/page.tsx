'use client';

import { useState, useEffect } from 'react';
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
import { LoanDisbursementDrawer, TransactionDrawer } from '@/components/dashboard';

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loanHistory, setLoanHistory] = useState<LoanHistoryItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [loading, setLoading] = useState(true);
  
  // Drawer states
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isLoanDrawerOpen, setIsLoanDrawerOpen] = useState(false);
  const [isTransactionDrawerOpen, setIsTransactionDrawerOpen] = useState(false);

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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
            <h2 className='text-[#191919] font-semibold text-[1.6875rem] mb-[0.56rem]'>Dashboard</h2>
            <h2 className='text-[#5F5F5F] font-semibold text-[1.6875rem] mb-[1.375rem]'>Welcome Back, Aanu</h2>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8 gap-2">
              <StatCard
                title="Upcoming Payment"
                value={`₦${stats.upcomingPayment.amount.toLocaleString()}`}
                subtitle={`Due ${stats.upcomingPayment.dueDate}`}
                variant="primary"
                trend="up"
              />
              
              <StatCard
                title="Active Plan"
                value={`${stats.activePlan.current}/${stats.activePlan.total}`}
                subtitle={stats.activePlan.planType}
              />
              
              <StatCard
                title="Balance"
                value={`₦${stats.balance.amount.toLocaleString()}`}
                subtitle={stats.balance.description}
              />
              
              <StatCard
                title="Wallet"
                value={`₦${stats.wallet.amount.toLocaleString()}`}
                subtitle={stats.wallet.description}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Loan History Table */}
              <div className="lg:col-span-3">
                <DataTable
                  title="Loan / Disbursement History"
                  columns={LOAN_HISTORY_COLUMNS}
                  data={loanHistory}
                  viewAllHref="/dashboard/loans"
                  onRowClick={(loan) => {
                    setSelectedLoan(loan);
                    setIsLoanDrawerOpen(true);
                  }}
                />
              </div>

              {/* Progress Tracker */}
              <div>
                <ProgressTracker
                  title="Progress Tracker"
                  subtitle="Track the timeline of your loan and repayment"
                  steps={progressSteps}
                  onAction={() => console.log('View full timeline')}
                />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Transactions */}
              <div className="lg:col-span-2 space-y-6">
                <DataTable
                  title="Recent Transactions"
                  columns={TRANSACTION_COLUMNS}
                  data={transactions}
                  viewAllHref="/dashboard/transactions"
                  onRowClick={(transaction) => {
                    setSelectedTransaction(transaction);
                    setIsTransactionDrawerOpen(true);
                  }}
                />

                {/* Chart */}
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
                    onClick: () => console.log(action.title)
                  }))}
                  onViewAll={() => console.log('View all actions')}
                />
              </div>
            </div>
      </div>
    </div>

    {/* Drawers */}
    <LoanDisbursementDrawer
      isOpen={isLoanDrawerOpen}
      onClose={() => setIsLoanDrawerOpen(false)}
      loan={selectedLoan}
    />
    
    <TransactionDrawer
      isOpen={isTransactionDrawerOpen}
      onClose={() => setIsTransactionDrawerOpen(false)}
      transaction={selectedTransaction}
    />
    </>
  );
}
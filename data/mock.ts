// Mock data for dashboard components
import type { 
  LoanHistoryItem, 
  TransactionItem, 
  ProgressStep, 
  ChartDataItem, 
  DashboardStats 
} from './types';

export const loanHistoryData: LoanHistoryItem[] = [
  {
    loanId: 'PMF-SIG-11',
    tuitionAmount: 75000,
    repaymentPlan: '3-month plan',
    status: 'ongoing',
    contributedTo: 'Springfield School',
    date: 'Jan 1 2025'
  },
  {
    loanId: 'PMF-SIG-08',
    tuitionAmount: 50000,
    repaymentPlan: '12-month plan',
    status: 'completed',
    contributedTo: 'Springfield School',
    date: 'Dec 1 2024'
  },
  {
    loanId: 'PMF-SIG-11',
    tuitionAmount: 65000,
    repaymentPlan: '3-month plan',
    status: 'completed',
    contributedTo: 'Springfield School',
    date: 'Nov 30 2024'
  },
  {
    loanId: 'PMF-SIG-11',
    tuitionAmount: 65000,
    repaymentPlan: '3-month plan',
    status: 'completed',
    contributedTo: 'Springfield School',
    date: 'Aug 1 2024'
  },
  {
    loanId: 'PMF-SIG-11',
    tuitionAmount: 65000,
    repaymentPlan: '3-month plan',
    status: 'completed',
    contributedTo: 'Springfield School',
    date: 'June 1 2024'
  }
];

export const recentTransactionsData: TransactionItem[] = [
  {
    date: 'Dec 12, 2024',
    description: 'Installment Payment (1/5)',
    amount: 15000,
    method: 'Bank Transfer',
    status: 'paid'
  },
  {
    date: 'Dec 05, 2024',
    description: 'Wallet Top-Up',
    amount: 25000,
    method: 'Bank Transfer',
    status: 'pending'
  },
  {
    date: 'Nov 22, 2024',
    description: 'Installment Payment (2/5)',
    amount: 15000,
    method: 'Wallet Debit',
    status: 'paid'
  },
  {
    date: 'Oct 15, 2024',
    description: 'Installment Payment (1/5)',
    amount: 15000,
    method: 'Bank Transfer',
    status: 'paid'
  },
  {
    date: 'Oct 05, 2024',
    description: 'Wallet Top-Up',
    amount: 6000,
    method: 'Card Payment',
    status: 'paid'
  }
];

export const progressSteps: ProgressStep[] = [
  {
    id: '1',
    title: 'School Verified',
    status: 'completed'
  },
  {
    id: '2',
    title: 'Loan Approved',
    status: 'completed'
  },
  {
    id: '3',
    title: 'School Paid',
    status: 'completed'
  },
  {
    id: '4',
    title: '1st Repayment made',
    status: 'active'
  },
  {
    id: '5',
    title: '2nd Repayment made',
    status: 'upcoming'
  }
];

export const chartData: ChartDataItem[] = [
  { month: 'Jan', value: 0 },
  { month: 'Feb', value: 20000 },
  { month: 'Mar', value: 35000 },
  { month: 'Apr', value: 45000 },
  { month: 'May', value: 50000 },
  { month: 'Jun', value: 65000 },
  { month: 'Jul', value: 70000 },
  { month: 'Aug', value: 75000 },
  { month: 'Sep', value: 65000 },
  { month: 'Oct', value: 80000 },
  { month: 'Nov', value: 95000 },
  { month: 'Dec', value: 100000 }
];

// API simulation functions
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    upcomingPayment: {
      amount: 45000,
      dueDate: 'Jan 15, 2025'
    },
    activePlan: {
      current: 3,
      total: 5,
      planType: 'Pay in 5 months plan'
    },
    balance: {
      amount: 90000,
      description: 'Your outstanding loan balance'
    },
    wallet: {
      amount: 50000,
      description: 'Available for loan repayment'
    }
  };
};

export const fetchLoanHistory = async (): Promise<LoanHistoryItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return loanHistoryData;
};

export const fetchRecentTransactions = async (): Promise<TransactionItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return recentTransactionsData;
};

export const fetchChartData = async (year: string): Promise<ChartDataItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Return different data based on year for demo
  if (year === '2024') {
    return chartData.map(item => ({ ...item, value: item.value * 0.8 }));
  }
  if (year === '2023') {
    return chartData.map(item => ({ ...item, value: item.value * 0.6 }));
  }
  
  return chartData;
};

// Wallet mock data
export const walletTransactionsData = [
  {
    date: 'Dec 15, 2024',
    description: 'Wallet Top-Up',
    amount: 25000,
    type: 'credit',
    status: 'completed'
  },
  {
    date: 'Dec 12, 2024',
    description: 'Loan Repayment',
    amount: -15000,
    type: 'debit',
    status: 'completed'
  },
  {
    date: 'Dec 08, 2024',
    description: 'Wallet Top-Up',
    amount: 30000,
    type: 'credit',
    status: 'completed'
  },
  {
    date: 'Dec 05, 2024',
    description: 'School Fee Payment',
    amount: -20000,
    type: 'debit',
    status: 'completed'
  }
];

// FAQ data
export const faqItems = [
  {
    question: 'How do I apply for a loan?',
    answer: 'You can apply for a loan by clicking on "Apply for Loan" in your dashboard and filling out the required information.'
  },
  {
    question: 'What documents do I need for school verification?',
    answer: 'You need your school ID, admission letter, and current school fee structure for verification.'
  },
  {
    question: 'How long does loan approval take?',
    answer: 'Loan approval typically takes 24-48 hours after all required documents are submitted.'
  },
  {
    question: 'Can I make early repayments?',
    answer: 'Yes, you can make early repayments without any penalties. This will help reduce your total interest.'
  }
];

// School verification data
export const verificationStepsData = [
  {
    id: 1,
    title: 'School Information',
    description: 'Provide your school details and contact information',
    status: 'completed'
  },
  {
    id: 2,
    title: 'Document Upload',
    description: 'Upload required documents for verification',
    status: 'completed'
  },
  {
    id: 3,
    title: 'School Verification',
    description: 'We verify your school details with the institution',
    status: 'completed'
  },
  {
    id: 4,
    title: 'Final Approval',
    description: 'Final approval and account activation',
    status: 'completed'
  }
];

export const schoolDetailsData = {
  name: 'Springfield School',
  address: '123 Education Street, Lagos, Nigeria',
  phone: '+234 801 234 5678',
  email: 'admin@springfieldschool.edu.ng',
  verificationDate: 'Dec 1, 2024',
  status: 'verified'
};

// Extended loan history data with additional fields
export const loanHistoryDataFull = loanHistoryData.map((loan, index) => ({
  ...loan,
  amountPaid: loan.status === 'completed' ? loan.tuitionAmount : Math.floor(loan.tuitionAmount * 0.4),
  balance: loan.status === 'completed' ? 0 : Math.floor(loan.tuitionAmount * 0.6),
  nextPayment: loan.status === 'completed' ? 'N/A' : 'Jan 20, 2025',
  actions: 'View Details'
}));

// Extended transaction data with additional fields
export const recentTransactionsDataFull = recentTransactionsData.map((transaction, index) => ({
  ...transaction,
  transactionId: `TXN-${String(index + 1000).padStart(6, '0')}`,
  category: transaction.description.includes('Installment') ? 'Loan Repayment' : 
            transaction.description.includes('Wallet') ? 'Wallet' : 'Payment',
  reference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
  balance: 50000 + (index * 5000),
  actions: 'View Receipt'
}));

// Data type definitions
export interface DashboardStats {
  upcomingPayment: { amount: number; dueDate: string };
  activePlan: { current: number; total: number; planType: string };
  balance: { amount: number; description: string };
  wallet: { amount: number; description: string };
}

export interface LoanHistoryItem {
  loanId: string;
  tuitionAmount: number;
  repaymentPlan: string;
  status: 'ongoing' | 'completed' | 'pending' | 'cancelled';
  contributedTo: string;
  date: string;
}

export interface TransactionItem {
  date: string;
  description: string;
  amount: number;
  method: string;
  status: 'paid' | 'pending' | 'failed';
}

export interface ChartDataItem {
  month: string;
  value: number;
}

export interface ProgressStep {
  id: string;
  title: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface EarlyAccessFormData {
  role: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  loanAmount: string;
}

// Table component types
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

export interface TableData {
  [key: string]: any;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
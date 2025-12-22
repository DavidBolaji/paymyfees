// Application constants
import type { TableColumn } from './types';

export const LOAN_STATUS = {
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  PENDING: 'pending',
  CANCELLED: 'cancelled'
} as const;

export const TRANSACTION_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  FAILED: 'failed'
} as const;

export const PROGRESS_STATUS = {
  COMPLETED: 'completed',
  ACTIVE: 'active',
  UPCOMING: 'upcoming'
} as const;

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  SCHOOL: 'school',
  PARENT: 'parent'
} as const;

export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'Bank Transfer',
  CARD_PAYMENT: 'Card Payment',
  WALLET_DEBIT: 'Wallet Debit'
} as const;

export const CURRENCY = {
  SYMBOL: '₦',
  CODE: 'NGN'
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd'
} as const;

// Table column definitions
export const LOAN_HISTORY_COLUMNS: TableColumn[] = [
  { key: 'loanId', label: 'LOAN ID' },
  { key: 'tuitionAmount', label: 'TUITION AMOUNT' },
  { key: 'repaymentPlan', label: 'REPAYMENT PLAN' },
  { key: 'status', label: 'STATUS' },
  { key: 'contributedTo', label: 'CONTRIBUTED TO' },
  { key: 'date', label: 'DATE' }
];

export const LOAN_HISTORY_COLUMNS_FULL: TableColumn[] = [
  { key: 'loanId', label: 'LOAN ID' },
  { key: 'tuitionAmount', label: 'TUITION AMOUNT' },
  { key: 'repaymentPlan', label: 'REPAYMENT PLAN' },
  { key: 'status', label: 'STATUS' },
  { key: 'contributedTo', label: 'CONTRIBUTED TO' },
  { key: 'date', label: 'DATE' },
  { key: 'amountPaid', label: 'AMOUNT PAID' },
  { key: 'balance', label: 'BALANCE' },
  { key: 'nextPayment', label: 'NEXT PAYMENT' },
  { key: 'actions', label: 'ACTIONS' }
];

export const TRANSACTION_COLUMNS: TableColumn[] = [
  { key: 'date', label: 'DATE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'amount', label: 'AMOUNT' },
  { key: 'method', label: 'METHOD' },
  { key: 'status', label: 'STATUS' }
];

export const TRANSACTION_COLUMNS_FULL: TableColumn[] = [
  { key: 'date', label: 'DATE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'amount', label: 'AMOUNT' },
  { key: 'method', label: 'METHOD' },
  { key: 'status', label: 'STATUS' },
  { key: 'transactionId', label: 'TRANSACTION ID' },
  { key: 'category', label: 'CATEGORY' },
  { key: 'reference', label: 'REFERENCE' },
  { key: 'balance', label: 'BALANCE' },
  { key: 'actions', label: 'ACTIONS' }
];

export const WALLET_TRANSACTION_COLUMNS: TableColumn[] = [
  { key: 'date', label: 'DATE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'amount', label: 'AMOUNT' },
  { key: 'type', label: 'TYPE' },
  { key: 'status', label: 'STATUS' }
];

// Instant action configurations
export const INSTANT_ACTIONS = [
  {
    id: 'apply-loan',
    title: 'Apply for Loan',
    description: 'Start a new loan application and view eligibility requirements.'
  },
  {
    id: 'view-payment-plan',
    title: 'View Payment Plan',
    description: 'Check your repayment schedule and upcoming due dates.'
  },
  {
    id: 'make-payment',
    title: 'Make Payment',
    description: 'Make payment to paymyfees with one quick swift action.'
  },
  {
    id: 'update-school',
    title: 'Update School Details',
    description: 'Modify your program, institution, or academic info.'
  },
  {
    id: 'fund-wallet',
    title: 'Fund Wallet',
    description: 'Top up your wallet using any payment method for easy repayment debit.'
  }
] as const;

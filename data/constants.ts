// Application constants
import type { TableColumn } from './types';

export const COUNTRIES = [
  { value: '', label: 'Select Country' },
  { value: 'Afghanistan', label: 'Afghanistan' },
  { value: 'Albania', label: 'Albania' },
  { value: 'Algeria', label: 'Algeria' },
  { value: 'Andorra', label: 'Andorra' },
  { value: 'Angola', label: 'Angola' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Armenia', label: 'Armenia' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Austria', label: 'Austria' },
  { value: 'Azerbaijan', label: 'Azerbaijan' },
  { value: 'Bahrain', label: 'Bahrain' },
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'Belarus', label: 'Belarus' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'Benin', label: 'Benin' },
  { value: 'Bolivia', label: 'Bolivia' },
  { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina' },
  { value: 'Botswana', label: 'Botswana' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Bulgaria', label: 'Bulgaria' },
  { value: 'Burkina Faso', label: 'Burkina Faso' },
  { value: 'Cameroon', label: 'Cameroon' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Chad', label: 'Chad' },
  { value: 'Chile', label: 'Chile' },
  { value: 'China', label: 'China' },
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Congo', label: 'Congo' },
  { value: 'Costa Rica', label: 'Costa Rica' },
  { value: 'Croatia', label: 'Croatia' },
  { value: 'Cuba', label: 'Cuba' },
  { value: 'Cyprus', label: 'Cyprus' },
  { value: 'Czech Republic', label: 'Czech Republic' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Dominican Republic', label: 'Dominican Republic' },
  { value: 'DR Congo', label: 'DR Congo' },
  { value: 'Ecuador', label: 'Ecuador' },
  { value: 'Egypt', label: 'Egypt' },
  { value: 'Ethiopia', label: 'Ethiopia' },
  { value: 'Finland', label: 'Finland' },
  { value: 'France', label: 'France' },
  { value: 'Gabon', label: 'Gabon' },
  { value: 'Gambia', label: 'Gambia' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Greece', label: 'Greece' },
  { value: 'Guatemala', label: 'Guatemala' },
  { value: 'Guinea', label: 'Guinea' },
  { value: 'Honduras', label: 'Honduras' },
  { value: 'Hungary', label: 'Hungary' },
  { value: 'India', label: 'India' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Iran', label: 'Iran' },
  { value: 'Iraq', label: 'Iraq' },
  { value: 'Ireland', label: 'Ireland' },
  { value: 'Israel', label: 'Israel' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Ivory Coast', label: 'Ivory Coast' },
  { value: 'Jamaica', label: 'Jamaica' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Jordan', label: 'Jordan' },
  { value: 'Kazakhstan', label: 'Kazakhstan' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Latvia', label: 'Latvia' },
  { value: 'Lebanon', label: 'Lebanon' },
  { value: 'Liberia', label: 'Liberia' },
  { value: 'Libya', label: 'Libya' },
  { value: 'Lithuania', label: 'Lithuania' },
  { value: 'Luxembourg', label: 'Luxembourg' },
  { value: 'Madagascar', label: 'Madagascar' },
  { value: 'Malawi', label: 'Malawi' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'Mali', label: 'Mali' },
  { value: 'Malta', label: 'Malta' },
  { value: 'Mauritania', label: 'Mauritania' },
  { value: 'Mauritius', label: 'Mauritius' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'Moldova', label: 'Moldova' },
  { value: 'Morocco', label: 'Morocco' },
  { value: 'Mozambique', label: 'Mozambique' },
  { value: 'Namibia', label: 'Namibia' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'New Zealand', label: 'New Zealand' },
  { value: 'Niger', label: 'Niger' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Norway', label: 'Norway' },
  { value: 'Oman', label: 'Oman' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'Panama', label: 'Panama' },
  { value: 'Paraguay', label: 'Paraguay' },
  { value: 'Peru', label: 'Peru' },
  { value: 'Philippines', label: 'Philippines' },
  { value: 'Poland', label: 'Poland' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Romania', label: 'Romania' },
  { value: 'Russia', label: 'Russia' },
  { value: 'Rwanda', label: 'Rwanda' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Senegal', label: 'Senegal' },
  { value: 'Serbia', label: 'Serbia' },
  { value: 'Sierra Leone', label: 'Sierra Leone' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Slovakia', label: 'Slovakia' },
  { value: 'Slovenia', label: 'Slovenia' },
  { value: 'Somalia', label: 'Somalia' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'South Sudan', label: 'South Sudan' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Sri Lanka', label: 'Sri Lanka' },
  { value: 'Sudan', label: 'Sudan' },
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Syria', label: 'Syria' },
  { value: 'Taiwan', label: 'Taiwan' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'Thailand', label: 'Thailand' },
  { value: 'Togo', label: 'Togo' },
  { value: 'Trinidad and Tobago', label: 'Trinidad and Tobago' },
  { value: 'Tunisia', label: 'Tunisia' },
  { value: 'Turkey', label: 'Turkey' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Ukraine', label: 'Ukraine' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'United States', label: 'United States' },
  { value: 'Uruguay', label: 'Uruguay' },
  { value: 'Uzbekistan', label: 'Uzbekistan' },
  { value: 'Venezuela', label: 'Venezuela' },
  { value: 'Vietnam', label: 'Vietnam' },
  { value: 'Yemen', label: 'Yemen' },
  { value: 'Zambia', label: 'Zambia' },
  { value: 'Zimbabwe', label: 'Zimbabwe' },
];

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
  { key: 'contributedTo', label: 'DISBURSED TO' },
  { key: 'date', label: 'DATE' }
];

export const LOAN_HISTORY_COLUMNS_SIMPLE: TableColumn[] = [
  { key: 'loanId', label: 'LOAN ID' },
  { key: 'tuitionAmount', label: 'TUITION AMOUNT' },
  { key: 'repaymentPlan', label: 'REPAYMENT PLAN' },
  { key: 'status', label: 'STATUS' },
  { key: 'contributedTo', label: 'DISBURSED TO' },
  { key: 'date', label: 'DATE' }
];

export const LOAN_HISTORY_COLUMNS_FULL: TableColumn[] = [
  { key: 'loanId', label: 'LOAN ID' },
  { key: 'tuitionAmount', label: 'TUITION AMOUNT' },
  { key: 'repaymentPlan', label: 'REPAYMENT PLAN' },
  { key: 'status', label: 'STATUS' },
  { key: 'contributedTo', label: 'DISBURSED TO' },
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
  { key: 'amount', label: 'AMOUNT' },
  { key: 'method', label: 'METHOD' },
  { key: 'transactionId', label: 'TRANSACTION ID' },
  { key: 'status', label: 'STATUS' },
  { key: 'type', label: 'ACTIVITY TYPE' },
  { key: 'date', label: 'DATE' }
];

export const INSTALLMENT_COLUMNS: TableColumn[] = [
  { key: 'installment', label: 'INSTALLMENT' },
  { key: 'amount', label: 'AMOUNT' },
  { key: 'dueDate', label: 'DUE DATE' },
  { key: 'status', label: 'STATUS' }
];

export const VERIFICATION_LOGS_COLUMNS: TableColumn[] = [
  { key: 'date', label: 'DATE' },
  { key: 'activities', label: 'ACTIVITIES' },
  { key: 'details', label: 'DETAILS' },
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

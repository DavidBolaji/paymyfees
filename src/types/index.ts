/**
 * Type Definitions and Interfaces
 * Comprehensive type system with strict typing and no use of 'any'
 */

import {
  UserRole,
  LoanStatus,
  VerificationStatus,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  PaymentStatus,
  DocumentType,
  NotificationType,
  SupportTicketStatus,
  SupportTicketPriority,
  ResidencyStatus
} from '@prisma/client';

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: ResponseMetadata;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMetadata;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ============================================
// User Types
// ============================================

export interface UserDTO {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  country: string;
  fullName: string;
  profileImage: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  residencyStatus: ResidencyStatus;
  isActive: boolean;
  isFirstTime: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  parentProfile?: any | null;
  schoolProfile?: any | null;
  wallet?: any | null;
  notificationSettings?: any | null;
}


export interface CreateUserInput {
  email: string;
  //phone: string;
  country: string;
  password: string;
  role: UserRole;
  fullName: string;
  profileImage?: string;
  mode: 'otp' | 'link'; // Verification mode: OTP or link
  schoolName?: string;  // Required when role is SCHOOL
}

export interface UpdateUserInput {
  fullName?: string;
  phone?: string;
  profileImage?: string;
  address?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
  refreshToken: string;
}

// ============================================
// Parent Profile Types
// ============================================

export interface ParentProfileDTO {
  id: string;
  userId: string;
  dateOfBirth: Date | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  bvn: string | null;
  nin: string | null;
  bvnVerified: boolean;
  ninVerified: boolean;
  employmentStatus: string | null;
  employerName: string | null;
  monthlyIncome: number | null;
  creditScore: number | null;
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  outstandingBalance: number;
}

export interface CreateParentProfileInput {
  userId: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  state?: string;
  bvn?: string;
  nin?: string;
  employmentStatus?: string;
  employerName?: string;
  monthlyIncome?: number;
}

// ============================================
// School Profile Types
// ============================================

export interface SchoolProfileDTO {
  id: string;
  userId: string;
  schoolName: string;
  schoolAddress: string;
  city: string;
  state: string;
  country: string;
  schoolEmail: string;
  schoolPhone: string;
  website: string | null;
  contactPersonName: string;
  contactPersonPosition: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
  verifiedAt: Date | null;
  totalStudents: number;
  totalDisbursements: number;
}

export interface CreateSchoolProfileInput {
  userId: string;
  schoolName: string;
  schoolAddress: string;
  city: string;
  state: string;
  schoolEmail: string;
  schoolPhone: string;
  website?: string;
  contactPersonName: string;
  contactPersonPosition: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

// ============================================
// Student Types
// ============================================

export interface StudentDTO {
  id: string;
  parentId: string;
  schoolId: string | null;
  fullName: string;
  dateOfBirth: Date | null;
  studentClass: string;
  studentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudentInput {
  parentId: string;
  schoolId?: string;
  fullName: string;
  dateOfBirth?: Date;
  studentClass: string;
  studentId?: string;
}

// ============================================
// Loan Types
// ============================================

/**
 * Base fields common to all loan types
 */
interface BaseLoanInput {
  userId: string;
  // studentId: string;
  schoolId: string;
  loanAmount: number;
  repaymentMonths: number;
  residencyStatus: ResidencyStatus;
}

/**
 * Local student loan input
 */
export interface LocalLoanInput extends BaseLoanInput {
  residencyStatus: ResidencyStatus;
  schoolName: string;
  academicSession: string;
  term: string;
}

/**
 * International student loan input
 */
export interface InternationalLoanInput extends BaseLoanInput {
  residencyStatus: ResidencyStatus;
  schoolName: string;
  countryOfStudy: string;
  programCourseOfStudy: string;
  academicSession: string;

  // Employment & Income Details
  employmentStatus?: string;
  companyName?: string;
  jobTitleRole?: string;
  monthlyNetIncome?: number;
  paymentFrequency?: string;

  // Loan Disbursement Details
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  countryOfBankAccount: string;
}

/**
 * Union type for loan creation
 */
export type CreateLoanInput = LocalLoanInput | InternationalLoanInput;

/**
 * Loan DTO (Data Transfer Object)
 */
export interface LoanDTO {
  id: string;
  loanNumber: string;
  userId: string;
  // studentId: string;
  schoolId: string;
  loanAmount: number;
  interestRate: number;
  totalInterest: number;
  totalAmount: number;
  monthlyPayment: number;
  repaymentMonths: number;
  schoolName: string;
  academicSession: string;
  term?: string;
  residencyStatus: ResidencyStatus;

  // User information (populated from relations)
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userCountry?: string;
  userCity?: string;
  userIsActive?: boolean;
  schoolIsVerified?: boolean;
  userPreviousLoans?: number;

  // International student specific fields
  countryOfStudy?: string;
  programCourseOfStudy?: string;
  employmentStatus?: string;
  companyName?: string;
  jobTitleRole?: string;
  monthlyNetIncome?: number;
  paymentFrequency?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  countryOfBankAccount?: string;

  status: LoanStatus;
  amountDisbursed: number;
  amountRepaid: number;
  outstandingBalance: number;
  applicationDate: Date;
  approvalDate?: Date | null;
  disbursementDate?: Date | null;
  firstPaymentDate?: Date | null;
  lastPaymentDate?: Date | null;
  completionDate?: Date | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Related data (populated from relations)
  documents?: any[];
  installments?: any[];
}

/**
 * Update loan status input
 */
export interface UpdateLoanStatusInput {
  loanId: string;
  status: LoanStatus;
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

/**
 * Loan calculation result
 */
export interface LoanCalculation {
  loanAmount: number;
  interestRate: number;
  totalInterest: number;
  totalAmount: number;
  monthlyPayment: number;
  repaymentMonths: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}


// ============================================
// Installment Types
// ============================================

export interface InstallmentDTO {
  id: string;
  loanId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  paidDate: Date | null;
  status: PaymentStatus;
  daysOverdue: number;
  lateFee: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInstallmentInput {
  loanId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
}

// ============================================
// Payment Types
// ============================================

export interface PaymentDTO {
  id: string;
  paymentReference: string;
  loanId: string;
  installmentId: string | null;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  gatewayReference: string | null;
  gatewayResponse: string | null;
  paymentDate: Date;
  confirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  loanId: string;
  installmentId?: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface ProcessPaymentInput {
  paymentId: string;
  gatewayReference: string;
  gatewayResponse: string;
  status: TransactionStatus;
}

// ============================================
// Wallet Types
// ============================================

export interface WalletDTO {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  dailyLimit: number | null;
  monthlyLimit: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FundWalletInput {
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface DebitWalletInput {
  userId: string;
  amount: number;
  description: string;
  category?: string;
}

// ============================================
// Transaction Types
// ============================================

export interface TransactionDTO {
  id: string;
  transactionReference: string;
  userId: string;
  walletId: string | null;
  paymentId: string | null;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  category: string | null;
  paymentMethod: PaymentMethod | null;
  status: TransactionStatus;
  gatewayReference: string | null;
  gatewayResponse: string | null;
  metadata: Record<string, unknown> | null;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionInput {
  userId: string;
  walletId?: string;
  paymentId?: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  category?: string;
  paymentMethod?: PaymentMethod;
  metadata?: Record<string, unknown>;
}

export interface TransactionFilters {
  userId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
}

// ============================================
// Verification Types
// ============================================

export interface SchoolVerificationDTO {
  id: string;
  loanId: string;
  schoolId: string;
  studentName: string;
  studentClass: string;
  invoiceAmount: number;
  status: VerificationStatus;
  enrollmentConfirmed: boolean;
  invoiceConfirmed: boolean;
  actualInvoiceAmount: number | null;
  requestedAt: Date;
  respondedAt: Date | null;
  verifiedBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVerificationInput {
  loanId: string;
  schoolId: string;
  studentName: string;
  studentClass: string;
  invoiceAmount: number;
}

export interface RespondToVerificationInput {
  verificationId: string;
  status: VerificationStatus;
  enrollmentConfirmed: boolean;
  invoiceConfirmed: boolean;
  actualInvoiceAmount?: number;
  verifiedBy: string;
  notes?: string;
}

// ============================================
// Document Types
// ============================================

export interface DocumentDTO {
  id: string;
  userId: string | null;
  parentId: string | null;
  schoolId: string | null;
  loanId: string | null;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  isVerified: boolean;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentInput {
  userId?: string;
  parentId?: string;
  schoolId?: string;
  loanId?: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

// ============================================
// Notification Types
// ============================================

export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: Date | null;
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Support Ticket Types
// ============================================

export interface SupportTicketDTO {
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  category: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  description: string;
  assignedTo: string | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupportTicketInput {
  userId: string;
  subject: string;
  category: string;
  priority: SupportTicketPriority;
  description: string;
}

// ============================================
// Waitlist Types
// ============================================

export interface WaitlistDTO {
  id: string;
  role: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  loanAmount: string;
  status: string;
  invitedAt: Date | null;
  registeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWaitlistInput {
  role: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  loanAmount: string;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardLoanSummary {
  id: string;
  loanNumber: string;
  loanAmount: number;
  status: string;
  schoolName: string;
  createdAt: string;
}

export interface DashboardStats {
  upcomingPayment: {
    amount: number;
    dueDate: string;
  } | null;
  activePlan: {
    current: number;
    total: number;
    planType: string;
  } | null;
  balance: {
    amount: number;
    description: string;
  };
  wallet: {
    amount: number;
    description: string;
    virtualAccountNumber?: string | null;
    virtualAccountBank?: string | null;
    embedlyWalletId?: string | null;
  };
  allLoans?: DashboardLoanSummary[];
}

export interface AnalyticsData {
  totalLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  outstandingBalance: number;
  repaymentRate: number;
  averageLoanAmount: number;
}

export interface ChartDataPoint {
  month: string;
  value: number;
}

// ============================================
// Service Interfaces (Dependency Injection)
// ============================================

export interface IUserService {
  createUser(input: CreateUserInput): Promise<UserDTO>;
  getUserById(id: string): Promise<UserDTO | null>;
  getUserByEmail(email: string): Promise<UserDTO | null>;
  updateUser(id: string, input: UpdateUserInput): Promise<UserDTO>;
  deleteUser(id: string): Promise<void>;
}

export interface ILoanService {
  createLoan(input: CreateLoanInput): Promise<LoanDTO>;
  getLoanById(id: string): Promise<LoanDTO | null>;
  getLoansByUserId(userId: string, pagination: PaginationParams): Promise<{ loans: LoanDTO[]; pagination: PaginationMetadata }>;
  updateLoanStatus(input: UpdateLoanStatusInput): Promise<LoanDTO>;
  calculateLoan(loanAmount: number, repaymentMonths: number): LoanCalculation;
}

export interface IWalletService {
  createWallet(userId: string): Promise<WalletDTO>;
  getWalletByUserId(userId: string): Promise<WalletDTO | null>;
  fundWallet(input: FundWalletInput): Promise<TransactionDTO>;
  debitWallet(input: DebitWalletInput): Promise<TransactionDTO>;
  getBalance(userId: string): Promise<number>;
}

export interface ITransactionService {
  createTransaction(input: CreateTransactionInput): Promise<TransactionDTO>;
  getTransactionById(id: string): Promise<TransactionDTO | null>;
  getTransactionsByUserId(userId: string, filters: TransactionFilters, pagination: PaginationParams): Promise<{ transactions: TransactionDTO[]; pagination: PaginationMetadata }>;
}

export interface IPaymentService {
  createPayment(input: CreatePaymentInput): Promise<PaymentDTO>;
  processPayment(input: ProcessPaymentInput): Promise<PaymentDTO>;
  getPaymentById(id: string): Promise<PaymentDTO | null>;
}

export interface INotificationService {
  createNotification(input: CreateNotificationInput): Promise<NotificationDTO>;
  getNotificationsByUserId(userId: string, pagination: PaginationParams): Promise<{ notifications: NotificationDTO[]; pagination: PaginationMetadata }>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}

// ============================================
// Repository Interfaces
// ============================================

export interface IUserRepository {
  create(input: CreateUserInput): Promise<UserDTO>;
  findById(id: string): Promise<UserDTO | null>;
  findByEmail(email: string): Promise<UserDTO | null>;
  findByPhone(phone: string): Promise<UserDTO | null>;
  update(id: string, input: Partial<UserDTO>): Promise<UserDTO>;
  delete(id: string): Promise<void>;
}

export interface ILoanRepository {
  create(input: CreateLoanInput & { loanNumber: string; interestRate: number; totalInterest: number; totalAmount: number; monthlyPayment: number; outstandingBalance: number }): Promise<LoanDTO>;
  findById(id: string): Promise<LoanDTO | null>;
  findByUserId(userId: string, pagination: PaginationParams): Promise<{ loans: LoanDTO[]; total: number }>;
  update(id: string, input: Partial<LoanDTO>): Promise<LoanDTO>;
  delete(id: string): Promise<void>;
}

export interface IWalletRepository {
  create(userId: string): Promise<WalletDTO>;
  findByUserId(userId: string): Promise<WalletDTO | null>;
  updateBalance(userId: string, newBalance: number): Promise<WalletDTO>;
}

export interface ITransactionRepository {
  create(input: CreateTransactionInput & { transactionReference: string }): Promise<TransactionDTO>;
  findById(id: string): Promise<TransactionDTO | null>;
  findByUserId(userId: string, filters: TransactionFilters, pagination: PaginationParams): Promise<{ transactions: TransactionDTO[]; total: number }>;
}


// ============================================
// Timeline Type Definitions
// ============================================

export interface TimelineProgressOverview {
  progress: string;
  totalPaid: string;
  outstanding: string;
  nextRepayment: string;
  nextRepaymentDate: string;
  percentageCompleted: number;
}

export interface RepaymentStage {
  label: string;
  value: string;
  isPaid: boolean;
}

export interface TimelineStep {
  id: string;
  title: string;
  subtitle?: string;
  status: 'completed' | 'upcoming';
}

export interface TimelineData {
  progressOverview: TimelineProgressOverview;
  repaymentStages: RepaymentStage[];
  detailedTimeline: TimelineStep[];
  disbursementReceiptUrl?: string;
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

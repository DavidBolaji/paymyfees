/**
 * Zod Validation Schemas
 * Comprehensive input validation for all API endpoints
 * Includes custom refinements, error messages, and type inference
 */

import { z } from 'zod';
import { 
  UserRole, 
  PaymentMethod, 
  SupportTicketPriority,
  DocumentType 
} from '@prisma/client';

// ============================================
// Common Schemas
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const idSchema = z.string().uuid({ message: 'Invalid ID format' });

export const emailSchema = z.string().email({ message: 'Invalid email address' });

export const phoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  'Invalid phone number format'
);

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
  // .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  // .regex(/[0-9]/, 'Password must contain at least one number')

// ============================================
// Authentication Schemas
// ============================================

export const registerSchema = z.object({
  role: z.nativeEnum(UserRole),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  mode: z.enum(['otp', 'link'], {
    required_error: 'Verification mode is required',
    invalid_type_error: 'Verification mode must be either "otp" or "link"',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================
// User Profile Schemas
// ============================================

export const updateUserProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
  address: z.string().max(500).optional(),
  profileImage: z.string().url().optional(),
});

export const updateParentProfileSchema = z.object({
  dateOfBirth: z.coerce.date().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  bvn: z.string().length(11, 'BVN must be 11 digits').optional(),
  nin: z.string().length(11, 'NIN must be 11 digits').optional(),
  employmentStatus: z.string().max(100).optional(),
  employerName: z.string().max(200).optional(),
  monthlyIncome: z.number().positive().optional(),
});

// ============================================
// Loan Application Schemas
// ============================================

export const createLoanSchema = z.object({
  schoolName: z.string().min(2, 'School name is required').max(200),
  academicSession: z.string().min(4, 'Academic session is required').max(50),
  term: z.enum(['First Term', 'Second Term', 'Third Term'], {
    message: 'Invalid term',
  }),
  loanAmount: z.number()
    .positive('Loan amount must be positive')
    .min(1000, 'Minimum loan amount is ₦1,000')
    .max(10000000, 'Maximum loan amount is ₦10,000,000'),
  repaymentMonths: z.number()
    .int('Repayment months must be an integer')
    .min(1, 'Minimum repayment period is 1 month')
    .max(12, 'Maximum repayment period is 12 months'),
  studentId: idSchema,
  consents: z.object({
    schoolDetails: z.boolean().refine((val) => val === true, {
      message: 'You must consent to school details verification',
    }),
    directPayment: z.boolean().refine((val) => val === true, {
      message: 'You must consent to direct payment to school',
    }),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept terms and conditions',
    }),
  }),
});

export const updateLoanStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'DISBURSED',
    'ACTIVE',
    'COMPLETED',
    'DEFAULTED',
    'CANCELLED',
  ]),
  approvedBy: z.string().optional(),
  rejectionReason: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
});

export const loanQuerySchema = z.object({
  status: z.enum([
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'DISBURSED',
    'ACTIVE',
    'COMPLETED',
    'DEFAULTED',
    'CANCELLED',
  ]).optional(),
  ...paginationSchema.shape,
});

// ============================================
// Student Schemas
// ============================================

export const createStudentSchema = z.object({
  fullName: z.string().min(2, 'Student name is required').max(100),
  dateOfBirth: z.coerce.date().optional(),
  studentClass: z.string().min(1, 'Student class is required').max(50),
  studentId: z.string().max(50).optional(),
  schoolId: idSchema.optional(),
});

// ============================================
// Wallet Schemas
// ============================================

export const fundWalletSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(100, 'Minimum funding amount is ₦100')
    .max(10000000, 'Maximum funding amount is ₦10,000,000'),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

export const verifyWalletFundingSchema = z.object({
  reference: z.string().min(1, 'Payment reference is required'),
});

// ============================================
// Payment Schemas
// ============================================

export const makePaymentSchema = z.object({
  loanId: idSchema,
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  installmentNumber: z.number().int().positive().optional(),
});

// ============================================
// Transaction Schemas
// ============================================

export const transactionQuerySchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REVERSED']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  ...paginationSchema.shape,
});

// ============================================
// School Verification Schemas
// ============================================

export const createSchoolVerificationSchema = z.object({
  schoolName: z.string().min(2).max(200),
  schoolAddress: z.string().min(5).max(500),
  contactPerson: z.string().min(2).max(100),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  studentName: z.string().min(2).max(100),
  studentClass: z.string().min(1).max(50),
});

export const respondToVerificationSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  enrollmentConfirmed: z.boolean(),
  invoiceConfirmed: z.boolean(),
  actualInvoiceAmount: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
});

// ============================================
// School Registration Schemas
// ============================================

export const registerSchoolSchema = z.object({
  schoolName: z.string().min(2, 'School name is required').max(200),
  schoolAddress: z.string().min(5, 'School address is required').max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  schoolEmail: emailSchema,
  schoolPhone: phoneSchema,
  website: z.string().url().optional(),
  contactPersonName: z.string().min(2).max(100),
  contactPersonPosition: z.string().min(2).max(100),
  contactPersonEmail: emailSchema,
  contactPersonPhone: phoneSchema,
  bankName: z.string().min(2, 'Bank name is required').max(100),
  accountNumber: z.string()
    .length(10, 'Account number must be 10 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  accountName: z.string().min(2, 'Account name is required').max(200),
});

// ============================================
// Document Upload Schemas
// ============================================

export const uploadDocumentSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  fileSize: z.number().positive().max(10485760, 'File size must not exceed 10MB'),
  mimeType: z.string().regex(
    /^(image\/(jpeg|jpg|png|gif|webp)|application\/pdf)$/,
    'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF'
  ),
});

// ============================================
// Support Ticket Schemas
// ============================================

export const createSupportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  category: z.string().min(2).max(50),
  priority: z.nativeEnum(SupportTicketPriority),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
});

export const updateSupportTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  assignedTo: z.string().optional(),
});

export const addSupportMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000),
  isInternal: z.boolean().default(false),
});

// ============================================
// Waitlist Schemas
// ============================================

export const joinWaitlistSchema = z.object({
  role: z.enum(['parent', 'student', 'teacher', 'school']),
  fullName: z.string().min(2, 'Full name is required').max(100),
  email: emailSchema,
  phone: phoneSchema,
  institution: z.string().min(2, 'Institution name is required').max(200),
  loanAmount: z.string().min(1, 'Loan amount range is required'),
});

// ============================================
// Notification Schemas
// ============================================

export const notificationQuerySchema = z.object({
  unreadOnly: z.coerce.boolean().optional(),
  ...paginationSchema.shape,
});

// ============================================
// Dashboard Schemas
// ============================================

export const chartQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100).optional(),
});

// ============================================
// Admin Schemas
// ============================================

export const reviewApplicationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().max(2000).optional(),
  approvedAmount: z.number().positive().optional(),
});

export const processDisbursementSchema = z.object({
  loanId: idSchema,
  amount: z.number().positive(),
  bankName: z.string().min(2).max(100),
  accountNumber: z.string().length(10).regex(/^\d+$/),
  accountName: z.string().min(2).max(200),
});

// ============================================
// Type Inference Exports
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerificationMode = 'otp' | 'link';
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type FundWalletInput = z.infer<typeof fundWalletSchema>;
export type MakePaymentInput = z.infer<typeof makePaymentSchema>;
export type CreateSchoolVerificationInput = z.infer<typeof createSchoolVerificationSchema>;
export type RegisterSchoolInput = z.infer<typeof registerSchoolSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;
export type ProcessDisbursementInput = z.infer<typeof processDisbursementSchema>;

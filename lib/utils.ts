import { LoanHistoryItem, TransactionItem } from "@/data";
import { VerificationLog } from "@/src/schoolStore";
import { LoanDTO, TransactionDTO } from "@/src/types";
import { PaymentMethod, SchoolProfile, TransactionStatus, TransactionType } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}


/**
 * Format date to display format
 */
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const d = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(d.getTime())) {
      return '-';
    }
    
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format payment method for display
 */
const formatPaymentMethod = (method: PaymentMethod | null): string => {
  if (!method) return 'N/A';
  
  const methodMap: Record<PaymentMethod, string> = {
    CARD: 'Card',
    BANK_TRANSFER: 'Bank Transfer',
    WALLET: 'Wallet',
    USSD: 'USSD'
  };
  
  return methodMap[method] || method;
};

/**
 * Format transaction status for display
 */
const formatStatus = (status: TransactionStatus): string => {
  return status.toLowerCase();
};

/**
 * Format transaction description based on type and description
 */
const formatDescription = (transaction: TransactionDTO): string => {
  // If there's a custom description, use it
  if (transaction.description && transaction.description.trim()) {
    return transaction.description;
  }
  
  // Otherwise, generate a description based on transaction type
  const typeDescriptions: Record<TransactionType, string> = {
    CREDIT: 'Wallet Deposit',   
    DEBIT: 'Loan Repayment',
  };
  
  return typeDescriptions[transaction.type] || transaction.type;
};



/**
 * Maps TransactionDTO from API to TransactionItem for display
 */
export function mapTransactionToItem(transaction: TransactionDTO): TransactionItem {
  // Ensure transactionDate is properly formatted
  const date = transaction.transactionDate instanceof Date
    ? formatDate(transaction.transactionDate)
    : transaction.transactionDate
      ? formatDate(new Date(transaction.transactionDate))
      : formatDate(new Date());
      
  return {
    date,
    description: formatDescription(transaction),
    amount: transaction.amount,
    method: formatPaymentMethod(transaction.paymentMethod),
    //@ts-ignore
    status: formatStatus(transaction.status),
  };
}


/**
 * Maps LoanDTO from API to LoanHistoryItem for display
 */
export function mapLoanToHistoryItem(loan: LoanDTO): LoanHistoryItem {
  // Format date
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format repayment plan
  const repaymentPlan = `${loan.repaymentMonths}-month plan`;

  // Use disbursement date, or application date as fallback
  const displayDate = loan.disbursementDate || loan.applicationDate;

  return {
    loanId: loan.loanNumber,
    tuitionAmount: loan.loanAmount,
    repaymentPlan,
    status: loan.status,
    contributedTo: loan.schoolName,
    date: formatDate(displayDate)
  };
}

/**
 * Maps array of LoanDTOs to LoanHistoryItems
 */
export function mapLoansToHistoryItems(loans: LoanDTO[]): LoanHistoryItem[] {
  return loans.map(mapLoanToHistoryItem);
}

/**
 * Maps array of TransactionDTOs to TransactionItems
 */
export function mapTransactionsToItems(transactions: TransactionDTO[]): TransactionItem[] {
  return transactions.map(mapTransactionToItem);
}

/**
 * School Scoring System
 * Calculates dynamic scores based on various parameters
 */

export interface SchoolScores {
  academicScore: number; // 0-100
  profileCompletionRate: number; // 0-100
  eligibilityStrength: 'Weak' | 'Low' | 'Moderate' | 'Good' | 'Strong' | 'Excellent';
  verificationStatus: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed';
  overallScore: number; // 0-100
}

/**
 * Calculate Academic Verification Score
 * Based on: verification status, documents, and verification requests
 */
export function calculateAcademicScore(
  profile: SchoolProfile | null,
  verificationLogs: VerificationLog[] = []
): number {
  if (!profile) return 0;

  let score = 0;

  // Base score for having a profile (10 points)
  score += 10;

  // Verification status (40 points)
  if (profile.isVerified) {
    score += 40;
  } else if (profile.verifiedAt) {
    score += 20; // Partially verified
  }

  // Document completeness (20 points)
  // This would check if required documents are uploaded
  // For now, we'll assume some basic checks
  const hasContactInfo = profile.contactPersonName && profile.contactPersonEmail;
  const hasBankInfo = profile.bankName && profile.accountNumber;
  const hasAddress = profile.schoolAddress && profile.city && profile.state;
  
  if (hasContactInfo) score += 7;
  if (hasBankInfo) score += 7;
  if (hasAddress) score += 6;

  console.log('VER', {verificationLogs, length: verificationLogs.length})

  // Verification request history (30 points)
  const totalRequests = verificationLogs.length;
  const verifiedRequests = verificationLogs.filter(r => r.status === 'VERIFIED').length;
  const rejectedRequests = verificationLogs.filter(r => r.status === 'REJECTED').length;

  if (totalRequests > 0) {
    const verificationRate = verifiedRequests / totalRequests;
    const rejectionRate = rejectedRequests / totalRequests;
    
    // Award points based on verification success rate
    score += Math.min(25, Math.floor(verificationRate * 25));
    
    // Deduct points for high rejection rate
    if (rejectionRate > 0.5) {
      score -= 10;
    } else if (rejectionRate > 0.3) {
      score -= 5;
    }
    
    // Bonus for having verification history
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Profile Completion Rate
 * Based on: required and optional fields filled
 */
export function calculateProfileCompletion(profile: SchoolProfile | null): number {
  if (!profile) return 0;

  const requiredFields = [
    profile.schoolName,
    profile.schoolAddress,
    profile.city,
    profile.state,
    profile.country,
    profile.schoolEmail,
    profile.schoolPhone,
    profile.contactPersonName,
    profile.contactPersonPosition,
    profile.contactPersonEmail,
    profile.contactPersonPhone,
    profile.bankName,
    profile.accountNumber,
    profile.accountName,
  ];

  const optionalFields = [
    profile.website,
    profile.academicLevel,
    profile.currentAcademicSession,
  ];

  const filledRequired = requiredFields.filter(field => field && field.trim().length > 0).length;
  const filledOptional = optionalFields.filter(field => field && field.trim().length > 0).length;

  // Required fields are worth 70%, optional are worth 30%
  const requiredScore = (filledRequired / requiredFields.length) * 70;
  const optionalScore = (filledOptional / optionalFields.length) * 30;

  return Math.round(requiredScore + optionalScore);
}

/**
 * Calculate Eligibility Strength
* Based on: academic score, profile completion, and activity
 */
export function calculateEligibilityStrength(
  academicScore: number,
  profileCompletion: number,
  profile: SchoolProfile | null
): 'Weak' | 'Low' | 'Moderate' | 'Good' | 'Strong' | 'Excellent' {
  const averageScore = (academicScore + profileCompletion) / 2;

  // Additional factors
  let bonus = 0;
  if (profile?.isVerified) bonus += 10;
  if (profile?.totalStudents && profile.totalStudents > 50) bonus += 5;
  // if (profile?.totalDisbursements && Number(profile.totalDisbursements.toFixed(0)) > 0) bonus += 5;

  const finalScore = Math.min(100, averageScore + bonus);

  if (finalScore >= 90) return 'Excellent';
  if (finalScore >= 75) return 'Strong';
  if (finalScore >= 60) return 'Good';
  if (finalScore >= 45) return 'Moderate';
  if (finalScore >= 30) return 'Low';
  return 'Weak';
}

/**
 * Calculate Verification Status
 */
export function calculateVerificationStatus(
  profile: SchoolProfile | null,
  verificationLogs: VerificationLog[] = []
): 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' {
  if (!profile) return 'Not Started';

  if (profile.isVerified) return 'Completed';

  const pendingRequests = verificationLogs.filter(r => r.status === 'PENDING').length;
  
  if (pendingRequests > 0) return 'Under Review';
  
  if (profile.createdAt) return 'In Progress';

  return 'Not Started';
}

/**
 * Calculate Overall School Score
 */
export function calculateOverallScore(scores: SchoolScores): number {
  // Weighted average of academic and profile scores
  return Math.round((scores.academicScore * 0.6) + (scores.profileCompletionRate * 0.4));
}

/**
 * Get all school scores
 */
export function getSchoolScores(
  profile: SchoolProfile | null,
  verificationLogs: VerificationLog[] = []
): SchoolScores {
  const academicScore = calculateAcademicScore(profile, verificationLogs);
  const profileCompletionRate = calculateProfileCompletion(profile);
  const eligibilityStrength = calculateEligibilityStrength(
    academicScore, 
    profileCompletionRate, 
    profile
  );
  const verificationStatus = calculateVerificationStatus(profile, verificationLogs);

  const scores: SchoolScores = {
    academicScore,
    profileCompletionRate,
    eligibilityStrength,
    verificationStatus,
    overallScore: 0, // Will be calculated next
  };

  scores.overallScore = calculateOverallScore(scores);

  return scores;
}

/**
 * Get color based on score
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get eligibility color
 */
export function getEligibilityColor(
  strength: 'Weak' | 'Low' | 'Moderate' | 'Good' | 'Strong' | 'Excellent'
): string {
  switch (strength) {
    case 'Excellent':
    case 'Strong':
      return 'text-green-600';
    case 'Good':
      return 'text-blue-600';
    case 'Moderate':
      return 'text-yellow-600';
    case 'Low':
    case 'Weak':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}
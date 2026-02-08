/**
 * Loan API Utilities
 * Client-side functions for fetching loan data
 */

import { api } from "@/src/lib/api";
import { LoanDTO } from "../types";
import { PaginationInfo } from "@/components/dashboard/data-table";

export interface DetailedLoanData {
  id: string;
  loanNumber: string;
  userId: string;
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
  residencyStatus: string;
  status: string;
  amountDisbursed: number;
  amountRepaid: number;
  outstandingBalance: number;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  firstPaymentDate?: string;
  lastPaymentDate?: string;
  completionDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Related data
  installments?: Array<{
    id: string;
    installmentNumber: number;
    amount: number;
    dueDate: string;
    paidDate: string | null;
    status: string;
    daysOverdue: number;
    lateFee: number;
  }>;
  documents?: Array<{
    id: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    isVerified: boolean;
    createdAt: string;
  }>;
  disbursement?: {
    id: string;
    disbursementReference: string;
    amount: number;
    status: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    disbursedAt: string | null;
    transferReference: string | null;
  } | null;
  school?: {
    id: string;
    schoolName: string;
    schoolAddress: string;
    city: string | null;
    state: string | null;
    country: string | null;
  };
}

/**
 * Fetch loan history with pagination
 */
export const fetchLoanHistory = async (
  page: number = 1,
  limit: number = 10,
  searchTerm?: string,
  status?: string
): Promise<{ loans: LoanDTO[] | [], pagination: PaginationInfo | undefined }> => {
  try {
    // Build URL with query parameters
    let url = `/api/loans/history?page=${page}&limit=${limit}`;
    
    // Add optional search term if provided
    if (searchTerm && searchTerm.trim() !== '') {
      url += `&search=${encodeURIComponent(searchTerm.trim())}`;
    }
    
    // Add optional status filter if provided
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    
    const response = await api.get(url);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error("Failed to fetch loan history:", data.message);
      return { loans: [], pagination: undefined };
    }
  } catch (error) {
    console.error("Error fetching loan history:", error);
    return { loans: [], pagination: undefined };
  }
};

/**
 * Fetch detailed loan information by ID
 */
export const fetchLoanDetails = async (loanId: string): Promise<DetailedLoanData | null> => {
  try {
    const url = `/api/loans/${loanId}/details`;
    const response = await api.get(url);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error("Failed to fetch loan details:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching loan details:", error);
    return null;
  }
};

/**
 * Fetch timeline data for a loan
 */
export const fetchTimelineData = async (loanId?: string) => {
  // Build URL with optional loanId query parameter
  const url = loanId
    ? `/api/loans/timeline?loanId=${loanId}`
    : '/api/loans/timeline';
  
  const response = await api.get(url);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch timeline data');
  }
  
  return result.data;
};

/**
 * Apply for a loan
 * Returns { success: boolean, data?: any, error?: string }
 */
export const applyForLoan = async (payload?: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await api.post('/api/loans/apply', payload);
    const result = await response.json();
    
    if (!result.success) {
      return {
        success: false,
        error: result.message || 'Failed to apply for loan'
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (err) {
    console.error('Error applying for loan:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred'
    };
  }
};


/**
 * Fetch payment plan data for active loan
 * Transforms detailed loan data into PaymentPlan format
 */
export const fetchPaymentPlanData = async (loanId?: string): Promise<any | null> => {
  try {
    // If loanId is provided, use it; otherwise the API will return the user's active loan
    const url = loanId 
      ? `/api/loans/${loanId}/payment-plan`
      : '/api/loans/payment-plan';
    
    console.log('🌐 Fetching payment plan from:', url);
    
    const response = await api.get(url);
    const data = await response.json();
    
    console.log('📡 Payment plan API response:', {
      success: data.success,
      hasData: !!data.data,
      message: data.message
    });
    
    if (data.success) {
      return data.data;
    } else {
      console.error("Failed to fetch payment plan:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching payment plan:", error);
    return null;
  }
};
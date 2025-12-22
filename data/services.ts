// API service functions
import type { ApiResponse, EarlyAccessFormData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'An error occurred',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Early access form submission
export async function submitEarlyAccess(
  formData: EarlyAccessFormData
): Promise<ApiResponse<{ message: string }>> {
  return apiRequest('/early-access', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

// Dashboard data fetching
export async function getDashboardStats() {
  return apiRequest('/dashboard/stats');
}

export async function getLoanHistory() {
  return apiRequest('/dashboard/loans');
}

export async function getTransactionHistory() {
  return apiRequest('/dashboard/transactions');
}

export async function getAnalyticsData(year?: string) {
  const params = year ? `?year=${year}` : '';
  return apiRequest(`/dashboard/analytics${params}`);
}

// Wallet operations
export async function getWalletBalance() {
  return apiRequest('/wallet/balance');
}

export async function topUpWallet(amount: number) {
  return apiRequest('/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

// School verification
export async function submitSchoolVerification(data: {
  schoolName: string;
  schoolAddress: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}) {
  return apiRequest('/school-verification', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getVerificationStatus() {
  return apiRequest('/school-verification/status');
}
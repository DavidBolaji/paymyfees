/**
 * Analytics API utilities
 */

import { api } from "@/src/lib/api";

export interface AnalyticsStats {
  walletBalance: number;
  totalWalletFunding: number;
  totalRepaymentsCompleted: number;
  totalRepaymentAmount: number;
  repaymentProgress: {
    completedInstallments: number;
    totalInstallments: number;
    percentage: number;
  };
  activeLoan: {
    id: string;
    loanNumber: string;
    totalAmount: number;
    amountRepaid: number;
    outstandingBalance: number;
    currentInstallment: number;
    totalInstallments: number;
  } | null;
  upcomingPayment: {
    amount: number;
    dueDate: Date | null;
    installmentNumber: number;
  } | null;
  fundingHistory: {
    count: number;
    totalAmount: number;
  };
  engagementScore: {
    score: number;
    percentage: number;
    metrics: {
      loginFrequency: number;
      paymentConsistency: number;
      walletActivity: number;
      notificationEngagement: number;
    };
  };
  timelineChart: {
    completedPercentage: number;
    pendingPercentage: number;
    completedCount: number;
    pendingCount: number;
  };
}

/**
 * Fetch analytics data for the current user
 */
export const fetchAnalytics = async (): Promise<AnalyticsStats | null> => {
  try {
    const response = await api.get('/api/analytics');
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error("Failed to fetch analytics:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return null;
  }
};
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { api } from '../lib/api';

// Types
export interface WalletBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
  virtualAccountNumber: string | null;
  virtualAccountBank: string | null;
}

export interface WalletTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  paymentMethod: string;
  method?: string; // For display in table
  transactionId?: string; // For display in table
}

export interface ChartData {
  month: string;
  fundings: number;
  repayments: number;
}

export interface PaymentCard {
  id: string;
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  isDefault: boolean;
}

export interface WalletStats {
  walletBalance: number;
  autoDebitStatus: 'Enabled' | 'Disabled';
  upcomingRepayment: {
    amount: number;
    dueDate: string;
  } | null;
  fundingHistory: {
    count: number;
    period: string;
  } | null;
}

interface WalletState {
  // Data
  balance: WalletBalance | null;
  transactions: WalletTransaction[];
  chartData: ChartData[];
  paymentMethods: PaymentCard[];
  stats: WalletStats | null;
  
  // UI States
  isLoading: boolean;
  isTransactionsLoading: boolean;
  isChartLoading: boolean;
  isPaymentMethodsLoading: boolean;
  error: string | null;
  
  // Payment states (NEW)
  isInitializingPayment: boolean;
  paymentError: string | null;
  
  // Pagination
  paginationInfo: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  
  // Actions
  fetchWalletBalance: (loanId?: string) => Promise<void>;
  fetchWalletTransactions: (page?: number, limit?: number) => Promise<void>;
  fetchChartData: (period?: string) => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  fundWallet: (amount: number, paymentMethod: string, currency: string) => Promise<boolean>; // DEPRECATED - use initializePayment
  initializePayment: (amount: number, paymentMethod: string, currency?: string, note?: string) => Promise<{ paymentUrl: string; reference: string }>; // NEW
  verifyPayment: (reference: string) => Promise<{ success: boolean; newBalance: number }>; // NEW
  addPaymentMethod: (paymentMethod: Omit<PaymentCard, 'id'>) => Promise<boolean>;
  removePaymentMethod: (id: string) => Promise<boolean>;
  clearPaymentError: () => void; // NEW
  reset: () => void;
}

const useWalletStore = create<WalletState>()(
  devtools(
    (set, get) => ({
      // Initial state
      balance: null,
      transactions: [],
      chartData: [],
      paymentMethods: [],
      stats: null,
      isLoading: false,
      isTransactionsLoading: false,
      isChartLoading: false,
      isPaymentMethodsLoading: false,
      error: null,
      isInitializingPayment: false,
      paymentError: null,
      paginationInfo: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
      
      // Actions
      fetchWalletBalance: async (loanId?: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const url = loanId ? `/api/wallet/balance?loanId=${encodeURIComponent(loanId)}` : '/api/wallet/balance';
          const response = await api.get(url);
          
          if (!response.ok) {
            throw new Error('Failed to fetch wallet balance');
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({
              balance: {
                balance: data.data.balance,
                currency: data.data.currency,
                lastUpdated: data.data.lastUpdated,
                virtualAccountNumber: data.data.virtualAccountNumber ?? null,
                virtualAccountBank: data.data.virtualAccountBank ?? null,
              },
              stats: {
                walletBalance: data.data.balance,
                autoDebitStatus: data.data.autoDebitEnabled ? 'Enabled' : 'Disabled',
                upcomingRepayment: data.data.upcomingRepayment,
                fundingHistory: data.data.fundingHistory,
              }
            });
          } else {
            throw new Error(data.message || 'Failed to fetch wallet balance');
          }
        } catch (error: any) {
          set({ error: error.message });
          console.error('Error fetching wallet balance:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      fetchWalletTransactions: async (page = 1, limit = 10) => {
        try {
          set({ isTransactionsLoading: true, error: null });
          
          const response = await api.get(`/api/wallet/transactions?page=${page}&limit=${limit}`);
          
          if (!response.ok) {
            const text = await response.text().catch(() => null);
            throw new Error(`Failed to fetch wallet transactions (status ${response.status})${text ? `: ${text}` : ''}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            // Transform transactions for display
            const transformedTransactions = data.data.transactions.map((t: any) => ({
              ...t,
              method: t.paymentMethod, // For display in table
              transactionId: t.reference.substring(0, 10), // For display in table
            }));
            
            set({ 
              transactions: transformedTransactions,
              paginationInfo: data.data.pagination
            });
          } else {
            throw new Error(data.message || 'Failed to fetch wallet transactions');
          }
        } catch (error: any) {
          set({ error: error.message });
          console.error('Error fetching wallet transactions:', error);
        } finally {
          set({ isTransactionsLoading: false });
        }
      },
      
      fetchChartData: async (period = '6months') => {
        try {
          set({ isChartLoading: true, error: null });
          
          const response = await api.get(`/api/wallet/chart?period=${period}`);
          
          if (!response.ok) {
            const text = await response.text().catch(() => null);
            throw new Error(`Failed to fetch wallet chart data (status ${response.status})${text ? `: ${text}` : ''}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ chartData: data.data });
          } else {
            throw new Error(data.message || 'Failed to fetch wallet chart data');
          }
        } catch (error: any) {
          set({ error: error.message });
          console.error('Error fetching chart data:', error);
        } finally {
          set({ isChartLoading: false });
        }
      },
      
      fetchPaymentMethods: async () => {
        try {
          set({ isPaymentMethodsLoading: true, error: null });
          
          // In a real app, we would fetch from an API endpoint
          // For now, we'll simulate with mock data
          const mockPaymentMethods = [
            {
              id: '1',
              cardNumber: '****5524',
              cardType: 'Mastercard',
              expiryDate: '09/28',
              isDefault: true,
            }
          ];
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ paymentMethods: mockPaymentMethods });
        } catch (error: any) {
          set({ error: error.message });
          console.error('Error fetching payment methods:', error);
        } finally {
          set({ isPaymentMethodsLoading: false });
        }
      },
      
      /**
       * DEPRECATED: Use initializePayment instead
       * This method is kept for backward compatibility but will redirect to Paystack
       */
      fundWallet: async (amount, paymentMethod, currency) => {
        try {
          console.warn('fundWallet is deprecated. Use initializePayment instead.');
          
          // Convert old method to new method
          const result = await get().initializePayment(amount, paymentMethod, currency);
          
          // Redirect to payment URL
          if (result.paymentUrl) {
            // Store reference for verification
            sessionStorage.setItem('pending_payment_reference', result.reference);
            sessionStorage.setItem('pending_payment_amount', amount.toString());
            
            // Redirect to Paystack
            window.location.href = result.paymentUrl;
            return true;
          }
          
          return false;
        } catch (error: any) {
          set({ error: error.message });
          console.error('Error funding wallet:', error);
          return false;
        }
      },
      
      /**
       * NEW: Initialize payment with Paystack
       * Returns payment URL for redirect
       */
      initializePayment: async (amount, paymentMethod, currency = 'NGN', note) => {
        set({ isInitializingPayment: true, paymentError: null });
        
        try {
          const response = await api.post('/api/wallet/initialize-payment', {
            amount,
            paymentMethod: paymentMethod.toUpperCase().replace(/ /g, '_'),
            currency,
            note,
            callbackUrl: `${window.location.origin}/wallet/payment-callback`,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to initialize payment');
          }

          const data = await response.json();

          if (!data.success || !data.data.paymentUrl) {
            throw new Error('Invalid response from server');
          }

          set({ isInitializingPayment: false });

          return {
            paymentUrl: data.data.paymentUrl,
            reference: data.data.reference,
          };
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to initialize payment';
          set({ 
            isInitializingPayment: false,
            paymentError: errorMessage,
          });
          throw error;
        }
      },

      /**
       * NEW: Verify payment after Paystack redirect
       * Updates wallet balance on success
       */
      verifyPayment: async (reference) => {
        try {
          const response = await api.get(`/api/wallet/verify-payment/${reference}`);
          
          if (!response.ok) {
            throw new Error('Failed to verify payment');
          }

          const data = await response.json();

          if (data.success && data.data.verified) {
            // Refresh wallet balance and transactions
            await get().fetchWalletBalance();
            await get().fetchWalletTransactions();
            
            return {
              success: true,
              newBalance: data.data.newBalance,
            };
          }

          throw new Error('Payment verification failed');
        } catch (error: any) {
          console.error('Error verifying payment:', error);
          throw error;
        }
      },
      
      addPaymentMethod: async (paymentMethod) => {
        try {
          set({ isPaymentMethodsLoading: true, error: null });
          
          // In a real app, we would call an API endpoint
          // For now, we'll simulate success
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Add to existing payment methods
          const newPaymentMethod = {
            ...paymentMethod,
            id: Date.now().toString(),
          };
          
          set(state => ({
            paymentMethods: [...state.paymentMethods, newPaymentMethod]
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message });
          console.error('Error adding payment method:', error);
          return false;
        } finally {
          set({ isPaymentMethodsLoading: false });
        }
      },
      
      removePaymentMethod: async (id) => {
        try {
          set({ isPaymentMethodsLoading: true, error: null });
          
          // In a real app, we would call an API endpoint
          // For now, we'll simulate success
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Remove from existing payment methods
          set(state => ({
            paymentMethods: state.paymentMethods.filter(pm => pm.id !== id)
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message });
          console.error('Error removing payment method:', error);
          return false;
        } finally {
          set({ isPaymentMethodsLoading: false });
        }
      },
      
      /**
       * NEW: Clear payment error
       */
      clearPaymentError: () => {
        set({ paymentError: null });
      },
      
      reset: () => {
        set({
          balance: null,
          transactions: [],
          chartData: [],
          paymentMethods: [],
          stats: null,
          isLoading: false,
          isTransactionsLoading: false,
          isChartLoading: false,
          isPaymentMethodsLoading: false,
          error: null,
          isInitializingPayment: false,
          paymentError: null,
          paginationInfo: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          },
        });
      },
    }),
    { name: 'wallet-store' }
  )
);

export default useWalletStore;
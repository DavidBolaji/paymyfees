import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TransactionItem } from '@/data';
import { PaginationInfo } from '@/components/dashboard/data-table';

interface TransactionState {
    transactions: TransactionItem[];
    hasHydrated: boolean;
    paginationInfo: PaginationInfo | undefined;
    lastFetched: number | null; // Timestamp of last fetch
    
    setPaginationInfo: (pagination: PaginationInfo | undefined) => void;
    setTransaction: (loan: TransactionItem[]) => void;
    setHasHydrated: (value: boolean) => void;
    setLastFetched: (timestamp: number) => void;
    shouldRefetch: () => boolean;
    clearCache: () => void;
}

const CACHE_DURATION = 2 * 60 * 1000; // 5 minutes in milliseconds

const useTransactionStore = create<TransactionState>()(
    persist(
        (set, get) => ({
            paginationInfo: undefined,
            transactions: [],
            hasHydrated: false,
            lastFetched: null,

            setTransaction: (transactions) =>
                set({
                    transactions: transactions,
                }),
            
            setPaginationInfo: (pagination) =>
                set({
                    paginationInfo: pagination,
                }),

            setHasHydrated: (value) =>
                set({
                    hasHydrated: value,
                }),

            setLastFetched: (timestamp) =>
                set({
                    lastFetched: timestamp,
                }),

            // Check if data should be refetched
            shouldRefetch: () => {
                const { lastFetched, transactions } = get();
                
                // No data in store, should fetch
                if (!transactions || transactions.length === 0) {
                    return true;
                }
                
                // No last fetch timestamp, should fetch
                if (!lastFetched) {
                    return true;
                }
                
                // Check if cache has expired
                const now = Date.now();
                const cacheAge = now - lastFetched;
                return cacheAge > CACHE_DURATION;
            },

            clearCache: () =>
                set({
                    transactions: [],
                    paginationInfo: undefined,
                    lastFetched: null,
                }),
        }),
        {
            name: 'paymyfess-transaction-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

export default useTransactionStore;
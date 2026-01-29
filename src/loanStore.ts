import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoanHistoryItem } from '@/data';
import { PaginationInfo } from '@/components/dashboard/data-table';

interface LoanState {
    loanHistory: LoanHistoryItem[];
    hasHydrated: boolean;
    paginationInfo: PaginationInfo | undefined;
    lastFetched: number | null; // Timestamp of last fetch
    currentLoan: LoanHistoryItem | null;

    setPaginationInfo: (pagination: PaginationInfo | undefined) => void;
    setLoanHistory: (loan: LoanHistoryItem[]) => void;
    setCurrentLoan: (loan: LoanHistoryItem | null) => void;
    setHasHydrated: (value: boolean) => void;
    setLastFetched: (timestamp: number) => void;
    shouldRefetch: () => boolean;
    clearCache: () => void;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

const useLoanStore = create<LoanState>()(
    persist(
        (set, get) => ({
            paginationInfo: undefined,
            loanHistory: [],
            hasHydrated: false,
            lastFetched: null,
             currentLoan: null,

            setLoanHistory: (loan) =>
                set({
                    loanHistory: loan,
                }),

            setCurrentLoan: (loan) =>
                set({
                    currentLoan: loan,
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
                const { lastFetched, loanHistory } = get();

                // No data in store, should fetch
                if (!loanHistory || loanHistory.length === 0) {
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
                   loanHistory: [],
                    currentLoan: null,
                    paginationInfo: undefined,
                    lastFetched: null,
                }),
        }),
        {
            name: 'paymyfess-loan-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

export default useLoanStore;
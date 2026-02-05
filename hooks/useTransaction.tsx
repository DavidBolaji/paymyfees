import { mapTransactionsToItems } from "@/lib/utils"
import useTransactionStore from "@/src/transactionStore"

import { fetchRecentTransactions } from "@/src/utils/transaction-api"
import { useEffect, useState } from "react"

const useTransaction = (forceRefresh = false) => {
    const {
        setTransaction,
        setPaginationInfo,
        transactions,
        paginationInfo,
        hasHydrated,
        shouldRefetch,
        setLastFetched,
        clearCache
    } = useTransactionStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, ] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [type, ] = useState<string | undefined>(undefined);

    useEffect(() => {
        // Wait for hydration before checking cache
        if (!hasHydrated) {
            return;
        }

        const loadData = async () => {
            // Check if we should fetch based on cache status
            const needsFetch = forceRefresh || shouldRefetch();

            if (!needsFetch) {
                console.log('Using cached loan data');
                return;
            }

            console.log('Fetching fresh loan data');
            setLoading(true);
            setError(null);

            try {
                const transactionData = await fetchRecentTransactions(page, limit, searchTerm, type);
                setTransaction(mapTransactionsToItems(transactionData.transactions));
                setPaginationInfo(transactionData?.pagination);
                setLastFetched(Date.now());
            } catch (err) {
                console.error('Error loading transactions:', err);
                setError(err instanceof Error ? err.message : 'Failed to load transactions');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [hasHydrated, forceRefresh, page, limit, searchTerm, type]);

    const refresh = async () => {
        setLoading(true);
        setError(null);

        try {
            const transactionData = await fetchRecentTransactions(page, limit, searchTerm, type);
            setTransaction(mapTransactionsToItems(transactionData.transactions));
            setPaginationInfo(transactionData?.pagination);
            setLastFetched(Date.now());
        } catch (err) {
            console.error('Error refreshing transactions:', err);
            setError(err instanceof Error ? err.message : 'Failed to refresh transactions');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = async (newPage: number) => {
        setPage(newPage);
        setLoading(true);
        
        try {
            const transactionData = await fetchRecentTransactions(newPage, limit, searchTerm, type);
            setTransaction(mapTransactionsToItems(transactionData.transactions));
            setPaginationInfo(transactionData?.pagination);
            setLastFetched(Date.now());
        } catch (err) {
            console.error('Error changing page:', err);
            setError(err instanceof Error ? err.message : 'Failed to change page');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchTerm(query);
        setPage(1); // Reset to first page when searching
        setLoading(true);
        
        try {
            const transactionData = await fetchRecentTransactions(1, limit, query, type);
            setTransaction(mapTransactionsToItems(transactionData.transactions));
            setPaginationInfo(transactionData?.pagination);
            setLastFetched(Date.now());
        } catch (err) {
            console.error('Error searching transactions:', err);
            setError(err instanceof Error ? err.message : 'Failed to search transactions');
        } finally {
            setLoading(false);
        }
    };

    return {
        transactions,
        paginationInfo,
        loading: !hasHydrated || loading,
        error,
        refresh,
        clearCache,
        handlePageChange,
        handleSearch,
        searchTerm,
        page
    };
}

export default useTransaction;
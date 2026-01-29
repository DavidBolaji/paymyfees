import { mapLoansToHistoryItems } from "@/lib/utils"
import useLoanStore from "@/src/loanStore"
import { fetchLoanHistory, fetchTimelineData } from "@/src/utils/loan-api"
import { LoanStatus } from "@prisma/client"
import { useEffect, useState } from "react"

const useLoan = (forceRefresh = false) => {
    const {
        setLoanHistory,
        setPaginationInfo,
        loanHistory,
        currentLoan,
        paginationInfo,
        hasHydrated,
        shouldRefetch,
        setLastFetched,
        setCurrentLoan,
        clearCache
    } = useLoanStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<string | undefined>(undefined);

    // Define active statuses
    const activeStatuses = [
        LoanStatus.ACTIVE,
        LoanStatus.DISBURSED,
        LoanStatus.APPROVED,
        LoanStatus.UNDER_REVIEW,
        LoanStatus.PENDING,
    ];

    // Helper function to fetch and add repayment progress data
    const addRepaymentProgressToLoans = async (loans: any[], mappedLoans: any[]) => {
        if (!loans || loans.length === 0) return mappedLoans;

        const activeLoans = loans.filter(loan =>
            activeStatuses.includes(loan.status.toUpperCase() as any)
        );
        
        if (activeLoans.length > 0 && activeLoans[0]) {
            try {
                const timelineData = await fetchTimelineData(activeLoans[0].id);
                if (timelineData && timelineData.progressOverview && activeLoans[0].loanNumber) {
                    // Find the corresponding loan in the mapped array
                    const loanIndex = mappedLoans.findIndex(loan =>
                        loan.loanId === activeLoans[0].loanNumber
                    );
                    
                    if (loanIndex !== -1) {
                        mappedLoans[loanIndex].repaymentProgress = timelineData.progressOverview;
                    }
                }
            } catch (err) {
                console.error('Error fetching timeline data:', err);
            }
        }
        
        return mappedLoans;
    };

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
                const loanData = await fetchLoanHistory(page, limit, searchTerm, status);
                let trimmed = mapLoansToHistoryItems(loanData.loans);
                
                // Add repayment progress data
                trimmed = await addRepaymentProgressToLoans(loanData.loans, trimmed);
                
                setLoanHistory(trimmed);
                setPaginationInfo(loanData?.pagination);
                
                const curLoan = trimmed.filter(loan =>
                    activeStatuses.includes(loan.status.toUpperCase() as any)
                )[0];
                
                setCurrentLoan(curLoan ?? null);
                setLastFetched(Date.now());
            } catch (err) {
                console.error('Error loading loan history:', err);
                setError(err instanceof Error ? err.message : 'Failed to load loans');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [hasHydrated, forceRefresh, page, limit, searchTerm, status]);

    const refresh = async () => {
        setLoading(true);
        setError(null);

        try {
            const loanData = await fetchLoanHistory(page, limit, searchTerm, status);
            let trimmed = mapLoansToHistoryItems(loanData.loans);
            
            // Add repayment progress data
            trimmed = await addRepaymentProgressToLoans(loanData.loans, trimmed);
            
            setLoanHistory(trimmed);
            setPaginationInfo(loanData?.pagination);
            setLastFetched(Date.now());
        } catch (err) {
            console.error('Error refreshing loan history:', err);
            setError(err instanceof Error ? err.message : 'Failed to refresh loans');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = async (newPage: number) => {
        setPage(newPage);
        setLoading(true);
        
        try {
            const loanData = await fetchLoanHistory(newPage, limit, searchTerm, status);
            let trimmed = mapLoansToHistoryItems(loanData.loans);
            
            // Add repayment progress data
            trimmed = await addRepaymentProgressToLoans(loanData.loans, trimmed);
            
            setLoanHistory(trimmed);
            setPaginationInfo(loanData?.pagination);
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
            const loanData = await fetchLoanHistory(1, limit, query, status);
            let trimmed = mapLoansToHistoryItems(loanData.loans);
            
            // Add repayment progress data
            trimmed = await addRepaymentProgressToLoans(loanData.loans, trimmed);
            
            setLoanHistory(trimmed);
            setPaginationInfo(loanData?.pagination);
            setLastFetched(Date.now());
        } catch (err) {
            console.error('Error searching loans:', err);
            setError(err instanceof Error ? err.message : 'Failed to search loans');
        } finally {
            setLoading(false);
        }
    };

    return {
        loanHistory,
        currentLoan,
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

export default useLoan;
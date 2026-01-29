import { api } from "@/src/lib/api";
import { LoanDTO } from "../types";
import { PaginationInfo } from "@/components/dashboard/data-table";


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

export const fetchTimelineData = async (loanId?: string) => {
  try {
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
  } catch (err) {
    console.error('Error fetching timeline:', err);
    console.log(err instanceof Error ? err.message : 'An error occurred');
  } 
}

export const applyForLoan = async (payload?: any) => {
  try {
    // Build URL with optional loanId query parameter
    const response = await api.post('/api/loans/apply', payload);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch timeline data');
    }

    return result.data;
  } catch (err) {
    console.error('Error fetching timeline:', err);
    console.log(err instanceof Error ? err.message : 'An error occurred');
  } 
}
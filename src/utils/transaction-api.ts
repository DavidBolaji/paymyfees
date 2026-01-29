import { api } from "@/src/lib/api";
import { TransactionDTO } from "../types";
import { PaginationInfo } from "@/components/dashboard/data-table";


export const fetchRecentTransactions = async (
  page: number = 1,
  limit: number = 10,
  searchTerm?: string,
  type?: string
): Promise<{ transactions: TransactionDTO[] | [], pagination: PaginationInfo | undefined} > => {
  try {
    // Build URL with query parameters
    let url = `/api/transactions?page=${page}&limit=${limit}`;
    
    // Add optional search term if provided
    if (searchTerm && searchTerm.trim() !== '') {
      url += `&search=${encodeURIComponent(searchTerm.trim())}`;
    }
    
    // Add optional type filter if provided
    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }
    
    const response = await api.get(url);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error("Failed to fetch transactions:", data.message);
      return {transactions: [], pagination: undefined};
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {transactions: [], pagination: undefined};
  }
};
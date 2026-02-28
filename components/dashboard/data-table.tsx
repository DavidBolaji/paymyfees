'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  label: string;
  width?: string;
}

interface TableData {
  [key: string]: any;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: TableData[];
  searchable?: boolean;
  filterable?: boolean;
  viewAllHref?: string;
  className?: string;
  onRowClick?: (item: TableData) => void;
  paginationInfo?: PaginationInfo;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  itemsPerPage?: number;
}

export function DataTable({
  title,
  columns,
  data,
  searchable = true,
  filterable = true,
  viewAllHref,
  className,
  onRowClick,
  paginationInfo,
  onPageChange,
  isLoading = false,
  itemsPerPage = 10
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<TableData[]>(data);

  const isServerPaginated = !!paginationInfo && !!onPageChange;
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(data);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTermLower);
      });
    });
    
    setFilteredData(filtered);
  }, [searchTerm, data]);
  
  const currentPage = paginationInfo?.page || 1;
  const totalPages = paginationInfo?.totalPages || 1;
  const total = paginationInfo?.total || 0;
  const limit = itemsPerPage || paginationInfo?.limit || 5;
  const isEmpty = data.length === 0;

  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + data.length, total);

  const emptyRowsCount = isServerPaginated ? limit : itemsPerPage;
  const fillerRowsCount = filteredData.length > 0 && filteredData.length < emptyRowsCount ? emptyRowsCount - filteredData.length : 0;
  const emptyRows = Array(emptyRowsCount).fill(null);
  const fillerRows = Array(fillerRowsCount).fill(null);

  const handlePageChange = (page: number) => {
    if (isServerPaginated && onPageChange) {
      onPageChange(page);
    }
  };

  const renderCellContent = (item: TableData, column: Column) => {
    const value = item[column.key];
    
    if (column.key === 'status' && typeof value === 'string') {
      return <StatusBadge status={value as any} />;
    }
    
    if (column.key.includes('amount') || column.key.includes('tuition') || column.key.includes('Amount')) {
      return <span className="font-medium">{value?.toLocaleString()}</span>;
    }
    
    return value;
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            disabled={isEmpty && i !== 1}
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 border-t border-b border-r border-gray-300 flex items-center justify-center text-xs sm:text-sm font-medium transition-colors",
              currentPage === i
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-600 hover:bg-gray-50",
              isEmpty && i !== 1 && "opacity-50 cursor-not-allowed"
            )}
          >
            {i}
          </button>
        );
      }
    } else {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 border-t border-b border-r border-gray-300 flex items-center justify-center text-xs sm:text-sm font-medium transition-colors",
            currentPage === 1
              ? "bg-gray-900 text-white border-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          1
        </button>
      );

      if (totalPages >= 2) {
        buttons.push(
          <button
            key={2}
            onClick={() => handlePageChange(2)}
            disabled={isEmpty}
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 border-t border-b border-r border-gray-300 flex items-center justify-center text-xs sm:text-sm font-medium transition-colors",
              currentPage === 2
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-600 hover:bg-gray-50",
              isEmpty && "opacity-50 cursor-not-allowed"
            )}
          >
            2
          </button>
        );
      }

      if (totalPages >= 3) {
        buttons.push(
          <button
            key={3}
            onClick={() => handlePageChange(3)}
            disabled={isEmpty}
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 border-t border-b border-r border-gray-300 flex items-center justify-center text-xs sm:text-sm font-medium transition-colors",
              currentPage === 3
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-600 hover:bg-gray-50",
              isEmpty && "opacity-50 cursor-not-allowed"
            )}
          >
            3
          </button>
        );
      }

      if (totalPages > 4) {
        buttons.push(
          <span key="ellipsis" className="px-1 sm:px-2 text-gray-400 border-t border-b border-gray-300 h-8 sm:h-10 flex items-center text-xs sm:text-sm">
            ...
          </span>
        );
      }

      if (totalPages > 3) {
        buttons.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            disabled={isEmpty}
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 border-t border-b border-r border-gray-300 flex items-center justify-center text-xs sm:text-sm font-medium transition-colors",
              currentPage === totalPages
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-600 hover:bg-gray-50",
              isEmpty && "opacity-50 cursor-not-allowed"
            )}
          >
            {totalPages}
          </button>
        );
      }
    }

    return buttons;
  };

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[#EFEFEF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Search */}
            {searchable && (
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-48 md:w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {/* Filter */}
            {filterable && (
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm whitespace-nowrap">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            )}
            
            {/* View All */}
            {viewAllHref && (
              <Link 
                href={viewAllHref}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
              >
                View All
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-grow" style={{ minHeight: '330px' }}>
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap",
                    column.width && `w-${column.width}`
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading ? (
              emptyRows.map((_, index) => (
                <tr key={`loading-${index}`} className="animate-pulse">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : isEmpty || filteredData.length === 0 ? (
              emptyRows.map((_, index) => (
                <tr key={`empty-${index}`} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-400">
                      {["tuitionAmount", "amount"].includes(column.key) ? "₦-": "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <>
                {filteredData.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "hover:bg-gray-50 transition-colors text-[#7C7C7C]",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-sm text-gray-700">
                        {renderCellContent(item, column)}
                      </td>
                    ))}
                  </tr>
                ))}
                
                {fillerRows.map((_, index) => (
                  <tr key={`filler-${index}`} className="hover:bg-gray-50 transition-colors">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-400">
                        {["tuitionAmount", "amount"].includes(column.key) ? "₦-": "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {isServerPaginated && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-row items-center justify-between gap-3 mt-auto">
          <div className="text-xs sm:text-sm text-gray-500">
            {isEmpty ? (
              "Showing 0 of 0 Records"
            ) : (
              `Showing ${startIndex + 1}-${endIndex} of ${total} Records`
            )}
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isEmpty || isLoading}
              className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-l-md flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {renderPaginationButtons()}
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || isEmpty || isLoading}
              className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-r-md flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

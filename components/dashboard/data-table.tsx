'use client';

import { useState } from 'react';
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

interface DataTableProps {
  title: string;
  columns: Column[];
  data: TableData[];
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  viewAllHref?: string;
  className?: string;
  onRowClick?: (item: TableData) => void;
  itemsPerPage?: number;
}

export function DataTable({
  title,
  columns,
  data,
  searchable = true,
  filterable = true,
  pagination = true,
  viewAllHref,
  className,
  onRowClick,
  itemsPerPage = 10
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const renderCellContent = (item: TableData, column: Column) => {
    const value = item[column.key];
    
    // Handle status badges
    if (column.key === 'status' && typeof value === 'string') {
      return <StatusBadge status={value as any} />;
    }
    
    // Handle currency formatting
    if (column.key.includes('amount') || column.key.includes('tuition')) {
      return <span className="font-medium">₦{value?.toLocaleString()}</span>;
    }
    
    return value;
  };

  return (
    <div className={cn("bg-white h-full rounded-xl border border-gray-200 shadow-sm", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {/* Filter */}
            {filterable && (
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            )}
            
            {/* View All */}
            {viewAllHref && (
              <Link 
                href={viewAllHref}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.width && `w-${column.width}`
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedData.map((item, index) => (
              <tr 
                key={index} 
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "hover:bg-gray-50 transition-colors text-[#7C7C7C]",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap font-medium text-sm text-gray-700 text-[0.9375rem] ">
                    {renderCellContent(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} Records
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Fixed Pagination Format: 1 2 3 ... 20 */}
            <button
              onClick={() => setCurrentPage(1)}
              className={cn(
                "w-10 h-10 border-t border-b border-r border-gray-300 flex items-center justify-center text-sm font-medium",
                currentPage === 1
                  ? "bg-gray-900 text-white border-gray-900"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              1
            </button>
            
            <button
              onClick={() => setCurrentPage(2)}
              className={cn(
                "w-10 h-10 border-t border-b border-r border-gray-300 flex items-center justify-center text-sm font-medium",
                currentPage === 2
                  ? "bg-gray-900 text-white border-gray-900"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              2
            </button>
            
            <button
              onClick={() => setCurrentPage(3)}
              className={cn(
                "w-10 h-10 border-t border-b border-r border-gray-300 flex items-center justify-center text-sm font-medium",
                currentPage === 3
                  ? "bg-gray-900 text-white border-gray-900"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              3
            </button>
            
            <span className="px-2 text-gray-400 border-t border-b border-gray-300 h-10 flex items-center">...</span>
            
            <button
              onClick={() => setCurrentPage(20)}
              className={cn(
                "w-10 h-10 border-t border-b border-r border-gray-300 flex items-center justify-center text-sm font-medium",
                currentPage === 20
                  ? "bg-gray-900 text-white border-gray-900"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              20
            </button>
            
            <button
              onClick={() => setCurrentPage(Math.min(20, currentPage + 1))}
              disabled={currentPage === 20}
              className="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
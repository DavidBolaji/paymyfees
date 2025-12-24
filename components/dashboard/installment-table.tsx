'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentInstallment } from '@/data/types';

interface InstallmentTableProps {
  installments: PaymentInstallment[];
}

export function InstallmentTable({ installments }: InstallmentTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(installments.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInstallments = installments.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center bg-green-100 px-2 py-1 rounded-full font-medium text-green-800 text-xs">
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center bg-yellow-100 px-2 py-1 rounded-full font-medium text-yellow-800 text-xs">
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center bg-red-100 px-2 py-1 rounded-full font-medium text-red-800 text-xs">
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-full font-medium text-gray-800 text-xs">
            {status}
          </span>
        );
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-gray-200 border-b">
              <th className="px-4 py-3 font-medium text-[#7C7C7C] text-xs text-left uppercase tracking-wider">
                INSTALLMENT
              </th>
              <th className="px-4 py-3 font-medium text-[#7C7C7C] text-xs text-left uppercase tracking-wider">
                AMOUNT
              </th>
              <th className="px-4 py-3 font-medium text-[#7C7C7C] text-xs text-left uppercase tracking-wider">
                DUE DATE
              </th>
              <th className="px-4 py-3 font-medium text-[#7C7C7C] text-xs text-left uppercase tracking-wider">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentInstallments.map((installment) => (
              <tr key={installment.installmentNumber} className="hover:bg-gray-50">
                <td className="px-4 py-4 font-medium text-[#191919] text-sm">
                  {installment.installmentNumber} of {installments.length}
                </td>
                <td className="px-4 py-4 text-[#191919] text-sm">
                  ₦{installment.amount.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-[#191919] text-sm">
                  {installment.dueDate}
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(installment.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-[#7C7C7C] text-sm">
          Showing {startIndex + 1}-{Math.min(endIndex, installments.length)} of {installments.length} Records
        </p>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "p-2 border rounded-lg",
              currentPage === 1
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={cn(
                  "px-3 py-2 rounded-lg font-medium text-sm",
                  currentPage === page
                    ? "bg-[#00296B] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {page}
              </button>
            );
          })}
          
          {totalPages > 5 && (
            <>
              <span className="px-2 text-gray-400">...</span>
              <button
                onClick={() => handlePageChange(totalPages)}
                className="hover:bg-gray-50 px-3 py-2 rounded-lg font-medium text-gray-600 text-sm"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "p-2 border rounded-lg",
              currentPage === totalPages
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
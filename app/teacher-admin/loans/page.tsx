'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { LoanDetailDrawer } from '@/components/dashboard/loan-detail-drawer';
import { api } from '@/src/lib/api';

const COLUMNS = [
  { key: 'loanNumber', label: 'Loan #' },
  { key: 'teacherName', label: 'Teacher Name' },
  { key: 'schoolName', label: 'School' },
  { key: 'loanAmount', label: 'Amount (₦)' },
  { key: 'repaymentMonths', label: 'Duration' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Applied' },
];

export default function TeacherAdminLoansPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/api/teacher-admin/loans?page=${page}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      const json = await res.json();
      setData(json.data ?? []);
      setPagination(json.metadata?.pagination ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleRowClick = (row: any) => {
    setSelectedLoan(row);
    setDrawerOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Loan Applications</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="DISBURSED">Disbursed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <DataTable
        title="Loan Applications"
        columns={COLUMNS}
        data={data}
        isLoading={loading}
        itemsPerPage={10}
        paginationInfo={pagination}
        onPageChange={fetchData}
        onRowClick={handleRowClick}
      />

      <LoanDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        loan={selectedLoan}
        onRefresh={() => fetchData()}
        userLabel="Teacher Information"
        loansBasePath="/api/teacher-admin/loans"
      />
    </div>
  );
}

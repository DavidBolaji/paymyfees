'use client';

import { useState, useEffect } from 'react';
import { DataTable, PaginationInfo } from '@/components/dashboard/data-table';
import { LoanDetailDrawer } from '@/components/dashboard/loan-detail-drawer';
import { BackNavigation } from '@/components/dashboard';
import { api } from '@/src/lib/api';

const TABLE_COLUMNS = [
  { key: 'userName', label: 'Student Name' },
  { key: 'schoolName', label: 'School' },
  { key: 'loanNumber', label: 'Application ID' },
  { key: 'status', label: 'Status' },
  { key: 'loanAmount', label: 'Loan Amount' },
  { key: 'applicationDate', label: 'Date' },
];

function fmt(d: any) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
}

function toRow(l: any) {
  return {
    ...l,
    loanAmount: `₦${Number(l.loanAmount || 0).toLocaleString()}`,
    applicationDate: fmt(l.applicationDate),
  };
}

export default function AllLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  useEffect(() => { fetchLoans(1); }, []);

  const fetchLoans = async (page: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/loans?page=${page}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setLoans((data.data || []).map(toRow));
        setPagination(data.metadata?.pagination);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleRowClick = async (loan: any) => {
    try {
      setDrawerLoading(true);
      setShowDrawer(true);
      const res = await api.get(`/api/admin/loans/${loan.id}`);
      const data = await res.json();
      if (data.success) setSelectedLoan(data.data);
    } catch (e) { console.error(e); }
    finally { setDrawerLoading(false); }
  };

  return (
    <div className="p-4 md:p-6 pt-6 md:pt-0">
      <BackNavigation href="/admin/loans" label="Back to dashboard" />
      <div className="mb-6">
        <h2 className="font-semibold text-[#191919] text-xl md:text-[1.6875rem]">
          All Loan Applications
        </h2>
      </div>
      <DataTable
        title="All Loan Applications"
        columns={TABLE_COLUMNS}
        data={loans}
        paginationInfo={pagination ?? undefined}
        onPageChange={fetchLoans}
        itemsPerPage={20}
        isLoading={loading}
        onRowClick={handleRowClick}
        searchable
      />
      <LoanDetailDrawer
        isOpen={showDrawer}
        onClose={() => { setShowDrawer(false); setSelectedLoan(null); }}
        loan={selectedLoan}
        isLoading={drawerLoading}
      />
    </div>
  );
}

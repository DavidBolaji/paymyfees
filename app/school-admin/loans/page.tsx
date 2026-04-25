'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { api } from '@/src/lib/api';

const COLUMNS = [
  { key: 'loanNumber', label: 'Loan #' },
  { key: 'teacherName', label: 'Teacher' },
  { key: 'loanAmount', label: 'Amount' },
  { key: 'schoolName', label: 'School' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Applied' },
];

export default function SchoolAdminLoansPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/loans?page=${page}&limit=10&role=TEACHER`);
      const json = await res.json();
      setData(json.data?.loans ?? json.data ?? []);
      setPagination(json.data?.pagination ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Teacher Loan Applications</h1>
      <DataTable
        title="All Loans"
        columns={COLUMNS}
        data={data}
        isLoading={loading}
        itemsPerPage={10}
        paginationInfo={pagination}
        onPageChange={fetchData}
      />
    </div>
  );
}

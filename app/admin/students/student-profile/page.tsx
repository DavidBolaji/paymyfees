'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/dashboard/data-table';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';
import { BackNavigation } from '@/components/dashboard';

const COLUMNS = [
  { key: 'studentName', label: 'Student Name' },
  { key: 'loanNumber', label: 'Loan Reference' },
  { key: 'school', label: 'School' },
  { key: 'totalAmount', label: 'Loan Amount' },
  { key: 'outstandingBalance', label: 'Outstanding' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Date' },
];

export default function StudentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return; }
    fetchStudents(1);
  }, [user]);

  const fetchStudents = async (page: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/students?page=${page}&limit=10`);
      const data = await res.json();
      setStudents(data.data || []);
      setPagination(data.metadata?.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_MAP: Record<string, string> = {
    DISBURSED: 'ongoing',
    ACTIVE: 'ongoing',
    PENDING: 'ongoing',
    APPROVED: 'pending',
    COMPLETED: 'completed',
    DEFAULTED: 'cancelled',
    CANCELLED: 'cancelled',
  };

  const formatted = students.map(s => ({
    ...s,
    totalAmount: s.totalAmount != null ? `₦${Number(s.totalAmount).toLocaleString()}` : 'N/A',
    outstandingBalance: s.outstandingBalance != null ? `₦${Number(s.outstandingBalance).toLocaleString()}` : 'N/A',
    status: STATUS_MAP[s.status] ?? s.status,
    date: s.date ? new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
  }));

  const handleRowClick = (row: any) => {
    router.push(`/admin/students/student-profile/${row.userId}`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <BackNavigation href={'/admin'} label="Back to Dashboard" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191919]">Student Profiles</h1>
        <p className="text-gray-500 mt-1">All students with active loans</p>
      </div>

      <DataTable
        title="Student Profiles"
        columns={COLUMNS}
        data={formatted}
        onRowClick={handleRowClick}
        paginationInfo={pagination}
        onPageChange={fetchStudents}
        isLoading={loading}
        itemsPerPage={10}
      />
    </div>
  );
}

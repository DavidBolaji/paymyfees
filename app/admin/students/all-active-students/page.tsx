'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/dashboard/data-table';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';
import { BackNavigation } from '@/components/dashboard';

const COLUMNS = [
  { key: 'studentName', label: 'Student Name' },
  { key: 'school', label: 'School' },
  { key: 'issue', label: 'Issue' },
  { key: 'status', label: 'Status' },
  { key: 'lastActivity', label: 'Last Activity' },
  { key: 'date', label: 'Date' },
];

const STATUS_MAP: Record<string, string> = {
  DISBURSED: 'ongoing',
  ACTIVE: 'ongoing',
  PENDING: 'pending',
  UNDER_REVIEW: 'pending',
  APPROVED: 'pending',
  COMPLETED: 'completed',
  DEFAULTED: 'cancelled',
  REJECTED: 'cancelled',
  CANCELLED: 'cancelled',
};

function fmt(d: any) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
}

export default function AllActiveStudentsPage() {
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

  const formatted = students.map(s => ({
    ...s,
    issue: s.status === 'DEFAULTED' ? 'Loan Default' : s.status === 'COMPLETED' ? 'None' : 'Active Loan',
    status: STATUS_MAP[s.status] ?? s.status,
    lastActivity: fmt(s.lastActivity),
    date: fmt(s.date),
  }));

  return (
    <div className="bg-[#F6F6F6] min-h-full p-4 sm:p-6 md:p-8">
      <BackNavigation href="/admin/students" label="Back to Dashboard" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191919]">All Active Students</h1>
        <p className="text-[#5F5F5F] mt-1">Full list of all students enrolled on PayMyFees.</p>
      </div>

      <DataTable
        title="All Active Students"
        columns={COLUMNS}
        data={formatted}
        onRowClick={row => router.push(`/admin/students/student-profile/${row.userId}`)}
        paginationInfo={pagination}
        onPageChange={fetchStudents}
        isLoading={loading}
        itemsPerPage={10}
        searchable
      />
    </div>
  );
}

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

export default function StudentsRequiringActionPage() {
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
      const res = await api.get(`/api/admin/students/requiring-action?page=${page}&limit=10`);
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
    date: s.date ? new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
  }));

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <BackNavigation href={'/admin//dashboard'} label="Back to Dashboard" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191919]">Students Requiring Action</h1>
        <p className="text-gray-500 mt-1">Students who need immediate attention</p>
      </div>

      <DataTable
        title="Students Requiring Action"
        columns={COLUMNS}
        data={formatted}
        onRowClick={row => router.push(`/admin/students/${row.userId}`)}
        paginationInfo={pagination}
        onPageChange={fetchStudents}
        isLoading={loading}
        itemsPerPage={10}
      />
    </div>
  );
}

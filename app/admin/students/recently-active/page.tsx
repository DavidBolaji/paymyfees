'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { StudentActiveDrawer } from '@/components/admin/student-active-drawer';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';
import { BackNavigation } from '@/components/dashboard';

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'activity', label: 'Activity' },
  { key: 'amount', label: 'Amount' },
  { key: 'method', label: 'Method' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Date' },
];

export default function RecentlyActiveStudentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return; }
    fetchStudents(1);
  }, [user]);

  const fetchStudents = async (page: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/students/recently-active?page=${page}&limit=10`);
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
    amount: s.amount != null ? `₦${Number(s.amount).toLocaleString()}` : 'N/A',
    method: s.method?.replace(/_/g, ' ') || 'N/A',
    date: s.date ? new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
  }));

  const handleRowClick = (row: any) => {
    setSelectedStudent(row);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8">
       <BackNavigation href={'/admin'} label="Back to Dashboard" />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#191919]">Recently Active Students</h1>
          <p className="text-gray-500 mt-1">Students with recent payment activity</p>
        </div>

        <DataTable
          title="Recently Active Students"
          columns={COLUMNS}
          data={formatted}
          onRowClick={handleRowClick}
          paginationInfo={pagination}
          onPageChange={fetchStudents}
          isLoading={loading}
          itemsPerPage={10}
        />
      </div>

      <StudentActiveDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        student={selectedStudent}
      />
    </>
  );
}

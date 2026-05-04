'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { DataTable } from '@/components/dashboard/data-table';
import { api } from '@/src/lib/api';

const LOAN_COLUMNS = [
  { key: 'loanNumber', label: 'Loan #' },
  { key: 'teacherName', label: 'Teacher' },
  { key: 'loanAmount', label: 'Amount' },
  { key: 'schoolName', label: 'School' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Applied' },
];

const TEACHER_COLUMNS = [
  { key: 'fullName', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'subject', label: 'Subject' },
  { key: 'employmentStatus', label: 'Status' },
  { key: 'createdAt', label: 'Joined' },
];

export default function TeacherAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [recentTeachers, setRecentTeachers] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, teachersRes] = await Promise.all([
        api.get('/api/admin/loans?page=1&limit=5&role=TEACHER'),
        api.get('/api/admin/students?page=1&limit=5&role=TEACHER'),
      ]);
      const [loansData, teachersData] = await Promise.all([
        loansRes.json(),
        teachersRes.json(),
      ]);

      const loans: any[] = loansData.data?.loans ?? loansData.data ?? [];
      const teachers: any[] = teachersData.data?.users ?? teachersData.data ?? [];

      setRecentLoans(loans);
      setRecentTeachers(teachers);
      setStats({
        totalTeachers: teachersData.data?.total ?? teachers.length,
        pendingLoans: loans.filter((l) => l.status === 'PENDING').length,
        approvedLoans: loans.filter((l) => l.status === 'APPROVED' || l.status === 'DISBURSED').length,
        rejectedLoans: loans.filter((l) => l.status === 'REJECTED').length,
      });
    } catch (err) {
      console.error('Teacher admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all teacher accounts and loan applications.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Teachers" value={stats?.totalTeachers ?? 0} />
            <StatCard title="Pending Loans" value={stats?.pendingLoans ?? 0} />
            <StatCard title="Approved / Disbursed" value={stats?.approvedLoans ?? 0} />
            <StatCard title="Rejected" value={stats?.rejectedLoans ?? 0} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          title="Recent Teacher Loan Applications"
          columns={LOAN_COLUMNS}
          data={recentLoans}
          isLoading={loading}
          itemsPerPage={5}
        />
        <DataTable
          title="Recently Registered Teachers"
          columns={TEACHER_COLUMNS}
          data={recentTeachers}
          isLoading={loading}
          itemsPerPage={5}
        />
      </div>
    </div>
  );
}

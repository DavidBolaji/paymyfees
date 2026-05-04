'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { DataTable } from '@/components/dashboard/data-table';
import { api } from '@/src/lib/api';

const LOAN_COLUMNS = [
  { key: 'teacherName', label: 'Teacher Name' },
  { key: 'loanAmount', label: 'Loan Amount' },
  { key: 'schoolName', label: 'School' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Date Applied' },
];

const TEACHER_COLUMNS = [
  { key: 'fullName', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'staffId', label: 'Staff ID' },
  { key: 'subject', label: 'Subject' },
  { key: 'createdAt', label: 'Joined' },
];

export default function SchoolAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [recentTeachers, setRecentTeachers] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

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

      const loans = loansData.data?.loans ?? loansData.data ?? [];
      const teachers = teachersData.data?.users ?? teachersData.data ?? [];

      setRecentLoans(loans);
      setRecentTeachers(teachers);
      setStats({
        totalTeachers: teachersData.data?.total ?? teachers.length,
        activeLoans: loans.filter((l: any) => l.status === 'ACTIVE' || l.status === 'DISBURSED').length,
        pendingLoans: loans.filter((l: any) => l.status === 'PENDING').length,
        approvedLoans: loans.filter((l: any) => l.status === 'APPROVED').length,
      });
    } catch (err) {
      console.error('School admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">School Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage teachers and their loan applications at your school.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Teachers" value={stats?.totalTeachers ?? 0} />
            <StatCard title="Active Loans" value={stats?.activeLoans ?? 0} />
            <StatCard title="Pending Loans" value={stats?.pendingLoans ?? 0} />
            <StatCard title="Approved Loans" value={stats?.approvedLoans ?? 0} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          title="Recent Loan Applications"
          columns={LOAN_COLUMNS}
          data={recentLoans}
          isLoading={loading}
          itemsPerPage={5}
        />
        <DataTable
          title="Recent Teachers"
          columns={TEACHER_COLUMNS}
          data={recentTeachers}
          isLoading={loading}
          itemsPerPage={5}
        />
      </div>
    </div>
  );
}

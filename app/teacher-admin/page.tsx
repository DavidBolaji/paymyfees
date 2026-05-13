'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { DataTable } from '@/components/dashboard/data-table';
import { LoanDetailDrawer } from '@/components/dashboard/loan-detail-drawer';
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [recentTeachers, setRecentTeachers] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, teachersRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        api.get('/api/teacher-admin/loans?page=1&limit=5'),
        api.get('/api/teacher-admin/teachers?page=1&limit=5'),
        api.get('/api/teacher-admin/loans?page=1&limit=1&status=PENDING'),
        api.get('/api/teacher-admin/loans?page=1&limit=1&status=APPROVED,DISBURSED'),
        api.get('/api/teacher-admin/loans?page=1&limit=1&status=REJECTED'),
      ]);
      const [loansData, teachersData, pendingData, approvedData, rejectedData] = await Promise.all([
        loansRes.json(),
        teachersRes.json(),
        pendingRes.json(),
        approvedRes.json(),
        rejectedRes.json(),
      ]);

      setRecentLoans(loansData.data ?? []);
      setRecentTeachers(teachersData.data ?? []);
      setStats({
        totalTeachers: teachersData.metadata?.pagination?.total ?? 0,
        pendingLoans: pendingData.metadata?.pagination?.total ?? 0,
        approvedLoans: approvedData.metadata?.pagination?.total ?? 0,
        rejectedLoans: rejectedData.metadata?.pagination?.total ?? 0,
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

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <DataTable
          title="Recent Teacher Loan Applications"
          columns={LOAN_COLUMNS}
          data={recentLoans}
          isLoading={loading}
          itemsPerPage={5}
          viewAllHref="/teacher-admin/loans"
          onRowClick={row => { setSelectedLoan(row); setDrawerOpen(true); }}
        />
        <DataTable
          title="Recently Registered Teachers"
          columns={TEACHER_COLUMNS}
          data={recentTeachers}
          isLoading={loading}
          itemsPerPage={5}
          viewAllHref="/teacher-admin/teachers"
          onRowClick={row => router.push(`/teacher-admin/teachers/${row.id}`)}
        />
      </div>

      <LoanDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        loan={selectedLoan}
        onRefresh={fetchData}
        userLabel="Teacher Information"
        loansBasePath="/api/teacher-admin/loans"
      />
    </div>
  );
}

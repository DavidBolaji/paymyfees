'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/dashboard/stat-card';
import { QuickActionsCardAdmin } from '@/components/dashboard/quick-actions-card-admin';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { DataTable } from '@/components/dashboard/data-table';
import { StudentsbyCountry } from '@/components/admin/students-by-country';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';

const REQUIRING_ACTION_COLUMNS = [
  { key: 'studentName', label: 'Student Name' },
  { key: 'school', label: 'School' },
  { key: 'issue', label: 'Issue' },
  { key: 'status', label: 'Status' },
  { key: 'lastActivity', label: 'Last Activity' },
  { key: 'date', label: 'Date' },
];

const RECENTLY_ACTIVE_COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'activity', label: 'Activity' },
  { key: 'amount', label: 'Amount' },
  { key: 'method', label: 'Method' },
  { key: 'status', label: 'Status' },
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [requiringAction, setRequiringAction] = useState<any[]>([]);
  const [recentlyActive, setRecentlyActive] = useState<any[]>([]);
  const [actionPagination, setActionPagination] = useState<any>(null);
  const [activePagination, setActivePagination] = useState<any>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, actionRes, activeRes] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/students/requiring-action?page=1&limit=5'),
        api.get('/api/admin/students/recently-active?page=1&limit=5'),
      ]);
      const [statsData, actionData, activeData] = await Promise.all([
        statsRes.json(), actionRes.json(), activeRes.json()
      ]);
      setStats(statsData.data);
      setRequiringAction(actionData.data || []);
      setRecentlyActive(activeData.data || []);
      setActionPagination(actionData.metadata?.pagination);
      setActivePagination(activeData.metadata?.pagination);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionPageChange = async (page: number) => {
    const res = await api.get(`/api/admin/students/requiring-action?page=${page}&limit=5`);
    const data = await res.json();
    setRequiringAction(data.data || []);
    setActionPagination(data.metadata?.pagination);
  };

  const handleActivePageChange = async (page: number) => {
    const res = await api.get(`/api/admin/students/recently-active?page=${page}&limit=5`);
    const data = await res.json();
    setRecentlyActive(data.data || []);
    setActivePagination(data.metadata?.pagination);
  };

  const formattedRequiringAction = requiringAction.map(s => ({
    ...s,
    date: s.date ? new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
  }));

  const formattedRecentlyActive = recentlyActive.map(s => ({
    ...s,
    amount: s.amount != null ? `₦${Number(s.amount).toLocaleString()}` : 'N/A',
    method: s.method?.replace(/_/g, ' ') || 'N/A',
  }));

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#191919]">Welcome back, Admin</h1>
        <p className="text-gray-500 mt-1">Here&apos;s a clear view of how students are doing today</p>
      </div>

      <QuickActionsCardAdmin />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array(4).fill(null).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Active Students"
              value={stats?.activeStudentCount?.toString() ?? '0'}
              subtitle="active students"
              footer={<span className="text-xs text-gray-500">Students currently using PayMyFees</span>}
              variant="primary"
            />
            <StatCard
              title="Students with Active Loans"
              value={stats?.activeLoansCount?.toString() ?? '0'}
              subtitle="with active loans"
              footer="Students currently repaying"
            />
            <StatCard
              title="Overdue Payments"
              value={stats?.overdueCount?.toString() ?? '0'}
              subtitle="payments overdue"
              footer="visualize progress toward full repayment."
            />
            <StatCard
              title="Support Requests Open"
              value={stats?.openTicketsCount?.toString() ?? '0'}
              subtitle="requests"
              footer={<span className="text-xs text-gray-500">Issues waiting for admin action</span>}
            />
          </>
        )}
      </div>

      {/* Students Requiring Action */}
      <div className="mb-8">
        <DataTable
          title="Students Requiring Action"
          columns={REQUIRING_ACTION_COLUMNS}
          data={formattedRequiringAction}
          viewAllHref="/admin/students/requiring-action"
          onRowClick={row => router.push(`/admin/students/${row.userId}`)}
          paginationInfo={actionPagination}
          onPageChange={handleActionPageChange}
          isLoading={loading}
          itemsPerPage={5}
        />
      </div>

      {/* Recently Active */}
      <div className="mb-8">
        <DataTable
          title="Recently Active Students"
          columns={RECENTLY_ACTIVE_COLUMNS}
          data={formattedRecentlyActive}
          viewAllHref="/admin/students/recently-active"
          paginationInfo={activePagination}
          onPageChange={handleActivePageChange}
          isLoading={loading}
          itemsPerPage={5}
        />
      </div>

      {/*  Students by Country side by side */}
      <div className='max-w-[414px]'>
        <StudentsbyCountry />
      </div>
    </div>
  );
}

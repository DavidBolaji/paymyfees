'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { api } from '@/src/lib/api';

const TABLE_COLUMNS = [
  { key: 'studentName', label: 'Student Name' },
  { key: 'school', label: 'School' },
  { key: 'issue', label: 'Issue' },
  { key: 'status', label: 'Status' },
  { key: 'lastActivity', label: 'Last Activity' },
  { key: 'date', label: 'Date' },
];

const STATUS_MAP: Record<string, string> = {
  DISBURSED: 'ongoing', ACTIVE: 'ongoing', PENDING: 'ongoing',
  APPROVED: 'pending', COMPLETED: 'completed',
  DEFAULTED: 'cancelled', CANCELLED: 'cancelled',
};

type Tab = 'all' | 'overdue' | 'completed';

function fmt(d: any) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
}

function toRow(s: any) {
  return {
    ...s,
    issue: s.status === 'DEFAULTED' ? 'Loan Default' : s.status === 'COMPLETED' ? 'None' : 'Active Loan',
    status: STATUS_MAP[s.status] ?? s.status,
    lastActivity: fmt(s.lastActivity),
    date: fmt(s.date),
  };
}

export default function SchoolAdminStudentsPage() {
  const router = useRouter();
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allPagination, setAllPagination] = useState<any>(null);
  const [allLoading, setAllLoading] = useState(true);

  const [overdueStudents, setOverdueStudents] = useState<any[]>([]);
  const [overduePagination, setOverduePagination] = useState<any>(null);
  const [overdueLoading, setOverdueLoading] = useState(false);

  const [completedStudents, setCompletedStudents] = useState<any[]>([]);
  const [completedPagination, setCompletedPagination] = useState<any>(null);
  const [completedLoading, setCompletedLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAll(1);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/school-admin/dashboard');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) { console.error(e); }
    finally { setStatsLoading(false); }
  };

  const fetchAll = async (page: number) => {
    try {
      setAllLoading(true);
      const res = await api.get(`/api/school-admin/students?page=${page}&limit=10`);
      const data = await res.json();
      setAllStudents(data.data || []);
      setAllPagination(data.metadata?.pagination);
    } catch (e) { console.error(e); }
    finally { setAllLoading(false); }
  };

  const fetchOverdue = async (page: number) => {
    try {
      setOverdueLoading(true);
      const res = await api.get(`/api/school-admin/students?page=${page}&limit=10&status=DEFAULTED`);
      const data = await res.json();
      setOverdueStudents(data.data || []);
      setOverduePagination(data.metadata?.pagination);
    } catch (e) { console.error(e); }
    finally { setOverdueLoading(false); }
  };

  const fetchCompleted = async (page: number) => {
    try {
      setCompletedLoading(true);
      const res = await api.get(`/api/school-admin/students?page=${page}&limit=10&status=COMPLETED`);
      const data = await res.json();
      setCompletedStudents(data.data || []);
      setCompletedPagination(data.metadata?.pagination);
    } catch (e) { console.error(e); }
    finally { setCompletedLoading(false); }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'overdue' && overdueStudents.length === 0) fetchOverdue(1);
    if (tab === 'completed' && completedStudents.length === 0) fetchCompleted(1);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All Students' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="bg-[#F6F6F6] min-h-full p-4 sm:p-6 md:p-8">
      <BackNavigation href="/school-admin" label="Back to Dashboard" />

      <div className="mb-6">
        <h1 className="text-2xl md:text-[1.6875rem] font-bold text-[#191919]">Student Directory</h1>
        <p className="text-[#5F5F5F] mt-1">Monitor and manage students across the full loan lifecycle.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          Array(4).fill(null).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Students" value={stats?.activeStudentCount?.toString() ?? '0'} subtitle="Active students" footer="Students enrolled" variant="primary" />
            <StatCard title="Students With Active Loans" value={stats?.activeLoansCount?.toString() ?? '0'} subtitle="With active loans" footer="Currently repaying" />
            <StatCard title="Overdue Payments" value={stats?.overdueCount?.toString() ?? '0'} subtitle="Payments overdue" footer="Requires attention" />
            <StatCard title="Completed Repayments" value={stats?.completedLoansCount?.toString() ?? '0'} subtitle="Fully settled" footer="Loans totally settled" />
          </>
        )}
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 px-2 sm:px-4 py-3 sm:py-4 font-semibold text-[0.7rem] sm:text-[0.8125rem] md:text-[0.925rem] text-center transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-[#00296B] text-white' : 'bg-white text-[#191919] hover:text-[#00296B] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'all' && (
        <DataTable title="All Students" columns={TABLE_COLUMNS} data={allStudents.map(toRow)}
          onRowClick={row => router.push(`/school-admin/students/${row.userId}`)}
          paginationInfo={allPagination} onPageChange={fetchAll} isLoading={allLoading} itemsPerPage={10} searchable />
      )}
      {activeTab === 'overdue' && (
        <DataTable title="Overdue Student Loans" columns={TABLE_COLUMNS} data={overdueStudents.map(toRow)}
          onRowClick={row => router.push(`/school-admin/students/${row.userId}`)}
          paginationInfo={overduePagination} onPageChange={fetchOverdue} isLoading={overdueLoading} itemsPerPage={10} searchable />
      )}
      {activeTab === 'completed' && (
        <DataTable title="Completed Student Loans" columns={TABLE_COLUMNS} data={completedStudents.map(toRow)}
          onRowClick={row => router.push(`/school-admin/students/${row.userId}`)}
          paginationInfo={completedPagination} onPageChange={fetchCompleted} isLoading={completedLoading} itemsPerPage={10} searchable />
      )}
    </div>
  );
}

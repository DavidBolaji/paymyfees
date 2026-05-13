'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { LoanDetailDrawer } from '@/components/dashboard/loan-detail-drawer';
import { api } from '@/src/lib/api';

const TABLE_COLUMNS = [
  { key: 'userName', label: 'Student Name' },
  { key: 'schoolName', label: 'School' },
  { key: 'loanNumber', label: 'Application ID' },
  { key: 'status', label: 'Status' },
  { key: 'loanAmount', label: 'Loan Amount' },
  { key: 'applicationDate', label: 'Date' },
];

type Tab = 'all' | 'pending' | 'approved' | 'rejected';

function fmt(d: any) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
}

function toRow(l: any) {
  return { ...l, loanAmount: `₦${Number(l.loanAmount || 0).toLocaleString()}`, applicationDate: fmt(l.applicationDate) };
}

export default function SchoolAdminLoansPage() {
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [allPagination, setAllPagination] = useState<any>(null);
  const [allLoading, setAllLoading] = useState(true);

  const [pendingLoans, setPendingLoans] = useState<any[]>([]);
  const [pendingPagination, setPendingPagination] = useState<any>(null);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingLoaded, setPendingLoaded] = useState(false);

  const [approvedLoans, setApprovedLoans] = useState<any[]>([]);
  const [approvedPagination, setApprovedPagination] = useState<any>(null);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [approvedLoaded, setApprovedLoaded] = useState(false);

  const [rejectedLoans, setRejectedLoans] = useState<any[]>([]);
  const [rejectedPagination, setRejectedPagination] = useState<any>(null);
  const [rejectedLoading, setRejectedLoading] = useState(false);
  const [rejectedLoaded, setRejectedLoaded] = useState(false);

  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);

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
      const res = await api.get(`/api/school-admin/loans?page=${page}&limit=10`);
      const data = await res.json();
      if (data.success) { setAllLoans((data.data || []).map(toRow)); setAllPagination(data.metadata?.pagination); }
    } catch (e) { console.error(e); }
    finally { setAllLoading(false); }
  };

  const fetchPending = async (page: number) => {
    try {
      setPendingLoading(true);
      const res = await api.get(`/api/school-admin/loans?page=${page}&limit=10&status=PENDING`);
      const data = await res.json();
      if (data.success) { setPendingLoans((data.data || []).map(toRow)); setPendingPagination(data.metadata?.pagination); setPendingLoaded(true); }
    } catch (e) { console.error(e); }
    finally { setPendingLoading(false); }
  };

  const fetchApproved = async (page: number) => {
    try {
      setApprovedLoading(true);
      const res = await api.get(`/api/school-admin/loans?page=${page}&limit=10&status=APPROVED,ACTIVE,DISBURSED,COMPLETED`);
      const data = await res.json();
      if (data.success) { setApprovedLoans((data.data || []).map(toRow)); setApprovedPagination(data.metadata?.pagination); setApprovedLoaded(true); }
    } catch (e) { console.error(e); }
    finally { setApprovedLoading(false); }
  };

  const fetchRejected = async (page: number) => {
    try {
      setRejectedLoading(true);
      const res = await api.get(`/api/school-admin/loans?page=${page}&limit=10&status=REJECTED`);
      const data = await res.json();
      if (data.success) { setRejectedLoans((data.data || []).map(toRow)); setRejectedPagination(data.metadata?.pagination); setRejectedLoaded(true); }
    } catch (e) { console.error(e); }
    finally { setRejectedLoading(false); }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'pending' && !pendingLoaded) fetchPending(1);
    if (tab === 'approved' && !approvedLoaded) fetchApproved(1);
    if (tab === 'rejected' && !rejectedLoaded) fetchRejected(1);
  };

  const handleRowClick = async (loan: any) => {
    try {
      setShowDrawer(true);
      const res = await api.get(`/api/school-admin/loans/${loan.id}`);
      const data = await res.json();
      if (data.success) setSelectedLoan(data.data);
    } catch (e) { console.error(e); }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Applications' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="p-4 md:p-6 pt-6">
      <div className="mb-6">
        <h2 className="mb-1 font-semibold text-[#191919] text-xl md:text-[1.6875rem]">Loan Applications</h2>
        <p className="text-[#5F5F5F] text-sm md:text-base">Review and manage all student loan applications.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Applications" value={String(stats?.loans?.total ?? 0)} subtitle="Total applications" footer="All student applications" />
            <StatCard title="Pending Review" value={String(stats?.loans?.pending ?? 0)} subtitle="Pending review" footer="Awaiting action" />
            <StatCard title="Approved" value={String(stats?.loans?.approved ?? 0)} subtitle="Loans approved" footer="Ready for disbursement" />
            <StatCard title="Rejected" value={String(stats?.loans?.rejected ?? 0)} subtitle="Rejected loans" footer="Applications flagged" />
          </>
        )}
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex-1 py-2.5 font-semibold text-[0.7rem] sm:text-[0.8125rem] md:text-[0.925rem] whitespace-nowrap text-center transition-colors ${
              activeTab === t.key ? 'bg-[#00296B] text-white' : 'bg-white text-[#191919] hover:text-[#00296B] hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'all' && (
        <DataTable title="All Loan Applications" columns={TABLE_COLUMNS} data={allLoans}
          paginationInfo={allPagination} onPageChange={fetchAll} itemsPerPage={10}
          isLoading={allLoading} onRowClick={handleRowClick} searchable />
      )}
      {activeTab === 'pending' && (
        <DataTable title="Pending Applications" columns={TABLE_COLUMNS} data={pendingLoans}
          paginationInfo={pendingPagination} onPageChange={fetchPending} itemsPerPage={10}
          isLoading={pendingLoading} onRowClick={handleRowClick} searchable />
      )}
      {activeTab === 'approved' && (
        <DataTable title="Approved Applications" columns={TABLE_COLUMNS} data={approvedLoans}
          paginationInfo={approvedPagination} onPageChange={fetchApproved} itemsPerPage={10}
          isLoading={approvedLoading} onRowClick={handleRowClick} searchable />
      )}
      {activeTab === 'rejected' && (
        <DataTable title="Rejected Applications" columns={TABLE_COLUMNS} data={rejectedLoans}
          paginationInfo={rejectedPagination} onPageChange={fetchRejected} itemsPerPage={10}
          isLoading={rejectedLoading} onRowClick={handleRowClick} searchable />
      )}

      <LoanDetailDrawer
        isOpen={showDrawer}
        onClose={() => { setShowDrawer(false); setSelectedLoan(null); }}
        loan={selectedLoan}
      />
    </div>
  );
}

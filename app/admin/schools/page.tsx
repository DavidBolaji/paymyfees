'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { SchoolVerifyDrawer } from '@/components/admin/school-verify-drawer';
import { BackNavigation } from '@/components/dashboard';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';

const TABLE_COLUMNS = [
  { key: 'schoolName', label: 'School Name' },
  { key: 'location', label: 'Location' },
  { key: 'applicationLinked', label: 'Application Linked' },
  { key: 'dateSubmitted', label: 'Date Submitted' },
  { key: 'status', label: 'Status' },
  { key: 'assignedAdmin', label: 'Assigned Admin' },
];

type Tab = 'all' | 'pending' | 'verified';

function fmt(d: any) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
}

function toRow(s: any) {
  return {
    ...s,
    location: [s.city, s.country].filter(Boolean).join(', ') || 'N/A',
    applicationLinked: s.loans?.length ?? 0,
    dateSubmitted: fmt(s.createdAt),
    status: s.isVerified ? 'completed' : 'pending',
    assignedAdmin: 'N/A',
  };
}

export default function AdminSchoolsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<Tab>('all');

  const [allSchools, setAllSchools] = useState<any[]>([]);
  const [allPagination, setAllPagination] = useState<any>(null);
  const [allLoading, setAllLoading] = useState(true);

  const [pendingSchools, setPendingSchools] = useState<any[]>([]);
  const [pendingPagination, setPendingPagination] = useState<any>(null);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [verifiedSchools, setVerifiedSchools] = useState<any[]>([]);
  const [verifiedPagination, setVerifiedPagination] = useState<any>(null);
  const [verifiedLoading, setVerifiedLoading] = useState(false);

  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return; }
    fetchStats();
    fetchAll(1);
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/schools/stats');
      const data = await res.json();
      setStats(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAll = async (page: number) => {
    try {
      setAllLoading(true);
      const res = await api.get(`/api/admin/schools?page=${page}&limit=10`);
      const data = await res.json();
      setAllSchools(data.data || []);
      setAllPagination(data.metadata?.pagination);
    } catch (e) { console.error(e); }
    finally { setAllLoading(false); }
  };

  const fetchPending = async (page: number) => {
    try {
      setPendingLoading(true);
      const res = await api.get(`/api/admin/schools?page=${page}&limit=10&status=pending`);
      const data = await res.json();
      setPendingSchools(data.data || []);
      setPendingPagination(data.metadata?.pagination);
    } catch (e) { console.error(e); }
    finally { setPendingLoading(false); }
  };

  const fetchVerified = async (page: number) => {
    try {
      setVerifiedLoading(true);
      const res = await api.get(`/api/admin/schools?page=${page}&limit=10&status=verified`);
      const data = await res.json();
      setVerifiedSchools(data.data || []);
      setVerifiedPagination(data.metadata?.pagination);
    } catch (e) { console.error(e); }
    finally { setVerifiedLoading(false); }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'pending' && pendingSchools.length === 0) fetchPending(1);
    if (tab === 'verified' && verifiedSchools.length === 0) fetchVerified(1);
  };

  const handleRowClick = (row: any) => {
    setSelectedSchool(row);
    setShowDrawer(true);
  };

  const handleApproved = () => {
    fetchAll(1);
    fetchPending(1);
    fetchVerified(1);
    fetchStats();
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All Schools' },
    { id: 'pending', label: 'Pending' },
    { id: 'verified', label: 'Verified' },
  ];

  return (
    <>
      <div className="bg-[#F6F6F6] min-h-full p-4 sm:p-6 md:p-8">
        <BackNavigation href="/admin" label="Back to Dashboard" />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-[1.6875rem] font-bold text-[#191919]">School Verification</h1>
          <p className="text-[#5F5F5F] mt-1">Review and validate schools submitted during loan applications.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            Array(4).fill(null).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Pending Schools"
                value={stats?.pendingSchoolsCount?.toString() ?? '0'}
                subtitle="Pending schools"
                footer="Awaiting review and documentation"
                variant="primary"
              />
              <StatCard
                title="Under Review"
                value={stats?.underReviewCount?.toString() ?? '0'}
                subtitle="School under review"
                footer="Currently being verified by admin"
              />
              <StatCard
                title="Verified Schools"
                value={stats?.verifiedSchoolsCount?.toString() ?? '0'}
                subtitle="Verified schools"
                footer="Approved institutions"
              />
              <StatCard
                title="Rejected Schools"
                value={stats?.rejectedSchoolsCount?.toString() ?? '0'}
                subtitle="Rejected schools"
                footer="Institution flagged due to compliance"
              />
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 font-semibold text-[0.7rem] sm:text-[0.8125rem] md:text-[0.925rem] text-center transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#00296B] text-white'
                  : 'bg-white text-[#191919] hover:text-[#00296B] hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* All Schools */}
        {activeTab === 'all' && (
          <DataTable
            title="All School Verification"
            columns={TABLE_COLUMNS}
            data={allSchools.map(toRow)}
            viewAllHref="/admin/schools/all-active-schools"
            onRowClick={handleRowClick}
            paginationInfo={allPagination}
            onPageChange={fetchAll}
            isLoading={allLoading}
            itemsPerPage={10}
            searchable
          />
        )}

        {/* Pending */}
        {activeTab === 'pending' && (
          <DataTable
            title="Pending Verification"
            columns={TABLE_COLUMNS}
            data={pendingSchools.map(toRow)}
            viewAllHref="/admin/schools/all-pending-schools"
            onRowClick={handleRowClick}
            paginationInfo={pendingPagination}
            onPageChange={fetchPending}
            isLoading={pendingLoading}
            itemsPerPage={10}
            searchable
          />
        )}

        {/* Verified */}
        {activeTab === 'verified' && (
          <DataTable
            title="Verified Schools"
            columns={TABLE_COLUMNS}
            data={verifiedSchools.map(toRow)}
            viewAllHref="/admin/schools/all-verified-schools"
            onRowClick={handleRowClick}
            paginationInfo={verifiedPagination}
            onPageChange={fetchVerified}
            isLoading={verifiedLoading}
            itemsPerPage={10}
            searchable
          />
        )}
      </div>

      <SchoolVerifyDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        school={selectedSchool}
        onApproved={handleApproved}
      />
    </>
  );
}

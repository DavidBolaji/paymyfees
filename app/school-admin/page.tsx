'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { DataTable } from '@/components/dashboard/data-table';
import { LoanDetailDrawer } from '@/components/dashboard/loan-detail-drawer';
import { SchoolVerifyDrawer } from '@/components/admin/school-verify-drawer';
import { api } from '@/src/lib/api';

const LOAN_COLUMNS = [
  { key: 'userName', label: 'Student Name' },
  { key: 'schoolName', label: 'School' },
  { key: 'loanNumber', label: 'Application ID' },
  { key: 'status', label: 'Status' },
  { key: 'loanAmount', label: 'Amount' },
  { key: 'applicationDate', label: 'Date' },
];

const SCHOOL_COLUMNS = [
  { key: 'schoolName', label: 'School Name' },
  { key: 'location', label: 'Location' },
  { key: 'dateSubmitted', label: 'Date Submitted' },
  { key: 'status', label: 'Status' },
];

function fmt(d: any) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
}

export default function SchoolAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [recentSchools, setRecentSchools] = useState<any[]>([]);

  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [schoolDrawerOpen, setSchoolDrawerOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, loansRes, schoolsRes] = await Promise.all([
        api.get('/api/school-admin/dashboard'),
        api.get('/api/school-admin/loans?page=1&limit=5'),
        api.get('/api/school-admin/schools?page=1&limit=5'),
      ]);
      const [statsData, loansData, schoolsData] = await Promise.all([
        statsRes.json(), loansRes.json(), schoolsRes.json(),
      ]);
      if (statsData.success) setStats(statsData.data);
      setRecentLoans((loansData.data || []).map((l: any) => ({
        ...l,
        loanAmount: `₦${Number(l.loanAmount || 0).toLocaleString()}`,
        applicationDate: fmt(l.applicationDate),
      })));
      setRecentSchools((schoolsData.data || []).map((s: any) => ({
        ...s,
        location: [s.city, s.country].filter(Boolean).join(', ') || 'N/A',
        dateSubmitted: fmt(s.createdAt),
        status: s.isVerified ? 'Verified' : 'Pending',
      })));
    } catch (err) {
      console.error('School admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#191919]">School Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage schools, students and loan applications.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array(4).fill(null).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Schools"
              value={stats?.totalSchoolsCount?.toString() ?? '0'}
              subtitle="Registered schools"
              footer="Schools on the platform"
              variant="primary"
            />
            <StatCard
              title="Pending Verification"
              value={stats?.pendingSchoolsCount?.toString() ?? '0'}
              subtitle="Awaiting review"
              footer="Schools pending approval"
            />
            <StatCard
              title="Verified Schools"
              value={stats?.verifiedSchoolsCount?.toString() ?? '0'}
              subtitle="Approved schools"
              footer="Verified institutions"
            />
            <StatCard
              title="Total Loan Applications"
              value={stats?.loans?.total?.toString() ?? '0'}
              subtitle="All applications"
              footer="Across all schools"
            />
          </>
        )}
      </div>

      {/* Recent Loans */}
      <div className="mb-8">
        <DataTable
          title="Recent Loan Applications"
          columns={LOAN_COLUMNS}
          data={recentLoans}
          isLoading={loading}
          itemsPerPage={5}
          viewAllHref="/school-admin/loans"
          onRowClick={row => { setSelectedLoan(row); setDrawerOpen(true); }}
        />
      </div>

      {/* Recent Schools */}
      <div className="mb-8">
        <DataTable
          title="Recently Registered Schools"
          columns={SCHOOL_COLUMNS}
          data={recentSchools}
          isLoading={loading}
          itemsPerPage={5}
          viewAllHref="/school-admin/schools"
          onRowClick={row => { setSelectedSchool(row); setSchoolDrawerOpen(true); }}
        />
      </div>

      <LoanDetailDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedLoan(null); }}
        loansBasePath="/api/school-admin/loans"
        loan={selectedLoan}
        onRefresh={fetchData}
      />

      <SchoolVerifyDrawer
        isOpen={schoolDrawerOpen}
        onClose={() => setSchoolDrawerOpen(false)}
        school={selectedSchool}
        onApproved={fetchData}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { DataTable } from '@/components/dashboard/data-table';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';

const LOAN_COLUMNS = [
  { key: 'loanNumber', label: 'Loan Number' },
  { key: 'userName', label: 'Applicant' },
  { key: 'schoolName', label: 'School' },
  { key: 'loanAmount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'applicationDate', label: 'Date' },
];

const SCHOOL_COLUMNS = [
  { key: 'schoolName', label: 'School Name' },
  { key: 'schoolEmail', label: 'Email' },
  { key: 'city', label: 'City' },
  { key: 'totalStudents', label: 'Students' },
  { key: 'isVerified', label: 'Status' },
  { key: 'createdAt', label: 'Registered' },
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loanPagination, setLoanPagination] = useState<any>(null);
  const [schoolPagination, setSchoolPagination] = useState<any>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, loansRes, schoolsRes] = await Promise.all([
        api.get('/api/admin/analytics'),
        api.get('/api/admin/loans?page=1&limit=5'),
        api.get('/api/admin/schools?page=1&limit=5')
      ]);

      const analyticsData = await analyticsRes.json();
      const loansData = await loansRes.json();
      const schoolsData = await schoolsRes.json();

      setAnalytics(analyticsData.data);
      setLoans(loansData.data || []);
      setSchools(schoolsData.data || []);
      setLoanPagination(loansData.metadata?.pagination);
      setSchoolPagination(schoolsData.metadata?.pagination);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanPageChange = async (page: number) => {
    try {
      const res = await api.get(`/api/admin/loans?page=${page}&limit=5`);
      const data = await res.json();
      setLoans(data.data || []);
      setLoanPagination(data.metadata?.pagination);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const handleSchoolPageChange = async (page: number) => {
    try {
      const res = await api.get(`/api/admin/schools?page=${page}&limit=5`);
      const data = await res.json();
      setSchools(data.data || []);
      setSchoolPagination(data.metadata?.pagination);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const formattedLoans = loans.map(loan => ({
    ...loan,
    applicationDate: new Date(loan.applicationDate).toLocaleDateString(),
    loanAmount: `₦${Number(loan.loanAmount).toLocaleString()}`
  }));

  const formattedSchools = schools.map(school => ({
    ...school,
    isVerified: school.isVerified ? 'Verified' : 'Pending',
    createdAt: new Date(school.createdAt).toLocaleDateString()
  }));

  return (
    <div className="p-6">
      <div className="">
        <h2 className='mb-[0.56rem] font-semibold text-[#191919] text-[1.6875rem]'>Admin Dashboard</h2>
        <p className='mb-[1.375rem] font-semibold text-[#5F5F5F] text-[1.6875rem]'>Welcome Back, {user?.fullName?.split(" ")[0] || "Admin"}</p>
        
        {/* Stats Grid */}
        <div className="gap-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {loading ? (
            <>
              <StatCardSkeleton variant="primary" />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Loans"
                value={analytics?.loans?.total?.toString() || "0"}
                subtitle={`${analytics?.loans?.active || 0} Active`}
                footer={`${analytics?.loans?.pending || 0} pending approval`}
                variant="primary"
              />
              <StatCard
                title="Total Disbursed"
                value={`₦${Number(analytics?.financial?.totalDisbursed || 0).toLocaleString()}`}
                subtitle={`${analytics?.loans?.completed || 0} Completed`}
                footer="Total amount disbursed to schools"
                variant="default"
              />
              <StatCard
                title="Verified Schools"
                value={analytics?.schools?.verified?.toString() || "0"}
                subtitle={`${analytics?.schools?.total || 0} Total Schools`}
                footer={`${analytics?.schools?.pending || 0} pending verification`}
                variant="default"
              />
              <StatCard
                title="Support Tickets"
                value={analytics?.support?.open?.toString() || "0"}
                subtitle={`${analytics?.support?.total || 0} Total Tickets`}
                footer="Active support requests"
                variant="default"
              />
            </>
          )}
        </div>

        {/* Loans Table */}
        <div className="mb-8">
          <DataTable
            title="Recent Loan Applications"
            columns={LOAN_COLUMNS}
            data={formattedLoans}
            viewAllHref="/admin/loans"
            paginationInfo={loanPagination}
            onPageChange={handleLoanPageChange}
            itemsPerPage={5}
            isLoading={loading}
            onRowClick={(loan) => router.push(`/admin/loans/${loan.id}`)}
            searchable={true}
          />
        </div>

        {/* Schools Table */}
        <div className="mb-8">
          <DataTable
            title="Recent School Registrations"
            columns={SCHOOL_COLUMNS}
            data={formattedSchools}
            viewAllHref="/admin/schools"
            paginationInfo={schoolPagination}
            onPageChange={handleSchoolPageChange}
            itemsPerPage={5}
            isLoading={loading}
            onRowClick={(school) => router.push(`/admin/schools/${school.id}`)}
            searchable={true}
          />
        </div>
      </div>
    </div>
  );
}

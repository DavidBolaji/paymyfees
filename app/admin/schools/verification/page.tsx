'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { SchoolVerifyDrawer } from '@/components/admin/school-verify-drawer';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';
import { BackNavigation } from '@/components/dashboard';

const COLUMNS = [
  { key: 'name', label: 'School Name' },
  { key: 'location', label: 'Location' },
  { key: 'applicationsLinked', label: 'Applications Linked' },
  { key: 'dateSubmitted', label: 'Date Submitted' },
  { key: 'status', label: 'Status' },
];

export default function SchoolVerificationPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return; }
    fetchSchools(1);
  }, [user]);

  const fetchSchools = async (page: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/schools/pending-verification?page=${page}&limit=10`);
      const data = await res.json();
      setSchools(data.data || []);
      setPagination(data.metadata?.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatted = schools.map(s => ({
    ...s,
    dateSubmitted: s.dateSubmitted
      ? new Date(s.dateSubmitted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'N/A',
    status: s.isVerified ? 'Verified' : 'Pending',
  }));

  const handleRowClick = (row: any) => {
    // Find original (unformatted) school to pass to drawer
    const original = schools.find(s => s.id === row.id) || row;
    setSelectedSchool(original);
    setDrawerOpen(true);
  };

  const handleApproved = () => {
    fetchSchools(1);
  };

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8">
        <BackNavigation href={'/admin'} label="Back to Dashboard" />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#191919]">School Verification</h1>
          <p className="text-gray-500 mt-1">Schools pending verification and approval</p>
        </div>

        <DataTable
          title="Pending School Verification"
          columns={COLUMNS}
          data={formatted}
          onRowClick={handleRowClick}
          paginationInfo={pagination}
          onPageChange={fetchSchools}
          isLoading={loading}
          itemsPerPage={5}
        />
      </div>

      <SchoolVerifyDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        school={selectedSchool}
        onApproved={handleApproved}
      />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { SchoolVerifyDrawer } from '@/components/admin/school-verify-drawer';
import { BackNavigation } from '@/components/dashboard';
import useAuthStore from '@/src/authStore';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api';

const COLUMNS = [
  { key: 'schoolName', label: 'School Name' },
  { key: 'location', label: 'Location' },
  { key: 'applicationLinked', label: 'Application Linked' },
  { key: 'dateSubmitted', label: 'Date Submitted' },
  { key: 'status', label: 'Status' },
  { key: 'assignedAdmin', label: 'Assigned Admin' },
];

function fmt(d: any) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
}

function toRow(s: any) {
  return {
    ...s,
    location: [s.city, s.country].filter(Boolean).join(', ') || 'N/A',
    applicationLinked: s.loans?.length ?? 0,
    dateSubmitted: fmt(s.createdAt),
    status: s.isVerified ? 'verified' : 'pending',
    assignedAdmin: 'N/A',
  };
}

export default function AllVerifiedSchoolsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return; }
    fetchSchools(1);
  }, [user]);

  const fetchSchools = async (page: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/schools?page=${page}&limit=20&status=verified`);
      const data = await res.json();
      setSchools(data.data || []);
      setPagination(data.metadata?.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="bg-[#F6F6F6] min-h-full p-4 sm:p-6 md:p-8">
        <BackNavigation href="/admin/schools" label="Back to Dashboard" />
        <DataTable
          title="Verified Schools"
          columns={COLUMNS}
          data={schools.map(toRow)}
          onRowClick={row => { setSelectedSchool(row); setShowDrawer(true); }}
          paginationInfo={pagination}
          onPageChange={fetchSchools}
          isLoading={loading}
          itemsPerPage={20}
          searchable
        />
      </div>
      <SchoolVerifyDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        school={selectedSchool}
        onApproved={() => fetchSchools(1)}
      />
    </>
  );
}

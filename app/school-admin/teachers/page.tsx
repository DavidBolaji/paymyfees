'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { api } from '@/src/lib/api';

const COLUMNS = [
  { key: 'fullName', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'staffId', label: 'Staff ID' },
  { key: 'subject', label: 'Subject' },
  { key: 'employmentStatus', label: 'Employment Status' },
  { key: 'createdAt', label: 'Joined' },
];

export default function SchoolAdminTeachersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/students?page=${page}&limit=10&role=TEACHER`);
      const json = await res.json();
      setData(json.data?.users ?? json.data ?? []);
      setPagination(json.data?.pagination ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Teacher Directory</h1>
      <DataTable
        title="All Teachers"
        columns={COLUMNS}
        data={data}
        isLoading={loading}
        itemsPerPage={10}
        paginationInfo={pagination}
        onPageChange={fetchData}
      />
    </div>
  );
}

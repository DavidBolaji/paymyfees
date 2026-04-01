'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { PaymentDetailDrawer } from '@/components/admin/payment-detail-drawer';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';
import { BackNavigation } from '@/components/dashboard';

const COLUMNS = [
  { key: 'loanNumber', label: 'Student ID' },
  { key: 'studentName', label: 'Student Name' },
  { key: 'school', label: 'School' },
  { key: 'outstanding', label: 'Outstanding' },
  { key: 'status', label: 'Status' },
  { key: 'delayCount', label: 'Delayed Days Count' },
  { key: 'date', label: 'Date' },
];

export default function DelayedPaymentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return; }
    fetchPayments(1);
  }, [user]);

  const fetchPayments = async (page: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/students/delayed-payments?page=${page}&limit=10`);
      const data = await res.json();
      setPayments(data.data || []);
      setPagination(data.metadata?.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatted = payments.map(p => ({
    ...p,
    outstanding: p.outstanding != null ? `₦${Number(p.outstanding).toLocaleString()}` : 'N/A',
    date: (() => { if (!p.date) return 'N/A'; const d = new Date(p.date); const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]; return `${m} ${d.getDate()} ${d.getFullYear()}`; })(),
  }));

  const handleRowClick = (row: any) => {
    setSelectedStudent(row);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8">
        <BackNavigation href={'/admin'} label="Back to Dashboard" />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#191919]">Delayed Payments</h1>
          <p className="text-gray-500 mt-1">Students with overdue installments requiring follow-up</p>
        </div>

        <DataTable
          title="Students Delaying Payment table"
          columns={COLUMNS}
          data={formatted}
          onRowClick={handleRowClick}
          paginationInfo={pagination}
          onPageChange={fetchPayments}
          isLoading={loading}
          itemsPerPage={10}
        />
      </div>

      <PaymentDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        student={selectedStudent}
        mode="delayed"
      />
    </>
  );
}

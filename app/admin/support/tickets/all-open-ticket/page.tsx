'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable, PaginationInfo } from '@/components/dashboard/data-table';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { TicketDrawer } from '@/components/admin/ticket-drawer';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { api } from '@/src/lib/api';

const COLUMNS = [
  { key: 'ticketNumber', label: 'Ticket ID' },
  { key: 'studentName', label: 'Student' },
  { key: 'category', label: 'Category' },
  { key: 'statusBadge', label: 'Status' },
  { key: 'assignedName', label: 'Assigned To' },
  { key: 'formattedDate', label: 'Date' },
];

function fmt(raw: any[]) {
  return raw.map(t => ({
    ...t,
    studentName: t.user?.fullName || '—',
    statusBadge: <StatusBadge status={t.status?.toLowerCase()} />,
    assignedName: t.assignedTo ? 'Admin' : '—',
    formattedDate: new Date(t.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    }),
  }));
}

export default function AllOpenTicketPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | undefined>();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchTickets = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/support?page=${page}&limit=20&status=OPEN`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.data || []);
        setPagination(data.metadata?.pagination);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return (
    <div className="p-4 md:p-6 pt-6 md:pt-0">
      <BackNavigation href="/admin/support" label="Back to Dashboard" />
      <div className="mb-6">
        <h2 className="font-semibold text-[#191919] text-xl md:text-[1.6875rem]">Open Tickets</h2>
      </div>
      <DataTable
        title="Open Tickets"
        columns={COLUMNS}
        data={fmt(tickets)}
        paginationInfo={pagination}
        onPageChange={fetchTickets}
        itemsPerPage={20}
        isLoading={loading}
        onRowClick={t => { setSelected(t); setDrawerOpen(true); }}
        searchable
      />
      <TicketDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ticket={selected}
        onReplySent={() => fetchTickets()}
      />
    </div>
  );
}

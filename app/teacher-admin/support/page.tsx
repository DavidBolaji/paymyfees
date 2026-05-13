'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable, PaginationInfo } from '@/components/dashboard/data-table';
import { TicketDrawer } from '@/components/admin/ticket-drawer';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { api } from '@/src/lib/api';

const TICKET_COLUMNS = [
  { key: 'ticketNumber', label: 'Ticket ID' },
  { key: 'studentName', label: 'Submitted By' },
  { key: 'category', label: 'Category' },
  { key: 'statusBadge', label: 'Status' },
  { key: 'formattedDate', label: 'Date' },
];

const TABS = [
  { id: 'all', label: 'All Tickets' },
  { id: 'OPEN', label: 'Open' },
  { id: 'RESOLVED', label: 'Resolved' },
  { id: 'CLOSED', label: 'Closed' },
] as const;

type TabId = typeof TABS[number]['id'];

function formatTickets(raw: any[]) {
  return raw.map(t => ({
    ...t,
    studentName: t.user?.fullName || '—',
    statusBadge: <StatusBadge status={t.status?.toLowerCase()} />,
    formattedDate: new Date(t.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    }),
  }));
}

export default function TeacherAdminSupportPage() {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [loaded, setLoaded] = useState<Partial<Record<TabId, boolean>>>({});
  const [tickets, setTickets] = useState<Partial<Record<TabId, any[]>>>({});
  const [pagination, setPagination] = useState<Partial<Record<TabId, PaginationInfo>>>({});
  const [loading, setLoading] = useState<Partial<Record<TabId, boolean>>>({});
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchTab = useCallback(async (tab: TabId, page = 1) => {
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      const status = tab === 'all' ? '' : `&status=${tab}`;
      const res = await api.get(`/api/admin/support?page=${page}&limit=10${status}`);
      const data = await res.json();
      if (data.success) {
        setTickets(prev => ({ ...prev, [tab]: data.data || [] }));
        setPagination(prev => ({ ...prev, [tab]: data.metadata?.pagination }));
        setLoaded(prev => ({ ...prev, [tab]: true }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, []);

  useEffect(() => {
    if (!loaded[activeTab]) fetchTab(activeTab);
  }, [activeTab, loaded, fetchTab]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="font-semibold text-[#191919] text-xl md:text-[1.6875rem]">Support Tickets</h2>
        <p className="text-[#5F5F5F] text-sm md:text-base mt-1">
          View and respond to support requests from teachers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 font-semibold text-[0.8125rem] text-center transition-colors
              ${activeTab === tab.id
                ? 'bg-[#00296B] text-white'
                : 'bg-white text-[#191919] hover:text-[#00296B] hover:bg-gray-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        title="Support Tickets"
        columns={TICKET_COLUMNS}
        data={formatTickets(tickets[activeTab] || [])}
        paginationInfo={pagination[activeTab]}
        onPageChange={p => fetchTab(activeTab, p)}
        itemsPerPage={10}
        isLoading={!!loading[activeTab]}
        onRowClick={ticket => { setSelectedTicket(ticket); setDrawerOpen(true); }}
        searchable
      />

      <TicketDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ticket={selectedTicket}
        onReplySent={() => { setLoaded({}); fetchTab(activeTab); }}
      />
    </div>
  );
}

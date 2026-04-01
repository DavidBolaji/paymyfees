'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, MessageSquare, X } from 'lucide-react';
import { api } from '@/src/lib/api';
import { StatusBadge } from '@/components/dashboard/status-badge';

function fmt(d: string | Date | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(',', ' •');
}

interface Message {
  id: string;
  message: string;
  senderRole: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketNumber?: string;
  subject: string;
  category: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  user?: { fullName: string };
}

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api.get('/api/support/tickets')
      .then(r => r.json())
      .then((d: any) => {
        if (d.success) setTickets(d.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openTicket = useCallback(async (ticket: Ticket) => {
    setSelected(ticket);
    setDetailLoading(true);
    try {
      const d = await api.get(`/api/support/tickets/${ticket.id}`).then(r => r.json());
      if (d.success) setSelected(d.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Help
      </button>

      <h1 className="text-2xl font-bold text-[#191919] mb-1">My Support Tickets</h1>
      <p className="text-sm text-gray-500 mb-6">View your submitted tickets and admin responses.</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#00296B] animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No tickets yet</p>
          <p className="text-sm mt-1">When you submit a support request it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => openTicket(ticket)}
              className="w-full text-left bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-[#00296B]/40 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-[#191919] truncate">{ticket.subject}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ticket.category} • {fmt(ticket.createdAt)}</p>
                </div>
                <StatusBadge status={ticket.status.toLowerCase()} />
              </div>
              {ticket.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{ticket.description}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#292929CC]">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 shrink-0">
              <div>
                <h2 className="font-bold text-[#191919]">{selected.subject}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{selected.category} • {fmt(selected.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status.toLowerCase()} />
                <button
                  onClick={() => setSelected(null)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border-2 border-[#002561] hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 text-[#002561]" />
                </button>
              </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Original issue */}
              <div className="flex flex-col items-start gap-1">
                <div className="bg-[#f3f4f6] text-[#191919] rounded-xl rounded-tl-none px-4 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap">
                  {selected.description}
                </div>
                <span className="text-[11px] text-gray-400 px-1">
                  You • {fmt(selected.createdAt)}
                </span>
              </div>

              {detailLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 text-[#00296B] animate-spin" />
                </div>
              ) : (
                selected.messages?.map(msg => {
                  const isAdmin = msg.senderRole === 'ADMIN';
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-xl text-sm max-w-[85%] whitespace-pre-wrap ${
                        isAdmin
                          ? 'bg-[#00296B] text-white rounded-tr-none'
                          : 'bg-[#f3f4f6] text-[#191919] rounded-tl-none'
                      }`}>
                        {msg.message}
                      </div>
                      <span className="text-[11px] text-gray-400 px-1">
                        {isAdmin ? 'Support Team' : 'You'} • {fmt(msg.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}

              {!detailLoading && (!selected.messages || selected.messages.length === 0) && (
                <p className="text-center text-sm text-gray-400 py-4">
                  No responses yet. Our support team will reply soon.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

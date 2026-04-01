'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { SuccessModal } from '@/components/ui/success-modal';
import { api } from '@/src/lib/api';
import { useRouter } from 'next/navigation';

interface TicketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  onReplySent?: () => void;
}

function fmt(d: string | Date | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(',', ' •');
}

export function TicketDrawer({ isOpen, onClose, ticket, onReplySent }: TicketDrawerProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else { document.body.style.overflow = 'unset'; setDetail(null); setNote(''); }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !ticket?.id) return;
    setLoadingDetail(true);
    api.get(`/api/admin/support/${ticket.id}`)
      .then(r => r.json())
      .then((d: any) => { if (d.success) setDetail(d.data); })
      .catch(console.error)
      .finally(() => setLoadingDetail(false));
  }, [isOpen, ticket?.id]);

  const handleCloseTicket = async () => {
    if (!detail?.id) return;
    try {
      setClosing(true);
      const res = await (await api.patch(`/api/admin/support/${detail.id}/status`, { status: 'CLOSED' })).json();
      if (res.success !== false) {
        onReplySent?.();
        setShowSuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClosing(false);
    }
  };

  const handleSendReply = async () => {
    if (!note.trim() || !detail?.id) return;
    try {
      setSending(true);
      const data = await (await api.post(`/api/admin/support/${detail.id}/respond`, { message: note.trim() })).json();
      if (data.success) {
        setNote('');
        onReplySent?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleViewProfile = () => {
    const userId = detail?.user?.id || ticket?.userId;
    if (userId) router.push(`/admin/students/student-profile/${userId}`);
    onClose();
  };

  const t = detail || ticket;
  const loan = detail?.user?.loans?.[0];
  const studentId = t?.user?.id ? `STU-${t.user.id.replace(/-/g, '').slice(0, 5).toUpperCase()}` : '—';

  return (
    <>
    <SuccessModal
      isOpen={showSuccess}
      onClose={() => { setShowSuccess(false); onClose(); }}
      title="Ticket Closed"
      message="The support ticket has been successfully closed."
    />
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="z-[100] fixed inset-0 bg-[#292929CC]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="top-0 right-0 z-[101] fixed bg-white shadow-2xl w-full max-w-[540px] h-full flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
              <h2 className="font-bold text-[#191919] text-[27PX]">Ticket Header</h2>
              <button
                onClick={onClose}
                className="flex justify-center items-center hover:bg-gray-50 border-[#002561] border-2 rounded-lg w-10 h-10 transition-colors"
              >
                <X className="w-5 h-5 text-[#002561]" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {loadingDetail ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="w-8 h-8 text-[#00296B] animate-spin" />
                </div>
              ) : (
                <>
                  {/* ── Student Information ─────────────────────── */}
                  <div>
                    <p className="font-semibolds text-[#191919] text-xl mb-5 inline-block">
                      Student Information
                    </p>
                    <div className="space-y-4">
                      <Row label="Student Name:" value={t?.user?.fullName || '—'} />
                      <Row label="Student ID:" value={studentId} />
                      <Row label="School:" value={loan?.school?.schoolName || '—'} />
                      <Row label="Loan ID:" value={loan?.loanNumber || '—'} />
                      <Row label="Account Status:" value={t?.user?.isActive ? 'Active' : 'Inactive'} />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#5F5F5F]">Status:</span>
                        <StatusBadge status={t?.status?.toLowerCase() || 'pending'} />
                      </div>
                      <Row label="Date & Time:" value={fmt(t?.createdAt)} />
                    </div>
                  </div>

                  {/* ── Ticket Information ─────────────────────── */}
                  <div>
                    <p className="font-semibolds text-[#191919] text-xl mb-5 inline-block">
                      Ticket Information
                    </p>
                    <div className="space-y-4">
                      <Row label="Category:" value={t?.category || '—'} />
                      <Row label="Channel:" value={t?.channel || 'In-App'} />
                      <Row label="Created:" value={fmt(t?.createdAt)} />
                      <Row label="Last Updated:" value={fmt(t?.updatedAt)} />
                      <div className="flex justify-between items-start text-sm gap-4">
                        <span className="text-[#5F5F5F] shrink-0">User Issue:</span>
                        <span className="text-[#191919] font-medium text-right">{t?.description || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Add Notes ─────────────────────────────── */}
                  <div>
                    <p className="font-semibold text-[#191919] text-base mb-3">Add Notes</p>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Add your note here"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[#d1d1d1] bg-[#f9f9f9] text-sm text-[#191919] placeholder:text-[#AEAEAE] resize-none focus:outline-none focus:ring-2 focus:ring-[#00296B]/20 focus:border-[#00296B]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 grid grid-cols-3 gap-3">
              <button
                onClick={handleViewProfile}
                className="h-12 rounded-xl border-2 border-[#00296B] text-[#00296B] font-semibold text-sm hover:bg-[#00296B]/5 transition-colors"
              >
                View Student Profile
              </button>
              <button
                onClick={handleSendReply}
                disabled={sending || !note.trim()}
                className="h-12 rounded-xl bg-[#00296B] text-white font-semibold text-sm hover:bg-[#001d4f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Send Reply
              </button>
              <button
                onClick={handleCloseTicket}
                disabled={closing || loadingDetail || detail?.status === 'CLOSED'}
                className="h-12 rounded-xl border-2 border-[#CFCFCF] text-[#7D7D7D] font-semibold text-sm hover:bg-[#E3E3E3]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Close Ticket
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#5F5F5F]">{label}</span>
      <span className="text-[#191919] font-medium">{value}</span>
    </div>
  );
}

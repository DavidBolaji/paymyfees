'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Download, FileText } from 'lucide-react';
import { RequestDocumentsModal } from '@/components/admin/request-documents-modal';
import { api } from '@/src/lib/api';

interface LoanDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
  isLoading?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onRefresh?: () => void;
}

function fmt(n: number) {
  return `₦${Number(n || 0).toLocaleString()}`;
}

function isGDrive(url: string) {
  return url?.includes('drive.google.com') || url?.includes('docs.google.com');
}

function DocItem({ doc }: { doc: any }) {
  const gdrive = isGDrive(doc.fileUrl || '');
  const sizeMB = doc.fileSize ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB` : '';

  if (gdrive) {
    return (
      <a
        href={doc.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-[#1a73e8] font-medium hover:underline"
        onClick={e => e.stopPropagation()}
      >
        <svg viewBox="0 0 87.3 78" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0a7.3 7.3 0 003.3 6.65z" fill="#0066da" />
          <path d="M43.65 25L29.9 1.2a7.1 7.1 0 00-3.3 3.3L.95 48.55A7.3 7.3 0 000 53H27.5z" fill="#00ac47" />
          <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.2A7.3 7.3 0 0087.3 53H59.8l5.85 11.5z" fill="#ea4335" />
          <path d="M43.65 25L57.4 1.2A7.35 7.35 0 0053.75 0H33.55c-1.3 0-2.6.35-3.65 1.2z" fill="#00832d" />
          <path d="M59.8 53H27.5L13.75 76.8c1.05.8 2.35 1.2 3.65 1.2h50.5c1.3 0 2.6-.4 3.65-1.2z" fill="#2684fc" />
          <path d="M73.4 26.5l-13.1-22.7A7.1 7.1 0 0057 .5L43.65 25 73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l13.75-23.8-17.2-23.2z" fill="#ffba00" />
        </svg>
        {doc.fileName || doc.documentType}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-3 py-2.5">
      <div className="flex items-center justify-center w-9 h-9 bg-red-50 rounded-lg shrink-0">
        <FileText className="w-5 h-5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#191919] truncate">{doc.fileName || doc.documentType}</p>
        {sizeMB && <p className="text-xs text-[#AEAEAE]">{sizeMB}</p>}
      </div>
      <a
        href={doc.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="flex items-center justify-center w-8 h-8 bg-[#191919] rounded-full hover:bg-[#00296B] transition-colors shrink-0"
      >
        <Download className="w-4 h-4 text-white" />
      </a>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#5F5F5F]">{label}</span>
      <span className={valueClass ?? 'text-[#191919] font-medium'}>{value}</span>
    </div>
  );
}

export function LoanDetailDrawer({ isOpen, onClose, loan, onApprove, onReject, onRefresh }: LoanDetailDrawerProps) {
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [note, setNote] = useState('');
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showReqDocs, setShowReqDocs] = useState(false);
  const [reqDocsLoading, setReqDocsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else { document.body.style.overflow = 'unset'; setDetail(null); setNote(''); }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !loan?.id) return;
    setLoadingDetail(true);
    api.get(`/api/admin/loans/${loan.id}`)
      .then((d: any) => { if (d.success) setDetail(d.data); })
      .catch(console.error)
      .finally(() => setLoadingDetail(false));
  }, [isOpen, loan?.id]);

  const handleApprove = async () => {
    if (!detail?.id) return;
    try {
      setApproving(true);
      await api.post(`/api/admin/loans/${detail.id}/approve`, {});
      onApprove?.();
      onRefresh?.();
      onClose();
    } catch (e) { console.error(e); } finally { setApproving(false); }
  };

  const handleReject = async () => {
    if (!detail?.id) return;
    try {
      setRejecting(true);
      await api.post(`/api/admin/loans/${detail.id}/reject`, {
        reason: note.trim() || 'Rejected by admin',
      });
      onReject?.();
      onRefresh?.();
      onClose();
    } catch (e) { console.error(e); } finally { setRejecting(false); }
  };

  const handleRequestDocs = async (data: { documents: string; instructions: string; channels: string[] }) => {
    if (!detail?.userId) return;
    try {
      setReqDocsLoading(true);
      await api.post('/api/admin/notifications', {
        userId: detail.userId,
        type: 'DOCUMENT_REQUEST',
        message: `Please upload: ${data.documents}. ${data.instructions}`,
      });
      setShowReqDocs(false);
    } catch (e) { console.error(e); } finally { setReqDocsLoading(false); }
  };

  if (!loan) return null;

  const l = detail || loan;
  const isPending = l?.status === 'PENDING';
  const isCommenced = ['ACTIVE', 'DISBURSED', 'COMPLETED', 'APPROVED'].includes(l?.status);
  const drawerTitle = isPending ? 'Approve Loan' : 'Loan Detail';
  const accountStatus = l?.userIsActive === false ? 'Requires Attention' : 'Active';
  const verificationStatus = l?.schoolIsVerified ? 'Verified & Approved' : 'Pending Verification';
  const previousLoans = l?.userPreviousLoans ?? 0;
  const docs: any[] = l?.documents || [];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="z-[100] fixed inset-0 bg-[#292929CC]"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="top-0 right-0 z-[101] fixed bg-white shadow-2xl w-full max-w-[540px] h-full flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 shrink-0">
                <h2 className="font-bold text-[#191919] text-xl">{drawerTitle}</h2>
                <button
                  onClick={onClose}
                  className="flex justify-center items-center hover:bg-gray-50 border-2 border-[#002561] rounded-lg w-10 h-10 transition-colors"
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
                    {/* Student Information */}
                    <div>
                      <p className="font-bold text-[#191919] text-base mb-3">Student Information</p>
                      <div className="space-y-3">
                        <Row label="Student Name:" value={l?.userName || '—'} valueClass="text-[#00296B] font-semibold" />
                        <Row label="School:" value={l?.schoolName || '—'} />
                        <Row label="Program / Level:" value={l?.programCourseOfStudy || l?.academicSession || '—'} />
                        <Row label="Country:" value={l?.userCountry || '—'} />
                        <Row label="City:" value={l?.userCity || '—'} />
                        <Row label="Account Status:" value={accountStatus} />
                      </div>
                    </div>

                    {/* Loan & Disbursement Context */}
                    <div>
                      <p className="font-bold text-[#191919] text-base mb-1 pb-1 border-b-2 border-dashed border-[#00296B] inline-block">
                        Loan &amp; Disbursement Context
                      </p>
                      <div className="space-y-3 mt-3">
                        <Row label="Loan ID:" value={l?.loanNumber || '—'} />
                        <Row label="Tuition Amount:" value={fmt(l?.loanAmount)} />
                        <Row label="To be Disbursed to:" value={l?.schoolName || '—'} />
                        <Row label="Verification Status:" value={verificationStatus} />
                        <Row
                          label="Previous Loan:"
                          value={`${previousLoans} (${previousLoans === 0 ? 'No issues' : `${previousLoans} loan${previousLoans > 1 ? 's' : ''}`})`}
                        />
                      </div>
                    </div>

                    {/* Supporting Data */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-bold text-[#191919] text-base mb-3">Supporting Data</p>
                      <p className="font-semibold text-[#191919] text-sm mb-2">Documents</p>
                      {docs.length === 0 ? (
                        <p className="text-sm text-[#AEAEAE]">No documents attached</p>
                      ) : (
                        <div className="space-y-2">
                          {docs.map((doc: any) => (
                            <DocItem key={doc.id} doc={doc} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Notes */}
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

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 grid grid-cols-3 gap-3 shrink-0">
                <button
                  onClick={handleReject}
                  disabled={rejecting || loadingDetail || isCommenced}
                  className="h-12 rounded-xl border-2 border-red-500 text-red-500 font-semibold text-sm hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                >
                  {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Reject Loan
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approving || loadingDetail || isCommenced}
                  className="h-12 rounded-xl bg-[#00296B] text-white font-semibold text-sm hover:bg-[#001d4f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                >
                  {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Approve Loan
                </button>
                <button
                  onClick={() => setShowReqDocs(true)}
                  disabled={loadingDetail || isCommenced}
                  className="h-12 rounded-xl border-2 border-[#00296B] text-[#00296B] font-semibold text-sm hover:bg-[#00296B]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Request Documents
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <RequestDocumentsModal
        isOpen={showReqDocs}
        onClose={() => setShowReqDocs(false)}
        onConfirm={handleRequestDocs}
        loading={reqDocsLoading}
      />
    </>
  );
}

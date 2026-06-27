'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Download, FileText, Edit } from 'lucide-react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { FreezeAccountModal } from '@/components/admin/freeze-account-modal';
import { SuspendLoanModal } from '@/components/admin/suspend-loan-modal';
import { PaymentReminderModal } from '@/components/admin/payment-reminder-modal';
import { EditStudentDrawer } from '@/components/admin/edit-student-drawer';
import { SuccessModal } from '@/components/ui/success-modal';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';

const STATUS_MAP: Record<string, string> = {
  DISBURSED: 'ongoing',
  ACTIVE: 'ongoing',
  PENDING: 'pending',
  UNDER_REVIEW: 'pending',
  APPROVED: 'pending',
  COMPLETED: 'completed',
  DEFAULTED: 'cancelled',
  REJECTED: 'cancelled',
  CANCELLED: 'cancelled',
};

function InfoCardSkeleton() {
  return (
    <div className="bg-white px-5 pt-6 pb-6 rounded-xl h-full animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-36 mb-6" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex justify-between mb-4">
          <div className="h-3 bg-gray-200 rounded w-28" />
          <div className="h-3 bg-gray-200 rounded w-36" />
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-3 last:border-0">
      <span className="text-base font-normal text-[#7C7C7C] flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-[#525252] text-right">{value ?? 'N/A'}</span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4">
      <p className="text-[22px] font-semibold text-[#191919] uppercase tracking-wide mb-5">{title}</p>
      {children}
    </div>
  );
}

export default function StudentProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showFreeze, setShowFreeze] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [successMsg, setSuccessMsg] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') { router.push('/dashboard'); return; }
    if (userId) fetchStudent();
  }, [user, userId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/students/${userId}`);
      const json = await res.json();
      setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const ACTION_LABELS: Record<string, { title: string; message: string }> = {
    suspend:        { title: 'Loan Suspended', message: 'Future loan eligibility has been successfully suspended.' },
    freeze:         { title: 'Account Frozen', message: 'The student account has been temporarily frozen.' },
    'send-reminder': { title: 'Reminder Sent', message: 'A payment reminder has been sent to the student.' },
  };

  const postAction = async (path: string, body: any) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/api/admin/students/${userId}/${path}`, body);
      const json = await res.json();
      if (json.success !== false) {
        setSuccessMsg(ACTION_LABELS[path] ?? { title: 'Action Successful', message: 'The action was completed successfully.' });
      } else {
        alert(json.message || 'Action failed. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="bg-[#F6F6F6] p-4 sm:p-6 md:p-8 min-h-full">
        <BackNavigation href="/admin/students" label="Back to Dashboard" />

        {/* Row 1: Student Info + Loan & Disbursement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mb-6">
          <InfoCardSkeleton />
          <InfoCardSkeleton />
        </div>

        {/* Row 2: Payment Timeline + Supporting Documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch mb-12">
          {/* Timeline skeleton */}
          <div className="bg-white rounded-xl px-5 pt-5 pb-4 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-32 mb-5" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-28 mb-1.5" />
                    <div className="h-2.5 bg-gray-100 rounded w-20" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1.5" />
                  <div className="h-2.5 bg-gray-100 rounded w-12 ml-auto" />
                </div>
              </div>
            ))}
          </div>
          {/* Documents skeleton */}
          <div className="bg-white rounded-xl px-5 pt-5 pb-4 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-36 mb-5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-[#F6F6F6] rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded bg-gray-200 flex-shrink-0" />
                    <div>
                      <div className="h-3 bg-gray-200 rounded w-24 mb-1.5" />
                      <div className="h-2.5 bg-gray-100 rounded w-14" />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-12 rounded-xl bg-gray-200 animate-pulse" />
          <div className="flex-1 h-12 rounded-xl bg-gray-200 animate-pulse" />
          <div className="flex-1 h-12 rounded-xl bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#F6F6F6] p-4 md:p-6 min-h-full">
        <BackNavigation href="/admin/students" label="Back to Dashboard" />
        <div className="flex justify-center items-center h-[400px]">
          <p className="text-[#7C7C7C]">Student not found.</p>
        </div>
      </div>
    );
  }

  const { user: student, loan, documents = [] } = data;

  const nextInstallment = loan?.installments?.find((i: any) => !['PAID', 'COMPLETED'].includes(i.status));

  return (
    <>
      <div className="bg-[#F6F6F6] min-h-full p-4 sm:p-6 md:p-8">
        <div className="pt-6 md:pt-0">
          <BackNavigation href="/admin/students" label="Back to Dashboard" />

          {/* ── 2-col grid: Info cards ───────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mb-6">
            {/* Student Information */}
            <SectionCard title="Student Information">
              <InfoRow label="Student Name" value={student.fullName} />
              <InfoRow label="Student ID" value={(params?.userId as any)?.split('-')[0]} />
              <InfoRow label="School" value={loan?.schoolName} />
              <InfoRow label="Phone Number" value={student.phone} />
              <InfoRow label="Country" value={student.country} />
              <InfoRow label="City" value={student.city} />
              <InfoRow label="Account Status" value="N/A" />
            </SectionCard>

            {/* Loan & Disbursement */}
            <SectionCard title="Loan & Disbursement">
              {loan ? (
                <>
                  <InfoRow label="Loan ID:" value={loan.loanNumber} />
                  <InfoRow label="Tuition Amount:" value={`₦${Number(loan.loanAmount || 0).toLocaleString()}`} />
                  <InfoRow label="Disbursed To:" value={loan.schoolName} />
                  <InfoRow label="Disbursement Date:" value={loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'} />
                  <InfoRow label="Verification Status" value={<StatusBadge status={STATUS_MAP[loan.status] || 'pending'} />} />
                  <InfoRow label="Paid Amount" value={`₦${Number(loan.amountRepaid || 0).toLocaleString()}`} />
                  <InfoRow label="Remaining Amount" value={`₦${Number(loan.outstandingBalance || 0).toLocaleString()}`} />
                </>
              ) : (
                <p className="text-sm text-[#7C7C7C] py-4">No active loan.</p>
              )}
            </SectionCard>
          </div>

          {/* ── 2-col grid: Timeline + Repayment Stages ─────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Repayment Stages / Installments */}
            <div className="bg-white rounded-xl px-5 pt-5 pb-4 h-full">
              <p className="text-[22px] font-semibold text-[#191919] uppercase tracking-wide mb-3">Payment Timeline</p>
              {loan?.installments && loan.installments.length > 0 ? (
                <div className="space-y-0 overflow-y-auto max-h-[280px]">
                  {loan.installments.map((inst: any, i: number) => {
                    const n = inst.installmentNumber ?? (i + 1);
                    const sfx = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
                    const isPaid = ['PAID', 'COMPLETED'].includes(inst.status);
                    const isNext = !isPaid && inst === nextInstallment;
                    return (
                      <div key={i} className="flex justify-between items-center py-2.5 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isPaid ? 'bg-[#002561] text-white' : isNext ? 'bg-amber-100 text-amber-700' : 'bg-[#F0F0F0] text-[#7C7C7C]'}`}>
                            {n}
                          </div>
                          <div>
                            <p className="text-sm text-[#191919]">{n}{sfx} Installment</p>
                            {inst.dueDate && (
                              <p className="text-xs text-[#7C7C7C]">Due {new Date(inst.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${isPaid ? 'text-[#191919]' : 'text-[#7C7C7C]'}`}>
                            ₦{Number(inst.amount).toLocaleString()}
                          </p>
                          <p className={`text-xs ${isPaid ? 'text-green-600' : isNext ? 'text-amber-600' : 'text-[#7C7C7C]'}`}>
                            {isPaid ? 'Paid' : isNext ? 'Next Due' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[#7C7C7C] py-2">No installment schedule yet.</p>
              )}
            </div>

            <div className="bg-white rounded-xl px-5 pt-5 pb-4 h-full">
              <p className="text-[22px] font-semibold text-[#191919] uppercase tracking-wide mb-3">Supporting Documents</p>
              {documents.length === 0 ? (
                <p className="text-sm text-[#7C7C7C] py-1">No documents uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {documents.map((doc: any) => {
                    const isGdrive = doc.fileUrl?.includes('drive.google.com') || doc.fileUrl?.includes('docs.google.com');
                    const fmtSize = (b: number) => b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
                    return (
                      <div key={doc.id} className="flex items-center justify-between gap-3 bg-[#F6F6F6] rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center ${isGdrive ? 'bg-white border border-gray-200' : 'bg-red-500'}`}>
                            {isGdrive
                              ? <svg viewBox="0 0 87.3 78" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" /><path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5A9 9 0 000 53h27.5z" fill="#00ac47" /><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5a9 9 0 001.2-4.5H59.8l5.85 11.5z" fill="#ea4335" /><path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" /><path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.5c1.6 0 3.15-.4 4.5-1.2z" fill="#2684fc" /><path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" /></svg>
                              : <FileText className="w-4 h-4 text-white" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#191919] truncate">{doc.fileName}</p>
                            {doc.fileSize ? <p className="text-xs text-[#7C7C7C]">{fmtSize(doc.fileSize)}</p> : null}
                          </div>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={!isGdrive ? doc.fileName : undefined}
                          className="flex-shrink-0 w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Download className="w-4 h-4 text-[#7C7C7C]" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className='mb-12' />

          {/* ── Action Buttons ───────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowEditDrawer(true)}
              className="flex-1 h-12 rounded-xl border-2 border-[#002561] bg-white text-[#002561] font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={() => setShowReminder(true)}
              className="flex-1 h-12 rounded-xl bg-[#002561] text-white font-semibold text-sm hover:bg-[#001d4e] transition-colors flex items-center justify-center gap-2"
            >
              Send Payment Reminder
            </button>
            <button
              onClick={() => setShowSuspend(true)}
              className="flex-1 h-12 rounded-xl border-2 border-red-500 bg-white text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              Suspend Future Loan Eligibility
            </button>
            <button
              onClick={() => setShowFreeze(true)}
              className="flex-1 h-12 rounded-xl border-2 border-[#191919] bg-white text-[#191919] font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              Temporarily Freeze Account
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SuspendLoanModal
        isOpen={showSuspend}
        onClose={() => setShowSuspend(false)}
        onConfirm={(d) => { postAction('suspend', d); setShowSuspend(false); }}
        loading={actionLoading}
      />
      <PaymentReminderModal
        isOpen={showReminder}
        onClose={() => setShowReminder(false)}
        onConfirm={(d) => { postAction('send-reminder', d); setShowReminder(false); }}
        loading={actionLoading}
      />
      <FreezeAccountModal
        isOpen={showFreeze}
        onClose={() => setShowFreeze(false)}
        onConfirm={(d) => { postAction('freeze', d); setShowFreeze(false); }}
        loading={actionLoading}
      />
      <EditStudentDrawer
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        student={data?.user}
        onSaved={fetchStudent}
      />
      <SuccessModal
        isOpen={!!successMsg}
        onClose={() => setSuccessMsg(null)}
        title={successMsg?.title}
        message={successMsg?.message}
      />
    </>
  );
}

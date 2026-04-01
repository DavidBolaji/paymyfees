'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { api } from '@/src/lib/api';

interface StudentActiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function fmtMonthYear(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function fmtDate(d: any) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
}

export function StudentActiveDrawer({ isOpen, onClose, student }: StudentActiveDrawerProps) {
  const [notes, setNotes] = useState('');
  const [fullData, setFullData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else { document.body.style.overflow = 'unset'; setFullData(null); }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Fetch full student data (wallet, dates, installments, etc.)
  useEffect(() => {
    if (!isOpen || !student?.userId) return;
    setFetchLoading(true);
    api.get(`/api/admin/students/${student.userId}`)
      .then(r => r.json())
      .then(d => setFullData(d.data ?? null))
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  }, [isOpen, student?.userId]);

  if (!student) return null;

  const loan = fullData?.loan ?? null;
  const user = fullData?.user ?? null;
  const wallet = fullData?.wallet ?? null;

  const totalMonths = loan?.repaymentMonths ?? student.repaymentMonths ?? 12;
  const amountRepaid = loan?.amountRepaid ?? student.amountRepaid ?? 0;
  const totalAmount = loan?.loanAmount ?? student.totalAmount ?? 0;
  const outstanding = loan?.outstandingBalance ?? student.outstanding ?? 0;

  const paidInstallments = loan?.installments?.filter((i: any) => ['PAID', 'COMPLETED'].includes(i.status)).length ?? 0;
  const totalInstallments = loan?.installments?.length ?? totalMonths;
  const progressPct = totalInstallments > 0
    ? Math.min((paidInstallments / totalInstallments) * 100, 100)
    : (totalAmount > 0 ? Math.min((amountRepaid / totalAmount) * 100, 100) : 0);

  const nextInstallment = loan?.installments?.find(
    (i: any) => !['PAID', 'COMPLETED'].includes(i.status)
  );

  const daysUntilDue = nextInstallment?.dueDate
    ? Math.max(0, Math.ceil((new Date(nextInstallment.dueDate).getTime() - Date.now()) / 86400000))
    : null;

  const activeLoanLabel = totalAmount
    ? `₦${Number(totalAmount).toLocaleString()}${totalMonths ? ` – ${totalMonths} Month Plan` : ''}`
    : 'N/A';

  const nextPaymentLabel = nextInstallment
    ? `₦${Number(nextInstallment.amount).toLocaleString()} Due in ${daysUntilDue ?? '?'} Days`
    : (student.nextPaymentAmount != null
        ? `₦${Number(student.nextPaymentAmount).toLocaleString()} Due in ${student.daysUntilDue ?? '?'} Days`
        : 'N/A');

  const walletBalance = wallet?.balance != null
    ? `₦${Number(wallet.balance).toLocaleString()} Available`
    : (student.walletBalance != null ? `₦${Number(student.walletBalance).toLocaleString()} Available` : 'N/A');

  const joinedAt = user?.createdAt ?? student.joinedAt;

  const modeLabel = student.method
    ? student.method.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'N/A';

  const internalNotes = loan?.adminNotes ?? student.adminNotes ?? student.notes;

  return (
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
            className="top-0 right-0 z-[101] fixed bg-white shadow-2xl w-full max-w-[520px] h-full flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 flex-shrink-0">
              <h2 className="font-semibold text-[#191919] text-lg">Student Activity Details</h2>
              <button
                onClick={onClose}
                className="flex justify-center items-center hover:bg-gray-50 border-[#002561] border-2 rounded-lg w-10 h-10 transition-colors"
              >
                <X className="w-5 h-5 text-[#002561]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
              {fetchLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-[#002561] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Student Details */}
                  <section>
                    <p className="text-xs font-bold text-[#191919] mb-3">Student Details</p>
                    <div className="space-y-3">
                      <Row label="Student Name" value={student.student || user?.fullName || 'N/A'} />
                      <Row label="Student ID" value={student.loanNumber || loan?.loanNumber || 'N/A'} />
                      <Row label="Email" value={user?.email || 'N/A'} />
                      <Row label="Phone" value={user?.phone || 'N/A'} />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#7C7C7C]">Account Status</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-xs font-semibold ${user?.isActive !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {user?.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <Row label="School" value={student.school || loan?.schoolName || 'N/A'} />
                      <Row label="Program / Course" value={loan?.programCourseOfStudy || 'N/A'} />
                      <Row label="Country" value={user?.country || 'N/A'} />
                      <Row label="Last Activity" value={timeAgo(student.paymentDate)} />
                      <Row label="Joined" value={fmtMonthYear(joinedAt)} />
                    </div>
                  </section>

                  <Divider />

                  {/* Activity Snapshot */}
                  <section>
                    <p className="text-xs font-bold text-[#191919] mb-3">Activity Snapshot</p>
                    <div className="space-y-3">
                      <Row label="Wallet Balance" value={walletBalance} />
                      <Row label="Active Loan" value={activeLoanLabel} />
                      <Row label="Next Payment" value={nextPaymentLabel} />
                      <Row label="Payment Mode" value={modeLabel} />
                      <Row label="Activity" value={student.activity || 'N/A'} />
                    </div>
                  </section>

                  <Divider />

                  {/* Loan Overview */}
                  <section>
                    <p className="text-xs font-bold text-[#191919] mb-3">Loan Overview</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-[#7C7C7C] mb-1.5">
                        <span>Progress</span>
                        <span>{paidInstallments} / {totalInstallments} months paid</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#002561] rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Row label="Loan Amount" value={`₦${Number(totalAmount || 0).toLocaleString()}`} />
                      <Row label="Total Paid" value={`₦${Number(amountRepaid).toLocaleString()}`} />
                      <Row label="Outstanding" value={`₦${Number(outstanding).toLocaleString()}`} />
                      <Row
                        label="Next Repayment Date"
                        value={nextInstallment?.dueDate ? fmtDate(nextInstallment.dueDate) : 'N/A'}
                      />
                      <Row
                        label="Next Repayment Amount"
                        value={nextInstallment ? `₦${Number(nextInstallment.amount).toLocaleString()}` : 'N/A'}
                      />
                      <Row
                        label="Interest Rate"
                        value={loan?.interestRate != null ? `${loan.interestRate}% Monthly` : 'N/A'}
                      />
                    </div>
                  </section>

                  <Divider />

                  {/* Internal Notes */}
                  <section>
                    <p className="text-xs font-bold text-[#191919] mb-2">Internal Notes</p>
                    <div className="w-full rounded-lg bg-[#f5f5f5] border border-[#e8e8e8] px-3 py-3 min-h-[72px] text-sm text-[#555] leading-relaxed">
                      {internalNotes || <span className="text-gray-400">No notes added yet.</span>}
                    </div>
                  </section>

                  {/* Add Notes */}
                  <section>
                    <p className="text-xs font-bold text-[#191919] mb-2">Add Notes</p>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Add your note here"
                      className="w-full rounded-lg bg-[#f5f5f5] border border-[#e8e8e8] px-3 py-3 text-sm text-[#292929] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#002561] resize-none"
                    />
                  </section>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-[#7C7C7C]">{label}</span>
      <span className="text-sm font-medium text-[#191919]">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-100" />;
}

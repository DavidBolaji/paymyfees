'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { PaymentReminderModal } from './payment-reminder-modal';
import { SuspendLoanModal } from './suspend-loan-modal';
import { api } from '@/src/lib/api';
import { formatCurrency } from '@/lib/utils';

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

const fmt = (val: number) => `₦${Number(val || 0).toLocaleString()}`;
const fmtDate = (d: any) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

interface PaymentDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  mode?: string;
}

export function PaymentDetailDrawer({ isOpen, onClose, student }: PaymentDetailDrawerProps) {
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [loanData, setLoanData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else { document.body.style.overflow = 'unset'; setLoanData(null); }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Fetch full loan data when drawer opens with a userId
  useEffect(() => {
    if (!isOpen || !student?.userId) return;
    setFetchLoading(true);
    api.get(`/api/admin/students/${student.userId}`)
      .then(r => r.json())
      .then(d => setLoanData(d.data?.loan ?? d.loan ?? null))
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  }, [isOpen, student?.userId]);

  if (!student) return null;

  const userId = student.userId;
  const loan = loanData ?? student;

  const totalRepayable = loan.loanAmount || loan.totalAmount || 0;
  const amountRepaid = loan.amountRepaid || 0;
  const outstanding = loan.outstandingBalance ?? loan.outstanding ?? 0;
  const paidCount = loan.installments?.filter((i: any) => ['PAID', 'COMPLETED'].includes(i.status)).length ?? 0;
  const totalCount = loan.installments?.length ?? 0;
  const progressPct = totalCount > 0 ? Math.min((paidCount / totalCount) * 100, 100) : 0;
  const nextInstallment = loan.installments?.find((i: any) => i.status !== 'PAID' && i.status !== 'COMPLETED');

  const handleReminder = async (data: any) => {
    if (!userId) return;
    try {
      setActionLoading(true);
      await api.post(`/api/admin/students/${userId}/send-reminder`, data);
      setShowReminderModal(false);
    } finally { setActionLoading(false); }
  };

  const handleSuspend = async (data: any) => {
    if (!userId) return;
    try {
      setActionLoading(true);
      await api.post(`/api/admin/students/${userId}/suspend`, data);
      setShowSuspendModal(false);
    } finally { setActionLoading(false); }
  };

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
              <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="font-semibold text-[#191919] text-lg">Payment Information</h2>
                <button onClick={onClose} className="flex justify-center items-center hover:bg-gray-50 border-[#002561] border-2 rounded-lg w-10 h-10 transition-colors">
                  <X className="w-5 h-5 text-[#002561]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {fetchLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-[#002561] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Loan Summary */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Loan Summary</p>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Loan ID', value: loan.loanNumber ?? 'N/A' },
                          { label: 'Status', value: <StatusBadge status={STATUS_MAP[loan.status] || 'pending'} /> },
                          { label: 'Borrowed Amount', value: formatCurrency(loan.loanAmount || 0) },
                          { label: 'Total Repayable', value: formatCurrency(totalRepayable) },
                          { label: 'Tenure', value: loan.repaymentMonths ? `${loan.repaymentMonths} Months` : 'N/A' },
                          { label: 'Interest Rate', value: loan.interestRate ? `${loan.interestRate}% Monthly` : 'N/A' },
                        ].map(item => (
                          <div key={item.label} className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{item.label}</span>
                            <span className="text-sm font-medium text-gray-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Loan Overview */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Loan Overview</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Paid / Total</span>
                          <span>{paidCount} / {totalCount} months paid</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#002561] rounded-full" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Total Paid', value: fmt(amountRepaid) },
                          { label: 'Outstanding', value: fmt(outstanding) },
                          { label: 'Next Repayment Date', value: nextInstallment ? fmtDate(nextInstallment.dueDate) : 'N/A' },
                          { label: 'Next Repayment Amount', value: nextInstallment ? fmt(nextInstallment.amount) : 'N/A' },
                        ].map(item => (
                          <div key={item.label} className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{item.label}</span>
                            <span className="text-sm font-medium text-gray-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Repayment Stages */}
                    {loan.installments && loan.installments.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Repayment Stages</p>
                        <div className="space-y-2">
                          {loan.installments.map((inst: any, i: number) => {
                            const n = inst.installmentNumber ?? (i + 1);
                            const sfx = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
                            const isPaid = inst.status === 'PAID' || inst.status === 'COMPLETED';
                            return (
                              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-gray-700">
                                  {n}{sfx} Installment{isPaid ? ' Paid' : ''}
                                </span>
                                {isPaid
                                  ? <span className="text-sm font-medium text-gray-900">{fmt(inst.amount)}</span>
                                  : <span className="text-sm font-medium text-gray-400">Unpaid</span>
                                }
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Internal Notes */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Internal Notes</p>
                      <div className="w-full rounded-lg bg-[#f5f5f5] border border-[#e0e0e0] px-3 py-2.5 min-h-[64px] text-sm text-[#555] leading-relaxed">
                        {loan.adminNotes ?? loan.notes ?? <span className="text-gray-400">No notes added yet.</span>}
                      </div>
                    </div>

                    {/* Add Notes */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Add Notes</p>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Write detailed notes..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002561] resize-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowReminderModal(true)}
                  className="flex-1 h-11 bg-[#002561] text-white rounded-lg text-sm font-medium hover:bg-[#001d4e] transition-colors flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" /> Send Payment Reminder
                </button>
                <button
                  onClick={() => setShowSuspendModal(true)}
                  className="flex-1 h-11 border border-red-500 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" /> Suspend Future Loan Eligibility
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PaymentReminderModal isOpen={showReminderModal} onClose={() => setShowReminderModal(false)} onConfirm={handleReminder} loading={actionLoading} />
      <SuspendLoanModal isOpen={showSuspendModal} onClose={() => setShowSuspendModal(false)} onConfirm={handleSuspend} loading={actionLoading} />
    </>
  );
}

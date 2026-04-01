'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { api } from '@/src/lib/api';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface StudentActiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

function fmtDate(d: any) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
}

function fmtMoney(v: any) {
  if (v == null || v === '') return 'N/A';
  return `₦${Number(v).toLocaleString()}`;
}

export function StudentActiveDrawer({ isOpen, onClose, student }: StudentActiveDrawerProps) {
  const [fullData, setFullData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else { document.body.style.overflow = 'unset'; setFullData(null); }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

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

  const paidInstallments = loan?.installments?.filter((i: any) => ['PAID', 'COMPLETED'].includes(i.status)).length ?? 0;
  const totalInstallments = loan?.installments?.length ?? loan?.repaymentMonths ?? 0;
  const progressPct = totalInstallments > 0 ? Math.min((paidInstallments / totalInstallments) * 100, 100) : 0;

  const nextInstallment = loan?.installments?.find(
    (i: any) => !['PAID', 'COMPLETED'].includes(i.status)
  );

  const loanStatus = loan?.status ?? student.loanStatus ?? 'PENDING';

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
            className="top-0 right-0 z-[101] fixed bg-white shadow-2xl w-full max-w-[480px] h-full flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 flex-shrink-0">
              <h2 className="font-semibold text-[#191919] text-[1rem]">Student Activity Details</h2>
              <button
                onClick={onClose}
                className="flex justify-center items-center hover:bg-gray-50 border-[#002561] border-2 rounded-lg w-10 h-10 transition-colors"
              >
                <X className="w-5 h-5 text-[#002561]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {fetchLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-[#002561] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-0">
                  {/* ── Student Information ── */}
                  <section className="mb-5">
                    <p className="text-[0.75rem] font-semibold text-[#191919] uppercase tracking-wider border-b-2 border-[#00296B] pb-1 inline-block mb-4">
                      Student Information
                    </p>
                    <div className="space-y-3">
                      <Row label="Student Name" value={student.student ?? user?.fullName} />
                      <Row label="Student ID" value={loan?.loanNumber ?? student.loanNumber} />
                      <Row label="School" value={student.school ?? loan?.schoolName} />
                      <Row label="Program" value={loan?.programCourseOfStudy ?? student.program} />
                      <Row label="Country" value={user?.country ?? student.country} />
                      <Row
                        label="Loan Status"
                        value={<StatusBadge status={loanStatus} />}
                      />
                      <Row
                        label="Account Status"
                        value={
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border-2 text-[0.67rem] font-semibold ${
                            user?.isActive !== false
                              ? 'bg-green-50 text-green-700 border-green-400'
                              : 'bg-red-50 text-red-600 border-red-400'
                          }`}>
                            {user?.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        }
                      />
                      <Row label="Date & Time" value={fmtDate(student.paymentDate ?? user?.createdAt)} />
                    </div>
                  </section>

                  <div className="border-t border-gray-100 mb-5" />

                  {/* ── Loan Information ── */}
                  <section className="mb-5">
                    <p className="text-[0.75rem] font-semibold text-[#191919] uppercase tracking-wider border-b-2 border-[#00296B] pb-1 inline-block mb-4">
                      Loan Information
                    </p>
                    <div className="space-y-3">
                      <Row label="Loan Amount" value={fmtMoney(loan?.loanAmount ?? student.totalAmount)} />
                      <Row label="Wallet Balance" value={wallet?.balance != null ? fmtMoney(wallet.balance) : 'N/A'} />
                      <Row
                        label="Next Repayment"
                        value={nextInstallment ? `${fmtMoney(nextInstallment.amount)} · ${fmtDate(nextInstallment.dueDate)}` : 'N/A'}
                      />
                      <Row label="Interest Rate" value={loan?.interestRate != null ? `${loan.interestRate}%` : 'N/A'} />
                      <Row label="Total Paid" value={fmtMoney(loan?.amountRepaid)} />
                      <Row label="Outstanding" value={fmtMoney(loan?.outstandingBalance)} />
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[0.7rem] text-[#7C7C7C] mb-1.5">
                        <span>Repayment Progress</span>
                        <span>{paidInstallments}/{totalInstallments} months</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#002561] rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </section>

                  <div className="border-t border-gray-100 mb-5" />

                  {/* ── Activity ── */}
                  <section>
                    <p className="text-[0.75rem] font-semibold text-[#191919] uppercase tracking-wider border-b-2 border-[#00296B] pb-1 inline-block mb-4">
                      Recent Activity
                    </p>
                    <div className="w-full rounded-lg bg-[#f5f5f5] border border-[#e8e8e8] px-3 py-3 text-[0.75rem] text-[#555] leading-relaxed min-h-[60px]">
                      {student.activity || <span className="text-gray-400">No recent activity recorded.</span>}
                    </div>
                  </section>
                </div>
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
    <div className="flex justify-between items-center gap-4">
      <span className="text-[0.75rem] text-[#7C7C7C] flex-shrink-0">{label}</span>
      <span className="text-[0.75rem] font-semibold text-[#191919] text-right">{value ?? 'N/A'}</span>
    </div>
  );
}


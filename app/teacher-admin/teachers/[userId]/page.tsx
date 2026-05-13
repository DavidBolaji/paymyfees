'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { LoanDetailDrawer } from '@/components/dashboard/loan-detail-drawer';
import { api } from '@/src/lib/api';

const STATUS_MAP: Record<string, string> = {
  DISBURSED: 'ongoing',
  ACTIVE: 'ongoing',
  PENDING: 'pending',
  APPROVED: 'pending',
  COMPLETED: 'completed',
  DEFAULTED: 'cancelled',
  REJECTED: 'cancelled',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-3">
      <span className="text-base font-normal text-[#7C7C7C] flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-[#525252] text-right">{value ?? 'N/A'}</span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <p className="text-lg font-semibold text-[#191919] uppercase tracking-wide mb-4">{title}</p>
      {children}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-5" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between mb-4">
          <div className="h-3 bg-gray-200 rounded w-28" />
          <div className="h-3 bg-gray-200 rounded w-36" />
        </div>
      ))}
    </div>
  );
}

export default function TeacherProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (userId) fetchTeacher();
  }, [userId]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/teacher-admin/teachers/${userId}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanClick = (loan: any) => {
    setSelectedLoan(loan);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-[#F6F6F6] p-4 sm:p-6 md:p-8 min-h-full">
        <BackNavigation href="/teacher-admin/teachers" label="Back to Teachers" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#F6F6F6] p-4 md:p-6 min-h-full">
        <BackNavigation href="/teacher-admin/teachers" label="Back to Teachers" />
        <div className="flex justify-center items-center h-[400px]">
          <p className="text-[#7C7C7C]">Teacher not found.</p>
        </div>
      </div>
    );
  }

  const { user, teacherProfile, loans } = data;
  const latestLoan = loans?.[0];

  return (
    <>
      <div className="bg-[#F6F6F6] min-h-full p-4 sm:p-6 md:p-8">
        <BackNavigation href="/teacher-admin/teachers" label="Back to Teachers" />

        {/* Row 1: Teacher Info + Employment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <SectionCard title="Teacher Information">
            <InfoRow label="Full Name" value={user.fullName} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="Staff ID" value={teacherProfile?.staffId} />
            <InfoRow label="Account Status" value={user.isActive ? 'Active' : 'Inactive'} />
            <InfoRow
              label="Joined"
              value={new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            />
          </SectionCard>

          <SectionCard title="Employment Details">
            <InfoRow label="School" value={teacherProfile?.schoolName} />
            <InfoRow label="School Email" value={teacherProfile?.schoolEmail} />
            <InfoRow label="Subject" value={teacherProfile?.subject} />
            <InfoRow label="Employment Status" value={teacherProfile?.employmentStatus} />
            <InfoRow label="School Address" value={teacherProfile?.schoolAddress} />
            <InfoRow label="Registration No." value={teacherProfile?.registrationNumber} />
          </SectionCard>
        </div>

        {/* Loan History */}
        <SectionCard title="Loan History">
          {loans.length === 0 ? (
            <p className="text-sm text-[#7C7C7C] py-2">No loan applications yet.</p>
          ) : (
            <div className="space-y-3">
              {loans.map((loan: any) => (
                <div
                  key={loan.id}
                  onClick={() => handleLoanClick(loan)}
                  className="flex items-center justify-between p-4 bg-[#F6F6F6] rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#191919]">{loan.loanNumber}</p>
                    <p className="text-xs text-[#7C7C7C] mt-0.5">{loan.schoolName}</p>
                    <p className="text-xs text-[#7C7C7C]">
                      Applied: {loan.applicationDate
                        ? new Date(loan.applicationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#191919]">
                      ₦{Number(loan.loanAmount).toLocaleString()}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={STATUS_MAP[loan.status] || 'pending'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Payment Timeline for latest loan */}
        {latestLoan?.installments?.length > 0 && (
          <div className="mt-5">
            <SectionCard title="Payment Timeline">
              <div className="space-y-0 overflow-y-auto max-h-[280px]">
                {latestLoan.installments.map((inst: any, i: number) => {
                  const n = inst.installmentNumber ?? (i + 1);
                  const sfx = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
                  const isPaid = ['PAID', 'COMPLETED'].includes(inst.status);
                  const isNext = !isPaid && inst === latestLoan.installments.find((x: any) => !['PAID', 'COMPLETED'].includes(x.status));
                  return (
                    <div key={i} className="flex justify-between items-center py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isPaid ? 'bg-[#002561] text-white' : isNext ? 'bg-amber-100 text-amber-700' : 'bg-[#F0F0F0] text-[#7C7C7C]'}`}>
                          {n}
                        </div>
                        <div>
                          <p className="text-sm text-[#191919]">{n}{sfx} Installment</p>
                          {inst.dueDate && (
                            <p className="text-xs text-[#7C7C7C]">
                              Due {new Date(inst.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
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
            </SectionCard>
          </div>
        )}
      </div>

      <LoanDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        loan={selectedLoan}
        onRefresh={fetchTeacher}
        userLabel="Teacher Information"
        loansBasePath="/api/teacher-admin/loans"
      />
    </>
  );
}

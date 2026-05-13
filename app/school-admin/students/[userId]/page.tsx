'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Download, FileText } from 'lucide-react';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { api } from '@/src/lib/api';

const STATUS_MAP: Record<string, string> = {
  DISBURSED: 'ongoing', ACTIVE: 'ongoing', PENDING: 'ongoing',
  APPROVED: 'pending', COMPLETED: 'completed',
  DEFAULTED: 'cancelled', CANCELLED: 'cancelled',
};

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

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 animate-pulse">
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

export default function SchoolAdminStudentDetailPage() {
  const params = useParams();
  const userId = params?.userId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (userId) fetchStudent();
  }, [userId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/school-admin/students/${userId}`);
      const json = await res.json();
      setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F6F6F6] p-4 sm:p-6 md:p-8 min-h-full">
        <BackNavigation href="/school-admin/students" label="Back to Students" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mb-6">
          <CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#F6F6F6] p-4 md:p-6 min-h-full">
        <BackNavigation href="/school-admin/students" label="Back to Students" />
        <div className="flex justify-center items-center h-[400px]">
          <p className="text-[#7C7C7C]">Student not found.</p>
        </div>
      </div>
    );
  }

  const { user: student, loan, documents = [] } = data;
  const nextInstallment = loan?.installments?.find((i: any) => !['PAID', 'COMPLETED'].includes(i.status));

  return (
    <div className="bg-[#F6F6F6] min-h-full p-4 sm:p-6 md:p-8">
      <BackNavigation href="/school-admin/students" label="Back to Students" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mb-6">
        <SectionCard title="Student Information">
          <InfoRow label="Student Name" value={student.fullName} />
          <InfoRow label="Email" value={student.email} />
          <InfoRow label="Phone" value={student.phone} />
          <InfoRow label="School" value={loan?.schoolName} />
          <InfoRow label="Country" value={student.country} />
          <InfoRow label="Account Status" value={student.isActive ? 'Active' : 'Inactive'} />
        </SectionCard>

        <SectionCard title="Loan & Disbursement">
          {loan ? (
            <>
              <InfoRow label="Loan ID" value={loan.loanNumber} />
              <InfoRow label="Loan Amount" value={`₦${Number(loan.loanAmount || 0).toLocaleString()}`} />
              <InfoRow label="Disbursed To" value={loan.schoolName} />
              <InfoRow label="Disbursement Date" value={loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'} />
              <InfoRow label="Status" value={<StatusBadge status={STATUS_MAP[loan.status] || 'pending'} />} />
              <InfoRow label="Paid Amount" value={`₦${Number(loan.paidAmount || 0).toLocaleString()}`} />
              <InfoRow label="Outstanding" value={`₦${Number(loan.remainingAmount || 0).toLocaleString()}`} />
            </>
          ) : (
            <p className="text-sm text-[#7C7C7C] py-4">No active loan.</p>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* Payment Timeline */}
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
                  <div key={i} className="flex justify-between items-center py-2.5">
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
                      <p className={`text-sm font-medium ${isPaid ? 'text-[#191919]' : 'text-[#7C7C7C]'}`}>₦{Number(inst.amount).toLocaleString()}</p>
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

        {/* Supporting Documents */}
        <div className="bg-white rounded-xl px-5 pt-5 pb-4 h-full">
          <p className="text-[22px] font-semibold text-[#191919] uppercase tracking-wide mb-3">Supporting Documents</p>
          {documents.length === 0 ? (
            <p className="text-sm text-[#7C7C7C] py-1">No documents uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {documents.map((doc: any) => {
                const fmtSize = (b: number) => b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
                return (
                  <div key={doc.id} className="flex items-center justify-between gap-3 bg-[#F6F6F6] rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center bg-red-500">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#191919] truncate">{doc.fileName}</p>
                        {doc.fileSize ? <p className="text-xs text-[#7C7C7C]">{fmtSize(doc.fileSize)}</p> : null}
                      </div>
                    </div>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4 text-[#7C7C7C]" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

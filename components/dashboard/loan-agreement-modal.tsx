'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface LoanAgreementSummary {
  borrowerName: string;
  studentName: string;
  institutionName: string;
  loanAmount: number;
  loanTenure: number;      // months
  monthlyRepayment: number;
  totalRepayment: number;
  /** Display label for interest rate — defaults to "2.5% per month" */
  interestRateLabel?: string;
}

export interface AgreementMeta {
  agreementVersion: string;
  acceptedAt: string;       // ISO UTC
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  consentLog: { item: string; acceptedAt: string }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (meta: AgreementMeta) => Promise<void>;
  summary: LoanAgreementSummary;
  isSubmitting?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AGREEMENT_VERSION = '1.0';


const CONSENT_ITEMS = [
  'I have reviewed my loan details',
  'I understand PayMyFees pays the school directly',
  'I agree to repay as scheduled',
  'I confirm my information is accurate',
  'I consent to data processing and KYC verification',
  'I agree to the Terms & Conditions and Privacy Policy',
] as const;

const AGREEMENT_TEXT = `By proceeding, I hereby agree and confirm that:

I have applied for an education loan from PayMyFees Limited ("PayMyFees"), and I authorize PayMyFees to disburse the approved loan amount directly to the named educational institution on my behalf.

I agree to repay the loan in monthly instalments according to the repayment schedule.

I understand that interest is charged at 2.5% per month.

I agree that repayments must be made on or before due dates.

In the event of default, I acknowledge that PayMyFees reserves the right to:
  • Report my credit status to licensed credit bureaus
  • Engage debt recovery agents
  • Initiate legal proceedings
  • Enforce any available legal remedies

I confirm that my application information is accurate.

I consent to verification and data processing for loan and compliance purposes.

─── Data Protection & Consent (NDPA 2023 Compliance) ───

I expressly consent to the collection, processing, storage, and sharing of my personal data for:
  • Loan processing and administration
  • Identity verification (KYC)
  • Regulatory compliance
  • Credit reporting

I understand that my data may be shared with:
  • Credit bureaus
  • Financial institutions
  • Regulators and law enforcement agencies where required by law

I accept full responsibility for repayment regardless of circumstances.

I warrant that all information provided is true, accurate, and complete, and I understand that any misrepresentation may result in loan cancellation or legal consequences.

I understand the terms applicable to early repayment, including whether any prepayment fees or adjustments apply.

This agreement shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.

By clicking "I Accept Loan Agreement", I enter into a legally binding agreement with PayMyFees Limited.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

function addMonths(d: Date, m: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + m);
  return r;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn('flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0', highlight && 'bg-blue-50 -mx-4 px-4 rounded')}>
      <span className="font-semibold text-[#292929]">{label}</span>
      <span className={cn('text-sm font-semibold text-right', highlight ? 'text-[#00296B]' : 'text-gray-800')}>{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LoanAgreementModal({ isOpen, onClose, onAccept, summary, isSubmitting = false }: Props) {
  const [step, setStep] = useState(0);
  const [agreementScrolled, setAgreementScrolled] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [, setSubmitError] = useState<string | null>(null);

  const agreementRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setAgreementScrolled(false);
      setAccepted(false);
      setSubmitError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const firstRepay = addMonths(today, 1);
  const finalRepay = addMonths(today, summary.loanTenure);

  const handleAgreementScroll = () => {
    const el = agreementRef.current;
    if (!el || agreementScrolled) return;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 12) {
      setAgreementScrolled(true);
    }
  };

  const handleAccept = async () => {
    const now = new Date().toISOString();
    const meta: AgreementMeta = {
      agreementVersion: AGREEMENT_VERSION,
      acceptedAt: now,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      platform: typeof window !== 'undefined' ? navigator.platform : '',
      language: typeof window !== 'undefined' ? navigator.language : '',
      screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
      consentLog: CONSENT_ITEMS.map((item) => ({ item, acceptedAt: now })),
    };
    setSubmitError(null);
    try {
      await onAccept(meta);
      setAccepted(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Submission failed. Please try again.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl shadow-2xl border border-[#F2F2F2] flex flex-col"
        style={{ width: '644px', maxWidth: '90vw', height: '90vh', padding: '23px 15px 20px' }}
      >
        {/* ── Header — matches Contact Support ── */}
        <div className="relative flex items-center justify-center mb-4 flex-shrink-0">
          <h3 className="text-2xl font-bold text-[#191919]">Loan Agreement</h3>
          {!isSubmitting && !accepted && (
            <button
              onClick={onClose}
              className="absolute right-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AnimatePresence mode="wait">

            {/* Step 1: Loan Summary */}
            {step === 0 && (
              <motion.div key="s1"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto px-2 py-2 space-y-1"
              >
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                  This is a credit facility. Please review all terms carefully before proceeding.
                </p>

                <div className="bg-gray-50 rounded-xl px-4 py-1 divide-y divide-gray-100">
                  <SummaryRow label="Borrower Name" value={summary.borrowerName} />
                  <SummaryRow label="Student Name" value={summary.studentName} />
                  <SummaryRow label="Institution" value={summary.institutionName} />
                  <SummaryRow label="Loan Amount" value={fmt(summary.loanAmount)} />
                  <SummaryRow label="Interest Rate" value={summary.interestRateLabel ?? '2.5% per month'} />
                  <SummaryRow label="Loan Tenure" value={`${summary.loanTenure} month${summary.loanTenure !== 1 ? 's' : ''}`} />
                  <SummaryRow label="Monthly Repayment" value={fmt(summary.monthlyRepayment)} />
                  <SummaryRow label="First Repayment Date" value={fmtDate(firstRepay)} />
                  <SummaryRow label="Final Repayment Date" value={fmtDate(finalRepay)} />
                  <SummaryRow label="Total Repayment" value={fmt(summary.totalRepayment)} highlight />
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-[#00296B] text-white font-semibold py-3 rounded-xl hover:bg-[#002050] transition-colors"
                >
                  Review Loan Agreement <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Agreement Text */}
            {step === 1 && (
              <motion.div key="s2"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col min-h-0 px-2 py-2"
              >
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <span className="font-semibold text-[#292929]">
                    Agreement — v{AGREEMENT_VERSION}
                  </span>
                  {!agreementScrolled && (
                    <span className="text-xs text-amber-600 animate-pulse">↓ Scroll to read all</span>
                  )}
                  {agreementScrolled && (
                    <span className="text-xs text-green-600 font-medium">✓ Read</span>
                  )}
                </div>

                <div
                  ref={agreementRef}
                  onScroll={handleAgreementScroll}
                  className="flex-1 overflow-y-auto rounded-xl border border-[#d1d1d1] bg-[#f5f5f5] p-4 text-base text-[#292929] leading-relaxed whitespace-pre-wrap min-h-0"
                >
                  {AGREEMENT_TEXT}
                </div>

                <div className="flex gap-3 mt-4 flex-shrink-0">
                  <button onClick={() => setStep(0)}
                    className="flex-1 h-12 border-2 border-[#00296B] bg-white text-[#00296B] font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!agreementScrolled}
                    className={cn(
                      'flex-1 h-12 flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors',
                      agreementScrolled
                        ? 'bg-[#00296B] text-white hover:bg-[#003D82]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Final Confirmation */}
            {step === 2 && (
              <motion.div key="s3"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto px-2 py-4 flex flex-col items-center justify-center text-center"
              >
                {accepted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-9 h-9 text-green-500" />
                    </div>
                    <p className="font-bold text-[#191919] text-xl">Agreement Accepted Successfully</p>
                    <p className="text-sm text-gray-500">Submitting your application…</p>
                    <div className="mt-2 border-2 border-[#00296B] border-t-transparent rounded-full w-6 h-6 animate-spin" />
                  </motion.div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                      <ShieldCheck className="w-9 h-9 text-[#00296B]" />
                    </div>
                    <p className="font-bold text-[#191919] text-xl mb-2">Ready to Accept</p>
                    <p className="text-sm text-gray-500 max-w-sm mb-1">
                      By clicking the button below you are entering into a legally binding agreement with PayMyFees Limited.
                    </p>
                    <p className="text-xs text-gray-400 mb-6">
                      Agreement v{AGREEMENT_VERSION} · {new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>

                    <div className="w-full flex gap-3">
                      <button onClick={() => setStep(1)}
                        className="flex-1 h-12 border-2 border-[#00296B] bg-white text-[#00296B] font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        Back
                      </button>
                      <button
                        onClick={handleAccept}
                        disabled={isSubmitting}
                        className="flex-1 h-12 flex items-center justify-center gap-2 bg-[#00296B] text-white font-semibold rounded-lg hover:bg-[#003D82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-5 h-5" />
                        )}
                        I Accept Loan Agreement
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

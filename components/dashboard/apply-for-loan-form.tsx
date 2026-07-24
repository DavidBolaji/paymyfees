'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentUploadList, DocumentUploadListRef } from './document-upload-list';
import { Checkbox } from '@/components/ui/checkbox';
import { FormInput, FormSelect } from '@/components/ui/form-input';
import { validateLoanApplication, type LoanApplicationFormData } from '@/data';
import { NIGERIAN_CLASS_LEVELS } from '@/data/constants';
import { normalizeText } from '@/lib/utils';
import { applyForLoan } from '../../src/utils/loan-api';
import { api } from '@/src/lib/api';
import { SchoolSelector } from './school-selector';
import RegistrationModal from './registration-modal';
import { SuccessModal } from '../ui/success-modal';
import { ResidencyStatus } from '@prisma/client';
import useAuthStore from '@/src/authStore';
import { CloudinaryUploadResult } from '@/src/utils/cloudinary-api';
import { useLoanApplicationStore } from '@/src/stores/loanApplicationStore';
import useDashboardStore from '@/src/stores/dashboardStore';
import { fetchDashboardStats } from '@/src/utils/dashboard-api';
import { CheckSquareIcon } from '@/assets/icons/CheckSquareIcon';
import { LoanAgreementModal, type AgreementMeta, type LoanAgreementSummary } from './loan-agreement-modal';

interface StudentProfileOption {
  id: string;
  studentName: string;
  dateOfBirth: string | null;
  relationship: string | null;
}

interface RepaymentPlan {
  months: number;
  monthlyAmount: number;
  totalAmount: number;
}

interface FormErrors {
  selectedPlan?: string;
  loanAmount?: string;
  schoolName?: string;
  schoolId?: string,
  academicSession?: string;
  term?: string;
  uploadedFiles?: string;
  studentProfile?: string;
  consents?: {
    schoolDetails?: string;
    directPayment?: string;
    terms?: string;
  };
}

// ─── Inline KYC section: auto-saves on blur, grayed-out once saved ───────────

type ParentProfile = {
  employmentStatus?: string | null;
  employerName?: string | null;
  employmentRole?: string | null;
  employmentType?: string | null;
  lengthOfEmployment?: string | null;
  monthlyIncome?: number | null;
};

const EMPLOYMENT_STATUS_OPTS = [
  { value: '', label: 'Select employment status' },
  { value: 'Employed', label: 'Employed' },
  { value: 'Self-Employed', label: 'Self-Employed' },
  { value: 'Unemployed', label: 'Unemployed' },
  { value: 'Retired', label: 'Retired' },
];
const EMPLOYMENT_TYPE_OPTS = [
  { value: '', label: 'Select employment type' },
  { value: 'Employee', label: 'Employee' },
  { value: 'Business', label: 'Business Person' },
];
const DURATION_OPTS = [
  { value: '', label: 'Select duration' },
  { value: '<1 year', label: 'Less than 1 year' },
  { value: '1-2 years', label: '1 – 2 years' },
  { value: '2-3 years', label: '2 – 3 years' },
  { value: '3-4 years', label: '3 – 4 years' },
  { value: '5+ years', label: '5 or more years' },
];

function InlineKycSection({ user, updateUser }: { user: { parentProfile?: ParentProfile; role?: string }; updateUser: (data: never) => void }) {
  const pp = user?.parentProfile;
  const saved = !!(pp?.employmentStatus && pp?.monthlyIncome);

  const [fields, setFields] = useState({
    employmentStatus: pp?.employmentStatus ?? '',
    employerName: pp?.employerName ?? '',
    employmentRole: pp?.employmentRole ?? '',
    employmentType: pp?.employmentType ?? '',
    lengthOfEmployment: pp?.lengthOfEmployment ?? '',
    monthlyIncome: pp?.monthlyIncome != null ? String(pp.monthlyIncome) : '',
  });
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(saved);

  const showEmployer = fields.employmentStatus === 'Employed' || fields.employmentStatus === 'Self-Employed';

  const autoSave = async (updated: typeof fields) => {
    if (!updated.employmentStatus || !updated.monthlyIncome) return; // don't save partial
    setSaving(true);
    try {
      const res = await api.put('/api/user/kyc', {
        employmentStatus: updated.employmentStatus,
        employerName: updated.employerName || null,
        employmentRole: updated.employmentRole || null,
        employmentType: updated.employmentType || null,
        lengthOfEmployment: updated.lengthOfEmployment || null,
        monthlyIncome: updated.monthlyIncome ? Number(updated.monthlyIncome) : null,
      });
      const data = await res.json();
      if (data.success) {
        updateUser({ parentProfile: data.data?.parentProfile, isFirstTime: false } as never);
        setSavedOk(true);
      }
    } catch {
      // silent — user can still submit, data isn't lost
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof typeof fields, value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
    setSavedOk(false);
  };

  const onBlur = (updated?: Partial<typeof fields>) => {
    const merged = { ...fields, ...updated };
    autoSave(merged);
  };

  const inputClass = cn(
    "bg-[#f5f5f5] px-3 border focus:border-[#00296B] rounded-lg focus:outline-none w-full h-12 text-[#292929] transition-colors",
    savedOk ? "border-green-300 text-gray-500 cursor-not-allowed" : "border-[#d1d1d1]"
  );
  const selectClass = cn(inputClass, "appearance-none");

  return (
    <div className="bg-white p-4 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#292D32] text-[18px]">Your KYC Details</h3>
        <div className="flex items-center gap-1.5 text-xs">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00296B]" />}
          {saving && <span className="text-[#00296B]">Saving…</span>}
          {!saving && savedOk && <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Saved</span></>}
        </div>
      </div>

      <p className="text-[#5F5F5F] text-xs">
        {savedOk
          ? 'Your employment details are saved and will be reused for future loan applications.'
          : 'Fill in your employment details below. They will be saved automatically and reused next time.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Employment Status */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-[#292929] text-sm">Employment Status <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              value={fields.employmentStatus}
              disabled={savedOk}
              onChange={e => set('employmentStatus', e.target.value)}
              onBlur={e => onBlur({ employmentStatus: e.target.value })}
              className={selectClass}
            >
              {EMPLOYMENT_STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Employment Type */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-[#292929] text-sm">Employment Type</label>
          <div className="relative">
            <select
              value={fields.employmentType}
              disabled={savedOk}
              onChange={e => set('employmentType', e.target.value)}
              onBlur={e => onBlur({ employmentType: e.target.value })}
              className={selectClass}
            >
              {EMPLOYMENT_TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Employer Name — only when employed */}
        {(showEmployer || savedOk) && (
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#292929] text-sm">Employer / Company Name</label>
            <input
              value={fields.employerName}
              disabled={savedOk}
              onChange={e => set('employerName', e.target.value)}
              onBlur={e => onBlur({ employerName: e.target.value })}
              placeholder="e.g. Acme Corporation"
              className={inputClass}
            />
          </div>
        )}

        {/* Job Title */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-[#292929] text-sm">Job Title / Role</label>
          <input
            value={fields.employmentRole}
            disabled={savedOk}
            onChange={e => set('employmentRole', e.target.value)}
            onBlur={e => onBlur({ employmentRole: e.target.value })}
            placeholder="e.g. Software Engineer"
            className={inputClass}
          />
        </div>

        {/* Duration with Current Employer */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-[#292929] text-sm">Duration with Current Employer</label>
          <div className="relative">
            <select
              value={fields.lengthOfEmployment}
              disabled={savedOk}
              onChange={e => set('lengthOfEmployment', e.target.value)}
              onBlur={e => onBlur({ lengthOfEmployment: e.target.value })}
              className={selectClass}
            >
              {DURATION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-[#292929] text-sm">Monthly NET Income (₦) <span className="text-red-500">*</span></label>
          <input
            type="number"
            min="0"
            value={fields.monthlyIncome}
            disabled={savedOk}
            onChange={e => set('monthlyIncome', e.target.value)}
            onBlur={e => onBlur({ monthlyIncome: e.target.value })}
            placeholder="e.g. 250000"
            className={inputClass}
          />
        </div>
      </div>

      {savedOk && (
        <p className="text-xs text-[#7C7C7C]">
          To update these details, go to your{' '}
          <Link href="/dashboard/profile" className="text-[#00296B] font-medium hover:underline">Profile page</Link>.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function ApplyForLoanForm() {
  const { user, updateUser } = useAuthStore();
  const { formData, updateFormData, updateConsent, resetForm } = useLoanApplicationStore();
  const { clearCache, setStats, setLastFetched } = useDashboardStore();
  const fileUploadRef = useRef<DocumentUploadListRef>(null);
  const kycUploadRef = useRef<DocumentUploadListRef>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, title: '', message: '' });
  const [agreementSummary, setAgreementSummary] = useState<LoanAgreementSummary | null>(null);

  // Student profile state
  const [studentProfiles, setStudentProfiles] = useState<StudentProfileOption[]>([]);
  const [studentProfileSelection, setStudentProfileSelection] = useState<string>('');
  const [newStudentForm, setNewStudentForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    relationship: '',
  });
  // Per-loan class level (separate from student profile)
  const [loanClassLevel, setLoanClassLevel] = useState('');
  // Prefilled documents from previous loan for the selected student
  const [prefillDocs, setPrefillDocs] = useState<Record<string, { fileName: string; fileUrl: string; fileSize: number; mimeType: string }>>({});

  useEffect(() => {
    api.get('/api/student-profiles')
      .then(r => r.json())
      .then(d => { if (d.success) setStudentProfiles(d.data || []); })
      .catch(() => {});
  }, []);

  const handleStudentProfileChange = async (value: string) => {
    setStudentProfileSelection(value);
    setPrefillDocs({});
    // Clear student profile error on any selection
    if (errors.studentProfile) {
      setErrors(prev => ({ ...prev, studentProfile: undefined }));
    }
    if (value === 'new') {
      updateFormData({ studentProfileId: undefined, newStudentProfile: { studentName: '', dateOfBirth: '', relationship: '' } });
    } else if (value) {
      updateFormData({ studentProfileId: value, newStudentProfile: undefined });
      // Attempt to prefill documents from previous loan for this student
      try {
        const res = await api.get(`/api/student-profiles/${value}/latest-documents`);
        const data = await res.json();
        if (data.success && data.data && Object.keys(data.data).length > 0) {
          setPrefillDocs(data.data);
        }
      } catch {
        // silent — user can still upload manually
      }
    } else {
      updateFormData({ studentProfileId: undefined, newStudentProfile: undefined });
    }
  };

  const handleNewStudentChange = (field: keyof typeof newStudentForm, value: string) => {
    // Normalize text fields to title case on every keystroke
    const normalized = (field === 'firstName' || field === 'lastName') ? normalizeText(value) : value;
    const updated = { ...newStudentForm, [field]: normalized };
    setNewStudentForm(updated);
    // Combine first + last name into the single studentName field for the API
    const fullName = `${updated.firstName} ${updated.lastName}`.trim();
    updateFormData({
      newStudentProfile: {
        studentName: fullName,
        dateOfBirth: updated.dateOfBirth,
        relationship: updated.relationship,
      },
    });
  };

  // Calculate repayment plans
const calculateRepaymentPlans = (amount: number): RepaymentPlan[] => {
  if (amount <= 0) return [];

  const plans: RepaymentPlan[] = [];
  const monthlyInterestRate = 0.025; // 2.5% per month

  for (let months = 1; months <= 12; months++) {
    // Calculate total interest: 2.5% * number of months
    const totalInterestRate = monthlyInterestRate * months;
    const totalAmount = amount * (1 + totalInterestRate);
    const monthlyAmount = totalAmount / months;

    plans.push({
      months,
      monthlyAmount: Math.round(monthlyAmount),
      totalAmount: Math.round(totalAmount)
    });
  }

  return plans;
};

  const repaymentPlans = calculateRepaymentPlans(formData.loanAmount || 0);
  const selectedPlanData = repaymentPlans.find(plan => plan.months === formData.selectedPlan);

  // Academic session options — dynamic based on current year
  const currentYear = new Date().getFullYear();
  const academicSessionOptions = [
    { value: '', label: 'Select Academic Session' },
    ...Array.from({ length: 3 }, (_, i) => {
      const end = currentYear - i;
      const session = `${end - 1}/${end}`;
      return { value: session, label: session };
    })
  ];

  // Term options
  const termOptions = [
    { value: '', label: 'Select Term' },
    { value: 'First Term', label: 'First Term' },
    { value: 'Second Term', label: 'Second Term' },
    { value: 'Third Term', label: 'Third Term' }
  ];

  // Form handlers
  const handleInputChange = (field: keyof LoanApplicationFormData, value: any) => {
    updateFormData({ [field]: value });

    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleConsentChange = (key: keyof NonNullable<LoanApplicationFormData['consents']>, checked: boolean) => {
    updateConsent(key, checked);

    // Clear consent error
    if (errors.consents?.[key]) {
      setErrors(prev => ({
        ...prev,
        consents: {
          ...prev.consents,
          [key]: undefined
        }
      }));
    }
  };

  const handleLoanAmountChange = (value: string) => {
    const numericValue = value.replace(/[₦,]/g, '');
    const amount = parseInt(numericValue) || 0;
    handleInputChange('loanAmount', amount);
  };

  const validateForm = (): boolean => {
    const result = validateLoanApplication(formData);
    const formErrors: FormErrors = {};

    if (!result.isValid) {
      Object.entries(result.errors).forEach(([key, message]) => {
        if (key.startsWith('consents.')) {
          const consentField = key.split('.')[1] as keyof NonNullable<FormErrors['consents']>;
          formErrors.consents = { ...formErrors.consents, [consentField]: message };
        } else {
          (formErrors as any)[key] = message;
        }
      });
    }

    // All required loan document slots must be uploaded
    if (!fileUploadRef.current?.areAllRequiredUploaded()) {
      formErrors.uploadedFiles = 'Please upload all required documents before submitting.';
    }

    // All required KYC document slots must be uploaded
    if (user?.role === 'PARENT' && !kycUploadRef.current?.areAllRequiredUploaded()) {
      formErrors.uploadedFiles = 'Please upload all required KYC and loan documents before submitting.';
    }

    // Parents must select or create a student profile
    if (user?.role === 'PARENT') {
      if (!studentProfileSelection) {
        formErrors.studentProfile = 'Please select or create a student profile to continue.';
      } else if (studentProfileSelection === 'new') {
        const fullName = `${newStudentForm.firstName} ${newStudentForm.lastName}`.trim();
        if (!fullName) {
          formErrors.studentProfile = 'Please enter the student\'s first and last name.';
        }
      }
      // Class level is required for all student-linked loans
      if (studentProfileSelection && !loanClassLevel) {
        formErrors.studentProfile = formErrors.studentProfile || 'Please select the student\'s current class or level.';
      }
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  // Opens the agreement modal after validating the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedPlanData) {
      setErrors((prev) => ({ ...prev, selectedPlan: 'Please choose a repayment plan' }));
      return;
    }

    // Resolve student name: new profile entry → newStudentForm, existing profile → lookup, else fallback
    const resolvedStudentName =
      studentProfileSelection === 'new'
        ? `${newStudentForm.firstName} ${newStudentForm.lastName}`.trim() || user?.fullName || 'Applicant'
        : studentProfileSelection
          ? studentProfiles.find(p => p.id === studentProfileSelection)?.studentName || user?.fullName || 'Applicant'
          : user?.fullName || 'Applicant';

    setAgreementSummary({
      borrowerName: user?.fullName ?? 'Applicant',
      studentName: resolvedStudentName,
      institutionName: formData.schoolName ?? '',
      loanAmount: formData.loanAmount ?? 0,
      loanTenure: formData.selectedPlan ?? 1,
      monthlyRepayment: selectedPlanData.monthlyAmount,
      totalRepayment: selectedPlanData.totalAmount,
    });
  };

  // Called by the agreement modal after the user accepts
  const executeSubmit = async (meta: AgreementMeta) => {
    setIsSubmitting(true);
    let cloudinaryResults: CloudinaryUploadResult[];

    try {
      // Step 1: Handle file uploads (loan docs + KYC docs combined)
      const loanUploadResults = fileUploadRef.current ? await fileUploadRef.current.uploadAllFiles() : [];
      const kycUploadResults = kycUploadRef.current ? await kycUploadRef.current.uploadAllFiles() : [];
      cloudinaryResults = [...loanUploadResults, ...kycUploadResults];

      if (!cloudinaryResults || cloudinaryResults.length === 0) {
        throw new Error('Please upload at least one document.');
      }

      // Step 2: Normalize + submit
      const normalizedFiles = cloudinaryResults.map((result) => ({
        url: result.secure_url || result.url,
        name: result.original_filename || result.public_id,
        size: result.bytes,
        type: result.format || result.resource_type,
      }));

      const payload: any = {
        ...formData,
        studentId: user!.id,
        repaymentMonths: formData.selectedPlan,
        uploadedFiles: normalizedFiles,
        residencyStatus: ResidencyStatus.LOCAL,
        agreementMeta: meta,
        loanClassLevel: loanClassLevel || undefined,
      };

      // Attach student profile — either existing ID or new profile data
      if (formData.studentProfileId) {
        payload.studentProfileId = formData.studentProfileId;
        delete payload.newStudentProfile;
      } else if (formData.newStudentProfile?.studentName) {
        payload.newStudentProfile = formData.newStudentProfile;
        delete payload.studentProfileId;
      } else {
        delete payload.studentProfileId;
        delete payload.newStudentProfile;
      }

      // Attach parent details if any field is filled
      if (formData.parentDetails && Object.values(formData.parentDetails).some(v => v !== undefined && v !== '')) {
        payload.parentDetails = formData.parentDetails;
      } else {
        delete payload.parentDetails;
      }

      const result = await applyForLoan(payload);

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit application. Please try again.');
      }

      setAgreementSummary(null);
      setSuccessModal({ open: true, title: 'Application Submitted!', message: 'Your loan application has been submitted successfully.' });

      clearCache();
      fetchDashboardStats().then((data) => {
        if (data) { setStats(data); setLastFetched(Date.now()); }
      });

      resetForm();
    } catch (error: any) {
      console.error('Submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All form data will be lost.')) {
      resetForm();
      setErrors({});
    }
  };

  const handleSchoolChange = (schoolId: string, schoolName: string) => {
    updateFormData({ schoolId, schoolName });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Student Profile Section */}
        <div className="bg-white p-4 rounded-xl space-y-4">
          <h3 className="font-semibold text-[#292D32] text-[18px]">Student Profile</h3>
          <p className="text-xs text-[#7C7C7C]"><span className="text-red-500">*</span> Required fields</p>

          <FormSelect
            label="Select Student"
            showRequired={user?.role === 'PARENT'}
            options={[
              { value: '', label: user?.role === 'PARENT' ? 'Select a student profile' : 'Select a student profile (optional)' },
              ...studentProfiles.map(p => ({
                value: p.id,
                label: p.studentName,
              })),
              { value: 'new', label: '+ Create new student profile' },
            ]}
            value={studentProfileSelection}
            onChange={e => handleStudentProfileChange(e.target.value)}
          />

          {errors.studentProfile && (
            <p className="text-red-600 text-sm">{errors.studentProfile}</p>
          )}

          {studentProfileSelection === 'new' && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <p className="text-sm font-medium text-[#5F5F5F]">New Student Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Student First Name"
                  showRequired
                  value={newStudentForm.firstName}
                  onChange={e => handleNewStudentChange('firstName', e.target.value)}
                  placeholder="e.g. Chisom"
                />
                <FormInput
                  label="Student Last Name"
                  showRequired
                  value={newStudentForm.lastName}
                  onChange={e => handleNewStudentChange('lastName', e.target.value)}
                  placeholder="e.g. Adeyemi"
                />
                <FormInput
                  label="Date of Birth"
                  type="date"
                  value={newStudentForm.dateOfBirth}
                  onChange={e => handleNewStudentChange('dateOfBirth', e.target.value)}
                />
                <FormSelect
                  label="Relationship to Student"
                  options={[
                    { value: '', label: 'Select relationship' },
                    { value: 'Father', label: 'Father' },
                    { value: 'Mother', label: 'Mother' },
                    { value: 'Guardian', label: 'Guardian' },
                    { value: 'Uncle', label: 'Uncle' },
                    { value: 'Aunt', label: 'Aunt' },
                    { value: 'Sibling', label: 'Sibling' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  value={newStudentForm.relationship}
                  onChange={e => handleNewStudentChange('relationship', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Per-loan class level — shown once any student is selected/created */}
          {studentProfileSelection && (
            <div className="pt-2 border-t border-gray-100">
              <FormSelect
                label="Student's Current Class / Level"
                showRequired
                value={loanClassLevel}
                onChange={e => {
                  setLoanClassLevel(e.target.value);
                  if (errors.studentProfile) setErrors(prev => ({ ...prev, studentProfile: undefined }));
                }}
                options={NIGERIAN_CLASS_LEVELS}
              />
            </div>
          )}
        </div>

        {/* Parent KYC / Employment Details — inline, auto-save on blur */}
        {user?.role === 'PARENT' && (
          <InlineKycSection user={user} updateUser={updateUser} />
        )}

        {/* KYC Documents — salary slips, utility bill, NIN, bank statement, parent photo */}
        {user?.role === 'PARENT' && (
          <div className="bg-white p-4 rounded-xl">
            <h3 className="mb-1 font-semibold text-[#292D32] text-[18px]">KYC Documents</h3>
            <p className="text-xs text-[#7C7C7C] mb-4">
              These documents are tied to your account and reused across all applications. Upload once; update anytime from your profile.
            </p>
            <DocumentUploadList
              ref={kycUploadRef}
              mode="kyc"
              folder="kyc-documents"
              onFilesChange={() => {}}
            />
          </div>
        )}

        <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column - School & Tuition Details */}
          <div className="space-y-6 bg-white p-4 rounded-xl">
            <div>
              <h3 className="mb-4 font-semibold text-[#292D32] text-[18px]">
                School & Tuition Details
              </h3>

              <div className="space-y-4">
                <SchoolSelector
                  value={formData.schoolId ?? ''}
                  onChange={handleSchoolChange}
                  onRegisterClick={() => setShowRegisterModal(true)}
                  error={errors.schoolId}
                />
                {/* <FormSelect
                label="School Name"
                options={[{
                  label: profile?.schoolName,
                  value: profile?.schoolName
                }]}
                placeholder="Enter School Name"
                value={formData.schoolName || ''}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                error={errors.schoolName}
              /> */}

                <FormSelect
                  label="Academic Session"
                  showRequired
                  options={academicSessionOptions}
                  value={formData.academicSession || ''}
                  onChange={(e) => handleInputChange('academicSession', e.target.value)}
                  error={errors.academicSession}
                />

                <FormSelect
                  label="Term"
                  showRequired
                  options={termOptions}
                  value={formData.term || ''}
                  onChange={(e) => handleInputChange('term', e.target.value)}
                  error={errors.term}
                />

                <div className="space-y-2">
                  <FormInput
                    label="Tuition Requested"
                    showRequired
                    value={formData.loanAmount ? `₦${formData.loanAmount.toLocaleString()}` : ''}
                    onChange={(e) => handleLoanAmountChange(e.target.value)}
                    placeholder="₦0"
                    error={errors.loanAmount}
                  />

                  {selectedPlanData && formData.loanAmount && formData.loanAmount > 0 && (
                    <p className="flex justify-end text-[#00296B] text-xs">
                      Platform request is ₦{selectedPlanData.totalAmount.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-xs">
                  <Info className="flex-shrink-0 mt-0.5 w-4 h-4 text-[#00296B]" />
                  <p className="text-[#00296B] text-xs">
                    It will be paid directly to the school after verification and approval.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Upload Files */}
          <div className="bg-white p-4 rounded-xl">
            <h3 className="mb-4 font-semibold text-[#292D32] text-[18px]">
              Upload Documents
            </h3>

            <div className="h-[480px] overflow-y-scroll [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              <DocumentUploadList
                ref={fileUploadRef}
                mode="loan"
                onFilesChange={(files) => handleInputChange('uploadedFiles', files)}
                prefillSlots={prefillDocs}
              />
            </div>

            {errors.uploadedFiles && (
              <p className="mt-2 text-red-600 text-sm">{errors.uploadedFiles}</p>
            )}
          </div>
        </div>

        {/* Choose Repayment Plan - Only show when loan amount is set */}
        <AnimatePresence>
          {formData.loanAmount && formData.loanAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className='bg-white p-4 rounded-xl'>
                <h3 className="mb-4 font-semibold text-[#292D32] text-[18px]">
                  Choose Repayment Plan
                </h3>

                <div className="mb-6 overflow-x-auto">
                  <div className="flex items-center gap-0 min-w-max">
                    {repaymentPlans.map((plan, index) => (
                      <div key={plan.months} className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleInputChange('selectedPlan', plan.months)}
                          className="group flex flex-col items-center"
                        >
                          {/* Circle */}
                          <div className={cn(
                            "flex justify-center items-center mb-2 border-2 rounded-full w-5 h-5 transition-all",
                            formData.selectedPlan === plan.months
                              ? "bg-[#00296B] border-[#00296B]"
                              : "border-gray-300 bg-white hover:border-[#00296B]"
                          )}>
                            {formData.selectedPlan === plan.months && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>

                          {/* Labels */}
                          <div className="text-center">
                            <div className="mb-1 font-medium text-[#292D32] text-xs">
                              {plan.months} Month{plan.months > 1 ? 's' : ''}
                            </div>
                            <div className="text-[#7C7C7C] text-xs">
                              ₦{plan.monthlyAmount.toLocaleString()}
                            </div>
                          </div>
                        </button>

                        {/* Connecting Line */}
                        {index < repaymentPlans.length - 1 && (
                          <div className="bg-gray-300 mx-2 mt-[-45px] w-12 h-px" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {errors.selectedPlan && (
                  <p className="text-red-600 text-sm">{errors.selectedPlan}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transparency & Consent */}
        <div className="space-y-4">
          <h3 className="font-semibold text-[#292D32] text-[18px]">
            Transparency & Consent
          </h3>

          <div className="space-y-4">
            <Checkbox
              checked={formData.consents?.schoolDetails || false}
              onChange={(checked) => handleConsentChange('schoolDetails', checked)}
              label="I confirm that the school details provided are correct."
              error={errors.consents?.schoolDetails}
            />

            <Checkbox
              checked={formData.consents?.directPayment || false}
              onChange={(checked) => handleConsentChange('directPayment', checked)}
              label="I understand that funds will be paid directly to the institution."
              error={errors.consents?.directPayment}
            />

            <Checkbox
              checked={formData.consents?.terms || false}
              onChange={(checked) => handleConsentChange('terms', checked)}
              label="I agree to PayMyFees' repayment terms and conditions."
              error={errors.consents?.terms}
            />
          </div>

          <p className="text-xs text-[#7C7C7C]"><span className="text-red-500">*</span> Required fields must be completed before submission</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="flex flex-1 justify-center items-center gap-2 border-2 border-gray-300 hover:border-gray-400 rounded-lg h-12 font-medium text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "flex flex-1 justify-center items-center gap-2 rounded-lg h-12 font-medium transition-colors",
              !isSubmitting
                ? "bg-[#00296B] text-white hover:bg-[#002561]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckSquareIcon />
                Review
              </>
            )}
          </button>
        </div>
      </form>
      <LoanAgreementModal
        isOpen={!!agreementSummary}
        onClose={() => setAgreementSummary(null)}
        onAccept={executeSubmit}
        summary={agreementSummary ?? {
          borrowerName: '', studentName: '', institutionName: '',
          loanAmount: 0, loanTenure: 1, monthlyRepayment: 0, totalRepayment: 0,
        }}
        isSubmitting={isSubmitting}
      />
      <RegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          setShowRegisterModal(false);
          setSuccessModal({ open: true, title: 'School Registered', message: 'Your school has been registered successfully.' });
        }}
      />
      <SuccessModal
        isOpen={successModal.open}
        onClose={() => setSuccessModal({ open: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
      />
    </>
  );
}
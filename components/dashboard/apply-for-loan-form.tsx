'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UploadedFile } from '@/components/ui/file-upload';
import { DocumentUploadList, DocumentUploadListRef } from './document-upload-list';
import { Checkbox } from '@/components/ui/checkbox';
import { FormInput, FormSelect } from '@/components/ui/form-input';
import { validateLoanApplication, type LoanApplicationFormData } from '@/data';
import { applyForLoan } from '../../src/utils/loan-api';
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
  relationship: string;
  classLevel: string;
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

export function ApplyForLoanForm() {
  const { user } = useAuthStore();
  const { formData, updateFormData, updateConsent, resetForm } = useLoanApplicationStore();
  const { clearCache, setStats, setLastFetched } = useDashboardStore();
  const fileUploadRef = useRef<DocumentUploadListRef>(null);

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
    classLevel: '',
  });

  useEffect(() => {
    fetch('/api/student-profiles')
      .then(r => r.json())
      .then(d => { if (d.success) setStudentProfiles(d.data || []); })
      .catch(() => {});
  }, []);

  const handleStudentProfileChange = (value: string) => {
    setStudentProfileSelection(value);
    // Clear student profile error on any selection
    if (errors.studentProfile) {
      setErrors(prev => ({ ...prev, studentProfile: undefined }));
    }
    if (value === 'new') {
      updateFormData({ studentProfileId: undefined, newStudentProfile: { studentName: '', dateOfBirth: '', relationship: '', classLevel: '' } });
    } else if (value) {
      updateFormData({ studentProfileId: value, newStudentProfile: undefined });
    } else {
      updateFormData({ studentProfileId: undefined, newStudentProfile: undefined });
    }
  };

  const handleNewStudentChange = (field: keyof typeof newStudentForm, value: string) => {
    const updated = { ...newStudentForm, [field]: value };
    setNewStudentForm(updated);
    // Combine first + last name into the single studentName field for the API
    const fullName = `${updated.firstName} ${updated.lastName}`.trim();
    updateFormData({
      newStudentProfile: {
        studentName: fullName,
        dateOfBirth: updated.dateOfBirth,
        relationship: updated.relationship,
        classLevel: updated.classLevel,
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

    // Parents must select or create a student profile
    if (user?.role === 'PARENT') {
      if (!studentProfileSelection) {
        formErrors.studentProfile = 'Please select or create a student profile to continue.';
      } else if (studentProfileSelection === 'new') {
        const fullName = `${newStudentForm.firstName} ${newStudentForm.lastName}`.trim();
        if (!fullName) {
          formErrors.studentProfile = 'Please enter the student\'s first and last name.';
        } else if (!newStudentForm.relationship) {
          formErrors.studentProfile = 'Please select your relationship to the student.';
        } else if (!newStudentForm.classLevel) {
          formErrors.studentProfile = 'Please enter the student\'s class or level.';
        }
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
      // Step 1: Handle file uploads
      if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
        const uploadedFiles = formData.uploadedFiles.filter(
          (f): f is UploadedFile & { cloudinaryResult: CloudinaryUploadResult } =>
            f.uploaded === true && f.cloudinaryResult !== undefined
        );

        if (uploadedFiles.length === formData.uploadedFiles.length) {
          cloudinaryResults = uploadedFiles.map(f => f.cloudinaryResult);
        } else {
          if (fileUploadRef.current?.uploadAllFiles) {
            cloudinaryResults = await fileUploadRef.current.uploadAllFiles();
          } else {
            cloudinaryResults = uploadedFiles.map(f => f.cloudinaryResult);
          }
        }

        if (!cloudinaryResults || cloudinaryResults.length === 0) {
          throw new Error('Please wait for all files to finish uploading.');
        }
      } else {
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

  const isStudentProfileValid = () => {
    if (user?.role !== 'PARENT') return true;
    if (!studentProfileSelection) return false;
    if (studentProfileSelection === 'new') {
      const fullName = `${newStudentForm.firstName} ${newStudentForm.lastName}`.trim();
      return !!fullName && !!newStudentForm.relationship && !!newStudentForm.classLevel;
    }
    return true;
  };

  const isFormValid = () => {
    return formData.schoolName &&
      formData.academicSession &&
      formData.term &&
      formData.loanAmount &&
      formData.loanAmount > 0 &&
      formData.selectedPlan &&
      formData.selectedPlan > 0 &&
      formData.uploadedFiles &&
      formData.uploadedFiles.length > 0 &&
      formData.consents?.schoolDetails &&
      formData.consents?.directPayment &&
      formData.consents?.terms &&
      isStudentProfileValid();
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

          <FormSelect
            label={user?.role === 'PARENT' ? 'Select Student *' : 'Select Student'}
            options={[
              { value: '', label: user?.role === 'PARENT' ? 'Select a student profile' : 'Select a student profile (optional)' },
              ...studentProfiles.map(p => ({
                value: p.id,
                label: `${p.studentName} — ${p.classLevel}`,
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
                  value={newStudentForm.firstName}
                  onChange={e => handleNewStudentChange('firstName', e.target.value)}
                  placeholder="e.g. Chisom"
                />
                <FormInput
                  label="Student Last Name"
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
                <FormInput
                  label="Class / Level"
                  value={newStudentForm.classLevel}
                  onChange={e => handleNewStudentChange('classLevel', e.target.value)}
                  placeholder="e.g. JSS 2, SSS 3, Grade 5"
                />
              </div>
            </div>
          )}
        </div>

        {/* Parent Employment Details */}
        <div className="bg-white p-4 rounded-xl space-y-4">
          <h3 className="font-semibold text-[#292D32] text-[18px]">Parent / Guardian Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Employment Status"
              options={[
                { value: '', label: 'Select status' },
                { value: 'Employed', label: 'Employed' },
                { value: 'Self-Employed', label: 'Self-Employed' },
                { value: 'Unemployed', label: 'Unemployed' },
                { value: 'Retired', label: 'Retired' },
              ]}
              value={formData.parentDetails?.employmentStatus ?? ''}
              onChange={e => updateFormData({ parentDetails: { ...formData.parentDetails, employmentStatus: e.target.value } })}
            />
            <FormSelect
              label="Employment Type"
              options={[
                { value: '', label: 'Select type' },
                { value: 'Employee', label: 'Employee' },
                { value: 'Business', label: 'Business Person' },
              ]}
              value={formData.parentDetails?.employmentType ?? ''}
              onChange={e => updateFormData({ parentDetails: { ...formData.parentDetails, employmentType: e.target.value as 'Employee' | 'Business' } })}
            />
            <FormInput
              label="Employment Role / Job Title"
              value={formData.parentDetails?.employmentRole ?? ''}
              onChange={e => updateFormData({ parentDetails: { ...formData.parentDetails, employmentRole: e.target.value } })}
              placeholder="e.g. Software Engineer, Trader"
            />
            <FormInput
              label="Monthly NET Income (₦)"
              value={formData.parentDetails?.monthlyNetIncome ? `₦${formData.parentDetails.monthlyNetIncome.toLocaleString()}` : ''}
              onChange={e => {
                const raw = e.target.value.replace(/[₦,]/g, '');
                const num = parseInt(raw) || undefined;
                updateFormData({ parentDetails: { ...formData.parentDetails, monthlyNetIncome: num } });
              }}
              placeholder="₦0"
            />
            <FormSelect
              label="Length of Employment"
              options={[
                { value: '', label: 'Select range' },
                { value: '<1year', label: 'Less than 1 year' },
                { value: '1-2years', label: '1 – 2 years' },
                { value: '2-3years', label: '2 – 3 years' },
                { value: '3-4years', label: '3 – 4 years' },
                { value: '5+years', label: '5+ years' },
              ]}
              value={formData.parentDetails?.lengthOfEmployment ?? ''}
              onChange={e => updateFormData({ parentDetails: { ...formData.parentDetails, lengthOfEmployment: e.target.value } })}
            />
          </div>
        </div>

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
                  options={academicSessionOptions}
                  value={formData.academicSession || ''}
                  onChange={(e) => handleInputChange('academicSession', e.target.value)}
                  error={errors.academicSession}
                />

                <FormSelect
                  label="Term"
                  options={termOptions}
                  value={formData.term || ''}
                  onChange={(e) => handleInputChange('term', e.target.value)}
                  error={errors.term}
                />

                <div className="space-y-2">
                  <FormInput
                    label="Tuition Requested"
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
                onFilesChange={(files) => handleInputChange('uploadedFiles', files)}
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

          {!isFormValid() && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Please complete all required fields and accept all terms
            </div>
          )}
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
            disabled={!isFormValid() || isSubmitting}
            className={cn(
              "flex flex-1 justify-center items-center gap-2 rounded-lg h-12 font-medium transition-colors",
              isFormValid() && !isSubmitting
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
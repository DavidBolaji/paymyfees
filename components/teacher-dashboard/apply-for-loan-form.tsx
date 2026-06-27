'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/ui/file-upload';
import { Checkbox } from '@/components/ui/checkbox';
import { FormInput, FormSelect } from '@/components/ui/form-input';
import { applyForLoan } from '@/src/utils/loan-api';
import { SchoolSelector } from '@/components/dashboard/school-selector';
import { SuccessModal } from '@/components/ui/success-modal';
import { LoanAgreementModal, type AgreementMeta, type LoanAgreementSummary } from '@/components/dashboard/loan-agreement-modal';
import { ResidencyStatus } from '@prisma/client';
import useAuthStore from '@/src/authStore';
import { CloudinaryUploadResult } from '@/src/utils/cloudinary-api';
import { CheckSquareIcon } from '@/assets/icons/CheckSquareIcon';

interface RepaymentPlan {
  months: number;
  monthlyAmount: number;
  totalAmount: number;
}

interface TeacherLoanFormData {
  // Personal info
  firstName: string;
  lastName: string;
  phone: string;
  schoolId: string;
  schoolName: string;
  // School identity
  schoolEmail: string;
  registrationNumber: string;
  schoolAddress: string;
  // Finance
  loanAmount: number;
  loanType: string;
  purposeOfLoan: string;
  repaymentMethod: string;
  selectedPlan: number;
  // Files + consents
  uploadedFiles: any[];
  consents: {
    schoolDetails: boolean;
    directPayment: boolean;
    terms: boolean;
  };
}

const LOAN_TYPE_OPTIONS = [
  { value: '', label: 'Select Loan Type' },
  { value: 'Teachers Support Loan', label: 'Teachers Support Loan' },
  { value: 'Professional Development Loan', label: 'Professional Development Loan' },
  { value: 'Emergency Loan', label: 'Emergency Loan' },
];

const PURPOSE_OPTIONS = [
  { value: '', label: 'Select Purpose' },
  { value: 'School Fees', label: 'School Fees' },
  { value: 'Professional Development', label: 'Professional Development' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'Other', label: 'Other' },
];

const REPAYMENT_METHOD_OPTIONS = [
  { value: '', label: 'Select Repayment Method' },
  { value: 'Salary Deduction', label: 'Salary Deduction' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Wallet', label: 'Wallet' },
];

const INITIAL_FORM: TeacherLoanFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  schoolId: '',
  schoolName: '',
  schoolEmail: '',
  registrationNumber: '',
  schoolAddress: '',
  loanAmount: 0,
  loanType: 'Teachers Support Loan',
  purposeOfLoan: '',
  repaymentMethod: 'Salary Deduction',
  selectedPlan: 0,
  uploadedFiles: [],
  consents: { schoolDetails: false, directPayment: false, terms: false },
};

export function TeacherApplyForLoanForm() {
  const { user } = useAuthStore();
  const fileUploadRef = useRef<any>(null);

  const [formData, setFormData] = useState<TeacherLoanFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TeacherLoanFormData | 'consents.schoolDetails' | 'consents.directPayment' | 'consents.terms', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, title: '', message: '' });
  const [agreementSummary, setAgreementSummary] = useState<LoanAgreementSummary | null>(null);

  const monthlyInterestRate = 0.025;

  const calculateRepaymentPlans = (amount: number): RepaymentPlan[] => {
    if (amount <= 0) return [];
    return Array.from({ length: 12 }, (_, i) => {
      const months = i + 1;
      const totalAmount = amount * (1 + monthlyInterestRate * months);
      return {
        months,
        monthlyAmount: Math.round(totalAmount / months),
        totalAmount: Math.round(totalAmount),
      };
    });
  };

  const repaymentPlans = calculateRepaymentPlans(formData.loanAmount);
  const selectedPlanData = repaymentPlans.find((p) => p.months === formData.selectedPlan);

  const update = (field: keyof TeacherLoanFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateConsent = (key: keyof TeacherLoanFormData['consents'], checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      consents: { ...prev.consents, [key]: checked },
    }));
  };

  const handleLoanAmountChange = (value: string) => {
    const amount = parseInt(value.replace(/[₦,]/g, '')) || 0;
    update('loanAmount', amount);
    update('selectedPlan' as any, 0); // reset plan when amount changes
  };

  const validate = (): boolean => {
    const e: any = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    if (!formData.schoolId) e.schoolId = 'Please select a school';
    if (!formData.schoolEmail.trim()) e.schoolEmail = 'School email is required';
    if (!formData.schoolAddress.trim()) e.schoolAddress = 'School address is required';
    if (!formData.loanAmount || formData.loanAmount <= 0) e.loanAmount = 'Enter a valid loan amount';
    if (!formData.loanType) e.loanType = 'Select a loan type';
    if (!formData.purposeOfLoan) e.purposeOfLoan = 'Select the purpose of your loan';
    if (!formData.repaymentMethod) e.repaymentMethod = 'Select a repayment method';
    if (!formData.selectedPlan) e.selectedPlan = 'Please choose a repayment plan';
    if (!formData.uploadedFiles.length) e.uploadedFiles = 'Please upload at least one document';
    if (!formData.consents.schoolDetails) e['consents.schoolDetails'] = 'Required';
    if (!formData.consents.directPayment) e['consents.directPayment'] = 'Required';
    if (!formData.consents.terms) e['consents.terms'] = 'Required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isFormValid = () =>
    formData.firstName &&
    formData.lastName &&
    formData.schoolId &&
    formData.schoolEmail &&
    formData.schoolAddress &&
    formData.loanAmount > 0 &&
    formData.loanType &&
    formData.purposeOfLoan &&
    formData.repaymentMethod &&
    formData.selectedPlan > 0 &&
    formData.uploadedFiles.length > 0 &&
    formData.consents.schoolDetails &&
    formData.consents.directPayment &&
    formData.consents.terms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!selectedPlanData) {
      setErrors((prev) => ({ ...prev, selectedPlan: 'Please choose a repayment plan' }));
      return;
    }

    setAgreementSummary({
      borrowerName: `${formData.firstName} ${formData.lastName}`.trim() || user?.fullName || 'Applicant',
      studentName: `${formData.firstName} ${formData.lastName}`.trim() || user?.fullName || 'Applicant',
      institutionName: formData.schoolName,
      loanAmount: formData.loanAmount,
      loanTenure: formData.selectedPlan,
      monthlyRepayment: selectedPlanData.monthlyAmount,
      totalRepayment: selectedPlanData.totalAmount,
    });
  };

  const executeSubmit = async (meta: AgreementMeta) => {
    setIsSubmitting(true);
    let cloudinaryResults: CloudinaryUploadResult[];

    try {
      const uploadedFiles = formData.uploadedFiles.filter(
        (f: any) => f.uploaded === true && f.cloudinaryResult !== undefined
      );

      if (uploadedFiles.length === formData.uploadedFiles.length) {
        cloudinaryResults = uploadedFiles.map((f: any) => f.cloudinaryResult);
      } else {
        if (fileUploadRef.current?.uploadAllFiles) {
          cloudinaryResults = await fileUploadRef.current.uploadAllFiles();
        } else {
          cloudinaryResults = uploadedFiles.map((f: any) => f.cloudinaryResult);
        }
      }

      if (!cloudinaryResults || cloudinaryResults.length === 0) {
        throw new Error('Please wait for all files to finish uploading.');
      }

      const normalizedFiles = cloudinaryResults.map((r) => ({
        url: r.secure_url || r.url,
        name: r.original_filename || r.public_id,
        size: r.bytes,
        type: r.format || r.resource_type,
      }));

      const payload = {
        studentId: user!.id,
        schoolId: formData.schoolId,
        schoolName: formData.schoolName,
        loanAmount: formData.loanAmount,
        repaymentMonths: formData.selectedPlan,
        residencyStatus: ResidencyStatus.LOCAL,
        academicSession: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
        term: formData.loanType || 'Teachers Support Loan',
        uploadedFiles: normalizedFiles,
        consents: {
          schoolDetails: formData.consents.schoolDetails,
          directPayment: formData.consents.directPayment,
          terms: formData.consents.terms,
        },
        agreementMeta: meta,
      };

      const result = await applyForLoan(payload);

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit application.');
      }

      setAgreementSummary(null);
      setSuccessModal({ open: true, title: 'Application Submitted!', message: 'Your loan application has been submitted successfully.' });
      setFormData(INITIAL_FORM);
    } catch (err: any) {
      console.error('Submission error:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All form data will be lost.')) {
      setFormData(INITIAL_FORM);
      setErrors({});
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Row 1: Personal Info + School Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Personal Information */}
          <div className="bg-white p-4 rounded-xl space-y-4">
            <h3 className="font-semibold text-[#292D32] text-[18px]">Personal Information</h3>

            <FormInput
              label="First Name"
              placeholder="Enter First Name"
              value={formData.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              error={errors.firstName}
            />
            <FormInput
              label="Last Name"
              placeholder="Enter Last Name"
              value={formData.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              error={errors.lastName}
            />
            <FormInput
              label="Phone Number"
              placeholder="Enter Phone Number"
              value={formData.phone}
              onChange={(e) => update('phone', e.target.value)}
              error={errors.phone}
            />
            <SchoolSelector
              value={formData.schoolId}
              onChange={(id, name) => { update('schoolId', id); update('schoolName', name); }}
              error={errors.schoolId as string}
            />

            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-xs">
              <Info className="flex-shrink-0 mt-0.5 w-4 h-4 text-[#00296B]" />
              <p className="text-[#00296B] text-xs">
                It will be paid directly to the school after verification and approval.
              </p>
            </div>
          </div>

          {/* School Identity Information */}
          <div className="bg-white p-4 rounded-xl space-y-4">
            <h3 className="font-semibold text-[#292D32] text-[18px]">School Identity Information</h3>

            <FormInput
              label="School Name"
              placeholder="Enter School Name"
              value={formData.schoolName}
              onChange={(e) => update('schoolName', e.target.value)}
            />
            <FormInput
              label="School Email"
              placeholder="Enter School Email"
              value={formData.schoolEmail}
              onChange={(e) => update('schoolEmail', e.target.value)}
              error={errors.schoolEmail}
            />
            <FormInput
              label="Registration Number"
              placeholder="Enter Registration Number"
              value={formData.registrationNumber}
              onChange={(e) => update('registrationNumber', e.target.value)}
            />
            <FormInput
              label="School Address"
              placeholder="Enter School Address"
              value={formData.schoolAddress}
              onChange={(e) => update('schoolAddress', e.target.value)}
              error={errors.schoolAddress}
            />

            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-xs">
              <Info className="flex-shrink-0 mt-0.5 w-4 h-4 text-[#00296B]" />
              <p className="text-[#00296B] text-xs">
                It will be paid directly to the school after verification and approval.
              </p>
            </div>
          </div>
        </div>

        {/* Row 2: Finance Request + Upload Files */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Finance Request */}
          <div className="bg-white p-4 rounded-xl space-y-4">
            <h3 className="font-semibold text-[#292D32] text-[18px]">Finance Request</h3>

            <div className="space-y-2">
              <FormInput
                label="Loan Amount"
                placeholder="Enter Loan Amount"
                value={formData.loanAmount ? `₦${formData.loanAmount.toLocaleString()}` : ''}
                onChange={(e) => handleLoanAmountChange(e.target.value)}
                error={errors.loanAmount}
              />
              {selectedPlanData && formData.loanAmount > 0 && (
                <p className="flex justify-end text-[#00296B] text-xs">
                  Total repayment is ₦{selectedPlanData.totalAmount.toLocaleString()}
                </p>
              )}
            </div>

            <FormSelect
              label="Loan Type"
              options={LOAN_TYPE_OPTIONS}
              value={formData.loanType}
              onChange={(e) => update('loanType', e.target.value)}
              error={errors.loanType}
            />

            <FormSelect
              label="Purpose of Loan Request"
              options={PURPOSE_OPTIONS}
              value={formData.purposeOfLoan}
              onChange={(e) => update('purposeOfLoan', e.target.value)}
              error={errors.purposeOfLoan}
            />

            <FormSelect
              label="Preferred Repayment Method"
              options={REPAYMENT_METHOD_OPTIONS}
              value={formData.repaymentMethod}
              onChange={(e) => update('repaymentMethod', e.target.value)}
              error={errors.repaymentMethod}
            />
          </div>

          {/* Upload Files */}
          <div className="bg-white p-4 rounded-xl space-y-4">
            <h3 className="font-semibold text-[#292D32] text-[18px]">Upload Files</h3>
            <p className="text-[#7C7C7C] text-sm">
              Upload Bvn, Nin, Salary slips, Bank statement and other supporting docs
            </p>
            <FileUpload
              ref={fileUploadRef}
              onFilesChange={(files) => update('uploadedFiles', files)}
              acceptedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
              maxFileSize={10}
              maxFiles={4}
              autoUpload={true}
              initialFiles={formData.uploadedFiles}
            />
            {errors.uploadedFiles && (
              <p className="mt-2 text-red-600 text-sm">{errors.uploadedFiles}</p>
            )}
          </div>
        </div>

        {/* Repayment Plan */}
        <AnimatePresence>
          {formData.loanAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white p-4 rounded-xl">
                <h3 className="mb-4 font-semibold text-[#292D32] text-[18px]">Choose Repayment Plan</h3>
                <div className="mb-6 overflow-x-auto">
                  <div className="flex items-center gap-0 min-w-max">
                    {repaymentPlans.map((plan, index) => (
                      <div key={plan.months} className="flex items-center">
                        <button
                          type="button"
                          onClick={() => update('selectedPlan', plan.months)}
                          className="group flex flex-col items-center"
                        >
                          <div className={cn(
                            'flex justify-center items-center mb-2 border-2 rounded-full w-5 h-5 transition-all',
                            formData.selectedPlan === plan.months
                              ? 'bg-[#00296B] border-[#00296B]'
                              : 'border-gray-300 bg-white hover:border-[#00296B]'
                          )}>
                            {formData.selectedPlan === plan.months && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="text-center">
                            <div className="mb-1 font-medium text-[#292D32] text-xs">{plan.months} Month{plan.months > 1 ? 's' : ''}</div>
                            <div className="text-[#7C7C7C] text-xs">₦{plan.monthlyAmount.toLocaleString()}</div>
                          </div>
                        </button>
                        {index < repaymentPlans.length - 1 && (
                          <div className="bg-gray-300 mx-2 mt-[-45px] w-12 h-px" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {errors.selectedPlan && <p className="text-red-600 text-sm">{errors.selectedPlan}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transparency & Consent */}
        <div className="space-y-4">
          <h3 className="font-semibold text-[#292D32] text-[18px]">Transparency & Consent</h3>
          <div className="space-y-4">
            <Checkbox
              checked={formData.consents.schoolDetails}
              onChange={(checked) => updateConsent('schoolDetails', checked)}
              label="I confirm that the school details provided are correct."
              error={errors['consents.schoolDetails'] as string}
            />
            <Checkbox
              checked={formData.consents.directPayment}
              onChange={(checked) => updateConsent('directPayment', checked)}
              label="I understand that funds will be paid directly to the institution."
              error={errors['consents.directPayment'] as string}
            />
            <Checkbox
              checked={formData.consents.terms}
              onChange={(checked) => updateConsent('terms', checked)}
              label="I agree to PayMyFees' repayment terms and conditions."
              error={errors['consents.terms'] as string}
            />
          </div>
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
              'flex flex-1 justify-center items-center gap-2 rounded-lg h-12 font-medium transition-colors',
              isFormValid() && !isSubmitting
                ? 'bg-[#00296B] text-white hover:bg-[#002561]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
      <SuccessModal
        isOpen={successModal.open}
        onClose={() => setSuccessModal({ open: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
      />
    </>
  );
}

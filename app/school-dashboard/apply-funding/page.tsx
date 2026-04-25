'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { FormInput, FormSelect } from '@/components/ui/form-input';
import { FileUpload, UploadedFile, FileUploadRef } from '@/components/ui/file-upload';
import { Checkbox } from '@/components/ui/checkbox';
import { BackNavigation } from '@/components/dashboard/back-navigation';
import { ApplicationStatus } from '@/components/dashboard/application-status';
import { LoanHistory } from '@/components/dashboard/loan-history';
import { CheckSquareIcon } from '@/assets/icons/CheckSquareIcon';
import useAuthStore from '@/src/authStore';
import { api } from '@/src/lib/api';

type TabType = 'apply' | 'status' | 'history';

interface RepaymentPlan {
  months: number;
  monthlyAmount: number;
  totalAmount: number;
}

const calculateRepaymentPlans = (amount: number): RepaymentPlan[] => {
  if (amount <= 0) return [];
  const monthlyInterestRate = 0.025; // 2.5% per month
  const plans: RepaymentPlan[] = [];
  for (let months = 1; months <= 12; months++) {
    const totalAmount = amount * (1 + monthlyInterestRate * months);
    plans.push({
      months,
      monthlyAmount: Math.round(totalAmount / months),
      totalAmount: Math.round(totalAmount),
    });
  }
  return plans;
};

interface SchoolFundingFormData {
  // Financial Information
  totalTermlyRevenue: string;
  numberOfTeachers: string;
  existingDebts: string;
  otherIncomeSources: string;
  // School Identity
  schoolName: string;
  schoolEmail: string;
  schoolRegistrationNumber: string;
  schoolAddress: string;
  // School Operations
  totalNumberOfStudents: string;
  amount: string;
  academicLevelsOffered: string;
  numberOfNonTeachingStaff: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const OTHER_INCOME_OPTIONS = [
  { value: '', label: 'Select option' },
  { value: 'grants', label: 'Grants & Donations' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'catering', label: 'Catering Services' },
  { value: 'afterschool', label: 'After-School Programs' },
  { value: 'none', label: 'None' },
];

const ACADEMIC_LEVEL_OPTIONS = [
  { value: '', label: 'Select level(s)' },
  { value: 'early_years', label: 'Early Years / Nursery' },
  { value: 'primary', label: 'Primary' },
  { value: 'junior_secondary', label: 'Junior Secondary (JSS)' },
  { value: 'senior_secondary', label: 'Senior Secondary (SSS)' },
  { value: 'primary_secondary', label: 'Primary & Secondary' },
  { value: 'all_levels', label: 'All Levels' },
];

const NON_TEACHING_STAFF_OPTIONS = [
  { value: '', label: 'Select range' },
  { value: '1-5', label: '1 – 5' },
  { value: '6-10', label: '6 – 10' },
  { value: '11-20', label: '11 – 20' },
  { value: '21-50', label: '21 – 50' },
  { value: '50+', label: '50+' },
];

export default function SchoolApplyFundingPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const fileUploadRef = useRef<FileUploadRef>(null);

  const [activeTab, setActiveTab] = useState<TabType>('apply');
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const [formData, setFormData] = useState<SchoolFundingFormData>({
    totalTermlyRevenue: '',
    numberOfTeachers: '',
    existingDebts: '',
    otherIncomeSources: '',
    schoolName: user?.schoolProfile?.schoolName || '',
    schoolEmail: user?.schoolProfile?.schoolEmail || '',
    schoolRegistrationNumber: '',
    schoolAddress: user?.schoolProfile?.schoolAddress || '',
    totalNumberOfStudents: '',
    amount: '',
    academicLevelsOffered: '',
    numberOfNonTeachingStaff: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const [consents, setConsents] = useState({
    schoolDetails: false,
    directPayment: false,
    terms: false,
  });

  const handleConsentChange = (key: keyof typeof consents, checked: boolean) => {
    setConsents((prev) => ({ ...prev, [key]: checked }));
    setErrors((prev) => { const next = { ...prev }; delete next[`consents_${key}`]; return next; });
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All form data will be lost.')) {
      setFormData({
        totalTermlyRevenue: '',
        numberOfTeachers: '',
        existingDebts: '',
        otherIncomeSources: '',
        schoolName: user?.schoolProfile?.schoolName || '',
        schoolEmail: user?.schoolProfile?.schoolEmail || '',
        schoolRegistrationNumber: '',
        schoolAddress: user?.schoolProfile?.schoolAddress || '',
        totalNumberOfStudents: '',
        amount: '',
        academicLevelsOffered: '',
        numberOfNonTeachingStaff: '',
      });
      setConsents({ schoolDetails: false, directPayment: false, terms: false });
      setSelectedPlan(null);
      setErrors({});
    }
  };

  const isFormValid = () =>
    formData.amount &&
    parseInt(formData.amount) > 0 &&
    selectedPlan !== null &&
    formData.schoolName.trim() &&
    formData.schoolEmail.trim() &&
    formData.schoolRegistrationNumber.trim() &&
    formData.schoolAddress.trim() &&
    formData.totalTermlyRevenue &&
    formData.numberOfTeachers &&
    formData.otherIncomeSources &&
    formData.totalNumberOfStudents &&
    formData.academicLevelsOffered &&
    formData.numberOfNonTeachingStaff &&
    uploadedFiles.length > 0 &&
    consents.schoolDetails &&
    consents.directPayment &&
    consents.terms;

  const amountValue = parseInt(formData.amount) || 0;
  const repaymentPlans = calculateRepaymentPlans(amountValue);
  const handleChange = (field: keyof SchoolFundingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.totalTermlyRevenue) newErrors.totalTermlyRevenue = 'Total termly revenue is required';
    if (!formData.numberOfTeachers) newErrors.numberOfTeachers = 'Number of teachers is required';
    if (!formData.otherIncomeSources) newErrors.otherIncomeSources = 'Please select an option';
    if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
    if (!formData.schoolEmail.trim()) newErrors.schoolEmail = 'School email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.schoolEmail)) newErrors.schoolEmail = 'Invalid email address';
    if (!formData.schoolRegistrationNumber.trim()) newErrors.schoolRegistrationNumber = 'Registration number is required';
    if (!formData.schoolAddress.trim()) newErrors.schoolAddress = 'School address is required';
    if (!formData.totalNumberOfStudents) newErrors.totalNumberOfStudents = 'Total students is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';
    if (!formData.academicLevelsOffered) newErrors.academicLevelsOffered = 'Please select academic level(s)';
    if (!formData.numberOfNonTeachingStaff) newErrors.numberOfNonTeachingStaff = 'Please select staff range';
    if (uploadedFiles.length === 0) newErrors.files = 'Please upload at least one document';
    if (!selectedPlan) newErrors.selectedPlan = 'Please choose a repayment plan';
    if (!consents.schoolDetails) newErrors.consents_schoolDetails = 'Please confirm school details';
    if (!consents.directPayment) newErrors.consents_directPayment = 'Please confirm payment terms';
    if (!consents.terms) newErrors.consents_terms = 'Please accept terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      // Upload files first
      const uploadResults = await fileUploadRef.current?.uploadAllFiles() ?? [];

      const payload = {
        ...formData,
        selectedPlan,
        loanAmount: parseInt(formData.amount),
        repaymentMonths: selectedPlan,
        documents: uploadResults,
        userId: user?.id,
        consents,
      };

      const response = await api.post('/api/loans/school-funding', payload);

      const data = await response.json();

      if (data.success) {
        setConsents({ schoolDetails: false, directPayment: false, terms: false });
        setSelectedPlan(null);
        router.push('/school-dashboard/wallet?funding_applied=true');
      } else {
        setErrors({ submit: data.message || 'Submission failed. Please try again.' });
      }
    } catch (err) {
      console.error('Funding application error:', err);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-6 md:pt-0">
      <BackNavigation href="/school-dashboard" label="Back to Dashboard" />

      <div className="mb-6">
        <h1 className="mb-2 font-semibold text-[#191919] text-xl md:text-[1.6875rem]">
          Apply for Funding
        </h1>
        <p className="font-medium text-[#7C7C7C] text-[15px]">
          Get financial support for your tuition in minutes.We verify your school before
          disbursement to ensure transparency and compliance.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-gray-200 border-b -mx-0 sm:mx-0 mb-6">
        {([
          { id: 'apply' as const, label: 'Apply for Funding' },
          { id: 'status' as const, label: 'Application Status' },
          { id: 'history' as const, label: 'Funding History' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 font-semibold text-[0.7rem] sm:text-[0.8125rem] md:text-[0.925rem] text-center transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-[#00296B] text-white'
                : 'text-[#191919] hover:text-[#00296B] hover:bg-gray-50 bg-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Apply for Funding Tab */}
      <div className={activeTab === 'apply' ? '' : 'hidden'}>
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Left — Financial Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-[#191919] text-lg">Financial Information</h2>

              <FormInput
                label="Total Termly Revenue (₦)"
                type="number"
                placeholder="e.g. 5000000"
                value={formData.totalTermlyRevenue}
                onChange={(e) => handleChange('totalTermlyRevenue', e.target.value)}
                error={errors.totalTermlyRevenue}
                min="0"
              />

              <FormInput
                label="Number of Teachers"
                type="number"
                placeholder="e.g. 40"
                value={formData.numberOfTeachers}
                onChange={(e) => handleChange('numberOfTeachers', e.target.value)}
                error={errors.numberOfTeachers}
                min="0"
              />

              <FormInput
                label="Existing Debts or Liabilities (₦)"
                type="number"
                placeholder="e.g. 200000 (enter 0 if none)"
                value={formData.existingDebts}
                onChange={(e) => handleChange('existingDebts', e.target.value)}
                min="0"
              />

              <FormSelect
                label="Other Income Sources"
                value={formData.otherIncomeSources}
                onChange={(e) => handleChange('otherIncomeSources', e.target.value)}
                options={OTHER_INCOME_OPTIONS}
                error={errors.otherIncomeSources}
              />
            </div>

            {/* Top Right — School Identity Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-[#191919] text-lg">School Identity Information</h2>

              <FormInput
                label="School Name"
                type="text"
                placeholder="Auto-populated"
                value={formData.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                error={errors.schoolName}
                readOnly={!!user?.schoolProfile?.schoolName}
              />

              <FormInput
                label="School Email"
                type="email"
                placeholder="school@example.com"
                value={formData.schoolEmail}
                onChange={(e) => handleChange('schoolEmail', e.target.value)}
                error={errors.schoolEmail}
              />

              <FormInput
                label="School Registration Number"
                type="text"
                placeholder="e.g. RC123456"
                value={formData.schoolRegistrationNumber}
                onChange={(e) => handleChange('schoolRegistrationNumber', e.target.value)}
                error={errors.schoolRegistrationNumber}
              />

              <FormInput
                label="School Address"
                type="text"
                placeholder="Full school address"
                value={formData.schoolAddress}
                onChange={(e) => handleChange('schoolAddress', e.target.value)}
                error={errors.schoolAddress}
              />
            </div>

            {/* Bottom Left — School Operations */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-[#191919] text-lg">School Operations</h2>

              <FormInput
                label="Total Number of Students"
                type="number"
                placeholder="e.g. 500"
                value={formData.totalNumberOfStudents}
                onChange={(e) => handleChange('totalNumberOfStudents', e.target.value)}
                error={errors.totalNumberOfStudents}
                min="0"
              />

              <FormInput
                label="Amount Requested (₦)"
                type="number"
                placeholder="e.g. 2000000"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                error={errors.amount}
                min="0"
              />

              <FormSelect
                label="Academic Levels Offered"
                value={formData.academicLevelsOffered}
                onChange={(e) => handleChange('academicLevelsOffered', e.target.value)}
                options={ACADEMIC_LEVEL_OPTIONS}
                error={errors.academicLevelsOffered}
              />

              <FormSelect
                label="Number of Non-Teaching Staff"
                value={formData.numberOfNonTeachingStaff}
                onChange={(e) => handleChange('numberOfNonTeachingStaff', e.target.value)}
                options={NON_TEACHING_STAFF_OPTIONS}
                error={errors.numberOfNonTeachingStaff}
              />
            </div>

            {/* Bottom Right — Upload Files */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-[#191919] text-lg mb-4">Upload Documents</h2>
              <p className="text-sm text-[#7C7C7C] mb-4">
                Upload supporting documents (CAC certificate, financial statements, etc.)
              </p>

              <FileUpload
                ref={fileUploadRef}
                onFilesChange={setUploadedFiles}
                acceptedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
                maxFileSize={10}
                maxFiles={5}
                folder="school-funding-documents"
                autoUpload={false}
              />

              {errors.files && (
                <p className="text-red-600 text-xs mt-2">{errors.files}</p>
              )}
            </div>
          </div>

          {/* Repayment Plan — shown when amount is entered */}
          <AnimatePresence>
            {amountValue > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden mt-6"
              >
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="mb-4 font-semibold text-[#292D32] text-[18px]">
                    Choose Repayment Plan
                  </h3>

                  <div className="mb-4 overflow-x-auto">
                    <div className="flex items-center gap-0 min-w-max">
                      {repaymentPlans.map((plan, index) => (
                        <div key={plan.months} className="flex items-center">
                          <button
                            type="button"
                            onClick={() => setSelectedPlan(plan.months)}
                            className="group flex flex-col items-center"
                          >
                            <div className={cn(
                              'flex justify-center items-center mb-2 border-2 rounded-full w-5 h-5 transition-all',
                              selectedPlan === plan.months
                                ? 'bg-[#00296B] border-[#00296B]'
                                : 'border-gray-300 bg-white hover:border-[#00296B]'
                            )}>
                              {selectedPlan === plan.months && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="mb-1 font-medium text-[#292D32] text-xs">
                                {plan.months} Month{plan.months > 1 ? 's' : ''}
                              </div>
                              <div className="text-[#7C7C7C] text-xs">
                                ₦{plan.monthlyAmount.toLocaleString()}
                              </div>
                            </div>
                          </button>

                          {index < repaymentPlans.length - 1 && (
                            <div className="bg-gray-300 mx-2 mt-[-45px] w-12 h-px" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPlan && (
                    <p className="text-[#00296B] text-xs text-right">
                      Total repayment: ₦{repaymentPlans.find(p => p.months === selectedPlan)?.totalAmount.toLocaleString()}
                    </p>
                  )}
                  {errors.selectedPlan && (
                    <p className="text-red-600 text-sm mt-1">{errors.selectedPlan}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transparency & Consent */}
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-[#292D32] text-[18px]">
              Transparency & Consent
            </h3>

            <div className="space-y-4">
              <Checkbox
                checked={consents.schoolDetails}
                onChange={(checked) => handleConsentChange('schoolDetails', checked)}
                label="I confirm that the school details provided are correct."
                error={errors.consents_schoolDetails}
              />

              <Checkbox
                checked={consents.directPayment}
                onChange={(checked) => handleConsentChange('directPayment', checked)}
                label="I understand that funds will be disbursed directly to the school account after verification."
                error={errors.consents_directPayment}
              />

              <Checkbox
                checked={consents.terms}
                onChange={(checked) => handleConsentChange('terms', checked)}
                label="I agree to PayMyFees' funding terms and repayment conditions."
                error={errors.consents_terms}
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
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Application Status Tab */}
      <div className={activeTab === 'status' ? 'py-8 text-center' : 'hidden'}>
        <ApplicationStatus />
      </div>

      {/* Funding History Tab */}
      <div className={activeTab === 'history' ? 'py-8' : 'hidden'}>
        <LoanHistory />
      </div>
    </div>
  );
}

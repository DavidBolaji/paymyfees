'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/ui/file-upload';
import { Checkbox } from '@/components/ui/checkbox';
import { FormInput, FormSelect } from '@/components/ui/form-input';
import { validateLoanApplication, type LoanApplicationFormData } from '@/data';

interface RepaymentPlan {
  months: number;
  monthlyAmount: number;
  totalAmount: number;
}

interface FormErrors {
  selectedPlan?: string;
  loanAmount?: string;
  schoolName?: string;
  academicSession?: string;
  term?: string;
  uploadedFiles?: string;
  consents?: {
    schoolDetails?: string;
    directPayment?: string;
    terms?: string;
  };
}

export function ApplyForLoanForm() {
  // Form state
  const [formData, setFormData] = useState<Partial<LoanApplicationFormData>>({
    selectedPlan: 6,
    loanAmount: 0,
    schoolName: '',
    academicSession: '',
    term: '',
    uploadedFiles: [],
    consents: {
      schoolDetails: false,
      directPayment: false,
      terms: false
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate repayment plans
  const calculateRepaymentPlans = (amount: number): RepaymentPlan[] => {
    if (amount <= 0) return [];
    
    const plans: RepaymentPlan[] = [];
    const interestRates = {
      1: 0.05, 2: 0.08, 3: 0.10, 4: 0.12, 5: 0.15, 6: 0.18,
      7: 0.20, 8: 0.22, 9: 0.25, 10: 0.28, 11: 0.30, 12: 0.32
    };

    for (let months = 1; months <= 12; months++) {
      const interestRate = interestRates[months as keyof typeof interestRates] || 0.35;
      const totalAmount = amount * (1 + interestRate);
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

  // Academic session options
  const academicSessionOptions = [
    { value: '', label: 'Select Academic Session' },
    { value: '2025/2026', label: '2025/2026' },
    { value: '2024/2025', label: '2024/2025' },
    { value: '2023/2024', label: '2023/2024' }
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
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleConsentChange = (key: keyof NonNullable<LoanApplicationFormData['consents']>, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      consents: {
        schoolDetails: prev.consents?.schoolDetails || false,
        directPayment: prev.consents?.directPayment || false,
        terms: prev.consents?.terms || false,
        [key]: checked
      }
    }));

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
    
    if (!result.isValid) {
      const formErrors: FormErrors = {};
      
      Object.entries(result.errors).forEach(([key, message]) => {
        if (key.startsWith('consents.')) {
          const consentField = key.split('.')[1] as keyof NonNullable<FormErrors['consents']>;
          formErrors.consents = {
            ...formErrors.consents,
            [consentField]: message
          };
        } else {
          (formErrors as any)[key] = message;
        }
      });
      
      setErrors(formErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Handle successful submission
      console.log('Form submitted successfully:', formData);
      alert('Loan application submitted successfully!');
      
      // Reset form
      setFormData({
        selectedPlan: 6,
        loanAmount: 0,
        schoolName: '',
        academicSession: '',
        term: '',
        uploadedFiles: [],
        consents: {
          schoolDetails: false,
          directPayment: false,
          terms: false
        }
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All form data will be lost.')) {
      setFormData({
        selectedPlan: 6,
        loanAmount: 0,
        schoolName: '',
        academicSession: '',
        term: '',
        uploadedFiles: [],
        consents: {
          schoolDetails: false,
          directPayment: false,
          terms: false
        }
      });
      setErrors({});
    }
  };

  const isFormValid = () => {
    return formData.schoolName &&
           formData.academicSession &&
           formData.term &&
           formData.loanAmount &&
           formData.loanAmount > 0 &&
           formData.uploadedFiles &&
           formData.uploadedFiles.length > 0 &&
           formData.consents?.schoolDetails &&
           formData.consents?.directPayment &&
           formData.consents?.terms;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      

      <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column - School & Tuition Details */}
        <div className="space-y-6 bg-white p-4 rounded-xl">
          <div>
            <h3 className="mb-4 font-semibold text-[#292D32] text-[18px]">
              School & Tuition Details
            </h3>
            
            <div className="space-y-4">
              <FormInput
                label="School Name"
                placeholder="Enter School Name"
                value={formData.schoolName || ''}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                error={errors.schoolName}
              />

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
        <div className="space-y-6 bg-white p-4 rounded-xl">
          <div>
            <h3 className="mb-2 font-semibold text-[#292D32] text-[18px]">
              Upload Files
            </h3>
            <p className="mb-4 text-[#7C7C7C] text-sm">
              Upload Bvn, Nin, Salary slips, Bank statement and other supporting docs
            </p>
            
            <FileUpload
              onFilesChange={(files) => handleInputChange('uploadedFiles', files)}
              acceptedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
              maxFileSize={10}
              maxFiles={10}
            />
            
            {errors.uploadedFiles && (
              <p className="mt-2 text-red-600 text-sm">{errors.uploadedFiles}</p>
            )}
          </div>
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
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Submit Loan Application
            </>
          )}
        </button>
      </div>
    </form>
  );
}
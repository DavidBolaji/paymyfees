/**
 * International Loan Application Form Store
 * Persists form state across tab switches for international students
 */

import { create } from 'zustand';
import { UploadedFile } from '@/components/ui/file-upload';

export interface LoanApplicationIntFormState {
  selectedPlan: number;
  loanAmount: number;
  schoolName: string;
  academicSession: string;
  term: string;
  countryOfStudy: string;
  programCourseOfStudy: string;
  employmentStatus: string;
  companyName: string;
  jobTitleRole: string;
  monthlyNetIncome: number;
  paymentFrequency: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  countryOfBankAccount: string;
  uploadedFiles: UploadedFile[];
  consents: {
    schoolDetails: boolean;
    directPayment: boolean;
    terms: boolean;
  };
}

interface LoanApplicationIntStore {
  formData: LoanApplicationIntFormState;
  updateFormData: (data: Partial<LoanApplicationIntFormState>) => void;
  updateConsent: (key: keyof LoanApplicationIntFormState['consents'], value: boolean) => void;
  resetForm: () => void;
}

const initialFormState: LoanApplicationIntFormState = {
  selectedPlan: 6,
  loanAmount: 0,
  schoolName: '',
  academicSession: '',
  term: '',
  countryOfStudy: '',
  programCourseOfStudy: '',
  employmentStatus: '',
  companyName: '',
  jobTitleRole: '',
  monthlyNetIncome: 0,
  paymentFrequency: '',
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  countryOfBankAccount: '',
  uploadedFiles: [],
  consents: {
    schoolDetails: false,
    directPayment: false,
    terms: false,
  },
};

export const useLoanApplicationIntStore = create<LoanApplicationIntStore>((set) => ({
  formData: initialFormState,
  
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  
  updateConsent: (key, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        consents: {
          ...state.formData.consents,
          [key]: value,
        },
      },
    })),
  
  resetForm: () => set({ formData: initialFormState }),
}));

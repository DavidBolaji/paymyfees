/**
 * Loan Application Form Store
 * Persists form state across tab switches
 */

import { create } from 'zustand';
import { UploadedFile } from '@/components/ui/file-upload';

export interface LoanApplicationFormState {
  selectedPlan: number;
  loanAmount: number;
  schoolId: string;
  schoolName: string;
  academicSession: string;
  term: string;
  uploadedFiles: UploadedFile[];
  consents: {
    schoolDetails: boolean;
    directPayment: boolean;
    terms: boolean;
  };
}

interface LoanApplicationStore {
  formData: LoanApplicationFormState;
  updateFormData: (data: Partial<LoanApplicationFormState>) => void;
  updateConsent: (key: keyof LoanApplicationFormState['consents'], value: boolean) => void;
  resetForm: () => void;
}

const initialFormState: LoanApplicationFormState = {
  selectedPlan: 6,
  loanAmount: 0,
  schoolId: '',
  schoolName: '',
  academicSession: '',
  term: '',
  uploadedFiles: [],
  consents: {
    schoolDetails: false,
    directPayment: false,
    terms: false,
  },
};

export const useLoanApplicationStore = create<LoanApplicationStore>((set) => ({
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
